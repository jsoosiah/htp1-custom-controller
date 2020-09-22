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
    <pre class="pre-scrollable bg-light p-2">{{mso}}</pre>
    <button 
      class="btn btn-sm btn-primary mb-3"
      @click="downloadMsoAsJson()"
    >
      Export Configuration
    </button>
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
  </div>
</template>

<script>

  import useMso from '@/use/useMso.js';

  import TwoStateButton from './TwoStateButton.vue';

  export default {
    name: 'System',
    setup() {

      const { 
        mso, setUnitName, setFrontPanelBrightness, toggleFastStart, toggleFastStartPassThrough, 
        setPowerOnVol, toggleVideoStatusHomePage, toggleExtendedAudioStatus, 
        toggleAdvancedInputSettings, toggleSupportTools 
      } = useMso();

      function downloadMsoAsJson(){
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mso.value));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', 'config.json');
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }

      return { mso, setUnitName, setFrontPanelBrightness, toggleFastStart, toggleFastStartPassThrough, 
        setPowerOnVol, toggleVideoStatusHomePage, toggleExtendedAudioStatus, toggleAdvancedInputSettings, 
        toggleSupportTools, downloadMsoAsJson 
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

</style>