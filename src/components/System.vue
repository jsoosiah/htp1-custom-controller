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

        <pre class="pre-scrollable bg-light p-2" v-if="false">{{ msoImport }}</pre>

        <template v-if="msoImport">
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
                <tr v-for="patch in msoImportPatch">
                  <td>
                    {{patch.op}}
                  </td>
                  <td>
                    {{patch.path}}
                  </td>
                  <td>
                    {{patch.value}}
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
            <div class="alert alert-success small" role="alert">
              The selected configuration file matches the current configuration. No changes necessary. 
            </div>
          </template>
        </template>
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
          Display Extended Audio Status
        </label>
      </div>
      <div class="custom-control custom-switch">
        <input 
          type="checkbox" 
          class="custom-control-input" 
          id="display-adv-input" 
          :checked="mso.stat?.displayAdvancedSettings" 
          @click="toggleAdvancedInputSettings()"
        >
        <label class="custom-control-label" for="display-adv-input">
          Advanced Input Settings
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

    <h5>About this Custom Interface</h5>
    <p>See <a target="_blank" href="https://github.com/jsoosiah/htp1-custom-controller">https://github.com/jsoosiah/htp1-custom-controller</a>.</p>
  </div>
</template>

<script>

  import { ref, computed } from 'vue';
  import { compare } from 'fast-json-patch/index.mjs';

  import useMso from '@/use/useMso.js';

  import TwoStateButton from './TwoStateButton.vue';

  export default {
    name: 'System',
    setup() {

      const { 
        mso, setUnitName, setFrontPanelBrightness, toggleFastStart, toggleFastStartPassThrough, 
        setPowerOnVol, toggleVideoStatusHomePage, toggleExtendedAudioStatus, 
        toggleAdvancedInputSettings, toggleSupportTools, importMsoPatchList
      } = useMso();

      const msoImport = ref(null);
      // const msoImportPatch = ref([]);

      function downloadMsoAsJson(){
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mso.value));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', 'config.json');
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }

      function importMsoFileSelected(e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.readAsText(event.target.files[0]);
          reader.onload = e => {
            try {
              msoImport.value = JSON.parse(e.target.result);
              console.log('onload', mso.value, msoImport.value);
              // msoImportPatch.value = compare(mso.value, msoImport.value);
            } catch (e) {

            }
          }
        }
      }

      const msoImportPatch = computed(() => {
        return compare(mso.value, msoImport.value);
      })

      function importMso() {
        importMsoPatchList(msoImportPatch.value);
      }

      return { 
        mso, setUnitName, setFrontPanelBrightness, toggleFastStart, toggleFastStartPassThrough, 
        setPowerOnVol, toggleVideoStatusHomePage, toggleExtendedAudioStatus, toggleAdvancedInputSettings, 
        toggleSupportTools, importMsoPatchList, 
        downloadMsoAsJson, importMsoFileSelected, msoImport, msoImportPatch, importMso
      };
    },
    components: {
      TwoStateButton,
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