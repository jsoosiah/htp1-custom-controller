<template>
  <div class="transition-container">
    <h5>System</h5>
    <div class="row">
      <div class="col-auto">
        <div class="form-group">
          <label for="unit-name" class="col-form-label col-form-label-sm ">Unit Name</label>
          <input disabled id="unit-name" type="text" class="form-control form-control-sm" aria-label="Unit Name" :value="mso.unitname" @change="({ type, target }) => setUnitName(target.value)" />
        </div>
      </div>
    </div>

    <h5>Power</h5>
    <two-state-button 
      :button-text="`Fast Start: ${mso.fastStart}`"
      :state-on="mso.fastStart === 'on'"
      @click="toggleFastStart()"
    />
    &nbsp;
    <two-state-button 
      :button-text="`Video Pass Through: ${mso.fastStartPassThrough}`"
      :state-on="mso.fastStartPassThrough === 'on'"
      @click="toggleFastStartPassThrough()"
    />

    <div class="form-group">
      <label for="power-on-volume" class="col-form-label col-form-label-sm ">Power On Volume</label>
      <div class="input-group input-group-sm numeric-input">
        <input type="number" class="form-control" aria-label="Power On Volume" aria-describedby="basic-addon2" :value="mso.powerOnVol" @change="({ type, target }) => setPowerOnVol(target.value)" min="-100" max="0">
        <div class="input-group-append">
          <span class="input-group-text" id="basic-addon2">dB</span>
        </div>
      </div>
    </div>

    <h5>Display</h5>
    <div class="row">
      <div class="col-auto">
        <div class="form-group">
          <label class="col-form-label col-form-label-sm" for="auro-strength">Front Panel Brightness</label>
          <div class="form-row">
            <input 
              type="range" 
              class="custom-range col" 
              id="auro-strength" 
              min="0" 
              max="10"
              :value="mso.hw?.fpBright"
              @input="({ type, target }) => setFrontPanelBrightness(target.value)"
            >
            <span class="col-auto auro-str-label">{{mso.hw?.fpBright}}</span>
          </div>
        </div>
      </div>
    </div>

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
    <h5>Advanced</h5>
    <div class="mb-3">
      <div class="custom-control custom-switch">
        <input 
          type="checkbox" 
          class="custom-control-input" 
          id="display-video" 
          :checked="mso.stat?.displayVideoStat" 
          @click="toggleVideoStatusHomePage()"
        >
        <label class="custom-control-label" for="display-video">
          Display Video Status on Home Page
        </label>
      </div>
      <div class="custom-control custom-switch">
        <input 
          type="checkbox" 
          class="custom-control-input" 
          id="display-audio" 
          :checked="mso.stat?.displayAudioStat" 
          @click="toggleExtendedAudioStatus()"
        >
        <label class="custom-control-label" for="display-audio">
          Display Extended Audio Status on Home Page
        </label>
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
    name: 'System',
    setup() {

      const { importJson,
              exportJsonToFile,
              importJsonFileToSelected } = useImportExport();

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
        return compare(mso.value, importJson.value);
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