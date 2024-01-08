<template>
  <div 
    id="settingsModal" 
    class="modal fade show" 
    tabindex="-1" 
    aria-labelledby="settingsModalLabel"
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content bg-dark">
        <div class="modal-header text-white">
          <h4 class="modal-title">
            Bluetooth Pairing Request
          </h4>
        </div>
        <div class="modal-body text-left text-white">
          <p>Pairing request from device: {{ btRequestDetails?.name }}</p>
          <p>Confirm the following PIN code matches on that device:</p>
          <p class="h1">{{ btRequestDetails?.passkey }}</p>
          <div class="row justify-content-end">
            <div class="col-auto">
              <button 
                class="btn btn-sm btn-danger"
                @click="rejectPair()"
              >
                Reject
              </button>
            </div>
            <div class="col-auto">
              <button 
                class="btn btn-sm btn-primary"
                @click="acceptPair()"
              >
                Pair
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import { ref, watch, computed, onMounted } from 'vue';

  import useBluetoothManager from '@/use/useBluetoothManager.js';

  export default {
    name: 'BluetoothPairingRequest',
    setup(props) {

      return { ...useBluetoothManager() };
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

  .modal-header {
    border-bottom:1px solid #212529;
  }

  .text-white {
    color:#dedad6 !important;
    /* background-color: #212529; */
  }

  input#select-ip.form-control.bg-dark {
    background-color: #212529 !important;
    border-color:rgba(255,255,255,.25);
  }

  small {
    color: rgba(255,255,255,.5) !important;
  }

  a {
    font-weight: bold;
    color: rgba(255,255,255,.75);
  }
</style>