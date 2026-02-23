<template>
  <div class="transition-container">
    <h5>Tone Control</h5>
    <two-state-button 
      :button-text="`Tone Control: ${mso.eq?.tc ? 'on' : 'off'}`"
      :state-on="mso.eq?.tc"
      @click="toggleToneControl()"
    />

    <tone-chart 
      :bass-freq="mso.eq?.bass.freq || 100"
      :bass-level="mso.eq?.bass.level || 0"
      :treble-freq="mso.eq?.treble.freq || 5000"
      :treble-level="mso.eq?.treble.level || 0"
      :dark-mode="darkMode"
      :tone-enabled="!!mso.eq?.tc"
      class="mt-3"
    />

    <div class="row mt-3">
      <div
        v-show="!mso.eq?.tc"
        class="col"
      >
        <dismissable-alert
          alert-key="tone-control-off"
          class="alert-warning"
        >
          Tone controls are currently turned off. The following tone control settings may be modified, but they will not have any effect until tone controls are turned on.
        </dismissable-alert>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-lg">
          <div class="form-group">
            <label
              for="inputEmail3"
              class="col-form-label col-form-label-sm "
            >Bass Corner Frequency</label>
            <div class="input-group input-group-sm numeric-input">
              <input
                type="number"
                class="form-control"
                aria-label="Minimum volume"
                aria-describedby="basic-addon2"
                :value="mso.eq?.bass.freq"
                min="20"
                max="500"
                @change="({ type, target }) => setBassCornerFrequency(target.value)"
              >
              <div class="input-group-append">
                <span
                  id="basic-addon2"
                  class="input-group-text"
                >Hz</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg">
          <div class="form-group">
            <label
              for="inputEmail3"
              class="col-form-label col-form-label-sm "
            >Treble Corner Frequency</label>
            <div class="input-group input-group-sm numeric-input">
              <input
                type="number"
                class="form-control"
                aria-label="Minimum volume"
                aria-describedby="basic-addon2"
                :value="mso.eq?.treble.freq"
                min="600"
                max="8000"
                @change="({ type, target }) => setTrebleCornerFrequency(target.value)"
              >
              <div class="input-group-append">
                <span
                  id="basic-addon2"
                  class="input-group-text"
                >Hz</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg">
          <div class="form-group">
            <label
              for="inputEmail3"
              class="col-form-label col-form-label-sm "
            >Bass Boost/Cut Level</label>
            <div class="input-group input-group-sm numeric-input">
              <input
                type="number"
                class="form-control"
                aria-label="Minimum volume"
                aria-describedby="basic-addon2"
                :value="mso.eq?.bass.level"
                min="-12"
                max="12"
                @change="({ type, target }) => setBassBoostCutLevel(target.value)"
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
        <div class="col-lg">
          <div class="form-group">
            <label
              for="inputPassword3"
              class="col-form-label col-form-label-sm "
            >Treble Boost/Cut Level</label>
            <div class="input-group input-group-sm numeric-input">
              <input
                type="number"
                class="form-control"
                aria-label="Minimum volume"
                aria-describedby="basic-addon2"
                :value="mso.eq?.treble.level"
                min="-12"
                max="12"
                @change="({ type, target }) => setTrebleBoostCutLevel(target.value)"
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

      <!-- Slider Controls -->
      <div class="quick-adjust-row row mt-4">
        <div class="col-12 mb-3 quick-adjust-header">
          <h6>Quick Adjust</h6>
        </div>
        <div class="sliders-flex">
          <div class="slider-item">
            <label class="form-label small mb-1"><strong>Bass Freq:</strong> <span class="slider-value">{{ mso.eq?.bass.freq }} Hz</span></label>
            <input 
              type="range" 
              class="form-range slider-input"
              min="0" 
              max="200" 
              step="0.5"
              :value="freqToSliderBass(mso.eq?.bass.freq)"
              @input="debouncedSetBassFreq(sliderToFreqBass($event.target.value))"
            >
          </div>
          <div class="slider-item">
            <label class="form-label small mb-1"><strong>Treble Freq:</strong> <span class="slider-value slider-value-wide">{{ mso.eq?.treble.freq }} Hz</span></label>
            <input 
              type="range" 
              class="form-range slider-input"
              min="600" 
              max="8000" 
              step="100"
              :value="mso.eq?.treble.freq"
              @keydown="handleTrebleKeydown"
              @input="debouncedSetTrebleFreq(parseInt($event.target.value))"
            >
          </div>
          <div class="slider-item slider-item-narrow">
            <label class="form-label small mb-1"><strong>Bass Level:</strong> <span class="slider-value">{{ mso.eq?.bass.level }} dB</span></label>
            <input 
              type="range" 
              class="form-range slider-input"
              min="-12" 
              max="12" 
              step="1"
              :value="mso.eq?.bass.level"
              @input="debouncedSetBassLevel($event.target.value)"
            >
          </div>
          <div class="slider-item slider-item-narrow">
            <label class="form-label small mb-1"><strong>Treble Level:</strong> <span class="slider-value">{{ mso.eq?.treble.level }} dB</span></label>
            <input 
              type="range" 
              class="form-range slider-input"
              min="-12" 
              max="12" 
              step="1"
              :value="mso.eq?.treble.level"
              @input="debouncedSetTrebleLevel($event.target.value)"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import useMso from '@/use/useMso.js';
  import useLocalStorage from '@/use/useLocalStorage.js';
  import TwoStateButton from './buttons/TwoStateButton.vue';
  import DismissableAlert from './buttons/DismissableAlert.vue';
  import ToneChart from './ToneChart.vue';
  import { debounce } from 'lodash-es';

  export default {
    name: 'ToneControl',
    components: {
      TwoStateButton,
      DismissableAlert,
      ToneChart,
    },
    setup() {

      const { darkMode } = useLocalStorage();
      const msoApi = useMso();
      const { setBassCornerFrequency, setTrebleCornerFrequency, setBassBoostCutLevel, setTrebleBoostCutLevel } = msoApi;

      const loudnessOptions = [
        {'label': 'ISO 226:2003', 'value': 'iso'},
        {'label': 'Vintage', 'value': 'vintage'},
      ];

      // Convert linear slider position (0-200) to logarithmic bass frequency (20-250 Hz)
      // Uses 200 steps to give maximum precision at low frequencies
      function sliderToFreqBass(sliderValue) {
        const minFreq = Math.log10(20);
        const maxFreq = Math.log10(250);
        const scale = (maxFreq - minFreq) / 200;
        const freq = Math.pow(10, minFreq + scale * sliderValue);
        // Round to nearest integer
        return Math.round(freq);
      }

      // Convert bass frequency (20-250 Hz) to linear slider position (0-200)
      function freqToSliderBass(freq) {
        const minFreq = Math.log10(20);
        const maxFreq = Math.log10(250);
        const scale = (maxFreq - minFreq) / 200;
        return (Math.log10(freq) - minFreq) / scale;
      }

      // Debounced versions of slider update functions (100ms delay)
      const debouncedSetBassFreq = debounce((value) => {
        setBassCornerFrequency(value);
      }, 50);

      const debouncedSetTrebleFreq = debounce((value) => {
        setTrebleCornerFrequency(value);
      }, 50);

      const debouncedSetBassLevel = debounce((value) => {
        setBassBoostCutLevel(value);
      }, 50);

      const debouncedSetTrebleLevel = debounce((value) => {
        setTrebleBoostCutLevel(value);
      }, 50);

      // Handle arrow key presses for treble frequency input (100Hz steps)
      function handleTrebleKeydown(event) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault();
          const currentValue = parseFloat(event.target.value) || 600;
          const step = 100;
          let newValue;
          
          if (event.key === 'ArrowUp') {
            newValue = Math.min(8000, currentValue + step);
          } else {
            newValue = Math.max(600, currentValue - step);
          }
          
          setTrebleCornerFrequency(newValue);
        }
      }

      return {
        ...msoApi, loudnessOptions, darkMode,
        debouncedSetBassFreq, debouncedSetTrebleFreq, debouncedSetBassLevel, debouncedSetTrebleLevel,
        sliderToFreqBass, freqToSliderBass, handleTrebleKeydown
      };
    },
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
    font-size:87.5%;
    font-weight: normal;
    border-top: 0px;
  }

  .table .form-control {
    width: auto;
    max-width: 6rem;
    float:right;
  }

  .col-lg {
    padding-left: 0;
  }

  .quick-adjust-row {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 0.25rem;
  }

  .quick-adjust-header {
    padding-left: 0;
  }

  .quick-adjust-header h6 {
    margin-left: 0;
  }

  .sliders-flex {
    display: flex;
    gap: 1rem;
    width: 100%;
  }

  .slider-item {
    flex: 1;
    min-width: 0;
  }

  .slider-item-narrow {
    flex: 0.8;
  }

  .slider-input {
    width: 100%;
  }

  .slider-value {
    display: inline-block;
    min-width: 50px;
    text-align: right;
  }

  .slider-value-wide {
    min-width: 60px;
  }

</style>