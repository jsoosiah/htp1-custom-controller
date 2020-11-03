<template>
  <div class="transition-container">
    <h5>Import/Export Configuration</h5>
    <h6>Export</h6>
    <div class="row">
      <div class="col-auto">
        <label>Export Preview</label>
        <pre class="pre-scrollable bg-light p-2">{{mso}}</pre>
        <button 
          class="btn btn-sm btn-primary mb-3"
          @click="downloadMsoAsJson()"
        >
          Export Current Configuration to File
        </button>
        <h6>Import</h6>
        <form>
          <div class="form-group">
            <label for="import=file">Select Import Configuration File</label>
            <input 
              type="file" 
              class="form-control-file" 
              id="import=file" 
              @change="importMsoFileSelected"
            />
          </div>
        </form>
        
        <pre class="pre-scrollable bg-light p-2" v-if="false">{{ importJson }}</pre>
        
        <mso-importer 
          v-if="importJson" 
          @confirm-import="importMso"
          :mso-import-patch="msoImportPatch"
        />
      </div>
    </div>
    <template v-if="false">
      <h5>Support</h5>
      <div class="custom-control custom-switch">
        <input 
          type="checkbox" 
          class="custom-control-input" 
          id="enable-support-tools" 
          :checked="mso.stat?.enableSupportTools" 
          @click="toggleSupportTools()"
        >
        <label class="custom-control-label" for="enable-support-tools">
          Enable Support Tools
        </label>
      </div>
    </template>

    <template v-if="debug">
      <h5>Debug Settings</h5>
      <div class="form-group">
        <label for="inputPassword3" class="col-form-label col-form-label-sm">Max wait time to send MSO commands</label>
          <div class="input-group input-group-sm numeric-input">
            <input 
              type="number" 
              class="form-control" 
              aria-label="Minimum volume" 
              aria-describedby="basic-addon2" 
              :value="maxWaitTimeToSendToMso" 
              @change="({ type, target }) => setMaxWaitTimeToSendToMso(target.value)" 
              min="0" 
              disabled
            />
            <div class="input-group-append">
              <span class="input-group-text" id="basic-addon2">ms</span>
            </div>
          </div>
      </div>
    </template>
  </div>
</template>

<script>

  import { ref, computed } from 'vue';
  import { compare } from 'fast-json-patch/index.mjs';

  import useLocalStorage from '@/use/useLocalStorage.js';
  import useImportExport from '@/use/useImportExport.js';
  import useMso from '@/use/useMso.js';

  import TwoStateButton from './buttons/TwoStateButton.vue';
  import MultiStateButtonGroup from './buttons/MultiStateButtonGroup.vue';
  import MsoImporter from './MsoImporter.vue';

  export default {
    name: 'Configs',
    setup() {

      const { importJson,
              exportJsonToFile,
              importJsonFileToSelected,
              filterCommands } = useImportExport();

      const { maxWaitTimeToSendToMso, setMaxWaitTimeToSendToMso } = useLocalStorage();

      const { 
        mso, setUnitName, setFrontPanelBrightness, toggleFastStart, toggleFastStartPassThrough, 
        setPowerOnVol, toggleVideoStatusHomePage, toggleExtendedAudioStatus, 
        toggleAdvancedInputSettings, toggleSupportTools, importMsoPatchList,
        setFastStartOn, setFastStartOff, setFastStartPassThroughOn, setFastStartPassThroughOff
      } = useMso();

      function downloadMsoAsJson(){
        exportJsonToFile(mso.value, 'config');
      }

      function importMsoFileSelected(e) {
        const file = e.target.files[0];
        importJsonFileToSelected(file);
      }

      const msoImportPatch = computed(() => {
        return filterCommands(compare(mso.value, importJson.value));
      });

      function importMso() {
        importMsoPatchList(msoImportPatch.value);
      }

      return { 
        mso, setUnitName, setFrontPanelBrightness, toggleFastStart, toggleFastStartPassThrough, 
        setPowerOnVol, toggleVideoStatusHomePage, toggleExtendedAudioStatus, toggleAdvancedInputSettings, 
        toggleSupportTools, importMsoPatchList, maxWaitTimeToSendToMso, setMaxWaitTimeToSendToMso,
        setFastStartOn, setFastStartOff, setFastStartPassThroughOn, setFastStartPassThroughOff,
        downloadMsoAsJson, importMsoFileSelected, importJson, msoImportPatch, importMso
      };
    },
    components: {
      MultiStateButtonGroup,
      TwoStateButton,
      MsoImporter
    },
    computed: {
      debug: () => window.location.href.includes('debug')
    }
  }
</script>

<style scoped>
  .form-control {
    text-align: left;
  }

  .pre-scrollable {
  }

  .import-patch {
    max-height: 340px;
    overflow: auto;
  }

</style>