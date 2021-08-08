<template>
  <div class="container">
    <div class="row mb-3">
      <div class="col">
        <strong
          v-if="smallHeader"
          class="small-header"
        >
          Signal Generator
        </strong>
        <h5 v-else>
          Signal Generator
        </h5>
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
      <div class="col">
        <div class="form-group">
          <label
            for="inputEmail3"
            class="col-form-label col-form-label-sm "
          >Volume Control</label>
          <div class="input-group input-group-sm numeric-input">
            <input
              type="number"
              class="form-control"
              aria-label="Minimum volume"
              aria-describedby="basic-addon2"
              :value="mso.volume"
              :min="mso.cal?.vpl"
              :max="mso.cal?.vph"
              @change="({ type, target }) => setVolume(target.value)"
            >
            <div class="input-group-append">
              <span
                id="basic-addon2"
                class="input-group-text"
              >dB</span>
            </div>
          </div>
        </div>
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
        <ChannelSelect :title="'Channel Select' + (mso.sgen?.signalType === 'both' ? ' - for left input' : '')" />
      </div>
      <div
        v-if="mso.sgen?.signalType === 'both'"
        class="col-auto"
      >
        <ChannelSelect
          title="Channel Select - for right input"
          :show-levels="false"
          :second-channel="true"
        />
      </div>
    </div>
  </div>
</template>

<script>

  import useMso from '@/use/useMso.js';

  import { Tooltip } from '@/directives/Tooltip.js';

  import ChannelSelect from './ChannelSelect.vue';
  import TwoStateButton from './buttons/TwoStateButton.vue';
  import DismissableAlert from './buttons/DismissableAlert.vue';

  export default {
    name: 'SignalGenerator',
    components: {
      ChannelSelect,
      TwoStateButton,
      DismissableAlert
    },
    directives: {
      Tooltip
    },
    props: {
      smallHeader: {
        type: Boolean,
        default: false,
      }
    },
    setup() {

      const { mso, toggleSignalGenerator, setSignalGeneratorChannel, setSignalGeneratorChannel2, 
        setSignalGeneratorSignalType, setSignalGeneratorOff, setSignalGeneratorOn, 
        showCrossoverControls, setSineFrequency, setSineAmplitude, setUpmix, setVolume } = useMso();

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

      return { 
        mso, toggleSignalGenerator, setSignalGeneratorChannel, setSignalGeneratorChannel2, setSignalGeneratorSignalType, 
        signalOptions, setSignalGeneratorOff, setSignalGeneratorOn, showCrossoverControls,
        setSineFrequency, setSineAmplitude, setUpmix, setVolume, 
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

  .small-header {
    display:block;
  }
</style>