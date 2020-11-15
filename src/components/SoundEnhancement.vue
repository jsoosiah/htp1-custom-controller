<template>
  <div class="transition-container">
    <h5>Upmix Settings</h5>
    <table class="table table-sm table-responsive-md table-striped">
      <thead>
        <tr>
          <th>Upmix</th>
          <th>Show on Homepage</th>
          <th>Controls</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="upmix in allUpmixers"
          :key="upmix.value"
        >
          <td>
            <two-state-button 
              :button-text="upmix.label"
              :state-on="mso.upmix.select === upmix.value"
              min-width="9rem"
              @click="setUpmix(upmix.value)"
            />
          </td>
          <td>
            <div class="custom-control custom-switch">
              <input 
                :id="'homevis-'+upmix.value" 
                type="checkbox" 
                class="custom-control-input" 
                :checked="upmix.homevis" 
                @click="toggleUpmixHomevis(upmix.value)"
              >
              <label
                class="custom-control-label"
                :for="'homevis-'+upmix.value"
              />
            </div>
          </td>
          <td>
            <div v-if="upmix.value === 'dolby'">
              <div class="custom-control custom-switch">
                <input 
                  id="dolbycs" 
                  type="checkbox" 
                  class="custom-control-input" 
                  :checked="mso.upmix?.dolby.cs" 
                  @click="toggleUpmixCenterSpread()"
                >
                <label
                  class="custom-control-label"
                  for="dolbycs"
                >
                  Center Spread
                </label>
              </div>
            </div>
            <div
              v-if="upmix.value === 'auro'"
              class="row"
            >
              <div class="col-lg">
                <div class="form-group">
                  <label
                    for="inputEmail3"
                    class="col-form-label col-form-label-sm "
                  >AuroMatic Preset</label>
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
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="col-lg">
                <div class="form-group">
                  <label
                    class="col-form-label col-form-label-sm"
                    for="auro-strength"
                  >AuroMatic Strength</label>
                  <div class="form-row">
                    <input 
                      id="auro-strength" 
                      type="range" 
                      class="custom-range col" 
                      min="1" 
                      max="16"
                      :value="mso.upmix?.auro.strength"
                      @input="({ type, target }) => setAuroMaticStrength(target.value)"
                    >
                    <span class="col-auto auro-str-label">{{ mso.upmix?.auro.strength }}</span>
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
    <div
      class="form-group"
      style="padding-left:.3rem"
    >
      <two-state-button 
        :button-text="`Wide Synth: ${mso.upmix?.dts.ws ? 'on' : 'off'}`" 
        :state-on="mso.upmix?.dts.ws" 
        :home-button="false"
        min-width="9rem"
        @click="toggleUpmixWideSynth()"
      />
      <small class="form-text text-muted">Synthesizes wide speakers when possible</small>
    </div>
  </div>
</template>

<script>

  import useMso from '@/use/useMso.js';

  import TwoStateButton from './buttons/TwoStateButton.vue';

  export default {
    name: 'SoundEnhancement',
    components: {
      TwoStateButton
    },
    setup() {

      const auroPresets = [
        {label: 'Small', value: 0},
        {label: 'Medium', value: 1},
        {label: 'Large', value: 2},
        {label: 'Movie', value: 3},
        {label: 'Speech', value: 4},
      ];

      return { ...useMso(), auroPresets };
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