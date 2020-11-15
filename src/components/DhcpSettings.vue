<template>
  <div class="custom-control custom-switch mb-3">
    <input 
      :id="`${id}-use-dhcp`" 
      v-model="props.network.dhcp" 
      type="checkbox" 
      class="custom-control-input" 
    >
    <label
      class="custom-control-label"
      :for="`${id}-use-dhcp`"
    >
      Use DHCP
    </label>
  </div>
  <table
    v-if="!props.network.dhcp"
    class="table table-sm table-responsive table-striped"
  >
    <tbody>
      <tr
        v-for="(addr, index) in props.network.addresses"
        :key="index"
      >
        <td>
          <div class="form-group">
            <label
              class="small"
              :for="`${props.id}-ip-addr-${index}`"
            >IP Address</label>
            <div class="input-group input-group-sm">
              <input 
                :id="`${props.id}-ip-addr-${index}`" 
                v-model="addr.address" 
                type="text" 
                class="form-control" 
                aria-label="IP Address"
                aria-describedby="ip"
              >
              <div class="input-group-append">
                <span
                  id="ip"
                  class="input-group-text"
                >/24</span>
              </div>
            </div>
          </div>
        </td>
        <td>
          <div class="form-group">
            <label
              class="small"
              :for="`${props.id}-netmask-${index}`"
            >Network Mask</label>
            <input 
              :id="`${props.id}-netmask-${index}`" 
              v-model="addr.netmask" 
              type="text"
              class="form-control form-control-sm"
            >
          </div>
        </td>
        <td>
          <div
            v-if="props.network.addresses.length > 1"
            class="form-group"
          >
            <label
              class="small"
              :for="`${props.id}-ip-addr`"
            >&nbsp;</label>
            <button 
              class="form-control form-control-sm btn btn-sm btn-danger"
              @click="removeIPAddress(index)"
            >
              <font-awesome-icon
                size="lg"
                :icon="['fas', 'times']"
              />
            </button>
          </div>
        </td>
        <td>
          <div
            v-if="index === props.network.addresses?.length - 1"
            class="form-group"
          >
            <label class="small">&nbsp;</label>
            <button 
              class="form-control form-control-sm btn btn-sm btn-primary"
              @click="addIPAddress()"
            >
              <font-awesome-icon
                size="lg"
                :icon="['fas', 'plus']"
              />
            </button>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div class="form-group">
            <label
              class="small"
              :for="`${props.id}-gateway`"
            >Default Gateway</label>
            <input 
              :id="`${props.id}-gateway`" 
              v-model="props.network.gateway" 
              type="text"
              class="form-control form-control-sm"
            >
          </div>
        </td>
        <td />
        <td />
        <td />
      </tr>
      <tr
        v-for="(dns, index) in props.network.dns"
        :key="index"
      >
        <td>
          <div class="form-group">
            <label
              class="small"
              :for="`${props.id}-dns-${index}`"
            >DNS Server {{ index + 1 }}</label>
            <input 
              :id="`${props.id}-dns-${index}`" 
              v-model="props.network.dns[index]" 
              type="text"
              class="form-control form-control-sm"
            >
          </div>
        </td>
        <td />
        <td>
          <div
            v-if="props.network.dns?.length > 1"
            class="form-group"
          >
            <label class="small">&nbsp;</label>
            <button 
              class="form-control form-control-sm btn btn-sm btn-danger"
              @click="removeNameserver(index)"
            >
              <font-awesome-icon
                size="lg"
                :icon="['fas', 'times']"
              />
            </button>
          </div>
        </td>
        <td>
          <div
            v-if="index === props.network.dns?.length - 1"
            class="form-group"
          >
            <label class="small">&nbsp;</label>
            <button 
              class="form-control form-control-sm btn btn-sm btn-primary"
              @click="addNameserver()"
            >
              <font-awesome-icon
                size="lg"
                :icon="['fas', 'plus']"
              />
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <div class="form-group">
    <button 
      class="btn btn-sm btn-primary"
      @click="applyNetworkConfig"
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
    },
    emits: [
      'add-ip-address',
      'remove-ip-address',
      'add-nameserver',
      'remove-nameserver',
      'apply-network-config'
    ], 
    setup(props, { emit }) {
      function addIPAddress() {
        emit('add-ip-address', props.network);
      }

      function removeIPAddress(index) {
        emit('remove-ip-address', props.network, index);
      }

      function addNameserver() {
        emit('add-nameserver', props.network);
      }

      function removeNameserver(index) {
        emit('remove-nameserver', props.network, index);
      }

      function applyNetworkConfig() {
        emit('apply-network-config', props.network);
      }

      return { props, addIPAddress, removeIPAddress, addNameserver, removeNameserver, applyNetworkConfig };
    }
  }
</script>

<style scoped>
  
</style>