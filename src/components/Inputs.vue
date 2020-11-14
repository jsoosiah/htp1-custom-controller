<template>
  <div class="transition-container">
    <div class="row justify-content-between">
      <div class="col-auto">
        <h5>Input Setup</h5>
      </div>
      <div class="col-auto">
        <div class="custom-control custom-switch">
          <input 
            type="checkbox" 
            class="custom-control-input" 
            id="display-adv-input" 
            :checked="mso.stat?.displayAdvancedSettings" 
            @click="toggleAdvancedInputSettings()"
          >
          <label class="custom-control-label" for="display-adv-input">
            Show Advanced Input Settings
          </label>
        </div>
      </div>
    </div>
    <table class="table table-sm table-responsive-lg table-striped">
      <thead>
        <tr>
          <th>Input</th>
          <th>Label</th>
          <th>Visible on Homepage</th>
          <th>Default Sound Mode</th>
          <th>Input Delay (ms)</th>
          <th>Input Trim (dB)</th>
          <th>UHD Capable</th>
          <th v-if="mso.stat?.displayAdvancedSettings">PCM Detect Sensitivity</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(inp, inpcode) in mso.inputs"
          :key="inpcode"
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
              class="form-control form-control-sm"
              @change="({ type, target }) => setInputDefaultUpmix(inpcode, target.value)"
            >
              <option :value="null">Last Used</option>
              <option
                v-for="upmix in allUpmixers" :key="upmix.value"
                :value="upmix.value"
                :selected="upmix.value === inp.defaultUpmix"
              >
                {{upmix.label}}
              </option>
            </select>
          </td>
          <td>
            <input 
              type="number" 
              class="form-control form-control-sm text-right" 
              aria-label="Input Delay" 
              :value="inp.delay" 
              @change="({ type, target }) => setInputDelay(inpcode, target.value)"
              min="0" 
              max="200" 
              size="3"
            />
          </td>
          <td>
            <input 
              type="number" 
              class="form-control form-control-sm text-right" 
              aria-label="Volume Offset" 
              :value="inp.gain" 
              @change="({ type, target }) => setInputVolumeTrim(inpcode, target.value)"
              min="-12" 
              max="12" 
              size="3"
            />
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
          <td v-if="mso.stat?.displayAdvancedSettings">
              <select 
                v-if="getFormatDetectOptions(inp.menuSounds).length > 0"
                class="form-control form-control-sm" 
                @change="({ type, target }) => setInputFormatDetectOption(inpcode, target.value)"
              >
                <option 
                  v-for="opt in getFormatDetectOptions(inp.menuSounds)" 
                  :key="opt.value"
                  :value="opt.value"
                  :selected="opt.value === inp.formatDetectOption"
                >
                  {{opt.label}}
                </option>
              </select>
          </td>
        </tr>
      </tbody>
    </table>
    <h5>HDMI CEC</h5>
    <div class="mb-3">
      <two-state-button 
        :button-text="`CEC: ${mso?.CEC?.cecOnSw}`" 
        :state-on="mso?.CEC?.cecOnSw === 'on'" 
        :home-button="false"
        @click="toggleCEC()"
      />
    </div>
    <table class="table table-sm table-responsive table-striped mb-3" v-if="mso.CEC?.cecOnSw === 'on'">
      <thead>
        <th>
          CEC Options
        </th>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="form-group">
              <label for="inputEmail3" class="col-form-label ">Alternate TV Input</label>
              <select 
                class="form-control form-control-sm" 
                @change="({ type, target }) => setTVSoundSrcDefault(target.value)"
              >
                <option 
                  v-for="opt in altTVInputs" 
                  :key="opt.value"
                  :value="opt.value"
                  :selected="opt.value === mso.stat.TVSoundSrcDefault"
                >
                  {{opt.label}}
                </option>
              </select>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="custom-control custom-switch">
              <input 
                type="checkbox" 
                class="custom-control-input" 
                id="cec-pwrk" 
                :checked="mso.CEC?.allowpwrk" 
                @click="toggleCECAllowPowerKey()"
              >
              <label class="custom-control-label" for="cec-pwrk">Allow power keys</label>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="custom-control custom-switch">
              <input 
                type="checkbox" 
                class="custom-control-input" 
                id="cec-volk" 
                :checked="mso.CEC?.allowvolk" 
                @click="toggleCECAllowVolKey()"
              >
              <label class="custom-control-label" for="cec-volk">Allow volume/mute keys</label>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="custom-control custom-switch">
              <input 
                type="checkbox" 
                class="custom-control-input" 
                id="cec-saf" 
                :checked="mso.CEC?.allowsaf" 
                @click="toggleCECAllowSysAudioOff()"
              >
              <label class="custom-control-label" for="cec-saf">Allow system audio off</label>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="custom-control custom-switch">
              <input 
                type="checkbox" 
                class="custom-control-input" 
                id="cec-inp" 
                :checked="mso.CEC?.allowinp" 
                @click="toggleCECAllowInputChange()"
              >
              <label class="custom-control-label" for="cec-inp">Allow input changes</label>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="custom-control custom-switch">
              <input 
                type="checkbox" 
                class="custom-control-input" 
                id="cec-stdb" 
                :checked="mso.CEC?.allowstdb" 
                @click="toggleCECAllowStandby()"
              >
              <label class="custom-control-label" for="cec-stdb">Allow standby</label>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <h5>Bluetooth Settings</h5>
    <div class="form-group">
      <label for="inputEmail3" class="col-form-label">Discoverable Timeout (0=Always Discoverable)</label>
      <div class="input-group bluetooth-input">
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
  </div>

</template>

<script>

  import useMso from '@/use/useMso.js';
  import useInputs from '@/use/useInputs.js';

  import TwoStateButton from './buttons/TwoStateButton.vue';

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

      const altTVInputs = [
        {label: 'None', value: 'none'},
        {label: 'Analog1', value: 'a1'},
        {label: 'Analog2', value: 'a2'},
        {label: 'COAX1', value: 'spdif1'},
        {label: 'COAX2', value: 'spdif2'},
        {label: 'COAX3', value: 'spdif3'},
        {label: 'Optical1', value: 'optical1'},
        {label: 'Optical2', value: 'optical2'},
        {label: 'Optical3', value: 'optical3'},
      ];

      return { ...useMso(), ...useInputs(), getFormatDetectOptions, altTVInputs };
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

  .numeric-input .form-control {
    min-width: auto;
  }

  div.bluetooth-input {
    width: 10rem;
  }
</style>