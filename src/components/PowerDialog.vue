<template>

  <div 
    class="modal fade show" 
    id="power-dialog" 
    tabindex="-1" 
    aria-labelledby="settingsModalLabel"
  >
    <div class="modal-dialog modal-sm">
      <div class="modal-content bg-dark">
        <div class="modal-header text-white">
          <h4 class="modal-title">
            Power Options
          </h4>
        </div>
        <div class="modal-body text-left text-white">

          <div class="form-group" v-if="!props.personalize || mso.personalize?.powerDialogButtons.shutdown">
            <button 
              class="btn btn-sm btn-danger"
              @click="handleShutdown"
            >
              Shutdown
            </button>
            <small class="form-text text-muted">Orderly shutdown the system and enter low power state</small>
          </div>

          <div class="form-group" v-if="!props.personalize || mso.personalize?.powerDialogButtons.sleep">
            <button 
              class="btn btn-sm btn-info"
              @click="handleSleep"
            >
              Sleep
            </button>
            <small class="form-text text-muted">Turn off front panel and sleep awaiting fast wake up</small>
          </div>

          <div class="form-group" v-if="!props.personalize || mso.personalize?.powerDialogButtons.restart">
            <button 
              class="btn btn-sm btn-warning"
              @click="handleRestart"
            >
              Restart
            </button>
            <small class="form-text text-muted">Orderly shutdown and then restart the system</small>
          </div>

          <div class="form-group" v-if="!props.personalize || mso.personalize?.powerDialogButtons.cancel">
            <button 
              class="btn btn-sm btn-secondary"
              @click="handleCancel"
            >
              Cancel
            </button>
            <small class="form-text text-muted">Do nothing</small>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import { ref } from 'vue';

  import useMso from '@/use/useMso.js';

  export default {
    name: 'PowerDialog',
    props: {
      personalize: {
        type: Boolean,
        default: false,
      }
    },
    setup(props, { emit }) {

      const { mso, powerOff, powerSleep, powerRestart } = useMso();

      function handleShutdown() {
        handleCancel();
        powerOff();
      }

      function handleSleep() {
        handleCancel();
        powerSleep();
      }

      function handleRestart() {
        handleCancel();
        powerRestart();
      }

      function handleCancel() {
        emit('cancel');
      }

      return { mso, handleShutdown, handleSleep, handleRestart, handleCancel, props };
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

  .btn {
    text-transform: uppercase;
    font-weight: 600;
    min-width: 7.5rem;
  }

  #power-dialog {
    /* width: 200px; */
  }
</style>