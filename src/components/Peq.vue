<template>
  <div class="transition-container">
    <h5>Parametric Equalization Filters <small class="text-muted">up to 16 bands are available</small></h5>
    <div class="alert alert-info small" role="alert">
      Note that a gain of 0dB is equivalent to bypassing the filter; * denotes channels or bands that have been modified and have active PEQ filters.
    </div>
    <peq-chart 
      :peq-slots="mso.peq?.slots || []"
      :active-channels="activeChannels"
      :selected-channel="selectedChannel"
      :spk-name="spkName"
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
        <div class="btn-group btn-group-sm" role="group" aria-label="Group By">
          <button @click="setGroupBy(0)" type="button" class="btn" :class="{'btn-primary': eqGroupBy === 0, 'btn-secondary': eqGroupBy !== 0}">Group by Channel</button>
          <button @click="setGroupBy(1)" type="button" class="btn" :class="{'btn-primary': eqGroupBy === 1, 'btn-secondary': eqGroupBy !== 1}">Group by Band</button>
        </div>
      </div>
    </div>
    <div class="row" v-show="!mso.peq?.peqsw">
      <div class="col">
        <div class="alert alert-warning small" role="alert">
          Parametric equalization is currently turned off. The following PEQ settings may be modified, but they will not have any effect until PEQ is turned on.
        </div>
      </div>
    </div>
    <!-- group by band --> 
    <template v-if="eqGroupBy === 1">
      <nav class="navbar nav-fill nav-pills bg-light navbar-light">
        <a 
          v-for="(slot, index) in mso.peq?.slots"
          :key="index"
          class="nav-link" 
          :class="{'active': mso.peq?.currentpeqslot === index, 'italic': bandHasModifications(index)}" 
          @click="setSelectedBand(index)" 
          href="javascript:void(0)" 
        >
         Band {{index + 1}}
        </a>
      </nav>
      <table class="table table-sm table-responsive-lg table-striped">
        <thead>
          <tr>
            <th>Channel</th>
            <th class="text-right">Center Freq. (Hz)</th>
            <th class="text-right">Gain (dB)</th>
            <th class="text-right">Q</th>
            <th class="text-right">Filter Type</th>
          </tr>
        </thead>
        <tbody :class="{'hiding':!tabLoaded, 'showing':tabLoaded}">
          <tr v-for="(channame, chanIndex) in activeChannels" :key="channame">
            <td>{{spkName(channame)}}</td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].Fc" 
                @change="({ type, target }) => { clearAllImports(); setPEQCenterFrequency(activeChannels[chanIndex], mso.peq?.currentpeqslot, target.value) }" 
                min="15" 
                max="20000" 
                step=".1"
                @focus="setSelectedChannel(chanIndex, true)"
              />
            </td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].gaindB" 
                @change="({ type, target }) => { clearAllImports(); setPEQGain(activeChannels[chanIndex], mso.peq?.currentpeqslot, target.value) }" 
                min="-20" 
                max="20" 
                step=".1"
                @focus="setSelectedChannel(chanIndex, true)"
              />
            </td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].Q" 
                @change="({ type, target }) => { clearAllImports(); setPEQQuality(activeChannels[chanIndex], mso.peq?.currentpeqslot, target.value) }" 
                min=".1" 
                max="10" 
                step=".1"
                @focus="setSelectedChannel(chanIndex, true)"
              />
            </td>
            <td class="text-right">
                <select 
                  class="form-control form-control-sm" 
                  @change="({ type, target }) => { clearAllImports(); setPEQFilterType(activeChannels[chanIndex], mso.peq?.currentpeqslot, target.value) }"
                  @focus="setSelectedChannel(chanIndex, true)"
                >
                  <option 
                    v-for="filterType in filterTypes" 
                    :key="filterType.value"
                    :value="filterType.value"
                    :selected="filterType.value === mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].FilterType"
                  >
                    {{filterType.label}}
                  </option>
                </select>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- import/export operations for band -->
      <h6>Manage Band {{mso.peq?.currentpeqslot + 1}}</h6>
      <div class="row">
        <div class="col-auto">
          <button 
            class="btn btn-sm btn-primary mb-3"
            @click="downloadSingleBandConfig(mso.peq?.currentpeqslot)"
          >
            Export Band {{mso.peq?.currentpeqslot + 1}} PEQ Configuration to File
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-auto">
          <div class="form-group">
            <label for="import=file">Import Band PEQ Configuration File to Band {{mso.peq?.currentpeqslot + 1}}</label>
            <input 
              ref="importBandRef"
              type="file" 
              class="form-control-file" 
              id="import=file" 
              @change="bandImportFileSelected"
            />
          </div>
          <mso-importer 
            v-if="bandImportJson" 
            @confirm-import="confirmImport(bandImportPatch)"
            :mso-import-patch="bandImportPatch"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-auto">
          <button 
            class="btn btn-sm btn-warning mb-3"
            @click="resetPEQsForBand(mso.peq?.currentpeqslot)"
          >
            Reset Settings for Band {{mso.peq?.currentpeqslot + 1}} 
          </button>
        </div>
      </div>

    </template>
    
    <!-- group by channel -->
    <template v-else>
      <nav class="navbar nav-fill nav-pills bg-light navbar-light">
        <a 
          v-for="(channame, index) in activeChannels"
          :key="channame"
          class="nav-link" 
          :class="{'active': selectedChannel === index, 'italic': channelHasModifications(channame)}" 
          @click="setSelectedChannel(index)" 
          href="javascript:void(0)" 
        >
          {{spkName(channame)}}
        </a>
      </nav>
      <table class="table table-sm table-responsive-md table-striped">
        <thead>
          <tr>
            <th class="text-right">Band</th>
            <th class="text-right">Center Freq. (Hz)</th>
            <th class="text-right">Gain (dB)</th>
            <th class="text-right">Q</th>
            <th class="text-right">Filter Type</th>
          </tr>
        </thead>
        <tbody :class="{'hiding':!tabLoaded, 'showing':tabLoaded}">
          <tr v-for="(slot, index) in mso.peq?.slots" :key="index">
            <td class="text-right">{{index + 1}}</td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="slot.channels[activeChannels[selectedChannel]].Fc" 
                @change="({ type, target }) => { clearAllImports(); setPEQCenterFrequency(activeChannels[selectedChannel], index, target.value) }" 
                min="15" 
                max="20000" 
                step=".1"
              />
            </td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="slot.channels[activeChannels[selectedChannel]].gaindB" 
                @change="({ type, target }) => { clearAllImports(); setPEQGain(activeChannels[selectedChannel], index, target.value) }" 
                min="-20" 
                max="20" 
                step=".1"
              />
            </td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="slot.channels[activeChannels[selectedChannel]].Q" 
                @change="({ type, target }) => { clearAllImports(); setPEQQuality(activeChannels[selectedChannel], index, target.value) }" 
                min=".1" 
                max="10" 
                step=".1"
              />
            </td>
            <td class="text-right">
                <select 
                  class="form-control form-control-sm" 
                  @change="({ type, target }) => { clearAllImports(); setPEQFilterType(activeChannels[selectedChannel], index, target.value) }"
                >
                  <option 
                    v-for="filterType in filterTypes" 
                    :key="filterType.value"
                    :value="filterType.value"
                    :selected="filterType.value === slot.channels[activeChannels[selectedChannel]].FilterType"
                  >
                    {{filterType.label}}
                  </option>
                </select>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- import/export operations for channel -->
      <h6>Manage Channel {{spkName(activeChannels[selectedChannel])}}</h6>
      <div class="row">
        <div class="col-auto">
        <button 
          class="btn btn-sm btn-primary mb-3"
          @click="downloadSingleChannelConfig(activeChannels[selectedChannel])"
        >
          Export {{spkName(activeChannels[selectedChannel])}} PEQ Configuration to File
        </button>
        </div>
      </div>
      <div class="row">
        <div class="col-auto">
          <div class="form-group">
            <label for="import=file">Import Channel PEQ Configuration File to Channel {{spkName(activeChannels[selectedChannel])}}</label>
            <input 
              ref="importChannelRef"
              type="file" 
              class="form-control-file" 
              id="import=file" 
              @change="channelImportFileSelected"
            />
          </div>
          <mso-importer 
            v-if="channelImportJson" 
            @confirm-import="confirmImport(channelImportPatch)"
            :mso-import-patch="channelImportPatch"
          />
        </div>
      </div>

      <div class="row">
        <div class="col-auto">
          <button 
            class="btn btn-sm btn-warning mb-3"
            @click="resetPEQsForChannel(activeChannels[selectedChannel])"
          >
            Reset Settings for Channel {{spkName(activeChannels[selectedChannel])}}
          </button>
        </div>
      </div>
    </template>
    <!-- global import/export operations -->
    <h6>Manage all Channels/Bands</h6>
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
    <div class="row">
      <div class="col-auto">
        <div class="form-group">
          <label for="import=file">Import Full Configuration File</label>
          <input 
            ref="importFullRef"
            type="file" 
            class="form-control-file" 
            id="import=file" 
            @change="fullImportFileSelected"
          />
        </div>
        <mso-importer 
          v-if="fullImportJson" 
          @confirm-import="confirmImport(fullImportPatch)"
          :mso-import-patch="fullImportPatch"
        />
      </div>
    </div>
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
  {{importBandRef?.value}}
</template>

<script>

  import { ref, computed } from 'vue';
  import { compare } from 'fast-json-patch/index.mjs';

  import useLocalStorage from '@/use/useLocalStorage.js';
  import useImportExport from '@/use/useImportExport.js';
  import useMso from '@/use/useMso.js';
  import useSpeakerGroups from '@/use/useSpeakerGroups.js';

  import TwoStateButton from './buttons/TwoStateButton.vue';
  import MultiStateButtonGroup from './buttons/MultiStateButtonGroup';
  import MsoImporter from './MsoImporter.vue';
  import PeqChart from './PeqChart.vue';

  export default {
    name: 'Eq',
    setup() {

      const { importJson: channelImportJson, importJsonFileToSelected: channelImportJsonFileToSelected } = useImportExport();
      const { importJson: bandImportJson, importJsonFileToSelected: bandImportJsonFileToSelected } = useImportExport();
      const { importJson: fullImportJson, importJsonFileToSelected: fullImportJsonFileToSelected, exportJsonToFile } = useImportExport();
      
      const { eqGroupBy, setEqGroupBy } = useLocalStorage();
      const { mso, setPEQSlot, resetPEQ, importMsoPatchList } = useMso();
      const { getActiveChannels, spkName } = useSpeakerGroups();

      const tabLoaded = ref(true);

      const importChannelRef = ref(null);
      const importBandRef = ref(null);
      const importFullRef = ref(null);

      const activeChannels = computed(() => {
        return getActiveChannels(mso.value.speakers?.groups);
      });

      const selectedChannel = ref(0);

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

        if (!fullImportPatch.value) {
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
        { label: 'High Shelf', value: 2 }
      ];

      return {
        ...useMso(), activeChannels, spkName, selectedChannel, setSelectedChannel, 
        bandHasModifications, channelHasModifications, filterTypes, tabLoaded, setSelectedBand, 
        downloadSingleChannelConfig, downloadSingleBandConfig, downloadFullConfig, 
        channelImportFileSelected, bandImportFileSelected, fullImportFileSelected, 
        channelImportJson, bandImportJson, fullImportJson, bandImportPatch, channelImportPatch, fullImportPatch, 
        confirmImport, clearAllImports, importBandRef, importChannelRef, importFullRef,
        resetPEQsForBand, resetPEQsForChannel, resetAllPEQs,
        eqGroupBy, setGroupBy
      };
    },
    components: {
      MultiStateButtonGroup,
      TwoStateButton,
      MsoImporter,
      PeqChart,
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