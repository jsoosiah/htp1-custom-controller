<template>
  <div class="transition-container">
    <template v-if="isMobileMode">
      <h5>Dirac Room Correction Filters <br><small class="text-muted ">up to 6 sets or slots available</small></h5>
      <div class="mb-3">
        <dirac-button-group :home-button="false" />
      </div>
      <div class="custom-control custom-switch mb-3">
        <input 
          id="display-adv-input" 
          type="checkbox" 
          class="custom-control-input" 
          :checked="showChannelMuteControls" 
          @click="toggleShowChannelMuteControls()"
        >
        <label
          class="custom-control-label"
          for="display-adv-input"
        >
          Show Advanced Settings
        </label>
      </div>

      <div class="form-group">
        <label for="diracSlot">Dirac Slot</label>
        <select
          id="diracSlot"
          class="form-control"
          @change="({ type, target }) => { setDiracTab(target.value) }"
        >
          <option 
            v-for="(slot, key) in mso.cal?.slots"
            :key="key"
            :selected="mso.cal?.currentdiracslot === key"
            :value="key"
          >
            {{ slot.name }} {{ slot.hasBCFilter ? '*' : '' }}
          </option>
        </select>
      </div>

      <div
        v-for="channame in activeChannels" 
        :key="channame" 
        class="card"
        :class=" currentDiracSlot?.channels[channame].mute === true ? ['border-danger', 'text-danger'] :'' "
      >
        <h5 class="card-header">
          {{ spkName(channame) }}
        </h5>
        <div class="card-body">
          <div class="row">
            <div class="col small">
              Dirac Calibration Delay
            </div>
            <div class="col text-right">
              {{ formatDecimal(currentDiracSlot?.channels[channame].caldelay) }} ms
            </div>
          </div>
          <div class="row">
            <div class="col small">
              User Delay
            </div>
            <div class="col text-right">
              <div class="form-group">
                <div
                  class="input-group input-group-sm numeric-input"
                  style="float:right"
                >
                  <input 
                    type="number" 
                    class="form-control form-control-sm text-right" 
                    :value="currentDiracSlot?.channels[channame].delay" 
                    min="0" 
                    max="100" 
                    step=".1" 
                    @change="({ type, target }) => setUserDelay(channame, target.value)"
                  >
                  <div class="input-group-append">
                    <span
                      id="basic-addon2"
                      class="input-group-text"
                    >ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col small">
              Total Delay
            </div>
            <div class="col text-right">
              {{ formatDecimal((mso.cal?.diracactive=='off' ? 0 : currentDiracSlot?.channels[channame].caldelay) + currentDiracSlot?.channels[channame].delay) }} ms
            </div>
          </div>
          <div class="row">
            <div class="col small">
              Dirac Calibration Trim 
            </div>
            <div class="col text-right">
              {{ formatDecimal(currentDiracSlot?.channels[channame].caltrim) }} dB
            </div>
          </div>
          <div class="row">
            <div class="col small">
              User Trim
            </div>
            <div class="col">
              <div class="form-group">
                <div
                  class="input-group input-group-sm numeric-input"
                  style="float:right"
                >
                  <input 
                    type="number" 
                    class="form-control form-control-sm text-right" 
                    :value="currentDiracSlot?.channels[channame].mute === true ? currentDiracSlot?.channels[channame].preMuteTrim : currentDiracSlot?.channels[channame].trim" 
                    :disabled="currentDiracSlot?.channels[channame].mute === true" 
                    min="-12"
                    max="12" 
                    step=".5" 
                    @change="({ type, target }) => setUserTrim(channame, target.value)"
                  >
                  <div class="input-group-append">
                    <span
                      id="basic-addon2"
                      class="input-group-text"
                    >dB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col small">
              Total Trim
            </div>
            <div class="col text-right">
              {{ formatDecimal((mso.cal?.diracactive=='off' ? 0 : currentDiracSlot?.channels[channame].caltrim) + (currentDiracSlot?.channels[channame].mute === true ? currentDiracSlot?.channels[channame].preMuteTrim : currentDiracSlot?.channels[channame].trim)) }} dB
            </div>
          </div>
          <div
            v-if="showChannelMuteControls"
            class="row"
          >
            <div class="col">
              <two-state-button 
                :button-text="`Mute: ${currentDiracSlot?.channels[channame].mute ? 'on' : 'off'}`" 
                :state-on="currentDiracSlot?.channels[channame].mute === true" 
                :mute-button="true"
                @btn-click="toggleMuteChannel(channame)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <h5>Dirac Room Correction Filters <small class="text-muted">up to 6 sets or slots available</small></h5>
      <dismissable-alert alert-key="calibration-dlbc">
        <span class="italic" /> denotes Dirac Live Room Correction filters with Bass Control.
      </dismissable-alert>
      <dismissable-alert
        v-if="mso.cal?.speakerConfigMismatch"
        alert-key="calibration-filter-mismatch"
        class="alert-warning"
      >
        The selected Dirac calibration does not match the current speaker configuration. Uncalibrated channels are highlighted.
      </dismissable-alert>
      <div class="row justify-content-between mb-3">
        <div class="col-auto">
          <dirac-button-group :home-button="false" />
        </div>
        <div class="col-auto">
          <div class="custom-control custom-switch">
            <input 
              id="display-adv-input" 
              type="checkbox" 
              class="custom-control-input" 
              :checked="showChannelMuteControls" 
              @click="toggleShowChannelMuteControls()"
            >
            <label
              class="custom-control-label"
              for="display-adv-input"
            >
              Show Advanced Settings
            </label>
          </div>
        </div>
      </div>
      <nav class="navbar nav-fill nav-pills bg-light navbar-light">
        <a 
          v-for="(slot, key) in mso.cal?.slots" 
          :key="key" 
          class="nav-link" 
          :class="{'active': mso.cal?.currentdiracslot === key, 'italic': slot.hasBCFilter}" 
          href="javascript:void(0)"
          @click="setDiracTab(key)"
        >
          {{ slot.name }}
        </a>
      </nav>
      <table class="table table-sm table-responsive-md table-striped">
        <thead>
          <tr>
            <th>Channel</th>
            <th class="text-right">
              Dirac Calibration<br>Delay (ms)
            </th>
            <th class="text-right">
              User Delay (ms)
            </th>
            <th class="text-right">
              Total Delay (ms)
            </th>
            <th class="text-right">
              Dirac Calibration<br>Trim (dB)
            </th>
            <th class="text-right">
              User Trim (dB)
            </th>
            <th class="text-right">
              Total Trim (dB)
            </th>
            <th 
              v-if="showChannelMuteControls"
              class="text-right"
            >
              Mute Channel
            </th>
          </tr>
        </thead>
        <tbody :class="{'hiding':currentDiracTab === null, 'showing':currentDiracTab !== null}">
          <tr 
            v-for="channame in activeChannels" 
            :key="channame"
            :class="{
              'table-warning': diracMismatchedChannels.includes(channame),
              'table-danger': currentDiracSlot?.channels[channame].mute === true
            }"
          >
            <td>{{ spkName(channame) }}</td>
            <td
              class="text-right"
              :class="{'text-muted':mso.cal?.diracactive=='off'}"
              :title="currentDiracSlot?.channels[channame].caldelay"
            >
              {{ formatDecimal(currentDiracSlot?.channels[channame].caldelay) }}
            </td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="currentDiracSlot?.channels[channame].delay" 
                min="0" 
                max="100" 
                step=".1" 
                @change="({ type, target }) => setUserDelay(channame, target.value)"
              >
            </td>
            <td 
              class="text-right"
              :title="currentDiracSlot?.channels[channame].caldelay + currentDiracSlot?.channels[channame].delay"
            >
              {{ formatDecimal((mso.cal?.diracactive=='off' ? 0 : currentDiracSlot?.channels[channame].caldelay) + currentDiracSlot?.channels[channame].delay) }}
            </td>
            <td
              class="text-right"
              :class="{'text-muted':mso.cal?.diracactive=='off'}"
              :title="currentDiracSlot?.channels[channame].caltrim"
            >
              {{ formatDecimal(currentDiracSlot?.channels[channame].caltrim) }}
            </td>
            <td class="text-right">
              <input 
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="currentDiracSlot?.channels[channame].mute === true ? currentDiracSlot?.channels[channame].preMuteTrim : currentDiracSlot?.channels[channame].trim" 
                :disabled="currentDiracSlot?.channels[channame].mute === true" 
                min="-12"
                max="12" 
                step=".5" 
                @change="({ type, target }) => setUserTrim(channame, target.value)"
              >
            </td>
            <td
              class="text-right"
              :title="currentDiracSlot?.channels[channame].caltrim + currentDiracSlot?.channels[channame].trim"
            >
              {{ formatDecimal((mso.cal?.diracactive=='off' ? 0 : currentDiracSlot?.channels[channame].caltrim) + (currentDiracSlot?.channels[channame].mute === true ? currentDiracSlot?.channels[channame].preMuteTrim : currentDiracSlot?.channels[channame].trim)) }}
            </td>
            <td
              v-if="showChannelMuteControls"
              class="text-right"
            >
              <two-state-button 
                :button-text="`Mute: ${currentDiracSlot?.channels[channame].mute ? 'on' : 'off'}`" 
                :state-on="currentDiracSlot?.channels[channame].mute === true" 
                :mute-button="true"
                @btn-click="toggleMuteChannel(channame)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </template>
    <div
      v-if="showChannelMuteControls"
      class="row"
    >
      <div class="col-auto">
        <button 
          class="btn btn-sm btn-danger mb-3"
          @click="setMuteAllChannelsOn()"
        >
          Mute All Channels
        </button>
      </div>
      <div class="col-auto">
        <button 
          class="btn btn-sm btn-primary mb-3"
          @click="setMuteAllChannelsOff()"
        >
          Unmute All Channels
        </button>
      </div>
      <div class="col-auto">
        <button 
          class="btn btn-sm btn-info mb-3"
          @click="toggleAllMuteChannels()"
        >
          Invert Mute on All Channels
        </button>
      </div>
    </div>
  </div>
</template>

<script>

  import { ref } from 'vue';

  import useMso from '@/use/useMso.js';
  import useLocalStorage from '@/use/useLocalStorage.js';
  import useSpeakerGroups from '@/use/useSpeakerGroups.js';
  import useResponsive from '@/use/useResponsive.js';
  
  import DiracButtonGroup from './buttons/DiracButtonGroup.vue';
  import TwoStateButton from './buttons/TwoStateButton.vue';
  import DismissableAlert from './buttons/DismissableAlert.vue';

  export default {
    name: 'Calibration',
    components: {
      DiracButtonGroup,
      TwoStateButton,
      DismissableAlert
    },
    setup() {

      const { 
        mso, setDiracSlot, setUserTrim, setUserDelay, 
        setMinVolume, setMaxVolume, setMaxOutputLevel, setLipsyncDelay,
        currentDiracSlot, activeChannels, toggleMuteChannel,
        setMuteAllChannelsOff, setMuteAllChannelsOn, toggleAllMuteChannels,
        diracMismatchedChannels
      } = useMso();
      const { spkName } = useSpeakerGroups();
      const { showChannelMuteControls, toggleShowChannelMuteControls } = useLocalStorage();
      const { isMobileMode } = useResponsive();

      const currentDiracTab = ref(mso.value.cal?.currentdiracslot);

      // const activeChannels = computed(() => {
      //   return getActiveChannels(mso.value.speakers?.groups);
      // });

      function formatDecimal(num) {
        return num?.toFixed(1);
      }

      async function setDiracTab(tab) {
        currentDiracTab.value = null;
        
        setTimeout(() => {
          setDiracSlot(tab);
          currentDiracTab.value = tab;
        }, 100);
      }

      return {
        mso, setDiracSlot, setUserTrim, setUserDelay, 
        setMinVolume, setMaxVolume, setMaxOutputLevel, setLipsyncDelay, currentDiracSlot,
        activeChannels, spkName, formatDecimal, currentDiracTab, setDiracTab,
        showChannelMuteControls, toggleShowChannelMuteControls, toggleMuteChannel,
        setMuteAllChannelsOff, setMuteAllChannelsOn, toggleAllMuteChannels, isMobileMode,
        diracMismatchedChannels
      };
    }
  }
</script>

<style scoped>

  .italic {
    /* font-style: italic; */
  }

  .italic:after {
    content:" BASS";
    font-weight: bold;
    vertical-align: super;
    font-size:75%;
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

  .card {
    margin-bottom: 1rem;
  }

  .card-body .row .col .form-group {
    margin-bottom:0;
  }

  .card-body .row {
    min-height:2rem;
  }

</style>