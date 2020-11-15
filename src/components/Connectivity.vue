<template>
  <div class="transition-container">
    <h5>Ethernet</h5>
    <template v-if="nmstat.eth0detail">
      <h6>Current Settings</h6>
      <table class="table table-sm table-responsive table-striped">
        <tbody>
          <tr>
            <td>IP Address</td>
            <td><code>{{ nmstat?.devs?.eth0?.IP4 && nmstat?.devs?.eth0?.IP4["ADDRESS[1]"] }}</code></td>
          </tr>
          <tr>
            <td>Gateway</td>
            <td><code>{{ nmstat?.devs?.eth0?.IP4 && nmstat?.devs?.eth0?.IP4["GATEWAY"] }}</code></td>
          </tr>
          <tr>
            <td>Network Cable</td>
            <td><code>{{ (nmstat?.devs?.eth0["WIRED-PROPERTIES"]["CARRIER"]=="on")?"Connected":"Disconnected" }}</code></td>
          </tr>
          <tr>
            <td>MAC Address</td>
            <td><code>{{ nmstat?.devs?.eth0["GENERAL"]["HWADDR"] }}</code></td>
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
    </template>
    <template v-else>
      <div
        class="spinner-border text-primary"
        role="status"
      >
        <span class="sr-only">Loading...</span>
      </div>
    </template>

    <h5>Wi-Fi</h5>
    <!-- TODO toggle wifi -->
    <div class="mb-3">
      <two-state-button 
        :button-text="`Wi-Fi: ${nmstat?.radioenabled === true ? 'On' : 'Off'}`" 
        :state-on="nmstat?.radioenabled === true" 
        :home-button="false"
        @click="wifipower"
      />
    </div>

    <div class="form-group">
      <label
        for="inputEmail3"
        class="col-form-label col-form-label-sm "
      >Country Code for Wireless Regulatory Settings {{ mso.crda }}</label>
      <select 
        class="form-control form-control-sm" 
        @change="({ type, target }) => setWifiCountryCode(target.value)"
      >
        <option 
          v-for="(name, code) in isoCountries" 
          :key="code"
          :value="code"
          :selected="code === mso.crda"
        >
          {{ code }}: {{ name }}
        </option>
      </select>
    </div>

    <template v-if="nmstat?.devs?.wlan0">
      <h6>Current Settings</h6>
      <table class="table table-sm table-responsive table-striped">
        <tbody>
          <tr>
            <td>Connected Network</td>
            <td><code>{{ nmstat?.devs?.wlan0 && nmstat?.devs?.wlan0["GENERAL"]["CONNECTION"] }}</code></td>
          </tr>
          <tr>
            <td>IP Address</td>
            <td><code>{{ nmstat?.devs?.wlan0?.IP4 && nmstat?.devs?.wlan0?.IP4["ADDRESS[1]"] }}</code></td>
          </tr>
          <tr>
            <td>Gateway</td>
            <td><code>{{ nmstat?.devs?.wlan0?.IP4 && nmstat?.devs?.wlan0?.IP4["GATEWAY"] }}</code></td>
          </tr>
          <tr>
            <td>MAC Address</td>
            <td><code>{{ nmstat?.devs?.wlan0["GENERAL"]["HWADDR"] }}</code></td>
          </tr>
        </tbody>
      </table>
      <h6>Manage Wi-Fi Networks</h6>
      <div class="row">
        <div class="form-group col-md">
          <label for="available-networks">Available Networks</label>
          <select
            id="available-networks"
            v-model="selnet"
            size="10"
            class="form-control"
          >
            <option
              v-for="net in nmstat.wifinets"
              :key="net"
              :value="net"
            >
              {{ net.ssid }}
            </option>
          </select>
        </div>
        <div class="col-md">
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              id="password" 
              v-model="password" 
              :type="showpass?'text':'password'" 
              class="form-control form-control-sm"
              aria-describedby="showpass-small"
            >
            <small
              id="showpass-small"
              class="form-text text-muted"
            >
              <div class="form-check">
                <input
                  id="showpass"
                  v-model="showpass"
                  class="form-check-input"
                  type="checkbox"
                >
                <label
                  class="form-check-label form-check-label-sm"
                  for="showpass"
                >
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
          <select
            id="configured-networks"
            v-model="actnet"
            size="10"
            class="form-control"
          >
            <option
              v-for="net in configuredNetworks"
              :key="net.NAME + net.UUID"
              :value="net"
            >
              {{ net.NAME }}
            </option>
          </select>
        </div>
      </div>
      <div class="row justify-content-end mb-3">
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
        <h6>Configuration for Wi-Fi Network "{{ actnet.NAME }}"</h6>
        <template v-if="network.wlan0.populated">
          <dhcp-settings
            id="wlan0" 
            :network="network.wlan0"
            :blank-ip="BLANK_IP_ADDRESS"
            @add-ip-address="addIPAddress"
            @remove-ip-address="removeIPAddress"
            @add-nameserver="addNameserver"
            @remove-nameserver="removeNameserver"
            @apply-network-config="applyNetworkConfig"
          />
        </template>
        <template v-else>
          <div
            class="spinner-border text-primary"
            role="status"
          >
            <span class="sr-only">Loading...</span>
          </div>
        </template>
      </template>
    </template>
    <template v-else>
      <div
        class="spinner-border text-primary"
        role="status"
      >
        <span class="sr-only">Loading...</span>
      </div>
    </template>
  </div>
</template>

<script>

  import { reactive, ref, computed, watch, onActivated, onDeactivated } from 'vue';

  import useMso from '@/use/useMso.js';
  import useCountryCodes from '@/use/useCountryCodes.js';
  import useNetworkManager from '@/use/useNetworkManager.js';

  import TwoStateButton from './buttons/TwoStateButton.vue';
  import DhcpSettings from './DhcpSettings.vue';

  const BLANK_IP_ADDRESS = {
      address: '',
      prefixlen: 24,
      netmask: '255.255.255.0'
  };

  export default {
    name: 'Connectivity',
    components: {
      TwoStateButton,
      DhcpSettings
    },
    setup() {

      const { 
        nmstat, condetails, scan, applyNetworkConfig, wificonfig, 
        wificonnect, wifidisconnect, wififorget, wifipower, getConDetails,
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

      function addIPAddress(network) {
        network.addresses.push(BLANK_IP_ADDRESS);
      }

      function removeIPAddress(network, index) {
        network.addresses.splice(index, 1);
      }

      function addNameserver(network) {
        network.dns.push('');
      }

      function removeNameserver(index) {
        network.dns.splice(index, 1);
      }

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
      onActivated(() => {
        console.log('Connectivity onActivated');
        scan();
        scanInterval = setInterval(scan, 5000);
      });

      // clear scan interval if 
      // navigating away from this page
      onDeactivated(() => {
        console.log('Connectivity onDeactivated');
        clearInterval(scanInterval);
      });

      return { 
        ...useMso(), ...useCountryCodes(), nmstat, scan, applyNetworkConfig, BLANK_IP_ADDRESS,
        int2ip, ip2int, cidr2mask, mask2cidr, wificonfig, wifipower, getConDetails,
        network, password, showpass, selnet, actnet, 
        configuredNetworks, wificonnect, wifidisconnect, wififorget,
        addIPAddress, removeIPAddress, addNameserver, removeNameserver
      };
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