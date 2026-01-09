<template>
  <div class="transition-container">
    <h5>System</h5>
    <div class="row">
      <div class="col-auto">
        <div class="form-group">
          <label
            for="unit-name"
            class="col-form-label col-form-label-sm "
          >Unit Name</label>
          <input
            id="unit-name"
            type="text"
            class="form-control form-control-sm"
            aria-label="Unit Name"
            :value="mso.unitname"
            @change="({ type, target }) => setUnitName(target.value)"
          >
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-auto">
        <div class="">
          <label
            for="select-ip"
            class="col-form-label col-form-label-sm"
          >Web UI IP address</label>
          <input 
            id="select-ip" 
            v-model="ipAddressText" 
            type="text" 
            class="form-control form-control-sm"
            aria-describedby="ip-help" 
            placeholder="e.g., 192.168.1.13"
          >
        </div>
      </div>
      <div class="col-auto">
        <div class="">
          <label class="col-form-label col-form-label-sm">&nbsp;</label>
          <button 
            class="btn btn-sm btn-primary"
            @click="validateAndSetWebsocketurl(ipAddressText)"
          >
            Save
          </button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-auto">
        <div class="form-group">
          <small class="form-text text-muted">The HTP-1 IP address that this web UI should connect to. Your entry will be remembered on this device.</small>
        </div>
      </div>
    </div>

    <h5>Demo Mode</h5>
    <div class="row">
      <div class="col-md-auto mb-3">
        <two-state-button 
          :button-text="`Demo Mode: ${isDemoMode? 'On' : 'Off'}`"
          :state-on="isDemoMode"
          @click="toggleDemoMode()"
        />
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

    <h5>Display</h5>
    <div class="row">
      <div class="col-auto">
        <div class="form-group">
          <label
            class="col-form-label col-form-label-sm"
            for="auro-strength"
          >Front Panel Brightness</label>
          <div class="form-row">
            <input 
              id="auro-strength" 
              type="range" 
              class="custom-range col" 
              min="0" 
              max="7"
              :value="mso.hw?.fpBright"
              @input="({ type, target }) => setFrontPanelBrightness(target.value)"
            >
            <span class="col-auto auro-str-label">{{ mso.hw?.fpBright }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import { ref, computed } from 'vue';
  import { compare } from 'fast-json-patch/index.mjs';

  import useImportExport from '@/use/useImportExport.js';
  import useWebSocket from '@/use/useWebSocket.js';
  import useMso from '@/use/useMso.js';
  import useLocalStorage from '@/use/useLocalStorage.js';

  import TwoStateButton from './buttons/TwoStateButton.vue';

  export default {
    name: 'System',
    components: {
      TwoStateButton,
    },
    setup() {

      const { importJson,
              exportJsonToFile,
              importJsonFileToSelected } = useImportExport();

      const { mso } = useMso();

      const { websocketIp, setWebsocketIp, findServers } = useWebSocket();

      const { isDemoMode } = useLocalStorage();

      const ipAddressText = ref(websocketIp.value);

      function validateAndSetWebsocketurl(url) {
        // todo: if valid 
        setWebsocketIp(url);
      }

      function downloadMsoAsJson(){
        exportJsonToFile(mso.value, 'config');
      }

      function importMsoFileSelected(e) {
        const file = e.target.files[0];
        importJsonFileToSelected(file);
      }

      function toggleDemoMode() {
        if (isDemoMode.value === true) {
          // turn off demo mode
          setWebsocketIp('');
          findServers(80, '192.168.1.', 2, 255, 20, 4000);
        } else {
          setWebsocketIp('htp1.jsoosiah.com');
        }
      }

      const msoImportPatch = computed(() => {
        return compare(mso.value, importJson.value);
      });

      return { 
        ...useMso(),
        downloadMsoAsJson, importMsoFileSelected, importJson, msoImportPatch,
        validateAndSetWebsocketurl, ipAddressText, setWebsocketIp, 
        isDemoMode, toggleDemoMode,
      };
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

  .import-patch {
    max-height: 340px;
    overflow: auto;
  }

  .btn {
    display: block;
  }

</style>