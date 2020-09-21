<template>
  <h5>Output Settings</h5>

  <div class="container">
    <div class="row">
      <div class="col-md">
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
      <div class="col-md">
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
      <div class="col-md">
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
      <div class="col-md">
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
    
  </div>
  <h5>Dirac Room Correction Filters <small class="text-muted">up to 6 sets or slots available</small></h5>
  <div class="alert alert-info small" role="alert">
    * denotes Dirac Live Room Correction filters with Bass Control
  </div>
  <div class="mb-3">
    <dirac-button />
  </div>
  <nav class="navbar nav-fill nav-pills bg-light navbar-light">
    <a 
      class="nav-link" 
      :class="{'active': mso.cal?.currentdiracslot === key, 'italic': slot.hasBCFilter}" 
      @click="setDiracSlot(key)" 
      href="javascript:void(0)" 
      v-for="(slot, key) in mso.cal?.slots"
    >
      {{slot.name}}
    </a>
  </nav>
  <table class="table table-sm table-responsive-md table-striped">
    <thead>
      <tr>
        <th>Channel</th>
        <th class="text-right">Dirac Calibration Delay (ms)</th>
        <th class="text-right">User Delay (ms)</th>
        <th class="text-right">Total Delay (ms)</th>
        <th class="text-right">Dirac Calibration Trim (dB)</th>
        <th class="text-right">User Trim (dB)</th>
        <th class="text-right">Total Trim (dB)</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="channame in activeChannels">
        <td>{{spkName(channame)}}</td>
        <td class="text-right" :title="currentDiracSlot?.channels[channame].caldelay">
          {{formatDecimal(currentDiracSlot?.channels[channame].caldelay)}}
        </td>
        <td class="text-right">
          <input 
            type="number" 
            class="form-control form-control-sm text-right" 
            :value="currentDiracSlot?.channels[channame].delay" 
            @change="({ type, target }) => setUserDelay(channame, target.value)" 
            min="0" 
            max="100" 
            step=".1"
          />
        </td>
        <td 
          class="text-right" :title="currentDiracSlot?.channels[channame].caldelay + currentDiracSlot?.channels[channame].delay">
          {{formatDecimal(currentDiracSlot?.channels[channame].caldelay + currentDiracSlot?.channels[channame].delay)}}
        </td>
        <td class="text-right" :title="currentDiracSlot?.channels[channame].caltrim">
          {{formatDecimal(currentDiracSlot?.channels[channame].caltrim)}}
        </td>
        <td class="text-right">
          <input 
            type="number" 
            class="form-control form-control-sm text-right" 
            :value="currentDiracSlot?.channels[channame].trim" 
            @change="({ type, target }) => setUserTrim(channame, target.value)" 
            min="-12" 
            max="12" 
            step=".5"
          >
        </td>
        <td class="text-right" :title="currentDiracSlot?.channels[channame].caltrim + currentDiracSlot?.channels[channame].trim">
          {{formatDecimal(currentDiracSlot?.channels[channame].caltrim + currentDiracSlot?.channels[channame].trim)}}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>

  import { computed, watch } from 'vue';

  import useMso from '@/use/useMso.js';
  import useSpeakerGroups from '@/use/useSpeakerGroups.js';
  import DiracButton from './DiracButton.vue';

  export default {
    name: 'Calibration',
    setup() {

      const { mso } = useMso();
      const { getActiveChannels, spkName } = useSpeakerGroups();

      const activeChannels = computed(() => {
        return getActiveChannels(mso.value.speakers?.groups);
      });

      function formatDecimal(num) {
        return num?.toFixed(1);
      }

      return {...useMso(), activeChannels, spkName, formatDecimal};
    },
    components: {
      DiracButton,
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
    width: 4rem;
    float:right;
  }

  .table-sm td {
    padding:0 0.3rem;
  }

  .col-md {
    padding-left: 0;
  }
</style>