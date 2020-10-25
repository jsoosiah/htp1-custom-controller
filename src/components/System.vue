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

    <h5>Output Settings</h5>
      <div class="row mb-3">
        <div class="col-lg-auto">
          <div class="form-group">
            <label for="inputEmail3" class="col-form-label col-form-label-sm">Min. volume</label>
            <div class="input-group input-group-sm numeric-input">
              <input type="number" class="form-control" aria-label="Minimum volume" aria-describedby="basic-addon2" :value="mso.cal?.vpl" @change="({ type, target }) => setMinVolume(target.value)" min="-100" max ="-60">
              <div class="input-group-append">
                <span class="input-group-text" id="basic-addon2">dB</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-auto">
            <div class="form-group">
              <label for="inputEmail3" class="col-form-label col-form-label-sm">Max. volume</label>
              <div class="input-group input-group-sm numeric-input">
                <input type="number" class="form-control" aria-label="Minimum volume" aria-describedby="basic-addon2" :value="mso.cal?.vph" @change="({ type, target }) => setMaxVolume(target.value)" min="-59" max ="22">
                <div class="input-group-append">
                  <span class="input-group-text" id="basic-addon2">dB</span>
                </div>
              </div>
            </div>
        </div>
        <div class="col-lg-auto">
            <div class="form-group">
              <label for="inputEmail3" class="col-form-label col-form-label-sm">Max. output level</label>
              <div class="input-group input-group-sm numeric-input">
                <input type="number" class="form-control" aria-label="Minimum volume" aria-describedby="basic-addon2" :value="mso.cal?.ampsense" @change="({ type, target }) => setMaxOutputLevel(target.value)" min="0.1" max="4" step="0.1">
                <div class="input-group-append">
                  <span class="input-group-text" id="basic-addon2">Vrms</span>
                </div>
              </div>
            </div>
        </div>
        <div class="col-lg-auto">
            <div class="form-group">
              <label for="inputPassword3" class="col-form-label col-form-label-sm">Lipsync delay</label>
                <div class="input-group input-group-sm numeric-input">
                  <input type="number" class="form-control" aria-label="Minimum volume" aria-describedby="basic-addon2" :value="mso.cal?.lipsync" @change="({ type, target }) => setLipsyncDelay(target.value)" min="0" max="200">
                  <div class="input-group-append">
                    <span class="input-group-text" id="basic-addon2">ms</span>
                  </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
      <div class="col-md-auto">
        <div class="form-group">
          <two-state-button 
            :button-text="`Reinforce Bass: ${mso.bassenhance}`" 
            :state-on="mso.bassenhance === 'on'" 
            :home-button="false"
            @click="toggleReinforceBass()"
          />
          <small class="form-text text-muted">Adds subwoofer signal to large speakers{{!showCrossoverControls ? ' - unavailable with Dirac Bass Control' : ''}}</small>
        </div>
      </div>
    </div>

    <h5>Power</h5>
    <div class="row">
      <div class="col-md-auto mb-3">

      
        <two-state-button 
          :button-text="`Fast Start: ${mso.fastStart}`"
          :state-on="mso.fastStart === 'on'"
          @click="toggleFastStart()"
        />
      </div>
      <div class="col-md-auto mb-3">
        <two-state-button 
          :button-text="`Video Pass Through: ${mso.fastStartPassThrough}`"
          :state-on="mso.fastStartPassThrough === 'on'"
          @click="toggleFastStartPassThrough()"
        />
      </div>
    </div>


    <div class="row">
      <div class="col-md-auto">
        <div class="form-group">
          <label for="power-on-volume" class="col-form-label col-form-label-sm ">Power On Volume</label>
          <div class="input-group input-group-sm numeric-input">
            <input type="number" class="form-control" aria-label="Power On Volume" aria-describedby="basic-addon2" :value="mso.powerOnVol" @change="({ type, target }) => setPowerOnVol(target.value)" min="-100" max="0">
            <div class="input-group-append">
              <span class="input-group-text" id="basic-addon2">dB</span>
            </div>
          </div>
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

      const { mso } = useMso();

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
        ...useMso(),
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