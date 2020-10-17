<template>

  <div 
    class="modal fade show" 
    id="settingsModal" 
    tabindex="-1" 
    aria-labelledby="settingsModalLabel"
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">
            <template v-if="websocketIp">
              Please Wait
            </template>
            <template v-else>
              Welcome
            </template>
          </h4>
        </div>
        <div class="modal-body text-left">
          <template v-if="websocketIp">
            <p>
              Connection to {{ websocketIp }} was lost. Reconnect will be attempted automatically.
              <span class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
              </span>
            </p>
            <p>
              Or, please update the IP address below if it has changed.
            </p>
          </template>
          <template v-else>
            <p>
             Now scanning the network for your HTP-1...
              <span class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
              </span>
            </p>
            <p>Or, please enter the local IP address for your HTP-1 below.</p>
          </template>

          <div class="form-group">
            <label for="select-ip">IP address</label>
            <input 
              type="text" 
              class="form-control form-control-sm" 
              id="select-ip" 
              aria-describedby="ip-help"
              placeholder="e.g., 192.168.1.13" 
              v-model="ipAddressText"
            >
            <small id="ip-help" class="form-text text-muted">Your entry will be remembered on this device.</small>
          </div>
          <div class="row justify-content-end">
            <div class="col-auto">
              <button 
                class="btn btn-sm btn-primary"
                @click="validateAndSetWebsocketurl(ipAddressText)"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import { ref } from 'vue';

  import useWebSocket from '@/use/useWebSocket.js';

  export default {
    name: 'IPSelect',
    setup() {

      const { websocketIp, websocketurl, setWebsocketIp } = useWebSocket();

      const ipAddressText = ref('');

      function validateAndSetWebsocketurl(url) {
        // todo: if valid 
        setWebsocketIp(url);
      }

      return { ipAddressText, websocketIp, websocketurl, validateAndSetWebsocketurl };
    }
  }
</script>

<style scoped>
  div {
    color: #212529;
  }

  .modal {
    display: block;
  }
</style>