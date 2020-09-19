<template>
  <h6>CEC</h6>
    <div class="mb-3">
      <two-state-button 
        :button-text="`CEC: ${mso.CEC.cecOnSw}`" 
        :state-on="mso.CEC.cecOnSw === 'on'" 
        :home-button="false"
        @click="toggleCEC()"
      />
    </div>
    <table class="table table-sm table-responsive table-striped mb-3" v-if="mso.CEC.cecOnSw === 'on'">
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
                :checked="mso.CEC.allowpwrk" 
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
                :checked="mso.CEC.allowvolk" 
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
                :checked="mso.CEC.allowsaf" 
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
                :checked="mso.CEC.allowinp" 
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
                :checked="mso.CEC.allowstdb" 
                @click="toggleCECAllowStandby()"
              >
              <label class="custom-control-label" for="cec-stdb">Allow standby</label>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  <h6>Ethernet</h6>
  <table class="table table-sm table-responsive table-striped">
    <thead>
      <tr>
        <th colspan="2">Current Settings</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>IP Address</td>
        <td><code>{{nmstat?.devs?.eth0?.IP4 && nmstat?.devs?.eth0?.IP4["ADDRESS[1]"]}}</code></td>
      </tr>
      <tr>
        <td>Gateway</td>
        <td><code>{{nmstat?.devs?.eth0?.IP4 && nmstat?.devs?.eth0?.IP4["GATEWAY"]}}</code></td>
      </tr>
      <tr>
        <td>Network Cable</td>
        <td>{{(nmstat?.devs?.eth0["WIRED-PROPERTIES"]["CARRIER"]=="on")?"Connected":"Disconnected"}}</td>
      </tr>
      <tr>
        <td>MAC Address</td>
        <td><code>{{nmstat?.devs?.eth0["GENERAL"]["HWADDR"]}}</code></td>
      </tr>
    </tbody>
  </table>
  <h6>Wi-Fi</h6>
  <table class="table table-sm table-responsive table-striped">
    <thead>
      <tr>
        <th colspan="2">Current Settings</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Connected Network</td>
        <td><code>{{nmstat?.devs?.wlan0 && nmstat?.devs?.wlan0["GENERAL"]["CONNECTION"]}}</code></td>
      </tr>
      <tr>
        <td>IP Address</td>
        <td><code>{{nmstat?.devs?.wlan0?.IP4 && nmstat?.devs?.wlan0?.IP4["GATEWAY"]}}</code></td>
      </tr>
      <tr>
        <td>Gateway</td>
        <td><code>{{nmstat?.devs?.wlan0?.IP4 && nmstat?.devs?.wlan0?.IP4["GATEWAY"]}}</code></td>
      </tr>
      <tr>
        <td>MAC Address</td>
        <td><code>{{nmstat?.devs?.wlan0["GENERAL"]["HWADDR"]}}</code></td>
      </tr>
    </tbody>
  </table>
  {{n}}
  <div class="row">
    <div class="form-group col">
      <label for="available-networks">Available Networks</label>
      <select size="10" class="form-control" id="available-networks">
        <option
          v-for="net in nmstat.wifinets"
        >
          {{net.ssid}}
        </option>
      </select>
    </div>
    <div class="col">
      ok
    </div>
    <div class="form-group col">
      <label for="configured-networks">Configured Networks</label>
      <select size="10" class="form-control" id="configured-networks">
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4</option>
        <option>5</option>
      </select>
    </div>
  </div>
</template>

<script>

  import { watch, onUnmounted } from 'vue';

  import useMso from '@/use/useMso.js';
  import useNetworkStat from '@/use/useNetworkStat.js';

  import TwoStateButton from './TwoStateButton.vue';

  export default {
    name: 'Connectivity',
    setup() {

      const { nmstat, scan } = useNetworkStat();

      let scanTimeout;

      // watch nmstat, set timeout for next scan 5 seconds
      // after previous scan completed
      watch(
        nmstat,
        val => {
          scanTimeout = setTimeout(scan, 5000);
        }
      );

      // cancel the last scan timeout if 
      // navigating away from this page
      onUnmounted(() => {
        clearTimeout(scanTimeout);
      });

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

      return { ...useMso(), nmstat, altTVInputs };
    },
    components: {
      TwoStateButton
    }
  }
</script>

<style scoped>
  th {
    font-size: 80%;
  }

  code {
    color: inherit;
  }
</style>