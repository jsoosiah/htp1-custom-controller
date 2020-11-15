<template>
  <div
    class="dropdown-menu dropdown-menu-right bg-dark text-white show"
    aria-labelledby="navbarDropdown"
  >
    <a
      class="dropdown-item"
      @click="handleShutdown"
    >
      Shutdown
      <small class="form-text text-muted">Orderly shutdown the system and enter low power state</small>
    </a>
    <a
      class="dropdown-item"
      href="#"
    >Sleep</a>
    <a
      class="dropdown-item"
      href="#"
    >Something else here</a>
  </div>
</template>

<script>

  import { ref } from 'vue';

  import useMso from '@/use/useMso.js';

  export default {
    name: 'PowerDropdown',
    setup(props, { emit }) {

      const { powerOff, powerSleep, powerRestart } = useMso();

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

      return { handleShutdown, handleSleep, handleRestart, handleCancel };
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

  .dropdown-menu {
    /* width: 200px; */
  }
</style>