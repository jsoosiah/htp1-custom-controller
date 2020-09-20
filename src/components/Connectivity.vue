<template>
  <h6>HDMI CEC</h6>
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
              <td><code>{{(nmstat?.devs?.eth0["WIRED-PROPERTIES"]["CARRIER"]=="on")?"Connected":"Disconnected"}}</code></td>
            </tr>
            <tr>
              <td>MAC Address</td>
              <td><code>{{nmstat?.devs?.eth0["GENERAL"]["HWADDR"]}}</code></td>
            </tr>
          </tbody>
        </table>
        <div class="custom-control custom-switch mb-3">
          <input 
            type="checkbox" 
            class="custom-control-input" 
            id="use-dhcp" 
            v-model="network.eth0.dhcp" 
          >
          <label class="custom-control-label" for="use-dhcp">
            Use DHCP
          </label>
        </div>
        <table class="table table-sm table-responsive table-striped" v-if="!network.eth0.dhcp">
          <tbody>
            <tr v-for="(addr, index) in network.eth0.addresses">
              <td>
                <div class="form-group">
                  <label class="small" :for="`eth0-ip-addr-${index}`">IP Address</label>
                  <div class="input-group input-group-sm">
                    <input 
                      type="text" 
                      class="form-control" 
                      :id="`eth0-ip-addr-${index}`" 
                      aria-label="IP Address" 
                      aria-describedby="ip"
                      v-model="addr.address"
                    >
                    <div class="input-group-append">
                      <span class="input-group-text" id="ip">/24</span>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div class="form-group">
                  <label class="small" :for="`eth0-netmask-${index}`">Network Mask</label>
                  <input 
                    type="text" 
                    class="form-control form-control-sm" 
                    :id="`eth0-netmask-${index}`"
                    v-model="addr.netmask"
                  >
                </div>
              </td>
              <td>
                <div class="form-group" v-if="network.eth0.addresses.length > 1">
                  <label class="small" for="eth0-ip-addr">&nbsp;</label>
                  <button 
                    class="form-control form-control-sm btn btn-sm btn-danger"
                    @click="removeIPAddress('eth0')"
                  >
                    <font-awesome-icon size="lg" :icon="['fas', 'times']" />
                  </button>
                </div>
              </td>
              <td>
                <div class="form-group" v-if="index === network.eth0.addresses?.length - 1">
                  <label class="small">&nbsp;</label>
                  <button 
                    class="form-control form-control-sm btn btn-sm btn-primary"
                    @click="addIPAddress('eth0')"
                  >
                    <font-awesome-icon size="lg" :icon="['fas', 'plus']" />
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div class="form-group">
                  <label class="small" for="eth0-gateway">Default Gateway</label>
                  <input 
                    type="text" 
                    class="form-control form-control-sm" 
                    id="eth0-gateway"
                    v-model="network.eth0.gateway"
                  />
                </div>
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr v-for="(dns, index) in network.eth0.dns">
              <td>
                <div class="form-group">
                  <label class="small" :for="`eth0-dns-${index}`">DNS Server {{ index + 1 }}</label>
                  <input 
                    type="text" 
                    class="form-control form-control-sm" 
                    :id="`eth0-dns-${index}`"
                    v-model="network.eth0.dns[index]"
                  />
                </div>
              </td>
              <td></td>
              <td>
                <div class="form-group" v-if="network.eth0.dns?.length > 1">
                  <label class="small">&nbsp;</label>
                  <button 
                    class="form-control form-control-sm btn btn-sm btn-danger"
                    @click="removeNameserver('eth0', index)"
                  >
                    <font-awesome-icon size="lg" :icon="['fas', 'times']" />
                  </button>
                </div>
              </td>
              <td>
                <div class="form-group" v-if="index === network.eth0.dns?.length - 1">
                  <label class="small">&nbsp;</label>
                  <button 
                    class="form-control form-control-sm btn btn-sm btn-primary"
                    @click="addNameserver('eth0')"
                  >
                    <font-awesome-icon size="lg" :icon="['fas', 'plus']" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="form-group">
          <button 
            class="btn btn-sm btn-primary"
            @click="applyNetworkConfig(network.eth0)"
          >
            Apply Network Settings
          </button>
          <small class="form-text text-muted">May affect connectivity</small>
        </div>

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

  import { reactive, watch, onUnmounted } from 'vue';

  import useMso from '@/use/useMso.js';
  import useNetworkManager from '@/use/useNetworkManager.js';

  import TwoStateButton from './TwoStateButton.vue';

  const BLANK_IP_ADDRESS = {
      address: '',
      prefixlen: 24,
      netmask: '255.255.255.0'
  };

  export default {
    name: 'Connectivity',
    setup() {

      const { nmstat, scan, applyNetworkConfig, int2ip, ip2int, cidr2mask, mask2cidr } = useNetworkManager();

      // local form state
      const network = reactive({
        eth0: {
          uuid: null,
        },
        wlan0: {
          uuid: null,
        }
      });

      let scanTimeout;

      function populateNetworkFromConfig(netInterface, config) {
        console.log('populateNetworkFromConfig', netInterface, config);
        let net = network[netInterface];
        net.dhcp = config.ipv4.method=='auto';
        if(net.dhcp)
        {
            // Fill in blank config so we have it if user goes to manual.
            net.addresses = [{...BLANK_IP_ADDRESS}];
            net.gateway='';
            net.dns=[''];
        }
        else {
            net.addresses = config.ipv4.addresses.split(',').map(addr => {
                addr = addr.trim();
                console.log('cidr',addr, addr.split('/')[1], cidr2mask(addr.split('/')[1]))
                return {
                    address: addr.split('/')[0],
                    prefixlen: addr.split('/')[1],
                    netmask: cidr2mask(addr.split('/')[1]),
                }
            });
            net.gateway = config.ipv4.gateway;
            net.dns = config.ipv4.dns.split(',');
        }
        net.uuid = config.GENERAL.UUID;
      }

      function addIPAddress(netInterface) {
        network[netInterface].addresses.push({...BLANK_IP_ADDRESS});
      }

      function removeIPAddress(netInterface, index) {
        network[netInterface].addresses.splice(index, 1);
      }

      function addNameserver(netInterface) {
        network[netInterface].dns.push('');
      }

      function removeNameserver(netInterface, index) {
        network[netInterface].dns.splice(index, 1);
      }

      // watch nmstat, set timeout for next scan 5 seconds
      // after previous scan completed
      watch(
        nmstat,
        newNMStat => {
          if (!scanTimeout) { // on first load, populate network from config
            populateNetworkFromConfig('eth0', newNMStat.eth0detail);
          }
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

      return { 
        ...useMso(), nmstat, scan, applyNetworkConfig, 
        int2ip, ip2int, cidr2mask, mask2cidr,
        altTVInputs, network,
        addIPAddress, removeIPAddress, addNameserver, removeNameserver
      };
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