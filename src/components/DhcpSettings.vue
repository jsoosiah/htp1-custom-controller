<template>
  <div class="custom-control custom-switch mb-3">
    <input 
      type="checkbox" 
      class="custom-control-input" 
      :id="`${id}-use-dhcp`" 
      v-model="props.network.dhcp" 
    >
    <label class="custom-control-label" :for="`${id}-use-dhcp`" >
      Use DHCP
    </label>
  </div>
  <table class="table table-sm table-responsive table-striped" v-if="!props.network.dhcp">
    <tbody>
      <tr v-for="(addr, index) in props.network.addresses" :key="index">
        <td>
          <div class="form-group">
            <label class="small" :for="`${props.id}-ip-addr-${index}`">IP Address</label>
            <div class="input-group input-group-sm">
              <input 
                type="text" 
                class="form-control" 
                :id="`${props.id}-ip-addr-${index}`" 
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
            <label class="small" :for="`${props.id}-netmask-${index}`">Network Mask</label>
            <input 
              type="text" 
              class="form-control form-control-sm" 
              :id="`${props.id}-netmask-${index}`"
              v-model="addr.netmask"
            >
          </div>
        </td>
        <td>
          <div class="form-group" v-if="props.network.addresses.length > 1">
            <label class="small" :for="`${props.id}-ip-addr`">&nbsp;</label>
            <button 
              class="form-control form-control-sm btn btn-sm btn-danger"
              @click="removeIPAddress(index)"
            >
              <font-awesome-icon size="lg" :icon="['fas', 'times']" />
            </button>
          </div>
        </td>
        <td>
          <div class="form-group" v-if="index === props.network.addresses?.length - 1">
            <label class="small">&nbsp;</label>
            <button 
              class="form-control form-control-sm btn btn-sm btn-primary"
              @click="addIPAddress()"
            >
              <font-awesome-icon size="lg" :icon="['fas', 'plus']" />
            </button>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div class="form-group">
            <label class="small" :for="`${props.id}-gateway`">Default Gateway</label>
            <input 
              type="text" 
              class="form-control form-control-sm" 
              :id="`${props.id}-gateway`"
              v-model="props.network.gateway"
            />
          </div>
        </td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr v-for="(dns, index) in props.network.dns" :key="index">
        <td>
          <div class="form-group">
            <label class="small" :for="`${props.id}-dns-${index}`">DNS Server {{ index + 1 }}</label>
            <input 
              type="text" 
              class="form-control form-control-sm" 
              :id="`${props.id}-dns-${index}`"
              v-model="props.network.dns[index]"
            />
          </div>
        </td>
        <td></td>
        <td>
          <div class="form-group" v-if="props.network.dns?.length > 1">
            <label class="small">&nbsp;</label>
            <button 
              class="form-control form-control-sm btn btn-sm btn-danger"
              @click="removeNameserver(index)"
            >
              <font-awesome-icon size="lg" :icon="['fas', 'times']" />
            </button>
          </div>
        </td>
        <td>
          <div class="form-group" v-if="index === props.network.dns?.length - 1">
            <label class="small">&nbsp;</label>
            <button 
              class="form-control form-control-sm btn btn-sm btn-primary"
              @click="addNameserver()"
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
      @click="applyNetworkConfig(props.network)"
    >
      Apply Network Settings
    </button>
    <small class="form-text text-muted">May affect connectivity</small>
  </div>
</template>

<script>
  export default {
    name: 'DhcpSettings',
    props: {
      network: {
        required: true,
        type: Object,
      },
      id: {
        required: true,
        type: String,
      },
      blankIp: {
        required: true,
        type: Object,
      }
    }, setup(props, { emit }) {
      function addIPAddress() {
        props.network.addresses.push({...props.blankIp});
      }

      function removeIPAddress(index) {
        props.network.addresses.splice(index, 1);
      }

      function addNameserver() {
        props.network.dns.push('');
      }

      function removeNameserver(index) {
        props.network.dns.splice(index, 1);
      }

      function applyNetworkConfig(net) {
        emit('apply-network-config', net);
      }

      return { props, addIPAddress, removeIPAddress, addNameserver, removeNameserver, applyNetworkConfig };
    },
    emits: ['apply-network-config']
  }
</script>

<style scoped>
  
</style>