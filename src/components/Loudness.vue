<template>
  <div class="transition-container">
    <h5>Loudness Compensation</h5>
    <two-state-button 
      :button-text="`Loudness Compensation: ${mso.loudness}`" 
      :state-on="mso.loudness === 'on'" 
      @btn-click="toggleLoudness()"
      min-width="7.5rem"
    />
    <div class="row mt-3">
      <div class="col" v-show="mso.loudness !== 'on'">
        <dismissable-alert alertKey="loudness-off" class="alert-warning">
          Loudness compensation is currently turned off. The following loudness compensation settings may be modified, but they will not have any effect until loudness compensation is turned on.
        </dismissable-alert>
      </div>
    </div>

  
    <div class="row">
      <div class="col-auto">
        <table class="table table-sm table-striped table-responsive">
          <thead>
            <tr>
              <th>
                Loudness Curve Select
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="curve in loudnessOptions" :key="curve.value">
              <td>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="curve" :id="`radio-${curve.value}`" :value="curve.value" :checked="mso.loudnessCurve === curve.value" @click="setLoudnessCurve(curve.value)">
                  <label 
                    class="form-check-label" 
                    :for="`radio-${curve.value}`"
                  >
                    {{curve.label}}
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-auto">
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
  
    <h5>Night Mode</h5>
    <div class="mb-3">
      <multi-state-button-group
        :states="[{value: 0, label: 'Night Off'}, {value: 2, label: 'Night Auto'}, {value: 1, label: 'Night On'}]"
        :state-value="mso.night === 'on' ? 1 : mso.night === 'off' ? 0 : 2"
        @set-on="setNightMode('on')"
        @set-off="setNightMode('off')"
        @set-other="setNightMode('auto')"
      />

    </div>

    <h5>Dialog Enhance</h5>
    <div class="row">
      <div class="col-auto">
      <div class="form-group">
        <label class="col-form-label col-form-label-sm" for="dialog-enh">Dialog Enhance</label>
        <div class="form-row">
          <input 
            type="range" 
            class="custom-range col" 
            id="dialog-enh" 
            min="0" 
            max="6"
            :value="mso.dialogEnh"
            @input="({ type, target }) => setDtsDialogEnh(target.value)"
          >
          <span class="col-auto auro-str-label">{{mso.dialogEnh}}</span>
        </div>
      </div>
      </div>
    </div>
  </div>

</template>

<script>
  import useMso from '@/use/useMso.js';
  import TwoStateButton from './buttons/TwoStateButton.vue';
  import MultiStateButtonGroup from './buttons/MultiStateButtonGroup.vue';
  import DismissableAlert from './buttons/DismissableAlert.vue';

  export default {
    name: 'ToneControl',
    setup() {

      const loudnessOptions = [
        {'label': 'ISO 226:2003', 'value': 'iso'},
        {'label': 'Vintage', 'value': 'vintage'},
      ];

      return {
        ...useMso(), loudnessOptions
      };
    },
    components: {
      TwoStateButton,
      MultiStateButtonGroup,
      DismissableAlert,
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

  .table-sm td {
    /* padding:0 0.3rem; */
  }

  .col-lg {
    padding-left: 0;
  }

</style>