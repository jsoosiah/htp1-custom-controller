<template>
  <h6>Input Setup</h6>
  <table class="table table-sm table-responsive-md table-striped">
    <thead>
      <tr>
        <th>Input</th>
        <th>Label</th>
        <th>Visible on Home Page</th>
        <th v-if="mso.stat?.displayAdvancedSettings">PCM Detect Sensitivity</th>
        <th>UHD Capable</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(inp, inpcode) in mso.inputs"
      >
        <td>
          <two-state-button 
            :button-text="inputName(inpcode)"
            :state-on="inpcode === mso.input"
            @click="setInput(inpcode)"
          />
        </td>
        <td>
          <input 
            type="text" 
            class="form-control form-control-sm" 
            :value="inp.label"
            @change="({ type, target }) => setInputLabel(inpcode, target.value)"
          />
        </td>
        <td>
          <div class="custom-control custom-switch">
            <input 
              type="checkbox" 
              class="custom-control-input" 
              :id="'visible-'+inpcode" 
              :checked="inp.visible" 
              @click="toggleInputVisible(inpcode)"
            >
            <label class="custom-control-label" :for="'visible-'+inpcode"></label>
          </div>
        </td>
        <td>
            <select 
              v-if="getFormatDetectOptions(inp.menuSounds).length > 0"
              class="form-control form-control-sm" 
              @change="({ type, target }) => setInputFormatDetectOption(inpcode, target.value)"
            >
              <option 
                v-for="opt in getFormatDetectOptions(inp.menuSounds)" 
                :value="opt.value"
                :selected="opt.value === inp.formatDetectOption"
              >
                {{opt.label}}
              </option>
            </select>
        </td>
        <td>
          <div class="custom-control custom-switch" v-if="inpcode.startsWith('h')">
            <input 
              type="checkbox" 
              class="custom-control-input" 
              :id="'uhd-'+inpcode" 
              :checked="inp.uhd" 
              @click="toggleInputUHD(inpcode)"
            >
            <label class="custom-control-label" :for="'uhd-'+inpcode"></label>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <h6>Bluetooth Settings</h6>
  <div class="form-group">
    <label for="inputEmail3" class="col-form-label">Discoverable Timeout (0=Always Discoverable)</label>
    <div class="input-group numeric-input">
      <input 
        type="number" 
        class="form-control" 
        aria-label="Discoverable Timeout" 
        :value="mso.bluetooth?.discoverabletime" 
        @change="({ type, target }) => setBluetoothDiscoverableTime(target.value)" 
        min="0"
      >
      <div class="input-group-append">
        <span class="input-group-text" id="basic-addon2">seconds</span>
      </div>
    </div>
  </div>
  <button 
    class="btn btn-sm btn-primary"
    @click="enableBluetoothDiscovery()"
  >
    Enable Bluetooth Discovery
  </button>

</template>

<script>

  import useMso from '@/use/useMso.js';
  import useInputs from '@/use/useInputs.js';

  import TwoStateButton from './TwoStateButton.vue';

  export default {
    name: 'Inputs',
    setup() {

      function getFormatDetectOptions(menuSounds) {
        switch (menuSounds) {
          case 1:
            return [];
          case 2:
            return [
              {label: 'Auto', value: 'auto'},
              {label: 'Biased', value: 'biased'}
            ];
          case 3:
            return [
              {label: 'Auto', value: 'auto'},
              {label: 'Biased', value: 'biased'},
              {label: 'Indicated', value: 'indicated'}
            ];
        } 
      }

      return { ...useMso(), ...useInputs(), getFormatDetectOptions };
    },
    components: {
      TwoStateButton,
    }
  }
</script>

<style scoped>
  th {
    font-size: 80%;
  }

  table .form-control {
    min-width: 6rem;
  }

  div.numeric-input {
    width: 10rem;
  }
</style>