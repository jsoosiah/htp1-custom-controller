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
      @update:bass-freq="setBassCornerFrequency($event)"
      @update:bass-level="setBassBoostCutLevel($event)"
      @update:treble-freq="setTrebleCornerFrequency($event)"
      @update:treble-level="setTrebleBoostCutLevel($event)"
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

    </div>
  </div>
</template>

<script>
  import useMso from '@/use/useMso.js';
  import useLocalStorage from '@/use/useLocalStorage.js';
  import TwoStateButton from './buttons/TwoStateButton.vue';
  import DismissableAlert from './buttons/DismissableAlert.vue';
  import ToneChart from './ToneChart.vue';
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


      return {
        ...msoApi, loudnessOptions, darkMode,
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


</style>