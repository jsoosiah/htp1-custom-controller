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
      </div>
    </div>
    <h5>Loudness Compensation</h5>
    <two-state-button 
      :button-text="`Loudness Compensation: ${mso.loudness}`" 
      :state-on="mso.loudness === 'on'" 
      @btn-click="toggleLoudness()"
      min-width="7.5rem"
    />
    <div class="row mt-3" v-show="mso.loudness !== 'on'">
      <div class="col">
        <div class="alert alert-warning small" role="alert">
          Loudness compensation is currently turned off. The following loudness compensation settings may be modified, but they will not have any effect until loudness compensation is turned on.
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
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
  import useMso from '@/use/useMso.js';

  import TwoStateButton from './buttons/TwoStateButton.vue';

  export default {
    name: 'ToneControl',
    setup() {
      return {
        ...useMso()
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