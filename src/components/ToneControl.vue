<template>
  <div class="transition-container">
    <h5>Tone Control</h5>
    <two-state-button 
      :button-text="`Tone Control: ${mso.eq?.tc ? 'on' : 'off'}`"
      :state-on="mso.eq?.tc"
      @click="toggleToneControl()"
    />

    <div class="row mt-3" v-show="!mso.eq?.tc">
      <div class="col">
        <div class="alert alert-warning small" role="alert">
          Tone controls are currently turned off. The following tone control settings may be modified, but they will not have any effect until tone controls are turned on.
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-lg">
            <div class="form-group">
              <label for="inputEmail3" class="col-form-label col-form-label-sm ">Bass Corner Frequency</label>
              <div class="input-group input-group-sm numeric-input">
                <input type="number" class="form-control" aria-label="Minimum volume" aria-describedby="basic-addon2" :value="mso.eq?.bass.freq" @change="({ type, target }) => setBassCornerFrequency(target.value)" min="40" max ="500">
                <div class="input-group-append">
                  <span class="input-group-text" id="basic-addon2">Hz</span>
                </div>
              </div>
            </div>
        </div>
        <div class="col-lg">
            <div class="form-group">
              <label for="inputEmail3" class="col-form-label col-form-label-sm ">Treble Corner Frequency</label>
              <div class="input-group input-group-sm numeric-input">
                <input type="number" class="form-control" aria-label="Minimum volume" aria-describedby="basic-addon2" :value="mso.eq?.treble.freq" @change="({ type, target }) => setTrebleCornerFrequency(target.value)" min="501" max ="8000">
                <div class="input-group-append">
                  <span class="input-group-text" id="basic-addon2">Hz</span>
                </div>
              </div>
            </div>
        </div>
        <div class="col-lg">
            <div class="form-group">
              <label for="inputEmail3" class="col-form-label col-form-label-sm ">Bass Boost/Cut Level</label>
              <div class="input-group input-group-sm numeric-input">
                <input type="number" class="form-control" aria-label="Minimum volume" aria-describedby="basic-addon2" :value="mso.eq?.bass.level" @change="({ type, target }) => setBassBoostCutLevel(target.value)" min="-12" max="12">
                <div class="input-group-append">
                  <span class="input-group-text" id="basic-addon2">dB</span>
                </div>
              </div>
            </div>
        </div>
        <div class="col-lg">
            <div class="form-group">
              <label for="inputPassword3" class="col-form-label col-form-label-sm ">Treble Boost/Cut Level</label>
              <div class="input-group input-group-sm numeric-input">
                <input type="number" class="form-control" aria-label="Minimum volume" aria-describedby="basic-addon2" :value="mso.eq?.treble.level" @change="({ type, target }) => setTrebleBoostCutLevel(target.value)" min="-12" max="12">
                <div class="input-group-append">
                  <span class="input-group-text" id="basic-addon2">dB</span>
                </div>
              </div>
            </div>
        </div>
        <div class="col-lg">
            <div class="form-group">
              <label for="inputPassword3" class="col-form-label col-form-label-sm ">Loudness Calibration</label>
                <div class="input-group input-group-sm numeric-input">
                  <input type="number" class="form-control" aria-label="Minimum volume" aria-describedby="basic-addon2" :value="mso.loudnessCal" @change="({ type, target }) => setLoudnessCalibration(target.value)" min="50" max="90">
                  <div class="input-group-append">
                    <span class="input-group-text" id="basic-addon2">dB</span>
                  </div>
                </div>
            </div>
        </div>
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
  import MultiStateButtonGroup from './buttons/MultiStateButtonGroup.vue';
  import MsoImporter from './MsoImporter.vue';

  export default {
    name: 'ToneControl',
    setup() {

      const { importJson, exportJsonToFile, importJsonFileToSelected } = useImportExport();
      const { eqGroupBy, setEqGroupBy } = useLocalStorage();
      const { mso, setPEQSlot, resetPEQ } = useMso();
      const { getActiveChannels, spkName } = useSpeakerGroups();

      const tabLoaded = ref(true);

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

      function importFileSelected(e) {
        const file = e.target.files[0];
        importJsonFileToSelected(file);
      }

      function resetPEQsForBand(band) {
        for (const channame of activeChannels.value) {
          resetPEQ(channame, band);
        }
      }

      function resetPEQsForChannel(channel) {
        for (let band = 0; band < 16; band++) {
          resetPEQ(channel, band);
        }
      }

      const channelImportPatch = computed(() => {

        if (!importJson.value || eqGroupBy === 1) {
          return [];
        }

        const fixedImportJson = [];

        console.log('importJson', importJson.value)

        // rewrite the channel name to the selected channel
        for (const slot of importJson.value) {
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
        .map(patch => ({...patch, path: `/peq/slots${patch.path}`}))
        ;
      });

      const bandImportPatch = computed(() => {
        if (!importJson.value || eqGroupBy === 0) {
          return [];
        }

        // fix relative paths
        return compare(mso.value.peq?.slots[mso.value?.peq.currentpeqslot].channels, importJson.value)
        .map(patch => ({...patch, path: `/peq/slots/${mso.value?.peq.currentpeqslot}/channels${patch.path}`}));
      });

      const filterTypes = [
        { label: 'PEQ', value: 0 },
        { label: 'Low Shelf', value: 1 },
        { label: 'High Shelf', value: 2 }
      ];

      return {
        ...useMso(), activeChannels, spkName, selectedChannel, setSelectedChannel, bandHasModifications, channelHasModifications, filterTypes, tabLoaded, setSelectedBand, downloadSingleChannelConfig, downloadSingleBandConfig, importFileSelected, importJson, bandImportPatch, channelImportPatch, resetPEQsForBand, resetPEQsForChannel,
        eqGroupBy, setGroupBy
      };
    },
    components: {
      MultiStateButtonGroup,
      TwoStateButton,
      MsoImporter,
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