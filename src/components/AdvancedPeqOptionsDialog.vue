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
            Advanced PEQ Options
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
              </div>
          </div>
        </div>
        <div class="modal-body text-left">

          <dismissable-alert alert-key="calibration-advanced-peq">
            Two PEQ modes are available:
            <ul>
              <li>
                PEQ "pre" Dirac Live. This is the default. PEQ operates on channel signal which are then fed into the Dirac Live filter. BEQ requires this setting. PEQ can be adjusted at any time. PEQ will operate on the LFE signal, and not on the separate subwoofer speaker signals.
              </li>
              <li>
                PEQ "post" Dirac Live. PEQ can be used to "pre-calibrate" before running the Dirac Live calibration. PEQ remains enabled while calibrating. "User" PEQ setting will then be frozen after the calibration. The PEQ module is located downstream of (post) the Dirac Live filters. This allows you to make Dirac Live's job a bit easier by addressing EQ issues before calibrating. But per Dirac Live rules, you cannot adjust the user delay, trim and PEQ after calibrating.
              </li>
            </ul>

          </dismissable-alert>

          <div class="alert alert-warning small" role="alert" v-if="peqSwitchWarning">
            PEQ Configuration locked down because a Dirac Live ART/BC filter is loaded. Delete all BC/ART filters to regain access.
          </div>

          <table class="table table-sm table-striped table-resonsive select">
            <thead>
              <tr>
                <th>
                  PEQ Configuration
                </th>
              </tr>
            </thead>
            <tbody>
              <!-- Apply PEQ pre-Dirac (default) -->
              <tr>
                <td>
                  <div class="form-check">
                    <input 
                      id="pre-dirac" 
                      class="form-check-input" 
                      type="radio" 
                      name="left-label" 
                      :checked="msoCopy?.peq?.location === 'pre' && msoCopy?.cal?.peq_during_cal === 'off'" 
                      @click="setPreDiracLocal()"
                      :disabled="!peqSwitchEnabled"
                    >
                    <label 
                      class="form-check-label" 
                      for="pre-dirac"
                    >
                      Apply PEQ pre-Dirac Live (default)
                    </label>
                  </div>
                </td>
              </tr>
              <!-- Apply PEQ post-Dirac and during calibration (advanced) -->
              <tr>
                <td>
                  <div class="form-check">
                    <input 
                      id="post-dirac-during" 
                      class="form-check-input" 
                      type="radio" 
                      name="left-label" 
                      :checked="msoCopy?.peq?.location === 'post' && msoCopy?.cal?.peq_during_cal === 'on'" 
                      @click="setPostDiracAndDuringCalLocal()"
                      :disabled="!peqSwitchEnabled"
                    >
                    <label 
                      class="form-check-label" 
                      for="post-dirac-during"
                    >
                      Apply PEQ post-Dirac Live and during calibration (advanced)
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
                  @click="save"
                  :disabled="!hasUnsavedChanges"
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
  import { get } from 'lodash-es';
  import { applyPatch, deepClone, compare } from 'fast-json-patch/index.mjs';
  import { Tooltip } from '@/directives/Tooltip.js';

  import DismissableAlert from './buttons/DismissableAlert.vue';

  import useMso from '@/use/useMso.js';
  import useLocalStorage from '@/use/useLocalStorage';

  export default {
    'name': 'AdvancedPeqOptionsDialog',
    directives: {
      Tooltip
    },
    components: {
      DismissableAlert,
    },
    'props': {
    },
    setup(props, { emit }) {
      function handleCancel() {
        emit('cancel');
      }
      const { mso, calToolConnected, diracFilterTransferInProgress, executeMacro, diracBCArtFilterExists, delayPeqAllowed } = useMso();
      const { darkMode } = useLocalStorage();

      const msoCopy = ref(null);
      const forceShowNotice = ref(false);

      const peqSwitchEnabled = computed(() => {
        return delayPeqAllowed.value !== 'blocked' || !diracBCArtFilterExists.value;
      });

      const peqSwitchWarning = computed(() => {
        return delayPeqAllowed.value !== 'OK' && diracBCArtFilterExists.value;
      });

      onMounted(() => {
        msoCopy.value = deepClone(mso.value);
      });

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

      function setPreDiracLocal() {
        const peq_location = patchMsoLocal('replace', `/peq/location`, 'pre');
        const peq_during_cal = patchMsoLocal('replace', '/cal/peq_during_cal', 'off');
        return peq_location && peq_during_cal;
      }

      function setPostDiracAndDuringCalLocal() {
        const peq_location = patchMsoLocal('replace', `/peq/location`, 'post');
        const peq_during_cal = patchMsoLocal('replace', '/cal/peq_during_cal', 'on');
        return peq_location && peq_during_cal;
      }

      function setPostDiracAndNoCalLocal() {
        const peq_location = patchMsoLocal('replace', `/peq/location`, 'post');
        const peq_during_cal = patchMsoLocal('replace', '/cal/peq_during_cal', 'off');
        return peq_location && peq_during_cal;
      }

      const unsavedChanges = computed(() => {
        if (!msoCopy.value?.cal || !msoCopy.value?.peq) {
          return false;
        }
        return compare(mso.value, msoCopy.value).filter(x => x.path.startsWith('/cal') || x.path.startsWith('/peq'))
      });

      const hasUnsavedChanges = computed(() => {
        return unsavedChanges.value.length > 0;
      });

      function save() {
        forceShowNotice.value = true;
        console.log('save', unsavedChanges.value);
        executeMacro(unsavedChanges.value);
        setTimeout(() => {
          // commitSpeakerLayout();
          emit('cancel');
        }, 2000);
      }

      return { 
        msoCopy, darkMode, handleCancel, unsavedChanges, hasUnsavedChanges, setPreDiracLocal, setPostDiracAndDuringCalLocal, setPostDiracAndNoCalLocal, save, forceShowNotice,
        peqSwitchEnabled, peqSwitchWarning
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