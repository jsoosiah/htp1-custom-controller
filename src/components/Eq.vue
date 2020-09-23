<template>
  <div class="transition-container">
    <h5>Tone Control</h5>
    <two-state-button 
      :button-text="`Tone Control: ${mso.eq?.tc ? 'on' : 'off'}`"
      :state-on="mso.eq?.tc"
      @click="toggleToneControl()"
    />

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

    <h5>Parametric Equalization Filters <small class="text-muted">up to 16 bands are available</small></h5>
    <div class="alert alert-info small" role="alert">
      Note that a gain of 0dB is equivalent to bypassing the filter; * denotes channels or bands that have been modified and have active PEQ filters
    </div>

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

    <!-- group by band --> 
    <template v-if="eqGroupBy === 1">
      <nav class="navbar nav-fill nav-pills bg-light navbar-light">
        <a 
          v-for="(slot, index) in mso.peq?.slots"
          
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
          <tr v-for="(channame, chanIndex) in activeChannels">
            <td>{{spkName(channame)}}</td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].Fc" 
                @change="({ type, target }) => setPEQCenterFrequency(activeChannels[chanIndex], mso.peq?.currentpeqslot, target.value)" 
                min="15" 
                max="20000" 
                step=".1"
              />
            </td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].gaindB" 
                @change="({ type, target }) => setPEQGain(activeChannels[chanIndex], mso.peq?.currentpeqslot, target.value)" 
                min="-20" 
                max="20" 
                step=".1"
              />
            </td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="mso.peq?.slots[mso.peq?.currentpeqslot].channels[activeChannels[chanIndex]].Q" 
                @change="({ type, target }) => setPEQQuality(activeChannels[chanIndex], mso.peq?.currentpeqslot, target.value)" 
                min=".1" 
                max="10" 
                step=".1"
              />
            </td>
            <td class="text-right">
                <select 
                  class="form-control form-control-sm" 
                  @change="({ type, target }) => setPEQFilterType(activeChannels[chanIndex], mso.peq?.currentpeqslot, target.value)"
                >
                  <option 
                    v-for="filterType in filterTypes" 
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
    </template>
    
    <!-- group by channel -->
    <template v-else>
      <nav class="navbar nav-fill nav-pills bg-light navbar-light">
        <a 
          v-for="(channame, index) in activeChannels"
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
          <tr v-for="(slot, index) in mso.peq?.slots">
            <td class="text-right">{{index + 1}}</td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="slot.channels[activeChannels[selectedChannel]].Fc" 
                @change="({ type, target }) => setPEQCenterFrequency(activeChannels[selectedChannel], index, target.value)" 
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
                @change="({ type, target }) => setPEQGain(activeChannels[selectedChannel], index, target.value)" 
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
                @change="({ type, target }) => setPEQQuality(activeChannels[selectedChannel], index, target.value)" 
                min=".1" 
                max="10" 
                step=".1"
              />
            </td>
            <td class="text-right">
                <select 
                  class="form-control form-control-sm" 
                  @change="({ type, target }) => setPEQFilterType(activeChannels[selectedChannel], index, target.value)"
                >
                  <option 
                    v-for="filterType in filterTypes" 
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
    </template>
  </div>
</template>

<script>

  import { ref, computed } from 'vue';

  import useLocalStorage from '@/use/useLocalStorage.js';
  import useMso from '@/use/useMso.js';
  import useSpeakerGroups from '@/use/useSpeakerGroups.js';

  import TwoStateButton from './TwoStateButton.vue';

  export default {
    name: 'Eq',
    setup() {
      const { eqGroupBy, setEqGroupBy } = useLocalStorage();
      const { mso, setPEQSlot } = useMso();
      const { getActiveChannels, spkName } = useSpeakerGroups();

      const tabLoaded = ref(true);

      const activeChannels = computed(() => {
        return getActiveChannels(mso.value.speakers?.groups);
      });

      const selectedChannel = ref(0);

      function setSelectedChannel(chanNumber) {

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

      const filterTypes = [
        { label: 'PEQ', value: 0 },
        { label: 'Low Shelf', value: 1 },
        { label: 'High Shelf', value: 2 }
      ];

      return {
        ...useMso(), activeChannels, spkName, selectedChannel, setSelectedChannel, bandHasModifications, channelHasModifications, filterTypes, tabLoaded, setSelectedBand,
        eqGroupBy, setGroupBy
      };
    },
    components: {
      TwoStateButton,
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