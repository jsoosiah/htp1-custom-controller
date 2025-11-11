<template>
  <div 
    id="layout-dialog" 
    class="modal fade show" 
    tabindex="-1" 
    aria-labelledby="settingsModalLabel"
  >
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
      <div class="modal-content" :class="{'bg-dark': darkMode}">
        <div class="modal-header" :class="{'text-white': darkMode}">
          <h4 class="modal-title">
            Edit Speaker Layout
          </h4>
          <div>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="handleCancel">
              <span aria-hidden="true" :class="{'text-white': darkMode}">&times;</span>
            </button>
              <div
                v-show="hasUnsavedChanges"
                class="alert alert-warning small"
                role="alert"
                style="margin-bottom:0;position:absolute;right:60px"
              >
                You have unsaved changes. Click Save to apply them.<br/>
                Updating speaker layout may take up to 5 minutes.
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
                      :checked="msoCopy?.speakers?.groups[spk.code]?.present || spk.code === 'lr'" 
                      :disabled="!allSpeakerToggles[spk.code].enabled"
                      @change="toggleSpeakerGroupLocal(spk.code); applyProductRulesLocal()"
                      
                    >
                    <label 
                      :id="'tooltip-container-' + spk.code" 
                      v-tooltip="allSpeakerToggles[spk.code]"
                      :class="{'form-check-label':spk.code !== 'lr', 'hidden-switch-label': spk.code === 'lr'}"
                      :for="'check-'+spk.code"
                    >
                      {{ spk.label }} 

                      <font-awesome-icon
                        v-if="spk.code === seatShakerChannel"
                        :icon="['fas', 'couch']"
                      />

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
                        :class="{'btn-primary': msoCopy?.speakers?.groups[spk.code]?.size === 'd', 'btn-secondary': msoCopy?.speakers?.groups[spk.code]?.size !== 'd'}"
                        @click="setSpeakerSizeLocal(spk.code, 'd')"
                      >
                        Dolby
                      </button>
                      <button
                        type="button"
                        class="btn"
                        :class="{'btn-primary': msoCopy?.speakers?.groups[spk.code]?.size === 's', 'btn-secondary': msoCopy?.speakers?.groups[spk.code]?.size !== 's'}"
                        @click="setSpeakerSizeLocal(spk.code, 's')"
                      >
                        Small
                      </button>
                      <button
                        type="button"
                        class="btn"
                        :class="{'btn-primary': msoCopy?.speakers?.groups[spk.code]?.size === 'l', 'btn-secondary': msoCopy?.speakers?.groups[spk.code]?.size !== 'l'}"
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

          <div
            v-if="!currentLayoutHasMatchingDiracFilter && !hasUnsavedChanges"
            class="alert alert-danger small"
            role="alert"
          >
            <div>Dirac Live is disabled; there are no Dirac filters available for the current speaker layout. </div>
            <div v-if="mso.cal?.currentLayout">
              Current Layout: <strong>{{ mso.cal?.currentLayout }}</strong>
            </div>
            <div v-if="mso.cal?.availableFilterLayouts">
              Layouts with Available Dirac Filters: <strong>{{ mso.cal?.availableFilterLayouts?.join(", ") }}</strong>
            </div>
          </div>
        

          <div
            v-else-if="!selectedLayoutHasMatchingDiracFilter"
            class="alert alert-danger small"
            role="alert"
          >
            <div>The selected speaker layout has no Dirac calibrations. Saving will result in an empty layout. This is a necessary first step to calibrating that layout. </div>
            <div v-if="selectedLayout">
              Selected Layout: <strong>{{ selectedLayout }}</strong>
            </div>
            <div v-if="mso.cal?.availableFilterLayouts">
              Layouts with Available Dirac Filters: <strong>{{ mso.cal?.availableFilterLayouts?.join(", ") }}</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer" :class="{'text-white': darkMode}">
            <div class="row justify-content-end">
              
                <button 
                  class="btn btn-sm btn-secondary mr-3"
                  @click="handleCancel"
                >
                  Cancel
                </button>
              
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

</template>

<script>

  import { computed, onMounted, ref } from 'vue';
  import { commit, get } from 'lodash-es';
  import { applyPatch, deepClone, compare } from 'fast-json-patch/index.mjs';
  import { Tooltip } from '@/directives/Tooltip.js';

  import useMso from '@/use/useMso.js';
  import useLocalStorage from '@/use/useLocalStorage';
  import useSpeakerGroups from '@/use/useSpeakerGroups';

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
        executeMacro, commitSpeakerLayout, diracMismatchedChannelGroups,
        currentLayoutHasMatchingDiracFilter, seatShakerChannel } = useMso();
      const { darkMode } = useLocalStorage();
      const { getActiveChannels, reverseBmg, spgFromGroupsString } = useSpeakerGroups();

      const msoCopy = ref(null);

      onMounted(() => {
        msoCopy.value = deepClone(mso.value);
      });

      const selectedLayout = computed(() => {
        return spgFromGroupsString(msoCopy.value?.speakers?.groups);
      })

      const activeChannelsCopy = computed(() => {
        return getActiveChannels(msoCopy.value.speakers?.groups);
      });

      const selectedLayoutHasMatchingDiracFilter = computed(() => {
        console.log(msoCopy.value?.cal?.availableFilterLayouts,selectedLayout.value)
        return msoCopy.value?.cal?.availableFilterLayouts?.includes(selectedLayout.value);
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
          message: '',
        };

        const groups = msoCopy.value?.speakers?.groups;

        if (groups && groups[spkCode] && !groups[spkCode].present) {
          // if 16 channels are already set, disable toggles that are off to prevent adding more speakers

          let limit = 16;
          if (spkCode !== 'c' && !spkCode.startsWith('sub')) {
            limit = 15;
          }

          if (activeChannelsCopy.value.length >= limit && spkCode !== 'lr') {
            // return false;
            result.enabled = false;
            result.message = 'A maximum of 16 speakers is allowed.';
            return result;
          }

          const validations = speakerGroupValidations.value[spkCode]; //getSpeakerGroupValidations(spkCode, groups);

          if (validations && validations.length > 0) {
            for (const validation of validations) {
              if (!validation.rule) {
                result.enabled = false;
                result.message = validation.message;
                return result;
              }
            }
          }
        }

        if (spkCode === seatShakerChannel.value) {
          result.enabled = spkCode !== 'sub5';
          result.message = 'Seat shaker channel. This channel will be excluded from Dirac calibrations and will not have any filter corrections while Dirac is enabled. ';
          if (!result.enabled) {
            result.message += 'Subwoofer 5 is used by seat shaker channel. Disable seat shaker to enable subwoofer 5.';
          }
          return result;
        }

        return result;
      }

      function showCrossoverControlsForSpeaker(spkCode) {
        return showCrossoverControls.value && !spkCode?.startsWith('sub');
      }

      function showCenterFreqControlsForSpeaker(spkCode) {
        return showCrossoverControlsForSpeaker(spkCode) && msoCopy.value?.speakers?.groups[spkCode]?.size !== 'l';
      }

      function showDolby(spkCode) {
        return spkCode.includes('t'); // top
      }

      function handleCancel() {
        emit('cancel');
      }

      // TODO refactor into reusable component
      function toggleSpeakerGroupLocal(spkCode) {
        return patchMsoLocal( 'replace', `/speakers/groups/${spkCode}/present`, !msoCopy.value.speakers.groups[spkCode]?.present);
      }

      function setCenterFreqLocal(spkCode, centerFreq) {
        return patchMsoLocal( 'replace', `/speakers/groups/${spkCode}/fc`, parseInt(centerFreq));
      }

      function setSpeakerSizeLocal(spkCode, sizeCode) {
        return patchMsoLocal( 'replace', `/speakers/groups/${spkCode}/size`, sizeCode);
      }

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

      function setSpeakerGroupPresentLocal(spkCode, present) {
        return patchMsoLocal( 'replace', `/speakers/groups/${spkCode}/present`, present);
      }

      function applyProductRulesLocal() {
        const groups = ['c', 'lrs', 'lrb', 'lrw', 'lrtf', 'lrtm', 'lrtr', 'lrhf', 'lrhr', 'sub1', 'sub2', 'sub3', 'sub4', 'sub5'];
        const spg = msoCopy.value.speakers?.groups;

        if (spg) {

          // too many channels, disable speaker groups until under 16
          if (activeChannelsCopy.value.length > 16) {
            let over = activeChannelsCopy.value.length - 16;
            // iterate speaker groups in reverse order, 
            // excluding subs, so starting at index 8 = lrhr
            // and disable them until the total channel count <= 16
            for (let i = 8; i >= 0; i--) { 
              if (spg[groups[i]].present) {
                setSpeakerGroupPresentLocal(groups[i], false);
                over -= 2;
              }
              
              // total channels is now 16 or less
              if (over <= 0) {
                break;
              }
            }
          }

          setSpeakerGroupPresentLocal('lrb', spg.lrb.present && spg.lrs.present); // No backs when no surround
          setSpeakerGroupPresentLocal('lrw', spg.lrw.present && spg.lrb.present); // No wides when no backs
          setSpeakerGroupPresentLocal('lrhf', spg.lrhf.present && (!spg.lrtf.present)); // No height front if top front present

          if ((!spg.lrs.present) && (spg.lrtm.present) && (spg.lrtf.present || spg.lrtr.present || spg.lrhf.present || spg.lrhr.present)) {
              setSpeakerGroupPresentLocal('lrtf', false);
              setSpeakerGroupPresentLocal('lrtr', false);
              setSpeakerGroupPresentLocal('lrhf', false);
              setSpeakerGroupPresentLocal('lrhr', false);
          }
          if ((!spg.lrs.present) && (!spg.lrtm.present) && (spg.lrtr.present || spg.lrhr.present)) {
              setSpeakerGroupPresentLocal('lrtf', spg.lrtf.present && (!spg.lrhf.present));
              setSpeakerGroupPresentLocal('lrtr', false);
              setSpeakerGroupPresentLocal('lrhr', false);
          }
          if ((!spg.c.present) && (!spg.lrb.present)) {
              setSpeakerGroupPresentLocal('lrtm', false);
          }
          spg.lrtf.present = spg.lrtf.present && (!spg.lrhf.present); // only one front allowed
          spg.lrtr.present = spg.lrtr.present && (!spg.lrhr.present); // only one rear allowed
          if ((!spg.lrtf.present) && (!spg.lrhf.present)) {
              setSpeakerGroupPresentLocal('lrhr', false); // no fronts . clear rears
              setSpeakerGroupPresentLocal('lrtr', false);
          }
          // No top middle when top front present but top rear not present
          if (spg.lrtm.present && spg.lrtf.present) {
              if ((!spg.lrtr.present) && (!spg.lrhr.present)) {
                  setSpeakerGroupPresentLocal('lrtm', false);
              }
          }
          if (spg.lrtm.present && spg.lrhf.present) {
              if ((!spg.lrtr.present) && (!spg.lrhr.present)) {
                  setSpeakerGroupPresentLocal('lrtm', false);
              }
          }

          setSpeakerGroupPresentLocal('sub2', spg.sub2.present && spg.sub1.present); // No sub2 without sub
          setSpeakerGroupPresentLocal('sub3', spg.sub3.present && spg.sub2.present); // No sub3 without sub2
          setSpeakerGroupPresentLocal('sub4', spg.sub4.present && spg.sub3.present); // No sub4 without sub3
          setSpeakerGroupPresentLocal('sub5', spg.sub5.present && spg.sub4.present); // No sub5 without sub4
        }
      }

      function save() {
        console.log('save', unsavedChanges.value);
        executeMacro(unsavedChanges.value);
        setTimeout(() => {
          commitSpeakerLayout();
          emit('cancel');
        }, 2000);
      }

      const unsavedChanges = computed(() => {
        if (!msoCopy.value?.speakers?.groups) {
          return false;
        }
        return compare(mso.value, msoCopy.value).filter(x => x.path.startsWith('/speakers/groups') || x.path.startsWith('/speakers/seatshaker'))
      });

      const hasUnsavedChanges = computed(() => {
        return unsavedChanges.value.length > 0;
      });

      return { 
        mso, msoCopy, showCrossoverControls, setSpeakerSizeLocal, setCenterFreqLocal,
        showCrossoverControlsForSpeaker, showCenterFreqControlsForSpeaker, showDolby,
        props, allSpeakerToggles, diracMismatchedChannelGroups, handleCancel, toggleSpeakerGroupLocal,
        hasUnsavedChanges, unsavedChanges, save, darkMode, seatShakerChannel,
        applyProductRulesLocal, currentLayoutHasMatchingDiracFilter, selectedLayoutHasMatchingDiracFilter,
        selectedLayout
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

  .modal-header.text-white {
    border-bottom:1px solid #212529;
  }

  .modal-footer.text-white {
    border-top:1px solid #212529;
  }

</style>