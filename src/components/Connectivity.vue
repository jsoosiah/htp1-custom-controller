<template>
  <div class="transition-container">
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
    <template v-if="nmstat.eth0detail">
      <h5>Ethernet</h5>
      <h6>Current Settings</h6>
      <table class="table table-sm table-responsive table-striped">
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
      <h6>Configuration for Wired Network</h6>
      <template v-if="network.eth0.uuid">
        <dhcp-settings
          id="eth0" 
          :network="network.eth0"
          :blank-ip="BLANK_IP_ADDRESS"
        />
      </template>
      <template v-else>
        <p>Connect the Ethernet cable in order to configure the wired network. </p>
      </template>

      <h5>Wi-Fi</h5>
      <h6>Current Settings</h6>
      <table class="table table-sm table-responsive table-striped">
        <tbody>
          <tr>
            <td>Connected Network</td>
            <td><code>{{nmstat?.devs?.wlan0 && nmstat?.devs?.wlan0["GENERAL"]["CONNECTION"]}}</code></td>
          </tr>
          <tr>
            <td>IP Address</td>
            <td><code>{{nmstat?.devs?.wlan0?.IP4 && nmstat?.devs?.wlan0?.IP4["ADDRESS[1]"]}}</code></td>
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
      <h6>Manage Wi-Fi Networks</h6>
      <div class="row">
        <div class="form-group col">
          <label for="available-networks">Available Networks</label>
          <select v-model="selnet" size="10" class="form-control" id="available-networks">
            <option
              v-for="net in nmstat.wifinets"
              :key="net"
              :value="net"
            >
              {{net.ssid}}
            </option>
          </select>
        </div>
        <div class="col">
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              :type="showpass?'text':'password'" 
              class="form-control form-control-sm" 
              id="password" 
              aria-describedby="showpass-small"
              v-model="password"
            />
            <small id="showpass-small" class="form-text text-muted">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="showpass" id="showpass" />
                <label class="form-check-label form-check-label-sm" for="showpass">
                  Show password
                </label>
              </div>
            </small>
          </div>
          <button 
            :disabled="!selnet.ssid || (selnet.security && !password)"
            class="btn btn-sm btn-primary"
            @click="wificonfig(selnet.ssid, password)"
          >
            Configure Network
          </button>
        </div>
        <div class="form-group col">
          <label for="configured-networks">Configured Networks</label>
          <select v-model="actnet" size="10" class="form-control" id="configured-networks">
            <option v-for="net in configuredNetworks" :value="net" :key="net.NAME + net.UUID">{{net.NAME}}</option>
          </select>
        </div>
      </div>
      <div class="row justify-content-end">
        <div class="col-auto">
          <button 
            :disabled="!actnet.UUID"
            class="btn btn-disabled btn-sm btn-danger"
            @click="wififorget(actnet.UUID)"
          >
            Forget
          </button>
          &nbsp;
          <button 
            :disabled="!actnet.UUID"
            class="btn btn-disabled btn-sm btn-warning"
            @click="wifidisconnect(actnet.UUID)"
          >
            Disconnect
          </button>
          &nbsp;
          <button 
            :disabled="!actnet.UUID"
            class="btn btn-disabled btn-sm btn-success"
            @click="wificonnect(actnet.UUID)"
          >
            Connect
          </button>
        </div>
      </div>
      
      <template v-if="actnet.UUID">
        <h6>Configuration for Wi-Fi Network "{{actnet.NAME}}"</h6>
        <template v-if="network.wlan0.populated">
          <dhcp-settings
            id="wlan0" 
            :network="network.wlan0"
            :blank-ip="BLANK_IP_ADDRESS"
            @apply-network-config="applyNetworkConfig"
          />
        </template>
        <template v-else>
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </template>
      </template>
    </template>
    <template v-else>
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </template>
  </div>
</template>

<script>

  import { reactive, ref, computed, watch, onMounted, onUnmounted } from 'vue';

  import useMso from '@/use/useMso.js';
  import useNetworkManager from '@/use/useNetworkManager.js';

  import TwoStateButton from './buttons/TwoStateButton.vue';
  import MultiStateButtonGroup from './buttons/MultiStateButtonGroup.vue';
  import DhcpSettings from './DhcpSettings.vue';

  const BLANK_IP_ADDRESS = {
      address: '',
      prefixlen: 24,
      netmask: '255.255.255.0'
  };

  export default {
    name: 'Connectivity',
    setup() {

      const { 
        state, nmstat, condetails, scan, applyNetworkConfig, wificonfig, 
        wificonnect, wifidisconnect, wififorget, getConDetails,
        int2ip, ip2int, cidr2mask, mask2cidr
      } = useNetworkManager();

      // local form state
      const network = reactive({
        eth0: {
          uuid: null,
        },
        wlan0: {
          uuid: null,
        }
      });

      const password = ref('');
      const showpass = ref(false);
      const selnet = ref({});
      const actnet = ref({});

      const configuredNetworks = computed(() => {
        return nmstat.value.cons ? nmstat.value.cons.filter(con => con.TYPE === '802-11-wireless') : [];
      });

      let scanInterval;

      function populateNetworkFromConfig(netInterface, config) {
        console.log('populateNetworkFromConfig', netInterface, config);
        let net = network[netInterface];
        net.dhcp = config.ipv4?.method === 'auto';
        if(net.dhcp)
        {
            // Fill in blank config so we have it if user goes to manual.
            net.addresses = [{...BLANK_IP_ADDRESS}];
            net.gateway='';
            net.dns=[''];
        }
        else {
            net.addresses = config.ipv4?.addresses.split(',').map(addr => {
                addr = addr.trim();
                console.log('cidr',addr, addr.split('/')[1], cidr2mask(addr.split('/')[1]))
                return {
                    address: addr.split('/')[0],
                    prefixlen: addr.split('/')[1],
                    netmask: cidr2mask(addr.split('/')[1]),
                }
            });
            net.gateway = config.ipv4?.gateway;
            net.dns = config.ipv4?.dns.split(',');
        }

        if (config.GENERAL?.UUID) {
          net.uuid = config.GENERAL?.UUID
        }

        net.populated = true;
      }

      // watch nmstat
      watch(
        nmstat,
        newNMStat => {
          if (!network.eth0.uuid) {
            populateNetworkFromConfig('eth0', newNMStat.eth0detail);
          }

          // set initial actnet value for Configured Networks select
          if (!actnet.value.UUID) {
            const active = newNMStat.cons.filter(con => con.ACTIVE === 'yes');
            if (active.length > 0) {
              actnet.value = active[0];
            }
          }
        }
      );

      // watch actnet, request new conDetails
      watch(
        actnet,
        newActnet => {
          console.log('newActnet', newActnet.UUID)
          network.wlan0 = {
            uuid: newActnet.UUID // test
          };
          getConDetails(newActnet.UUID);
        }
      )

      // watch condetails, populate network wlan0
      watch(
        condetails,
        newCondetails => {
          console.log('newCondetails', newCondetails);
            populateNetworkFromConfig('wlan0', newCondetails);
        }
      )

      // perform initial network scan
      // and continue scanning every 5 seconds
      onMounted(() => {
        console.log('Connectivity onMounted');
        scan();
        scanInterval = setInterval(scan, 5000);
      });

      // clear scan interval if 
      // navigating away from this page
      onUnmounted(() => {
        console.log('Connectivity onUnmounted');
        clearInterval(scanInterval);
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
        ...useMso(), nmstat, scan, applyNetworkConfig, BLANK_IP_ADDRESS,
        int2ip, ip2int, cidr2mask, mask2cidr, wificonfig, getConDetails,
        altTVInputs, network, password, showpass, selnet, actnet, 
        configuredNetworks, wificonnect, wifidisconnect, wififorget
      };
    },
    components: {
      MultiStateButtonGroup,
      TwoStateButton,
      DhcpSettings
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