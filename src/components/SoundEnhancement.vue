<template>
  <div class="transition-container">
    <h5>Upmix Settings</h5>
    <table class="table table-sm table-responsive-md table-striped">
      <thead>
        <tr>
          <th>Upmix</th>
          <th>Show on Home Page</th>
          <th>Controls</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="upmix in allUpmixers" :key="upmix.value">
          <th>
            <div class="form-check">
              <input 
                class="form-check-input" 
                type="radio" 
                name="upmix" 
                :id="`radio-${upmix.value}`" 
                :value="upmix.value" 
                :checked="mso.upmix.select === upmix.value" 
                @click="setUpmix(upmix.value)">
              <label class="form-check-label" :for="`radio-${upmix.value}`">
                {{(upmix.label)}}
              </label>
            </div>
          </th>
          <td>
            <div class="custom-control custom-switch">
              <input 
                type="checkbox" 
                class="custom-control-input" 
                :id="'homevis-'+upmix.value" 
                :checked="upmix.homevis" 
                @click="toggleUpmixHomevis(upmix.value)"
              >
              <label class="custom-control-label" :for="'homevis-'+upmix.value"></label>
            </div>
          </td>
          <td>
            <div v-if="upmix.value === 'dolby'">
              <div class="custom-control custom-switch">
                <input 
                  type="checkbox" 
                  class="custom-control-input" 
                  id="dolbycs" 
                  :checked="mso.upmix?.dolby.cs" 
                  @click="toggleUpmixCenterSpread()"
                >
                <label class="custom-control-label" for="dolbycs">
                  Center Spread
                </label>
              </div>
            </div>
            <div class="row" v-if="upmix.value === 'auro'">
              <div class="col-lg">
                
                <div class="form-group">
                  <label for="inputEmail3" class="col-form-label col-form-label-sm ">AuroMatic Preset</label>
                  <select 
                    class="form-control form-control-sm" 
                    @change="({ type, target }) => setAuroMaticPreset(target.value)"
                  >
                    <option 
                      v-for="opt in auroPresets" 
                      :key="opt.value"
                      :value="opt.value"
                      :selected="opt.value === mso.upmix?.auro.preset"
                    >
                      {{opt.label}}
                    </option>
                  </select>
                </div>
              </div>
              <div class="col-lg">
                <div class="form-group">
                  <label class="col-form-label col-form-label-sm" for="auro-strength">AuroMatic Strength</label>
                  <div class="form-row">
                    <input 
                      type="range" 
                      class="custom-range col" 
                      id="auro-strength" 
                      min="1" 
                      max="16"
                      :value="mso.upmix?.auro.strength"
                      @input="({ type, target }) => setAuroMaticStrength(target.value)"
                    >
                    <span class="col-auto auro-str-label">{{mso.upmix?.auro.strength}}</span>
                  </div>
                </div>
              </div>
              <div class="col-lg-auto">
                <div class="form-group">
                  <label class="col-form-label col-form-label-sm">&nbsp;</label>
                  <button 
                    class="btn btn-sm btn-primary form-control"
                    @click="setDefaultAuroMaticStrength()"
                  >
                    Default
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="form-group">
      <two-state-button 
        :button-text="`Reinforce Bass: ${mso.bassenhance}`" 
        :state-on="mso.bassenhance === 'on'" 
        :home-button="false"
        @click="toggleReinforceBass()"
      />
      <small class="form-text text-muted">Adds subwoofer signal to large speakers{{!showCrossoverControls ? ' - unavailable with Dirac Bass Control' : ''}}</small>
    </div>
    <div class="form-group">
      <two-state-button 
        :button-text="`Wide Synth: ${mso.upmix?.dts.ws ? 'on' : 'off'}`" 
        :state-on="mso.upmix?.dts.ws" 
        :home-button="false"
        @click="toggleUpmixWideSynth()"
      />
      <small class="form-text text-muted">Synthesizes wide speakers when possible</small>
    </div>
  </div>
</template>

<script>

  import useMso from '@/use/useMso.js';

  import TwoStateButton from './TwoStateButton.vue';
  import MultiStateButtonGroup from './MultiStateButtonGroup.vue';

  export default {
    name: 'SoundEnhancement',
    setup() {

      const auroPresets = [
        {label: 'Small', value: 0},
        {label: 'Medium', value: 1},
        {label: 'Large', value: 2},
        {label: 'Movie', value: 3},
        {label: 'Speech', value: 4},
      ];

      return { ...useMso(), auroPresets };
    },
    components: {
      MultiStateButtonGroup,
      TwoStateButton
    }
  }
</script>

<style scoped>
  thead th {
    font-size: 80%;
  }

  .table-striped .table-auro tr {
    background-color: rgba(0,0,0,0);
  }

  .auro-str-label {
    min-width: 2rem;
    text-align: right;
  }

</style>