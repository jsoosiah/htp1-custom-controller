<template>
  <p>The following changes will be imported into the current configuration:</p>
  <template v-if="msoImportPatch.length > 0">
    <table class="table table-sm table-striped table-responsive">
      <thead>
        <tr>
          <th>op</th>
          <th>path</th>
          <th>value</th>
        </tr>
      </thead>
      <tbody class="import-patch">
        <tr
          v-for="patch in msoImportPatch"
          :key="patch"
        >
          <td>
            <code>{{ patch.op }}</code>
          </td>
          <td>
            <code>{{ patch.path }}</code>
          </td>
          <td>
            <code>{{ patch.value }}</code>
          </td>
        </tr>
      </tbody>
    </table>
    <button 
      class="btn btn-sm btn-primary mb-3"
      @click="importMso()"
    >
      Confirm Import Configuration
    </button>
  </template>
  <template v-else>
    <div
      class="alert alert-success small"
      role="alert"
    >
      The selected configuration file matches the current configuration. No changes necessary. 
    </div>
  </template>
</template>

<script>
  export default {
    name: 'MsoImporter',
    props: {
      msoImportPatch: {
        required: true,
        type: Object,
      }
    },
    emits: ['confirm-import'],
    setup(props, { emit }) {
      function importMso() {
        emit('confirm-import');
      }

      return { importMso };
    }
  }
</script>

<style scoped>
  code {
    color: inherit;
  }
</style>