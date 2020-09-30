<template>
  <div class="transition-container">
    <h5>Record Macros</h5>
    <div class="accordion" id="accordionExample">
      <macro-editor 
        :commandKey="key" 
        :key="key"
        v-for="key in commandKeys" 
      />
    </div>
  </div>
</template>

<script>

  import MacroEditor from './MacroEditor.vue';

  export default {
    name: 'Macros',
    setup(props, { emit }) {
      const commandKeys = [
        'cmda',
        'cmdb',
        'cmdc',
        'cmdd',
        'preset1',
        'preset2',
        'preset3',
        'preset4'
      ];

      return {
        commandKeys
      };
    },
    components: {
      MacroEditor,
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