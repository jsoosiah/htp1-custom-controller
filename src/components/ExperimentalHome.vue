<template>
  <div>
      <div class="container">
        <!-- Input Label, Menu Buttons -->
        <div class="row justify-content-between">
          <div class="col-auto">
            <router-link class="settings-link current-input-label" :to="`${$route.path}/settings/inputs`">
              {{mso.inputs && mso.inputs[mso.input].label}}
            </router-link>
          </div>
          <div class="col-auto text-right" v-if="mso.stat?.displayVideoStat">
            <h6>{{mso.videostat.VideoResolution}}<br/>
              <small>
                {{mso.videostat.VideoColorSpace}}
                {{mso.videostat.VideoMode}}
                {{mso.videostat.HDRstatus}}
                {{mso.videostat.VideoBitDepth}} 
                {{mso.videostat.Video3D}}
              </small>
            </h6>
          </div>
        </div>
        <!-- Program Format, Blank, Listening Format   -->
        <div class="row mt-2">
          <div class="col text-left">
            <h5>Program Format: {{mso.status?.DECProgramFormat}} <small v-if="mso.stat?.displayAudioStat">{{mso.status?.DECSampleRate}}</small></h5>
            <div>
              {{mso.status?.DECSourceProgram}}
            </div>
          </div>
          <div class="col text-right">
            <h5>Listening Format: {{mso.status?.ENCListeningFormat}} <small v-if="mso.stat?.displayAudioStat">{{mso.status?.ENCSampleRate}}</small></h5>
            <div>
                {{mso.status?.SurroundMode}}
            </div>
          </div>
        </div>
        <!-- Program Format Logo, Volumn Text, Listening Format Logo -->
        <div class="row mt-2">
          <div class="col text-left">
            <img v-if="streamTypeIcon(mso.status)" class="fillheight" :src="require(`@/assets/${streamTypeIcon(mso.status)}`)+'#svgView(preserveAspectRatio(xMinYMin))'">
          </div>
          <div class="col-auto text-center">
            <span 
              class="vol-display" 
              :class="{'text-danger':mso.muted}" 
              v-press="handleMute"
            >
              {{mso.volume}} dB
            </span>
          </div>
          <div class="col text-right">
            <img v-if="upmixerIcon(mso.status)" class="fillheight float-right" :src="require(`@/assets/${upmixerIcon(mso.status)}`)+'#svgView(preserveAspectRatio(xMaxYMax))'">
          </div>
        </div>
        <!-- Volume Buttons -->
        <div class="row mt-2">
          <div class="col-md-12 text-center">
            <button 
              type="button" 
              class="btn btn-dark vol-btn" 
              v-press="handleVolumeDownPress"
              v-long-press="handleVolumeDownLongPress"
              v-long-press-up="handleVolumeLongPressUp"
            >
              <font-awesome-icon  :class="{'text-danger':mso.muted}" size="4x" :icon="['fas', 'volume-down']" />
            </button>
            <button 
              type="button" 
              class="btn btn-dark vol-btn" 
              v-press="handleVolumeUpPress"
              v-long-press="handleVolumeUpLongPress"
              v-long-press-up="handleVolumeLongPressUp"
            >
              <font-awesome-icon  :class="{'text-danger':mso.muted}" size="4x" :icon="['fas', 'volume-up']" />
            </button>
          </div>
        </div>
        <!-- Input Select -->
        <div class="row mt-2">
          <div class="col-md-12 text-center">
              <h5><router-link  class="settings-link" :to="`${$route.path}/settings/inputs`">Input Select</router-link></h5>
              <div class="inputs-container my-3">
                <two-state-button 
                  v-for="(inp, key) in visibleInputs"
                  :key="key"
                  :button-text="inp.label"
                  :state-on="inputLoaded(key)"
                  :state-loading="inputSelectedAndLoading(key)"
                  :home-button="true"
                  @btn-click="handleInputClicked(key)"
                  :show-state-indicators="true"
                  :single-indicator="true"
                  :recently-interacted="inputRecentlyInteracted"
                />
              </div>
          </div>
        </div>
        <!-- Upmix Select -->
        <div class="row mt-2" v-if="mso.stat.systemAudio">
          <div class="col-md-12 text-center">
              <h5><router-link class="settings-link" :to="`${$route.path}/settings/sound-enhancement`">Upmix Select</router-link></h5>
              <div class="upmix-container my-3">
                <two-state-button 
                  v-for="(upmix, key) in visibleUpmixers"
                  :key="key"
                  :button-text="upmix.label"
                  :state-on="key === mso.upmix.select"
                  :home-button="true"
                  @btn-click="handleUpmixClicked(key)" 
                  :show-state-indicators="true"
                  :single-indicator="true"
                  :recently-interacted="upmixRecentlyInteracted"
                />
              </div>
          </div>
        </div>
        <!-- Modes -->
        <div class="row mt-2" v-if="mso.personalize?.modes && Object.keys(mso.personalize.modes).length > 0">
          <div class="col-md-12 text-center">
              <h5>Modes</h5>
              <!-- Dirac -->
              <dirac-button 
                v-if="mso.personalize?.modes.dirac"
                :home-button="true"
              />
              <!-- PEQ -->
              <two-state-button 
                v-if="mso.personalize?.modes.peq"
                :button-text="`PEQ ${mso.peq?.peqsw ? 'on' : 'off'}`"
                :state-on="mso.peq?.peqsw"
                :home-button="true"
                @btn-click="toggleGlobalPEQ()"
                :show-state-indicators="true"
              />
              <!-- Tone Control -->
              <two-state-button 
                v-if="mso.personalize?.modes.tone"
                :button-text="`Tone Control ${mso.eq?.tc ? 'on' : 'off'}`"
                :state-on="mso.eq?.tc"
                :home-button="true"
                @btn-click="toggleToneControl()"
                :show-state-indicators="true"
                min-width="10rem"
              />
              <!-- Loudness -->
              <two-state-button 
                v-if="mso.personalize?.modes.loudness"
                :button-text="`Loudness ${mso.loudness}`" 
                :state-on="mso.loudness === 'on'" 
                :home-button="true"
                @btn-click="toggleLoudness()"
                :show-state-indicators="true"
                min-width="7.5rem"
              />
              <!-- Dialog Enhance --> 
              <dialog-enhance-button 
                v-if="mso.personalize?.modes.dialogenh"
                :home-button="true" 
                :show-state-indicators="true" 
              />

              <!-- Night Mode -->
              <three-state-button 
                v-if="mso.personalize?.modes.night"
                :button-text="`Night ${mso.night}`"
                :states="{'off': 0, 'on': 1, 'auto': 2}"
                :state-value="mso.night"
                :home-button="true"
                @btn-click="setNextNightMode()"
                :show-state-indicators="true"
                min-width="6.75rem"
              />
          </div>
        </div>
      </div>
  </div>
</template>

<script>

import { ref, defineAsyncComponent, computed, onMounted } from 'vue';
import { debounce } from 'lodash-es';

import useLocalStorage from '@/use/useLocalStorage.js';
import useMso from '@/use/useMso.js';
import useStream from '@/use/useStream.js';

import { LongPress, LongPressUp, Press } from '@/directives/Press.js';

import TwoStateButton from './buttons/TwoStateButton.vue';
import ThreeStateButton from './buttons/ThreeStateButton.vue';
import MultiStateButtonGroup from './buttons/MultiStateButtonGroup.vue';
import DiracButton from './buttons/DiracButton.vue';
import DialogEnhanceButton from './buttons/DialogEnhanceButton.vue';
import DiracButtonGroup from './buttons/DiracButtonGroup.vue';
import IpSelect from './IpSelect.vue';

// ms per dB
const LONG_PRESS_VOLUME_ADJUST_SPEED = 125; 

const SIGNAL_GENERATOR_TAB = 2;
const INPUTS_TAB = 5;
const SOUND_ENHANCEMENTS_TAB = 6;
const MACROS_TAB = 8;
const HELP_TAB = 11;

export default {
  setup() {

    const { settingsActiveTab, setSettingsActiveTab } = useLocalStorage();

    const { 
      mso, setVolume, toggleMute,
      loading, calToolConnected, state,
      visibleInputs, visibleUpmixers, powerOn, setInput, setUpmix, powerOff, 
      setNextNightMode, toggleLoudness, setNextDtsDialogEnh, toggleToneControl, toggleGlobalPEQ,
      setNightOff, setNightAuto, setNightOn, setLoudnessOff, setLoudnessOn, 
      setToneControlOff, setToneControlOn, setGlobalPEQOff, setGlobalPEQOn, setDtsDialogEnh,
      currentlyRecordingSlot
    } = useMso();

    onMounted(() => {
      if(window.addEventListener) {
        // Handle window's `load` event.
        window.addEventListener('load', function () {
          // Wire up the `focus` and `blur` event handlers.
          // window.addEventListener('focus', window.myApp.onFocus);
          window.addEventListener('blur', handleVolumeLongPressUp);
        });

        // window.onerror = function(msg, url, linenumber) {
        //     alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
        //     return true;
        // }
      }
    });

    const experimental = computed(() => window.location.href.includes('experimental'));

    const settingsModalIsOpen = ref(false);

    const upmixRecentlyInteracted = ref(false);
    let upmixRecentlyInteractedTimeout;
    
    const inputRecentlyInteracted = ref(false);
    let inputRecentlyInteractedTimeout;

    const showMobileMenu = ref(false);

    // intervals for performing the actual volume adjustments
    let incrementVolumeInterval;
    let decrementVolumeInterval;

    function handleMute(e) {
      e.preventDefault();
      toggleMute();
    }

    function incrementVolume() {
      setVolume(mso.value.volume + 1);
    }

    function decrementVolume() {
      setVolume(mso.value.volume - 1);
    }

    function handleVolumeDownPress() {
      console.log('handleVolumeDownPress');
      decrementVolume();
    }

    function handleVolumeUpPress() {
      console.log('handleVolumeUpPress');
      incrementVolume();
    }

    function handleVolumeDownLongPress() {
      console.log('handleVolumeDownLongPress');
      clearInterval(decrementVolumeInterval);
      clearInterval(incrementVolumeInterval);
      decrementVolumeInterval = setInterval(decrementVolume, LONG_PRESS_VOLUME_ADJUST_SPEED);
    } 

    function handleVolumeUpLongPress () {
      console.log('handleVolumeUpLongPress');
      clearInterval(decrementVolumeInterval);
      clearInterval(incrementVolumeInterval);
      incrementVolumeInterval = setInterval(incrementVolume, LONG_PRESS_VOLUME_ADJUST_SPEED);
    }

    function handleVolumeLongPressUp() {
      console.log('handleVolumeLongPressUp');
      clearInterval(decrementVolumeInterval);
      clearInterval(incrementVolumeInterval);
    }

    function handleInputClicked(inp) {
      setInput(inp);
      inputRecentlyInteracted.value = true;
      clearTimeout(inputRecentlyInteractedTimeout);
      inputRecentlyInteractedTimeout = setTimeout(() => {
        inputRecentlyInteracted.value = false;
      }, 3000);
    }

    function handleUpmixClicked(upmix) {
      setUpmix(upmix)
      upmixRecentlyInteracted.value = true;
      clearTimeout(upmixRecentlyInteractedTimeout);
      upmixRecentlyInteractedTimeout = setTimeout(() => {
        upmixRecentlyInteracted.value = false;
      }, 3000);
    }

    function inputSelectedAndLoading(inp) {
      return inp === mso.value.input && inputLoading(inp);
    }

    function inputLoaded(inp) {
      return inp === mso.value.input && !inputLoading(inp);
    }

    function inputLoading(inp) {
      return inp.startsWith('h') && mso.value.videostat?.VideoResolution === '-----';
    }

    return { 
      mso, setVolume, toggleMute,
      loading, calToolConnected, state,
      visibleInputs, visibleUpmixers,
      powerOn, setInput, setUpmix, powerOff, 
      setNextNightMode, toggleLoudness, setNextDtsDialogEnh, toggleToneControl, toggleGlobalPEQ,
      ...useStream(),
      handleInputClicked, handleUpmixClicked, inputRecentlyInteracted, upmixRecentlyInteracted,
      handleVolumeDownLongPress, handleVolumeUpLongPress, handleVolumeLongPressUp,
      handleVolumeDownPress, handleVolumeUpPress, handleMute, 
      setNightOff, setNightAuto, setNightOn, setLoudnessOff, setLoudnessOn, setToneControlOff, setToneControlOn, setGlobalPEQOff, setGlobalPEQOn,setDtsDialogEnh,
      currentlyRecordingSlot,
      inputLoaded, inputSelectedAndLoading,
      experimental
    };
  },
  components: {
    Settings: defineAsyncComponent(() => import('./Settings.vue')),
    DiracButton,
    DiracButtonGroup,
    DialogEnhanceButton,
    TwoStateButton,
    ThreeStateButton,
    MultiStateButtonGroup,
    IpSelect,
  },
  directives: {
    LongPress,
    LongPressUp,
    Press
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .current-input-label {
    line-height: 1;
    font-size: 2rem;
    color:inherit;
    cursor: pointer;
  }

  @media(min-width: 576px) {
    .current-input-label {
      font-size: 2.75rem;
    }
  }

  .settings-link {
    color:#dedad6;
  }

  .settings-link:hover {
    text-decoration: none;
  }

  .vol-display {
    font-weight: bold;
    font-size:3rem;
    cursor: pointer;
    color:white;
  }

  .vol-btn, .vol-btn:focus, .vol-btn:active {
    background-color: rgba(0,0,0,0) !important;
    box-shadow: none !important;
    outline:none;
    border:none;
    width:6rem;
    height:6rem;
    margin:1rem;
  }

  .yellow-text-btn {
    color:yellow;
  }
  .fillheight {
    max-height:4rem;
    max-width:8rem;
    display: block;
  }

  .mfade-enter-from,
  .mfade-leave-to {
    opacity: 0;
  }

  .transition-container-fixed {
    display: block;
    z-index: 9;
    position: fixed;
  }

  /*.inputs-container::v-deep(.home-btn),
  .upmix-container::v-deep(.home-btn) {
    margin: 0;
  }*/

  ::v-deep(.home-btn) {
    /* margin: .03125rem; */
    outline: 1px solid black;
    /* padding: 1rem; */
  }

  .link {
    cursor: pointer;
  }

  button.btn:focus {
    outline:none;
    box-shadow: none;
  }

  div.container {
    color:#dedad6;
    /* background-color: black; */
  }

  div.background-dark {
    background-color: black;
    width:100vw;
    height:100vh;
    position:fixed;
    top:0;
    z-index: -1;
  }

  .mfade-enter-active,
  .mfade-leave-active {
    /* transition: opacity .1s ease; */
    z-index: 0;
  }

  .mfade-enter-from,
  .mfade-leave-to {
    opacity: 0;
    z-index: 0;
  }


</style>
