<template>
  <div class="transition-container">
    <h5>Record Macros</h5>
    <div class="row justify-content-between mb-3">
      <div class="col-auto">
        <div class="custom-control custom-switch">
          <input 
            id="display-adv-input" 
            type="checkbox" 
            class="custom-control-input" 
            :checked="showMacroCodeEditor" 
            @click="toggleShowMacroCodeEditor()"
          >
          <label
            class="custom-control-label"
            for="display-adv-input"
          >
            Show Macro Code Editor
          </label>
        </div>
      </div>
    </div>
    <h6>Remote Buttons</h6>
    <div
      id="accordionExample"
      class="accordion mb-3"
    >
      <template v-if="mso.svronly">
        <macro-editor 
          v-for="key in commandKeys" 
          :key="key"
          :command-key="key" 
        />
      </template>
    </div>
    <h6>Additional Macros</h6>
    <dismissable-alert
      alert-key="macros-extra"
    >
      Additional macros beyond the 8 standard slots may be added or removed. These extra macros can only be run from this web UI and are not accessible from the remote.
    </dismissable-alert>
    <div class="accordion mb-3">
      <macro-editor
        v-for="(value, key) in mso.svronly.extraMacros"
        :key="key"
        :command-key="key.toString()"
        :is-extra-command="true"
      />
    </div>
    <button 
      class="btn btn-sm btn-primary mb-3"
      @click="createExtraMacro"
    >
      Create New Macro
    </button>
  </div>
</template>

<script>

  import useMso from '@/use/useMso.js';
  import useLocalStorage from '@/use/useLocalStorage.js';

  import MacroEditor from './MacroEditor.vue';
  import DismissableAlert from './buttons/DismissableAlert.vue';

  export default {
    name: 'Macros',
    components: {
      MacroEditor,
      DismissableAlert,
    },
    setup() {

      return {
        ...useMso(), ...useLocalStorage()
      };
    }
  }
</script>

<style scoped>

  .italic {
    font-style: italic;
  }

  .italic:after {
    content:" *";
    font-weight: bold;
  }

  .navbar {
    padding: 0;
  }

  .nav-link {
    text-transform: uppercase;
    font-size: .8rem;
    font-weight: 600;
    padding:0.5rem 0.675rem;
    border-radius: 0;
  }

  th {
    font-size:80%;
  }

  .table .form-control {
    width: auto;
    max-width: 6rem;
    float:right;
  }

  .table-sm td {
    padding:0 0.3rem;
  }

  .col-lg {
    padding-left: 0;
  }

</style>