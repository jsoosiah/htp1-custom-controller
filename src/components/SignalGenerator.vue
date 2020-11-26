<template>
  <div class="container">
    <div class="row mb-3">
      <div class="col">
        <h5>Signal Generator</h5>
        <dismissable-alert
          v-if="mso.upmix.select !== 'off'"
          alert-key="sgen-direct"
          class="alert-warning"
        >
          <p>Upmix should be set to Direct for the signal generator to function correctly.</p>
          <two-state-button 
            button-text="Direct"
            :state-on="mso.upmix.select === 'off'"
            @click="setUpmix('off')"
          />
        </dismissable-alert>
        <two-state-button
          :button-text="`Signal Generator: ${mso.sgen?.sgensw}`"
          :state-on="mso.sgen?.sgensw === 'on'"
          @click="toggleSignalGenerator()"
        />
      </div>
    </div>
    <div class="row">
      <div class="col-auto">
        <table class="table table-sm table-striped table-responsive">
          <thead>
            <tr>
              <th>
                Signal Select
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="signal in signalOptions"
              :key="signal.value"
            >
              <td>
                <div class="form-check">
                  <input
                    :id="`radio-${signal.value}`"
                    class="form-check-input"
                    type="radio"
                    name="signal"
                    :value="signal.value"
                    :checked="mso.sgen?.signalType === signal.value"
                    @click="setSignalGeneratorSignalType(signal.value)"
                  >
                  <label 
                    class="form-check-label" 
                    :for="`radio-${signal.value}`"
                  >
                    {{ signal.label }}
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="mso.sgen?.signalType === 'sine'">
          <div class="form-group">
            <label
              for="inputEmail3"
              class="col-form-label col-form-label-sm"
            >Frequency</label>
            <div class="input-group input-group-sm numeric-input">
              <input 
                type="number" 
                class="form-control" 
                aria-label="Frequency" 
                aria-describedby="basic-addon2" 
                :value="mso.sgen?.sinehz" 
                min="10" 
                max="20000" 
                step="10"
                @change="({ type, target }) => setSineFrequency(target.value)"
              >
              <div class="input-group-append">
                <span
                  id="basic-addon2"
                  class="input-group-text"
                >Hz</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label
              for="inputEmail3"
              class="col-form-label col-form-label-sm"
            >Amplitude</label>
            <div class="input-group input-group-sm numeric-input">
              <input 
                type="number" 
                class="form-control" 
                aria-label="Amplitude" 
                aria-describedby="basic-addon2" 
                :value="mso.sgen?.sinedb" 
                min="-140" 
                max="0" 
                step="5"
                @change="({ type, target }) => setSineAmplitude(target.value)"
              >
              <div class="input-group-append">
                <span
                  id="basic-addon2"
                  class="input-group-text"
                >dBFS (peak)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-auto">
        <table class="table table-sm table-striped table-responsive">
          <thead>
            <tr>
              <th>
                Channel Select {{ mso.sgen?.signalType === 'both' ? ' - for left input' : '' }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="channame in visibleChannels"
              :key="channame"
            >
              <td>
                <div class="form-check">
                  <input
                    :id="`radio-${channame}`"
                    class="form-check-input"
                    type="radio"
                    name="channel"
                    :value="channame"
                    :checked="mso.sgen?.select === channame"
                    @click="setSignalGeneratorChannel(channame)"
                  >
                  <label 
                    class="form-check-label" 
                    :for="`radio-${channame}`"
                  >
                    {{ translatedSpkName(channame) }} 
                    <font-awesome-icon 
                      v-if="visibleChannels.length !== activeChannels.length && channame === 'sub1'"
                      :id="`tooltip-container-left-${channame}`"
                      v-tooltip="{
                        enabled: !(visibleChannels.length !== activeChannels.length && channame === 'sub1'),
                        message: 'Individual subwoofer channels are unavailable when Dirac Bass Control is enabled.'
                      }"
                      :icon="['fas', 'question-circle']"
                    />
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="mso.sgen?.signalType === 'both'"
        class="col-auto"
      >
        <table class="table table-sm table-striped table-responsive">
          <thead>
            <tr>
              <th>
                Channel Select - for right input
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="channame in visibleChannels"
              :key="channame"
            >
              <td>
                <div class="form-check">
                  <input 
                    :id="`radio2-${channame}`" 
                    class="form-check-input" 
                    type="radio" 
                    name="channel2" 
                    :value="channame" 
                    :checked="mso.sgen?.select2 === channame" 
                    @click="setSignalGeneratorChannel2(channame)"
                  >
                  <label 
                    class="form-check-label" 
                    :for="`radio2-${channame}`"
                  >
                    {{ translatedSpkName(channame) }} 
                    <font-awesome-icon 
                      v-if="visibleChannels.length !== activeChannels.length && channame === 'sub1'"
                      :id="`tooltip-container-right-${channame}`"
                      v-tooltip="{
                        enabled: !(visibleChannels.length !== activeChannels.length && channame === 'sub1'),
                        message: 'Individual subwoofer channels are unavailable when Dirac Bass Control is enabled.'
                      }"
                      :icon="['fas', 'question-circle']"
                    />
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>

  import { computed } from 'vue';

  import useMso from '@/use/useMso.js';
  import useSpeakerGroups from '@/use/useSpeakerGroups.js';

  import { Tooltip } from '@/directives/Tooltip.js';

  import TwoStateButton from './buttons/TwoStateButton.vue';
  import DismissableAlert from './buttons/DismissableAlert.vue';

  export default {
    name: 'SignalGenerator',
    components: {
      TwoStateButton,
      DismissableAlert
    },
    directives: {
      Tooltip
    },
    setup() {

      const { mso, toggleSignalGenerator, setSignalGeneratorChannel, setSignalGeneratorChannel2, 
        setSignalGeneratorSignalType, setSignalGeneratorOff, setSignalGeneratorOn, 
        showCrossoverControls, setSineFrequency, setSineAmplitude, setUpmix } = useMso();
      const { getActiveChannels, spkName } = useSpeakerGroups();

      const signalOptions = [
        {'label': '"THX-like" band limited noise', 'value': 'thx'},
        {'label': 'Full bandwidth pink noise', 'value': 'pink'},
        {'label': 'Louder reference noise', 'value': 'dolby'},
        {'label': 'Polarity pulse', 'value': 'pulse'},
        {'label': 'Sinewave', 'value': 'sine'},
        {'label': 'Left input as signal', 'value': 'left'},
        {'label': 'Right input as signal', 'value': 'right'},
        {'label': 'Left and right input as signal', 'value': 'both'},
      ];

      const activeChannels = computed(() => {
        return getActiveChannels(mso.value.speakers?.groups);
      });

      const visibleChannels = computed(() => {
        console.log('visible', visibleChannels)
        return activeChannels.value.filter(
          channame => showCrossoverControls.value || (channame != 'sub2' && channame != 'sub3' && channame != 'sub4' && channame != 'sub5')
        );
      });

      function toListSentence(arr) {
        return arr.length < 3 ?
        arr.join(' and ') :
        `${arr.slice(0, -1).join(', ')}, and ${arr[arr.length - 1]}`;
      } 

      function translatedSpkName(channame) {
        if (!showCrossoverControls.value && channame === 'sub1') {
          let subs = ['Subwoofer 1'];
          for (const channame of activeChannels.value) {
            if (channame.startsWith('sub')) {
              const subNumber = channame[channame.length - 1];
              if (subNumber > 1) {
                subs.push(subNumber);
              }
            }
          }
          return toListSentence(subs);
        }
        return spkName(channame);
      }

      return { 
        mso, toggleSignalGenerator, setSignalGeneratorChannel, setSignalGeneratorChannel2, setSignalGeneratorSignalType, 
        activeChannels, visibleChannels, translatedSpkName, signalOptions, setSignalGeneratorOff, setSignalGeneratorOn, showCrossoverControls,
        setSineFrequency, setSineAmplitude, setUpmix
      };
    }
  }
</script>

<style scoped>
  th {
    font-size:80%;
  }

  .col-auto, .col {
    padding-left: 0;
  }

  .numeric-input {
    width: 9.5rem;
  }
</style>