<template>
  <div class="transition-container">
    <div class="row justify-content-between">
      <div class="col-auto">
        <h5>Input Setup</h5>
        <dismissable-alert alert-key="inputs-background-service">
          * Sound Mode, Delay, Dirac Slot, and Run Macro for individual inputs require the <a
            target="_blank"
            href="https://github.com/jsoosiah/htp1-custom-ui-background-service/releases/latest"
          >HTP-1 Custom UI Background Service</a> to be running in the background on a computer in order to function.
        </dismissable-alert>
      </div>
      <div class="col-auto">
        <div class="custom-control custom-switch">
          <input 
            id="display-adv-input" 
            type="checkbox" 
            class="custom-control-input" 
            :checked="mso.stat?.displayAdvancedSettings" 
            @click="toggleAdvancedInputSettings()"
          >
          <label
            class="custom-control-label"
            for="display-adv-input"
          >
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
          <th>Sound Mode*</th>
          <th>Delay (ms)*</th>
          <th>Dirac Slot*</th>
          <th>Run Macro*</th>
          <th>UHD Capable</th>
          <th v-if="mso.stat?.displayAdvancedSettings">
            PCM Detect Sensitivity
          </th>
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
            >
          </td>
          <td>
            <div class="custom-control custom-switch">
              <input 
                :id="'visible-'+inpcode" 
                type="checkbox" 
                class="custom-control-input" 
                :checked="inp.visible" 
                @click="toggleInputVisible(inpcode)"
              >
              <label
                class="custom-control-label"
                :for="'visible-'+inpcode"
              />
            </div>
          </td>
          <td>
            <select 
              class="form-control form-control-sm"
              @change="({ type, target }) => setInputDefaultUpmix(inpcode, target.value)"
            >
              <option :value="null">
                Last Used
              </option>
              <option
                v-for="upmix in allUpmixers"
                :key="upmix.value"
                :value="upmix.value"
                :selected="upmix.value === inp.defaultUpmix"
              >
                {{ upmix.label }}
              </option>
            </select>
          </td>
          <td>
            <input 
              type="number" 
              class="form-control form-control-sm text-right" 
              aria-label="Input Delay" 
              :value="inp.delay" 
              min="0"
              max="200" 
              size="3" 
              @change="({ type, target }) => setInputDelay(inpcode, target.value)"
            >
          </td>
          <td>
            <select
              id="diracSlot"
              class="form-control form-control-sm"
              @change="({ type, target }) => { setInputDiracSlot(inpcode, target.value) }"
            >
              <option :value="null">
                Last Used
              </option>
              <option 
                v-for="(slot, key) in mso.cal?.slots"
                :key="key"
                :selected="inp.diracslot === key"
                :value="key"
              >
                {{ slot.name }} {{ slot.hasBCFilter ? '*' : '' }}
              </option>
            </select>
          </td>
          <td>
            <select 
              id="runMacro"
              class="form-control form-control-sm"
              @change="({ type, target }) => { setInputRunMacro(inpcode, target.value) }"
            >
              <option :value="null">
                None
              </option>
              <option
                v-for="(name, key) in mso.svronly.macroNames"
                :key="key"
                :selected="inp.macro === key"
                :value="key"
              >
                {{ name }}
              </option>
            </select>
          </td>
          <td>
            <div
              v-if="inpcode.startsWith('h')"
              class="custom-control custom-switch"
            >
              <input 
                :id="'uhd-'+inpcode" 
                type="checkbox" 
                class="custom-control-input" 
                :checked="inp.uhd" 
                @click="toggleInputUHD(inpcode)"
              >
              <label
                class="custom-control-label"
                :for="'uhd-'+inpcode"
              />
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
                {{ opt.label }}
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
    <table
      v-if="mso.CEC?.cecOnSw === 'on'"
      class="table table-sm table-responsive table-striped mb-3"
    >
      <thead>
        <th>
          CEC Options
        </th>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="form-group">
              <label
                for="inputEmail3"
                class="col-form-label "
              >Alternate TV Input</label>
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
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="custom-control custom-switch">
              <input 
                id="cec-pwrk" 
                type="checkbox" 
                class="custom-control-input" 
                :checked="mso.CEC?.allowpwrk" 
                @click="toggleCECAllowPowerKey()"
              >
              <label
                class="custom-control-label"
                for="cec-pwrk"
              >Allow power keys</label>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="custom-control custom-switch">
              <input 
                id="cec-volk" 
                type="checkbox" 
                class="custom-control-input" 
                :checked="mso.CEC?.allowvolk" 
                @click="toggleCECAllowVolKey()"
              >
              <label
                class="custom-control-label"
                for="cec-volk"
              >Allow volume/mute keys</label>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="custom-control custom-switch">
              <input 
                id="cec-saf" 
                type="checkbox" 
                class="custom-control-input" 
                :checked="mso.CEC?.allowsaf" 
                @click="toggleCECAllowSysAudioOff()"
              >
              <label
                class="custom-control-label"
                for="cec-saf"
              >Allow system audio off</label>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="custom-control custom-switch">
              <input 
                id="cec-inp" 
                type="checkbox" 
                class="custom-control-input" 
                :checked="mso.CEC?.allowinp" 
                @click="toggleCECAllowInputChange()"
              >
              <label
                class="custom-control-label"
                for="cec-inp"
              >Allow input changes</label>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="custom-control custom-switch">
              <input 
                id="cec-stdb" 
                type="checkbox" 
                class="custom-control-input" 
                :checked="mso.CEC?.allowstdb" 
                @click="toggleCECAllowStandby()"
              >
              <label
                class="custom-control-label"
                for="cec-stdb"
              >Allow standby</label>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <h5>  Lipsync Delay</h5>
    <div class="row">
      <div class="col-lg-auto">
        <div class="form-group">
          <label
            for="inputPassword3"
            class="col-form-label col-form-label-sm"
          >Lipsync Delay</label>
          <div class="input-group input-group-sm numeric-input">
            <input
              type="number"
              class="form-control"
              aria-label="Minimum volume"
              aria-describedby="basic-addon2"
              :value="mso.cal?.lipsync"
              min="0"
              max="340"
              @change="({ type, target }) => setLipsyncDelay(target.value)"
            >
            <div class="input-group-append">
              <span
                id="basic-addon2"
                class="input-group-text"
              >ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <h5>Bluetooth Settings</h5>
    <div class="form-group">
      <label
        for="inputEmail3"
        class="col-form-label"
      >Discoverable Timeout (0=Always Discoverable)</label>
      <div class="input-group bluetooth-input">
        <input 
          type="number" 
          class="form-control" 
          aria-label="Discoverable Timeout" 
          :value="mso.bluetooth?.discoverabletime" 
          min="0" 
          @change="({ type, target }) => setBluetoothDiscoverableTime(target.value)"
        >
        <div class="input-group-append">
          <span
            id="basic-addon2"
            class="input-group-text"
          >seconds</span>
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
  import DismissableAlert from './buttons/DismissableAlert.vue';

  export default {
    name: 'Inputs',
    components: {
      TwoStateButton,
      DismissableAlert,
    },
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