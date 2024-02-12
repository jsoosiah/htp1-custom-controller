<template>
  <div 
    id="power-dialog" 
    class="modal fade show" 
    tabindex="-1" 
    aria-labelledby="settingsModalLabel"
  >
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">
            Edit Speaker Layout
          </h4>
          <div>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="handleCancel">
              <span aria-hidden="true">&times;</span>
            </button>
              <div
                v-show="hasUnsavedChanges"
                class="alert alert-warning small"
                role="alert"
                style="margin-bottom:0;position:absolute;right:60px"
              >
                You have unsaved changes. Click Save to apply them. {{ unsavedChanges }}
              </div>
          </div>
        </div>
        <div class="modal-body text-left">
          <table class="table table-sm table-striped table-responsive-sm">
            <tbody
              v-for="speakerGroup in props.speakerGroups"
              :key="speakerGroup.header"
            >
              <tr />
              <tr>
                <th colspan="3">
                  {{ speakerGroup.header }} <small
                    v-if="speakerGroup.subtitle"
                    class="text-muted"
                  >{{ speakerGroup.subtitle }}</small>
                </th>
              </tr>
              <tr
                v-for="spk in speakerGroup.speakers"
                :key="spk.code"
                :class="{'table-warning': msoCopy?.cal?.speakerConfigMismatch && diracMismatchedChannelGroups.includes(spk.code)}"
              >
                <td>
                  <div class="form-check">
                    <input 
                      :id="'check-'+spk.code" 
                      type="checkbox" 
                      class="form-check-input" 
                      :checked="msoCopy?.speakers?.groups[spk.code]?.present" 
                      :disabled="!allSpeakerToggles[spk.code].enabled"
                      @change="toggleSpeakerGroupLocal(spk.code)"
                    >
                    <label 
                      :id="'tooltip-container-' + spk.code" 
                      v-tooltip="allSpeakerToggles[spk.code]"
                      :class="{'form-check-label':spk.code !== 'lr', 'hidden-switch-label': spk.code === 'lr'}"
                      :for="'check-'+spk.code"
                    >
                      {{ spk.label }} 
                      <font-awesome-icon 
                        v-if="!allSpeakerToggles[spk.code].enabled && allSpeakerToggles[spk.code].message"
                        :icon="['fas', 'question-circle']"
                      /></label>
                  </div>
                </td>
                <td class="text-right">
                  <template v-if="showCenterFreqControlsForSpeaker(spk.code)">
                    <label
                      class="sr-only"
                      :for="'xo-'+spk.code"
                    >Crossover Frequency Center (Hz)</label>
                    <div class="input-group input-group-sm numeric-input float-right">
                      <div class="input-group-prepend">
                        <div class="input-group-text">
                          fc
                        </div>
                      </div>
                      <input
                        :id="'xo-'+spk.code"
                        type="number"
                        step="10"
                        min="40"
                        max="200"
                        class="form-control"
                        :value="msoCopy?.speakers?.groups[spk.code]?.fc"
                        @change="({ type, target }) => setCenterFreqLocal(spk.code, target.value)"
                      >
                      <div class="input-group-append">
                        <div class="input-group-text">
                          Hz
                        </div>
                      </div>
                    </div>
                  </template>
                </td>
                <td class="text-right">
                  <template v-if="showCrossoverControlsForSpeaker(spk.code)">
                    <div
                      class="btn-group btn-group-sm"
                      role="group"
                      aria-label="Speaker Size"
                    >
                      <button
                        v-if="showDolby(spk.code)"
                        type="button"
                        class="btn"
                        :class="{'btn-primary': msoCopy?.speakers?.groups[spk.code].size === 'd', 'btn-secondary': msoCopy?.speakers?.groups[spk.code].size !== 'd'}"
                        @click="setSpeakerSizeLocal(spk.code, 'd')"
                      >
                        Dolby
                      </button>
                      <button
                        type="button"
                        class="btn"
                        :class="{'btn-primary': msoCopy?.speakers?.groups[spk.code].size === 's', 'btn-secondary': msoCopy?.speakers?.groups[spk.code].size !== 's'}"
                        @click="setSpeakerSizeLocal(spk.code, 's')"
                      >
                        Small
                      </button>
                      <button
                        type="button"
                        class="btn"
                        :class="{'btn-primary': msoCopy?.speakers?.groups[spk.code].size === 'l', 'btn-secondary': msoCopy?.speakers?.groups[spk.code].size !== 'l'}"
                        @click="setSpeakerSizeLocal(spk.code, 'l')"
                      >
                        Large
                      </button>
                    </div>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="modal-footer">
            <div class="row justify-content-end">
              <div class="col-auto">
                <button 
                  class="btn btn-sm btn-secondary"
                  @click="handleCancel"
                >
                  Cancel
                </button>
              </div>
              <div class="col-auto">
                <button 
                  class="btn btn-sm btn-primary"
                  :disabled="!hasUnsavedChanges"
                  @click="save"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>

  import { computed, onMounted, ref } from 'vue';
  import { commit, get } from 'lodash-es';
  import { applyPatch, deepClone, compare } from 'fast-json-patch/index.mjs';
  import { Tooltip } from '@/directives/Tooltip.js';

  import useMso from '@/use/useMso.js';

  export default {
    'name': 'SpeakerGroupCrossoverControls',
    directives: {
      Tooltip
    },
    'props': {
      speakerGroups: Array
    },
    setup(props, { emit }) {

      const { mso, showCrossoverControls, calToolConnected,
        executeMacro, commitSpeakerLayout, activeChannels, diracMismatchedChannelGroups } = useMso();

      const msoCopy = ref(null);

      onMounted(() => {
        msoCopy.value = deepClone(mso.value);
      });

      // rule states the conditions for which the toggle should be enabled
      // all rules in the array will be combined with AND
      // if the toggle is disabled, message is displayed to the user as the reason 
      const speakerGroupValidations = computed(() => {

        const groups = msoCopy.value?.speakers?.groups;

        return {
          'lr': [
              {rule: false, message: null} // always disable LR toggle
            ], 
          'sub2': [
              {rule: groups.sub1.present, message: 'Subwoofer must be enabled before Subwoofer 2.'}
            ], 
          'sub3': [
              {rule: groups.sub2.present, message: 'Subwoofer 2 must be enabled before Subwoofer 3.'}
            ], 
          'sub4': [
              {rule: groups.sub3.present, message: 'Subwoofer 3 must be enabled before Subwoofer 4.'}
            ], 
          'sub5': [
              {rule: groups.sub4.present, message: 'Subwoofer 4 must be enabled before Subwoofer 5.'}
            ], 
          'lrb': [
              {rule: groups.lrs.present, message: 'L/R Surround must be enabled before L/R Rear Surround.'}
            ], 
          'lrw': [
              {rule: groups.lrb.present, message: 'L/R Rear Surround must be enabled before L/R Wide.'}
            ], 
          'lrhf': [
              {rule: !groups.lrtf.present, message: 'L/R Top Front must be disabled to enable L/R Front Height.'},
              {rule: groups.lrs.present || !groups.lrtm.present, message: 'L/R Surround must be enabled or L/R Top Middle must be disabled to enable L/R Front Height.'}
            ], 
          'lrtf': [
              {rule: !groups.lrhf.present, message: 'L/R Front Height must be disabled to enable L/R Top Front.'},
              {rule: groups.lrs.present || !groups.lrtm.present, message: 'L/R Surround must be enabled or L/R Top Middle must be disabled to enable L/R Top Front.'}
            ], 
          'lrtm': [
              {rule: groups.c.present || groups.lrb.present, message: 'Center or L/R Rear Surround must be enabled before L/R Top Middle.'},
              {rule: (!(groups.lrhf.present || groups.lrtf.present) || (groups.lrhr.present || groups.lrtr.present)), message: 'If L/R Top Front or L/R Front Height is enabled, then L/R Top Rear or L/R Rear Height must be enabled before L/R Top Middle'}
            ], 
          'lrhr': [
              {rule: !groups.lrtr.present, message: 'L/R Top Rear must be disabled to enable L/R Rear Height.'},
              {rule: groups.lrtf.present || groups.lrhf.present, message: 'L/R Top Front or L/R Front Height must be enabled before L/R Rear Height.'}
            ], 
          'lrtr': [
              {rule: !groups.lrhr.present, message: 'L/R Rear Height must be disabled to enable L/R Top Rear.'},
              {rule: groups.lrtf.present || groups.lrhf.present, message: 'L/R Top Front or L/R Front Height must be enabled before L/R Top Rear.'}
            ]
          };
      });

      const allSpeakerToggles = computed(() => {

        const result = {};

        for (const group of props.speakerGroups) {
          for (const speaker of group.speakers) {
            result[speaker.code] = enableSpeakerToggle(speaker.code);
          }
        }

        return result;
      });

      function enableSpeakerToggle(spkCode) {

        const result = {
          enabled: true,
          message: ''
        };

        const groups = msoCopy.value?.speakers?.groups;

        if (groups && !groups[spkCode].present) {
          // if 16 channels are already set, disable toggles that are off to prevent adding more speakers

          let limit = 16;
          if (spkCode !== 'c' && !spkCode.startsWith('sub')) {
            limit = 15;
          }

          if (activeChannels.value.length >= limit && spkCode !== 'lr') {
            // return false;
            result.enabled = false;
            result.message = 'A maximum of 16 speakers is allowed.';
            return result;
          }

          const validations = speakerGroupValidations.value[spkCode]; //getSpeakerGroupValidations(spkCode, groups);

          if (validations && validations.length > 0) {
            for (const validation of validations) {
              // console.log('validations', spkCode, validations)
              if (!validation.rule) {
                result.enabled = false;
                result.message = validation.message;
                return result;
              }
            }
          }
        }

        return result;
      }

      function showCrossoverControlsForSpeaker(spkCode) {
        // console.log('showCrossoverControls', showCrossoverControls)
        return showCrossoverControls.value && !spkCode?.startsWith('sub');
      }

      function showCenterFreqControlsForSpeaker(spkCode) {
        return showCrossoverControlsForSpeaker(spkCode) && msoCopy.value?.speakers?.groups[spkCode].size !== 'l';
      }

      function showDolby(spkCode) {
        return spkCode.includes('t'); // top
      }

      function handleCancel() {
        emit('cancel');
      }

      // TODO refactor into reusable component
      function toggleSpeakerGroupLocal(spkCode) {
        return patchMsoLocal( 'replace', `/speakers/groups/${spkCode}/present`, !msoCopy.value.speakers.groups[spkCode].present);
      }

      function setCenterFreqLocal(spkCode, centerFreq) {
        return patchMsoLocal( 'replace', `/speakers/groups/${spkCode}/fc`, parseInt(centerFreq));
      }

      function setSpeakerSizeLocal(spkCode, sizeCode) {
        return patchMsoLocal( 'replace', `/speakers/groups/${spkCode}/size`, sizeCode);
      }

      // TODO refactor into reusable component
      function patchMsoLocal(op, path, value) {
        const singlePatch = {
          'op': op,
          'path': path,
          'value': value,
        };

        // block changes if dirac calibration is in progress
        if (!calToolConnected.value) {

          // block cal changes if dirac filter transfer is in progress
          if (path.includes('/cal/') && diracFilterTransferInProgress.value) {
            return false;
          }

          // check if patch already matches local mso state
          const oldValue = get(msoCopy.value, singlePatch.path.substring(1).split('/'));
          if (oldValue === singlePatch.value) {
            return false;
          }

          // update local mso copy state
          applyPatch(msoCopy.value, [singlePatch]);
          return true;
        }

        return false;
      }

      function save() {
        console.log('save', unsavedChanges.value);
        executeMacro(unsavedChanges.value);
        commitSpeakerLayout();
        emit('cancel');
      }

      const unsavedChanges = computed(() => {
        if (!msoCopy.value?.speakers?.groups) {
          return false;
        }
        return compare(mso.value, msoCopy.value).filter(x => x.path.startsWith('/speakers/groups'))
      });

      const hasUnsavedChanges = computed(() => {
        return unsavedChanges.value.length > 0;
      });

      return { 
        msoCopy, showCrossoverControls, setSpeakerSizeLocal, setCenterFreqLocal,
        showCrossoverControlsForSpeaker, showCenterFreqControlsForSpeaker, showDolby,
        props, allSpeakerToggles, diracMismatchedChannelGroups, handleCancel, toggleSpeakerGroupLocal,
        hasUnsavedChanges, unsavedChanges, save
      };
    }
  }
</script>

<style scoped>

  th {
    font-size: 80%;
  }

  small {
    font-size: 90%;
  }

  .input-group, .btn-group {
    margin:.1rem;
  }

  table td {
    height: 2.2rem;
  }

  td {
    padding:0 0.3rem;
  }

  .hidden-switch-label {
    padding: 0;
    margin:0;
  }

</style>