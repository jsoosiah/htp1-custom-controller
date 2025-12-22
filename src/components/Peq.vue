<template>
  <div class="transition-container">
    <h5>Parametric Equalization Filters <small class="text-muted">up to 16 bands are available</small></h5>
    <dismissable-alert alert-key="peq-bypass">
      Note that a gain of 0dB is equivalent to bypassing the filter; * denotes channels or bands that have been modified and have active PEQ filters.
    </dismissable-alert>
    <peq-chart 
      ref="chartRef"
      :peq-slots="mso.peq?.slots || []"
      :active-channels="activeChannels"
      :selected-channel="selectedChannel"
      :spk-name="spkNamePre"
      :dark-mode="darkMode"
    />
    <div class="row justify-content-between">
      <div class="col-auto mb-3">
        <two-state-button 
          :button-text="`Parametric Equalization: ${mso.peq?.peqsw ? 'on' : 'off'}`"
          :state-on="mso.peq?.peqsw"
          @click="toggleGlobalPEQ()"
        />
      </div>
      <div class="col-auto mb-3">
        <div
          class="btn-group btn-group-sm"
          role="group"
          aria-label="Group By"
        >
          <button
            type="button"
            class="btn"
            :class="{'btn-primary': eqGroupBy === 0, 'btn-secondary': eqGroupBy !== 0}"
            @click="setGroupBy(0)"
          >
            Group by Channel
          </button>
          <button
            type="button"
            class="btn"
            :class="{'btn-primary': eqGroupBy === 1, 'btn-secondary': eqGroupBy !== 1}"
            @click="setGroupBy(1)"
          >
            Group by Band
          </button>
        </div>
      </div>
    </div>
    <div
      v-show="isPeqPre"
      class="row"
    >
      <div class="col">
        <dismissable-alert
          alert-key="peq-pre"
          class="alert-info"
        >
          PEQ is applied pre-Dirac Live. PEQ controls are available on the LFE channel rather than individual subwoofer channels. 
        </dismissable-alert>
      </div>
    </div>
    <div
      v-show="!mso.peq?.peqsw"
      class="row"
    >
      <div class="col">
        <dismissable-alert
          alert-key="peq-off"
          class="alert-warning"
        >
          Parametric equalization is currently turned off. The following PEQ settings may be modified, but they will not have any effect until PEQ is turned on.
        </dismissable-alert>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <dismissable-alert
          v-if="mso.peq.beqActive"
          alert-key="beq-filters-highlighted"
          class="alert-warning"
        >
          BEQ filters are highlighted.
        </dismissable-alert>
      </div>
    </div>
    <!-- group by band --> 
    <template v-if="eqGroupBy === 1">
      <nav
        class="navbar nav-fill nav-pills"
        :class="{'bg-dark navbar-dark': darkMode, 'bg-light navbar-light': !darkMode}"
      >
        <a 
          v-for="(slot, index) in mso.peq?.slots"
          :key="index"
          class="nav-link" 
          :class="{'active': mso.peq?.currentpeqslot === index, 'italic': bandHasModifications(index)}" 
          href="javascript:void(0)" 
          @click="setSelectedBand(index)" 
        >
          Band {{ index + 1 }}
        </a>
      </nav>
      <table class="table table-sm table-responsive-lg table-striped">
        <thead>
          <tr>
            <th>Channel</th>
            <th class="text-right">
              Center Freq. (Hz)
            </th>
            <th class="text-right">
              Gain (dB)
            </th>
            <th class="text-right">
              Q
            </th>
            <th class="text-right">
              Filter Type
            </th>
            <th class="text-right">
              Bypass
            </th>
          </tr>
        </thead>
        <tbody :class="{'hiding':!tabLoaded, 'showing':tabLoaded}">
          <tr
            v-for="(channame, chanIndex) in activeChannels"
            :key="channame"
            :class="{'table-warning': mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].beq,
                     'table-danger': mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].bypass || channelInvalid(chanIndex)}"
            v-show="channelVisible(channame)"
          >
            <td>
              <span v-if="!peqWarning">
                {{ spkNamePre(channame) }}
              </span>
              <span v-else v-tooltip="{'message': warningMessagePeq}" :id="`peqbyband-${channame}`">
                {{ spkNamePre(channame) }}
                <font-awesome-icon :icon="['fas', 'question-circle']" />
              </span>
            </td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].Fc" 
                min="15" 
                max="20000" 
                step=".1" 
                @change="({ type, target }) => { clearAllImports(); setPEQCenterFrequency(activeChannels[chanIndex], mso.peq?.currentpeqslot, target.value) }"
                @focus="setSelectedChannel(chanIndex, true)"
                :disabled="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].bypass === true || !peqEnabled"
              >
            </td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].bypass === true ? mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].preBypassGain : mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].gaindB" 
                :disabled="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].bypass === true || !peqEnabled"
                min="-99" 
                max="20" 
                step=".1" 
                @change="({ type, target }) => { clearAllImports(); setPEQGain(activeChannels[chanIndex], mso.peq?.currentpeqslot, target.value) }"
                @focus="setSelectedChannel(chanIndex, true)"
                v-show="!(mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].bypass === true && mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].preBypassFilterType === 3 || mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].FilterType === 3)"
              >
            </td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].Q" 
                min=".1" 
                max="10" 
                step=".1" 
                @change="({ type, target }) => { clearAllImports(); setPEQQuality(activeChannels[chanIndex], mso.peq?.currentpeqslot, target.value) }"
                @focus="setSelectedChannel(chanIndex, true)"
                :disabled="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].bypass === true || !peqEnabled"
              >
            </td>
            <td class="text-right">
              <select 
                class="form-control form-control-sm" 
                @change="({ type, target }) => { clearAllImports(); setPEQFilterType(activeChannels[chanIndex], mso.peq?.currentpeqslot, target.value) }"
                @focus="setSelectedChannel(chanIndex, true)"
                :disabled="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].bypass === true || !peqEnabled"
              >
                <option 
                  v-for="filterType in filterTypes" 
                  :key="filterType.value"
                  :value="filterType.value"
                  
                  :selected="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].bypass === true ? mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].preBypassFilterType : mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].FilterType"
                >
                  {{ filterType.label }}
                </option>
              </select>
            </td>
            <td class="text-right">
              <two-state-button
                :button-text="`Bypass: ${mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].bypass ? 'on' : 'off'}`"
                :state-on="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].bypass === true"
                :mute-button="true"
                @btn-click="togglePEQBypass(activeChannels[chanIndex], mso.peq?.currentpeqslot)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </template>
    
    <!-- group by channel -->
    <template v-else>
      <nav
        class="navbar nav-fill nav-pills"
        :class="{'bg-dark navbar-dark': darkMode, 'bg-light navbar-light': !darkMode}"
      >
        <a 
          v-for="(channame, index) in activeChannels"
          :key="channame"
          class="nav-link" 
          :class="{'active': selectedChannel === index, 'italic': channelHasModifications(channame)}" 
          href="javascript:void(0)" 
          @click="setSelectedChannel(index)" 
          v-show="channelVisible(channame)"
        >
          {{ spkNamePre(channame) }}
          <font-awesome-icon
                        v-if="channame === seatShakerChannel"
                        :icon="['fas', 'couch']"
                      />
        </a>
      </nav>
      <table class="table table-sm table-responsive-md table-striped">
        <thead>
          <tr>
            <th class="text-right">
              Band
            </th>
            <th class="text-right">
              Center Freq. (Hz)
            </th>
            <th class="text-right">
              Gain (dB)
            </th>
            <th class="text-right">
              Q
            </th>
            <th class="text-right">
              Filter Type
            </th>
            <th class="text-right">
              Bypass
            </th>
          </tr>
        </thead>
        <tbody :class="{'hiding':!tabLoaded, 'showing':tabLoaded}">
          <tr
            v-for="(slot, index) in mso.peq?.slots"
            :key="index"
            :class="{'table-warning': slot.channels[activeChannels[selectedChannel]].beq,
                     'table-danger': slot.channels[activeChannels[selectedChannel]].bypass || bandInvalid(activeChannels[selectedChannel], index)}"
          >
            <td class="text-right">
              <span v-if="!peqWarning">{{ index + 1 }}</span>
              <span v-else v-tooltip="{'message': warningMessagePeq}" :id="`peqbychan-${index}`">
                {{ index + 1 }}
                <font-awesome-icon :icon="['fas', 'question-circle']"/>
              </span>
            </td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="slot.channels[activeChannels[selectedChannel]].Fc" 
                min="15" 
                max="20000" 
                step=".1" 
                @change="({ type, target }) => { handleCenterFreq(activeChannels[selectedChannel], index, target.value) }"
                :disabled="slot.channels[activeChannels[selectedChannel]].bypass === true || !peqEnabled"
              >
            </td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="slot.channels[activeChannels[selectedChannel]].bypass === true ? slot.channels[activeChannels[selectedChannel]].preBypassGain : slot.channels[activeChannels[selectedChannel]].gaindB" 
                :disabled="slot.channels[activeChannels[selectedChannel]].bypass === true || !peqEnabled"
                min="-99" 
                max="20" 
                step=".1" 
                @change="({ type, target }) => { handleGain(activeChannels[selectedChannel], index, target.value) }"
                v-show="!(slot.channels[activeChannels[selectedChannel]].bypass === true && slot.channels[activeChannels[selectedChannel]].preBypassFilterType === 3 || slot.channels[activeChannels[selectedChannel]].FilterType === 3)"
              >
            </td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="slot.channels[activeChannels[selectedChannel]].Q" 
                min="0.1" 
                max="10" 
                step=".1" 
                @change="({ type, target }) => { handleQ(activeChannels[selectedChannel], index, target.value) }"
                :disabled="slot.channels[activeChannels[selectedChannel]].bypass === true || !peqEnabled"
              >
            </td>
            <td class="text-right">
              <select 
                class="form-control form-control-sm" 
                @change="({ type, target }) => { handleFilterType(activeChannels[selectedChannel], index, target.value) }"
                :disabled="slot.channels[activeChannels[selectedChannel]].bypass === true || !peqEnabled"
              >
                <option 
                  v-for="filterType in filterTypes" 
                  :key="filterType.value"
                  :value="filterType.value"
                  :selected="filterType.value === (slot.channels[activeChannels[selectedChannel]].bypass === true ? slot.channels[activeChannels[selectedChannel]].preBypassFilterType : slot.channels[activeChannels[selectedChannel]].FilterType)"
                >
                  {{ filterType.label }}
                </option>
              </select>
            </td>
            <td class="text-right">
              <two-state-button
                :button-text="`Bypass: ${slot.channels[activeChannels[selectedChannel]].bypass ? 'on' : 'off'}`"
                :state-on="slot.channels[activeChannels[selectedChannel]].bypass === true"
                :mute-button="true"
                @btn-click="handleBypass(activeChannels[selectedChannel], index)"
                :disabled="!peqEnabled"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <!-- channel groups -->
    <template v-if="secretSettings">
      <h6>Channel Groups</h6>
      <div class="row mb-3">
        <div class="col-auto">
          <div class="custom-control custom-switch">
            <input 
              id="link-all-channels" 
              type="checkbox" 
              class="custom-control-input" 
              :checked="linkAllChannels" 
              @change="toggleLinkAllChannels"
            >
            <label 
              class="custom-control-label"
              for="link-all-channels"
            >
              Link All Channels
            </label>
          </div>
        </div>
      </div>
    </template>

    <!-- export operations -->
    <template v-if="eqGroupBy === 1">
      <h6>Export Band {{ mso.peq?.currentpeqslot + 1 }}</h6>
      <div class="row">
        <div class="col-auto">
          <button 
            class="btn btn-sm btn-primary mb-3"
            @click="downloadSingleBandConfig(mso.peq?.currentpeqslot)"
          >
            Export Band {{ mso.peq?.currentpeqslot + 1 }} PEQ Configuration to File
          </button>
        </div>
      </div>
    </template>
    <template v-else>
      <h6>Export Channel {{ spkNamePre(activeChannels[selectedChannel]) }}</h6>
      <div class="row">
        <div class="col-auto">
          <button 
            class="btn btn-sm btn-primary mb-3"
            @click="downloadSingleChannelConfig(activeChannels[selectedChannel])"
          >
            Export {{ spkNamePre(activeChannels[selectedChannel]) }} PEQ Configuration to File
          </button>
        </div>
        <div class="col-auto">
          <button
            class="btn btn-sm btn-primary mb-3"
            @click="downloadSingleChannelTargetCurve(activeChannels[selectedChannel])"
          >
            Export {{ spkNamePre(activeChannels[selectedChannel]) }} PEQ to Dirac Live Target Curve
          </button>
        </div>
      </div>
    </template>
    <h6>Export Full PEQ Configuration</h6>
    <div class="row">
      <div class="col-auto">
        <button 
          class="btn btn-sm btn-primary mb-3"
          @click="downloadFullConfig()"
        >
          Export Full PEQ Configuration to File
        </button>
      </div>
    </div>

    <!-- import operations -->

    <!-- import operations for band -->
    <template v-if="eqGroupBy === 1">
      <h6>Import Band PEQ Configuration to Band {{ mso.peq?.currentpeqslot + 1 }}</h6>
      <div class="row">
        <div class="col-auto">
          <div class="form-group">
            <label for="import-file-band">Select Band PEQ Configuration File</label>
            <input 
              id="import-file-band"
              ref="importBandRef" 
              type="file" 
              class="form-control-file" 
              @change="bandImportFileSelected"
              :disabled="!peqEnabled"
            >
          </div>
          <mso-importer 
            v-if="bandImportJson" 
            :mso-import-patch="bandImportPatch"
            @confirm-import="confirmImport(bandImportPatch)"
          />
        </div>
      </div>
    </template>
    <!-- import operations for channel -->
    <template v-else>
      <h6>Import Channel PEQ Configuration or REW Filter to Channel {{ spkNamePre(activeChannels[selectedChannel]) }}</h6>
      <div class="row">
        <div class="col-auto">
          <div class="form-group">
            <label for="import-file-channel">Select Channel PEQ Configuration File or REW filter file</label>
            <input 
              id="import-file-channel"
              ref="importChannelRef" 
              type="file" 
              class="form-control-file" 
              @change="channelImportFileSelected"
              :disabled="!peqEnabled"
            >
          </div>
          <mso-importer 
            v-if="channelImportJson" 
            :mso-import-patch="channelImportPatch"
            :validation-warnings="channelImportValidationWarnings"
            @confirm-import="confirmImport(channelImportPatch)"
          />
        </div>
      </div>
    </template>
    <!-- global import operations -->
    <h6>Import Full PEQ Configuration File</h6>
    <div class="row">
      <div class="col-auto">
        <div class="form-group">
          <label for="import-file-full">Select Full PEQ Configuration File</label>
          <input 
            id="import-file-full"
            ref="importFullRef" 
            type="file" 
            class="form-control-file" 
            @change="fullImportFileSelected"
            :disabled="!peqEnabled"
          >
        </div>
        <mso-importer 
          v-if="fullImportJson" 
          :mso-import-patch="fullImportPatch"
          @confirm-import="confirmImport(fullImportPatch)"
        />
      </div>
    </div>
    
    <!-- clone operations --> 
    <template v-if="eqGroupBy === 0">
      <h6>Clone Channel {{ spkNamePre(activeChannels[selectedChannel]) }} PEQ to Other Channels</h6>
      <div class="form-group">
        <label for="target-channels">Target Channels</label>
        <select
          id="target-channels"
          v-model="targetCloneChannels"
          multiple
          class="form-control"
          :disabled="!peqEnabled"
        >
          <option
            v-for="channel in selectableChannels"
            :key="channel"
            :value="channel"
          >
            {{ spkNamePre(channel) }}
          </option>
        </select>
      </div>
      <div class="row">
        <div class="col-auto">
          <button 
            class="btn btn-sm btn-primary mb-3"
            :disabled="targetCloneChannels.length === 0 || !peqEnabled"
            @click="cloneSelectedChannelPEQToTargetChannels"
          >
            Clone {{ spkNamePre(activeChannels[selectedChannel]) }} PEQ to Selected Channels
          </button>
        </div>
      </div>
    </template>

    <!-- reset operations --> 
    <h6>Reset PEQ Settings</h6>
    <!-- band reset operations -->
    <template v-if="eqGroupBy === 1">
      <div class="row">
        <div class="col-auto">
          <button 
            class="btn btn-sm btn-warning mb-3"
            @click="resetPEQsForBand(mso.peq?.currentpeqslot)"
          >
            Reset Settings for Band {{ mso.peq?.currentpeqslot + 1 }} 
          </button>
        </div>
      </div>
    </template>
    <!-- channel reset operations -->
    <template v-else>
      <div class="row">
        <div class="col-auto">
          <button 
            class="btn btn-sm btn-warning mb-3"
            @click="resetPEQsForChannel(activeChannels[selectedChannel])"
          >
            Reset Settings for Channel {{ spkNamePre(activeChannels[selectedChannel]) }}
          </button>
        </div>
      </div>
    </template>
    <!-- global reset operations -->
    <div class="row">
      <div class="col-auto">
        <button 
          class="btn btn-sm btn-danger mb-3"
          @click="resetAllPEQs"
        >
          Reset All PEQ Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script>

  import { ref, computed } from 'vue';
  import { compare } from 'fast-json-patch/index.mjs';

  import useLocalStorage from '@/use/useLocalStorage.js';
  import useImportExport from '@/use/useImportExport.js';
  import useMso from '@/use/useMso.js';
  import useSpeakerGroups from '@/use/useSpeakerGroups.js';

  import TwoStateButton from './buttons/TwoStateButton.vue';
  import MsoImporter from './MsoImporter.vue';
  import PeqChart from './PeqChart.vue';
  import DismissableAlert from './buttons/DismissableAlert.vue';

  import { Tooltip } from '@/directives/Tooltip.js';

  export default {
    name: 'Eq',
    components: {
      TwoStateButton,
      MsoImporter,
      PeqChart,
      DismissableAlert
    },
    directives: {
      Tooltip,
    },
    setup() {

      const { importJson: channelImportJson, importJsonFileToSelected: channelImportJsonFileToSelected, 
        validationWarnings: channelImportValidationWarnings, exportTargetToFile } = useImportExport();
      const { importJson: bandImportJson, importJsonFileToSelected: bandImportJsonFileToSelected } = useImportExport();
      const { importJson: fullImportJson, importJsonFileToSelected: fullImportJsonFileToSelected, exportJsonToFile } = useImportExport();
      
      const { eqGroupBy, setEqGroupBy, darkMode } = useLocalStorage();
      const { mso, setPEQSlot, resetPEQ, importMsoPatchList, activeChannels,
        setPEQCenterFrequency, setPEQQuality, setPEQFilterType, setPEQGain, togglePEQBypass,
        delayPeqAllowed, diracFilterType, filterTypeToCssClass, diracErrorState } = useMso();
      const { getActiveChannels, spkName } = useSpeakerGroups();

      const chartRef = ref(null);
      const tabLoaded = ref(true);

      const importChannelRef = ref(null);
      const importBandRef = ref(null);
      const importFullRef = ref(null);

      const targetCloneChannels = ref([]);

      const isPeqPre = computed(() => {
        return mso?.value?.peq?.location === "pre" && diracErrorState.value === 'GREEN';
      });

      const peqEnabled = computed(() => {
        return mso?.value?.peq.location === "pre" || delayPeqAllowed.value !== 'blocked' || diracErrorState.value !== 'GREEN';
      });

      const peqWarning = computed(() => {
        return mso?.value?.peq.location !== "pre" && delayPeqAllowed.value !== 'OK' && diracErrorState.value === 'GREEN';
      });

      // const activeChannels = computed(() => {
      //   return getActiveChannels(mso.value.speakers?.groups);
      // });

      const selectableChannels = computed(() => {
        console.log('selectable',activeChannels)
        return activeChannels.value.filter((ch, index) => index !== selectedChannel.value);
      });

      const selectedChannel = ref(0);

      const linkAllChannels = ref(false);

      const secretSettings = computed(() => window.location.href.includes('secret'));

      function setSelectedChannel(chanNumber, skipLoader) {

        if (skipLoader) {
          selectedChannel.value = chanNumber;
          return;
        }

        tabLoaded.value = false;

        setTimeout(() => {
          selectedChannel.value = chanNumber;
          tabLoaded.value = true;
        }, 100);
      }

      function setSelectedBand(bandNumber) {
        tabLoaded.value = false;

        setTimeout(() => {
          setPEQSlot(bandNumber);
          tabLoaded.value = true;
        }, 100);
      }

      function channelHasModifications(channame) {
        return mso.value.peq?.slots.filter(
          slot => slot.channels[channame].gaindB !== 0
        ).length > 0;
      }

      function bandHasModifications(band) {
        return Object.entries(mso.value.peq?.slots[band].channels).filter(chan => {
          return chan[1].gaindB !== 0
        }).length > 0;
      }

      function setGroupBy(grpBy) {
        tabLoaded.value = false;

        setTimeout(() => {
          setEqGroupBy(grpBy);
          tabLoaded.value = true;
        }, 100);
        
      }

      function downloadFullConfig() {
        exportJsonToFile(mso.value.peq?.slots, `peq-all`);
      }

      function downloadSingleBandConfig(band) {
        exportJsonToFile(mso.value.peq?.slots[band].channels, `peq-band-${band+1}`);
      }

      function downloadSingleChannelConfig(channame) {
        const singleChannelPeqs = mso.value.peq?.slots.map(
          slot => ({channels: {
            [channame]: slot.channels[channame]
          }})
        );
        exportJsonToFile(singleChannelPeqs, `peq-channel-${channame}`);
      }

      function downloadSingleChannelTargetCurve(channame) {
        exportTargetToFile(chartRef.value.exportData, `peq-channel-${channame}-target`);
      }

      function channelImportFileSelected(e) {
        const file = e.target.files[0];
        channelImportJsonFileToSelected(file);
      }

      function bandImportFileSelected(e) {
        const file = e.target.files[0];
        bandImportJsonFileToSelected(file);
      }

      function fullImportFileSelected(e) {
        const file = e.target.files[0];
        fullImportJsonFileToSelected(file);
      }

      function clearAllImports() {
        if (importChannelRef.value?.value) {
          importChannelRef.value.value = null;
          channelImportJson.value = null;
        }

        if (importBandRef.value?.value) {
          importBandRef.value.value = null;
          bandImportJson.value = null;
        }
        
        importFullRef.value.value = null;
        fullImportJson.value = null;
      }

      function resetPEQsForBand(band) {
        clearAllImports();
        for (const channame of activeChannels.value) {
          resetPEQ(channame, band);
        }
      }

      function resetPEQsForChannel(channel) {
        clearAllImports();
        for (let band = 0; band < 16; band++) {
          resetPEQ(channel, band);
        }
      }

      function resetAllPEQs() {
        if (confirm('All PEQs will be reset for all channels.')) {
          clearAllImports();
          for (let band = 0; band < 16; band++) {
            for (const channame of activeChannels.value) {
              resetPEQ(channame, band);
            }
          }
        }
      }

      // TODO validate
      const channelImportPatch = computed(() => {
        if (!channelImportJson.value || eqGroupBy.value === 1) {
          return [];
        }

        const fixedImportJson = [];

        console.log('channelImportPatch', eqGroupBy);

        // rewrite the channel name to the selected channel
        for (const slot of channelImportJson.value) {
          console.log(slot, Object.entries(slot.channels))
          for (const [key, channel] of Object.entries(slot.channels)) {
            fixedImportJson.push({channels: {
              [activeChannels.value[selectedChannel.value]]: channel
            }});
            break;
          }
        }

        console.log('fixedImportJson', fixedImportJson);

        // fix relative paths
        return compare(mso.value.peq?.slots, fixedImportJson).filter(patch => patch.op === 'replace')
          .map(patch => ({...patch, path: `/peq/slots${patch.path}`}));
      });

      // TODO validate
      const bandImportPatch = computed(() => {
        if (!bandImportJson.value || eqGroupBy.value === 0) {
          return [];
        }

        // fix relative paths
        return compare(mso.value.peq?.slots[mso.value?.peq.currentpeqslot].channels, bandImportJson.value)
          .map(patch => ({...patch, path: `/peq/slots/${mso.value?.peq.currentpeqslot}/channels${patch.path}`}));
      });

      // TODO validate
      const fullImportPatch = computed(() => {
        if (!fullImportJson.value) {
          return [];
        }

        // fix relative paths
        return compare(mso.value.peq?.slots, fullImportJson.value)
         .map(patch => ({...patch, path: `/peq/slots${patch.path}`}));
      });

      function confirmImport(patchList) {
        importMsoPatchList(patchList);
      }

      const filterTypes = [
        { label: 'PEQ', value: 0 },
        { label: 'Low Shelf', value: 1 },
        { label: 'High Shelf', value: 2 },
        { label: 'All Pass', value: 3 }
      ];

      function toListSentence(arr) {
        return arr.length < 3 ?
        arr.join(' and ') :
        `${arr.slice(0, -1).join(', ')}, and ${arr[arr.length - 1]}`;
      } 

      function cloneSelectedChannelPEQToTargetChannels() {
        if (confirm(`The PEQ for channel ${spkNamePre(activeChannels.value[selectedChannel.value])} will be cloned to the following channels, overwriting their existing PEQ filters: ${toListSentence(targetCloneChannels.value.map(ch => spkNamePre(ch)))}`)) {
          for (const channel of targetCloneChannels.value) {
            for (let band = 0; band < 16; band++) {
              const currentPEQ = mso.value.peq?.slots[band].channels[activeChannels.value[selectedChannel.value]];
              setPEQCenterFrequency(channel, band, currentPEQ.Fc);
              setPEQQuality(channel, band, currentPEQ.Q);
              setPEQFilterType(channel, band, currentPEQ.FilterType);
              setPEQGain(channel, band, currentPEQ.gaindB);
            }
          }

          targetCloneChannels.value = [];
        }
      }

      function toggleLinkAllChannels() {
        linkAllChannels.value = !linkAllChannels.value;
      }

      function handleCenterFreq(channel, slot, centerFreq) {
        clearAllImports(); 
        if (linkAllChannels.value) {
          for (const channame of activeChannels.value) {
            setPEQCenterFrequency(channame, slot, centerFreq);
          }
        } else {
          setPEQCenterFrequency(channel, slot, centerFreq);
        }
      }

      function handleGain(channel, slot, gain) {
        clearAllImports(); 
        if (linkAllChannels.value) {
          for (const channame of activeChannels.value) {
            setPEQGain(channame, slot, gain);
          }
        } else {
          setPEQGain(channel, slot, gain);
        }
      }

      function handleQ(channel, slot, q) {
        clearAllImports(); 
        if (linkAllChannels.value) {
          for (const channame of activeChannels.value) {
            setPEQQuality(channame, slot, q);
          }
        } else {
          setPEQQuality(channel, slot, q);
        }
      }

      function handleFilterType(channel, slot, filterType) {
        clearAllImports(); 
        if (linkAllChannels.value) {
          for (const channame of activeChannels.value) {
            setPEQFilterType(channame, slot, filterType);
          }
        } else {
          setPEQFilterType(channel, slot, filterType);
        }
      }

      function handleBypass(channel, slot) {
        clearAllImports(); 
        if (linkAllChannels.value) {
          for (const channame of activeChannels.value) {
            togglePEQBypass(channame, slot);
          }
        } else {
          togglePEQBypass(channel, slot); 
        }
      }

      function channelInvalid(chanIndex) {
        // TODO handle bypass
        return !peqEnabled.value && (mso?.value?.peq?.slots[mso?.value?.peq?.currentpeqslot].channels[activeChannels.value[chanIndex]].FilterType === 3 || mso?.value?.peq?.slots[mso?.value?.peq?.currentpeqslot].channels[activeChannels.value[chanIndex]].gaindB !== 0);
      }

      function bandInvalid(channel, slot) {
        // slot.channels[activeChannels[selectedChannel]].bypass
        return !peqEnabled.value && (mso?.value?.peq?.slots[slot].channels[channel].FilterType === 3 || mso?.value?.peq?.slots[slot].channels[channel].gaindB !== 0);
      }

      const warningMessagePeq = computed(() => {
        const baseMsg = `The Dirac Live ${filterTypeToCssClass(diracFilterType.value, true).toUpperCase()} filter carefully aligns the phase. Applying PEQ destroys the Dirac Live ${filterTypeToCssClass(diracFilterType.value, true).toUpperCase()} effect.`
        if (delayPeqAllowed.value === 'warn') {
          return baseMsg + " Edit at your own risk.";
        }

        return baseMsg;
      });

      function channelVisible(channame) {
        return !isPeqPre.value || !(channame !== 'sub1' && channame.startsWith('sub'));
      }

      function spkNamePre(spkId) {

        if (!isPeqPre.value) {
          return spkName(spkId);
        }

        if (spkId === 'sub1') {
          return 'LFE';
        }
        return spkName(spkId);
      }

      return {
        ...useMso(), activeChannels, spkNamePre, selectedChannel, setSelectedChannel, selectableChannels,
        bandHasModifications, channelHasModifications, filterTypes, tabLoaded, setSelectedBand, 
        downloadSingleChannelConfig, downloadSingleBandConfig, downloadFullConfig, 
        channelImportFileSelected, bandImportFileSelected, fullImportFileSelected, channelImportValidationWarnings,
        channelImportJson, bandImportJson, fullImportJson, bandImportPatch, channelImportPatch, fullImportPatch, 
        confirmImport, clearAllImports, importBandRef, importChannelRef, importFullRef,
        resetPEQsForBand, resetPEQsForChannel, resetAllPEQs,
        eqGroupBy, setGroupBy,
        cloneSelectedChannelPEQToTargetChannels, targetCloneChannels, 
        secretSettings, linkAllChannels, toggleLinkAllChannels,
        handleCenterFreq, handleGain, handleQ, handleFilterType, handleBypass, darkMode, chartRef,
        downloadSingleChannelTargetCurve, peqWarning, peqEnabled, warningMessagePeq, channelInvalid, bandInvalid,
        diracErrorState, channelVisible, isPeqPre
      };
    }
  }
</script>

<style scoped>

  .italic {
    font-style: italic;
  }

  .italic:after {
    content:" *";
    font-weight: bold;
  }

  .navbar {
    padding: 0;
  }

  .nav-link {
    text-transform: uppercase;
    font-size: .8rem;
    font-weight: 600;
    padding:0.5rem 0.675rem;
    border-radius: 0;
  }

  th {
    font-size:80%;
  }

  .table .form-control {
    width: auto;
    max-width: 6rem;
    float:right;
  }

  .table-sm td {
    padding:0 0.3rem;
  }

  .col-lg {
    padding-left: 0;
  }

</style>