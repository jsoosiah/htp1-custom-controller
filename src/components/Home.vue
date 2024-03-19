<template>
  <div>
    <div class="container">
      <!-- Input Label -->
      <div 
        v-if="!isMobileMode && (mso.personalize.homeLabels?.topLeft !== null || mso.personalize.homeLabels?.topRight !== null)" 
        class="row justify-content-between mb-3"
      >
        <div class="col-auto">
          <template v-if="mso.personalize.homeLabels?.topLeft === 'current-input'">
            <router-link
              class="settings-link current-input-label"
              :to="`/settings/inputs`"
            >
              {{ mso.inputs && mso.inputs[mso.input].label }}
            </router-link>
          </template>
          <template v-else-if="mso.personalize.homeLabels?.topLeft === 'unit-name'">
            <router-link
              class="settings-link current-input-label"
              :to="`/settings/system`"
            >
              {{ mso.unitname }}
            </router-link>
          </template>
        </div>
        <div class="col-auto">
          <template v-if="mso.personalize.homeLabels?.topRight === 'current-input'">
            <router-link
              class="settings-link current-input-label"
              :to="`/settings/inputs`"
            >
              {{ mso.inputs && mso.inputs[mso.input].label }}
            </router-link>
          </template>
          <template v-else-if="mso.personalize.homeLabels?.topRight === 'unit-name'">
            <router-link
              class="settings-link current-input-label"
              :to="`/settings/system`"
            >
              {{ mso.unitname }}
            </router-link>
          </template>
        </div>
      </div>
      <!-- Program Format, Video, Listening Format   -->
      <div class="row">
        <div class="col-md">
          <div
            class="card"
            :class="{'desktop-card': !isMobileMode, 'mobile-card': isMobileMode}"
          >
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-auto icon-col text-center">
                  <component
                    :is="streamTypeIcon(mso.status)"
                    height="52"
                    width="80"
                    preserve-aspect-ratio="xMidYMid"
                  />
                </div>
                <div class="col">
                  <h6 class="card-title text-muted">
                    Program Format
                  </h6>
                  <h6 class="card-text">
                    {{ mso.status?.DECProgramFormat }} <small>{{ mso.status?.DECSourceProgram }} <span v-if="mso.stat?.displayAudioStat">{{ mso.status?.DECSampleRate }}</span></small>
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="mso.stat?.displayVideoStat"
          class="col-md"
        >
          <div
            class="card"
            :class="{'desktop-card': !isMobileMode, 'mobile-card': isMobileMode}"
          >
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-auto icon-col text-center fillheight">
                  <font-awesome-icon
                    class="text-muted"
                    size="2x"
                    :icon="['fas', 'tv']"
                  />
                </div>
                <div class="col">
                  <h6 class="card-title text-muted">
                    Video
                  </h6>
                    
                  <h6 class="card-text">
                    {{ mso.videostat.VideoResolution }}
                    <small>
                      {{ mso.videostat.VideoColorSpace }}
                      {{ mso.videostat.VideoMode }}
                      {{ mso.videostat.HDRstatus }}
                      {{ mso.videostat.VideoBitDepth }}
                      {{ mso.videostat.Video3D }}
                    </small>
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md">
          <div
            class="card"
            :class="{'desktop-card': !isMobileMode, 'mobile-card': isMobileMode}"
          >
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-auto icon-col text-center fillheight">
                  <component
                    :is="upmixerIcon(mso.status)"
                    height="52"
                    width="80"
                    preserve-aspect-ratio="xMidYMid"
                  />
                </div>
                <div class="col">
                  <h6 class="card-title text-muted">
                    Listening Format
                  </h6>
                  <h6 class="card-text">
                    {{ mso.status?.ENCListeningFormat }} <small>{{ mso.status?.SurroundMode }} <span v-if="mso.stat?.displayAudioStat">{{ mso.status?.ENCSampleRate }}</span></small>
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Program Format Logo, Volumn Text, Listening Format Logo -->
      <div class="row mt-2 justify-content-center">
        <div
          class="col-auto text-left"
          :class="{'px-0': isMobileMode}"
        >
          <button 
            v-press="handleVolumeDownPress" 
            v-long-press="handleVolumeDownLongPress" 
            v-long-press-up="handleVolumeLongPressUp"
            type="button"
            class="btn btn-dark vol-btn"
          >
            <font-awesome-icon
              :class="{'text-danger':mso.muted}"
              size="4x"
              :icon="['fas', 'volume-down']"
            />
          </button>
        </div>
        <div
          class="col-auto text-center"
          :class="{'px-0': isMobileMode}"
        >
          <span 
            v-press="handleMute" 
            class="vol-display" 
            :class="{'text-danger':mso.muted}"
          >
            {{ displayVolume }} dB
          </span>
        </div>
        <div class="col-auto text-right pr-0">
          <button 
            v-press="handleVolumeUpPress" 
            v-long-press="handleVolumeUpLongPress" 
            v-long-press-up="handleVolumeLongPressUp"
            type="button"
            class="btn btn-dark vol-btn"
          >
            <font-awesome-icon
              :class="{'text-danger':mso.muted}"
              size="4x"
              :icon="['fas', 'volume-up']"
            />
          </button>
        </div>
      </div>
      <!-- Volume Buttons -->
      <div class="row mt-2">
        <div class="col-md-12 text-center" />
      </div>
      <!-- Input Select -->
      <div class="row mt-2">
        <div class="col-md-12 text-center">
          <h5>
            <router-link
              class="settings-link"
              :to="`/settings/inputs`"
            >
              Input Select
            </router-link>
          </h5>
          <div class="inputs-container my-3">
            <two-state-button 
              v-for="(inp, key) in visibleInputs"
              :key="key"
              :button-text="inp.label"
              :state-on="inputLoaded(key)"
              :state-loading="inputSelectedAndLoading(key)"
              :home-button="true"
              :show-state-indicators="true"
              :single-indicator="true"
              :recently-interacted="inputRecentlyInteracted"
              @btn-click="handleInputClicked(key)"
            />
          </div>
        </div>
      </div>
      <!-- Upmix Select -->
      <div
        v-if="mso.stat.systemAudio"
        class="row mt-2"
      >
        <div class="col-md-12 text-center">
          <h5>
            <router-link
              class="settings-link"
              :to="`/settings/upmix`"
            >
              Upmix Select
            </router-link>
          </h5>
          <div class="upmix-container my-3">
            <two-state-button 
              v-for="(upmix, key) in visibleUpmixers"
              :key="key"
              :button-text="upmix.label"
              :state-on="key === mso.upmix.select"
              :home-button="true"
              :show-state-indicators="true" 
              :single-indicator="true"
              :recently-interacted="upmixRecentlyInteracted"
              @btn-click="handleUpmixClicked(key)"
            />
          </div>
        </div>
      </div>
      <!-- Modes -->
      <div
        v-if="mso.personalize?.modes && Object.keys(mso.personalize?.modes).length > 0"
        class="row mt-2"
      >
        <div class="col-md-12 text-center">
          <h5>Modes</h5>
          <div class="my-3">
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
              :show-state-indicators="true"
              @btn-click="toggleGlobalPEQ()"
            />
            <!-- Tone Control -->
            <two-state-button 
              v-if="mso.personalize?.modes.tone"
              :button-text="`Tone Control ${mso.eq?.tc ? 'on' : 'off'}`"
              :state-on="mso.eq?.tc"
              :home-button="true"
              :show-state-indicators="true"
              min-width="10rem"
              @btn-click="toggleToneControl()"
            />
            <!-- Loudness -->
            <two-state-button 
              v-if="mso.personalize?.modes.loudness"
              :button-text="`Loudness ${mso.loudness}`" 
              :state-on="mso.loudness === 'on'" 
              :home-button="true"
              :show-state-indicators="true"
              min-width="7.5rem"
              @btn-click="toggleLoudness()"
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
              :show-state-indicators="true"
              min-width="6.75rem"
              @btn-click="setNextNightMode()"
            />

            <!-- Wide Synth -->
            <two-state-button 
              v-if="mso.personalize?.modes.ws"
              :button-text="`Wide Synth ${mso.upmix?.dts.ws ? 'on' : 'off'}`" 
              :state-on="mso.upmix?.dts.ws" 
              :home-button="true"
              min-width="9rem"
              @click="toggleUpmixWideSynth()"
            />

            <!-- Lipsync Delay -->
            <div
              v-if="mso.personalize?.modes.lipsync"
              class="row mt-2 justify-content-center"
            >
              <div
                class="col-auto text-left"
                :class="{'px-0': isMobileMode}"
              >
                <button 
                  v-press="handleLipsyncDownPress" 
                  v-long-press="handleLipsyncDownLongPress" 
                  v-long-press-up="handleLipsyncLongPressUp"
                  type="button"
                  class="btn btn-dark lipsync-btn"
                >
                  <font-awesome-icon
                    :class="{'text-danger':mso.muted}"
                    size="2x"
                    :icon="['fas', 'minus']"
                  />
                </button>
              </div>
              <div
                class="col-auto text-center"
                :class="{'px-0': isMobileMode}"
              >
                <span 
                  v-press="handleMute" 
                  class="lipsync-display" 
                  :class="{'text-danger':mso.muted}"
                >
                  {{ mso.cal?.lipsync }} ms
                </span>
              </div>
              <div class="col-auto text-right pr-0">
                <button 
                  v-press="handleLipsyncUpPress" 
                  v-long-press="handleLipsyncUpLongPress" 
                  v-long-press-up="handleLipsyncLongPressUp"
                  type="button"
                  class="btn btn-dark lipsync-btn"
                >
                  <font-awesome-icon
                    :class="{'text-danger':mso.muted}"
                    size="2x"
                    :icon="['fas', 'plus']"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dirac Slots -->
      <div
        v-if="mso.personalize?.diracSlots && Object.keys(mso.personalize.diracSlots).length > 0"
        class="row mt-2"
      >
        <div class="col-md-12 text-center">
          <h5>
            <router-link
              class="settings-link"
              :to="`/settings/calibration`"
            >
              Dirac Slot Select
            </router-link>
          </h5>
          <div class="diracslot-container my-3">
            <two-state-button 
              v-for="(slot, key) in visibleDiracSlots"
              :key="key"
              :button-text="slot.name"
              :state-on="parseInt(key) === mso.cal?.currentdiracslot"
              :home-button="true"
              :show-state-indicators="true" 
              :single-indicator="true"
              :recently-interacted="diracSlotRecentlyInteracted"
              @btn-click="handleDiracSlotClicked(key)"
            />
          </div>
        </div>
      </div>

      <!-- Macros --> 
      <div
        v-if="mso.personalize?.macros && Object.keys(mso.personalize.macros).length > 0"
        class="row mt-2"
      >
        <div class="col-md-12 text-center">
          <h5>
            <router-link
              class="settings-link"
              :to="`/settings/macros`"
            >
              Macros
            </router-link>
          </h5>
          <div class="diracslot-container my-3">
            <two-state-button 
              v-for="(macro, key) in visibleRemoteMacros"
              :key="key"
              :button-text="mso.svronly?.macroNames[key]"
              :state-on="macroIsActive(macro)"
              :home-button="true"
              @btn-click="executeMacro(macro)" 
            />
          </div>
          <div class="diracslot-container my-3">
            <two-state-button 
              v-for="(macro, key) in visibleExtraMacros"
              :key="key"
              :button-text="mso.svronly?.macroNames[key]"
              :state-on="macroIsActive(macro)"
              :home-button="true"
              @btn-click="executeMacro(macro)" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { ref, computed, onMounted } from 'vue';
import { applyPatch, deepClone, compare } from 'fast-json-patch/index.mjs';

import useMso from '@/use/useMso.js';
import useStream from '@/use/useStream.js';
import useResponsive from '@/use/useResponsive.js';

import { LongPress, LongPressUp, Press } from '@/directives/Press.js';

import TwoStateButton from './buttons/TwoStateButton.vue';
import ThreeStateButton from './buttons/ThreeStateButton.vue';
import DiracButton from './buttons/DiracButton.vue';
import DialogEnhanceButton from './buttons/DialogEnhanceButton.vue';

import AuroCodecIcon from './icons/streamformat/AuroCodecIcon.vue';
import AuromaticCroppedIcon from './icons/streamformat/AuromaticCroppedIcon.vue';
import DirectIcon from './icons/streamformat/DirectIcon.vue';
import DolbyAtmosWhiteIcon from './icons/streamformat/DolbyAtmosWhiteIcon.vue';
import DolbyAudioWhiteIcon from './icons/streamformat/DolbyAudioWhiteIcon.vue';
import DtsHdmaWhiteIcon from './icons/streamformat/DtsHdmaWhiteIcon.vue';
import DtsHdWhiteIcon from './icons/streamformat/DtsHdWhiteIcon.vue';
import DtsWhiteIcon from './icons/streamformat/DtsWhiteIcon.vue';
import DtsXWhiteIcon from './icons/streamformat/DtsXWhiteIcon.vue';
import PcmIcon from './icons/streamformat/PcmIcon.vue';
import StereoIcon from './icons/streamformat/StereoIcon.vue';

// ms per dB
const LONG_PRESS_VOLUME_ADJUST_SPEED = 125; 

export default {
  components: {
    DiracButton,
    DialogEnhanceButton,
    TwoStateButton,
    ThreeStateButton,
    AuroCodecIcon,
    AuromaticCroppedIcon,
    DirectIcon,
    DolbyAtmosWhiteIcon,
    DolbyAudioWhiteIcon,
    DtsHdmaWhiteIcon,
    DtsHdWhiteIcon,
    DtsWhiteIcon,
    DtsXWhiteIcon,
    PcmIcon,
    StereoIcon,
  },
  directives: {
    LongPress,
    LongPressUp,
    Press
  },
  setup() {

    const { isMobileMode } = useResponsive();

    const { 
      mso, setVolume, toggleMute,
      loading, calToolConnected, state,
      visibleInputs, visibleUpmixers, visibleDiracSlots, powerOn, setInput, setUpmix, powerOff, 
      setNextNightMode, toggleLoudness, setNextDtsDialogEnh, toggleToneControl, toggleGlobalPEQ,
      setNightOff, setNightAuto, setNightOn, setLoudnessOff, setLoudnessOn, setDiracSlot,
      setToneControlOff, setToneControlOn, setGlobalPEQOff, setGlobalPEQOn, setDtsDialogEnh,
      currentlyRecordingSlot, visibleRemoteMacros, visibleExtraMacros, executeMacro, toggleUpmixWideSynth,
      displayVolume, setLipsyncDelay
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

    const upmixRecentlyInteracted = ref(false);
    let upmixRecentlyInteractedTimeout;
    
    const inputRecentlyInteracted = ref(false);
    let inputRecentlyInteractedTimeout;

    const diracSlotRecentlyInteracted = ref(false);
    let diracSlotRecentlyInteractedTimeout;

    // intervals for performing the actual volume adjustments
    let incrementVolumeInterval;
    let decrementVolumeInterval;
    let incrementLipsyncInterval;
    let decrementLipsyncInterval;

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
      clearInterval(decrementVolumeInterval);
      clearInterval(incrementVolumeInterval);
      decrementVolume();
    }

    function handleVolumeUpPress() {
      console.log('handleVolumeUpPress');
      clearInterval(decrementVolumeInterval);
      clearInterval(incrementVolumeInterval);
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

    function incrementLipsync() {
      setLipsyncDelay(mso.value.cal.lipsync + 1);
    }

    function decrementLipsync() {
      setLipsyncDelay(mso.value.cal.lipsync - 1);
    }

    function handleLipsyncDownPress() {
      console.log('handleLipsyncDownPress');
      decrementLipsync();
    }

    function handleLipsyncUpPress() {
      console.log('handleLipsyncUpPress');
      incrementLipsync();
    }

    function handleLipsyncDownLongPress() {
      console.log('handleLipsyncDownLongPress');
      clearInterval(decrementLipsyncInterval);
      clearInterval(incrementLipsyncInterval);
      decrementLipsyncInterval = setInterval(decrementLipsync, LONG_PRESS_VOLUME_ADJUST_SPEED);
    } 

    function handleLipsyncUpLongPress () {
      console.log('handleLipsyncUpLongPress');
      clearInterval(decrementLipsyncInterval);
      clearInterval(incrementLipsyncInterval);
      incrementLipsyncInterval = setInterval(incrementLipsync, LONG_PRESS_VOLUME_ADJUST_SPEED);
    }

    function handleLipsyncLongPressUp() {
      console.log('handleVolumeLongPressUp');
      clearInterval(decrementLipsyncInterval);
      clearInterval(incrementLipsyncInterval);
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

    function handleDiracSlotClicked(slot) {
      setDiracSlot(slot);
      diracSlotRecentlyInteracted.value = true;
      clearTimeout(diracSlotRecentlyInteractedTimeout);
      diracSlotRecentlyInteractedTimeout = setTimeout(() => {
        diracSlotRecentlyInteracted.value = false;
      }, 3000);
    }

    function macroIsActive(macro) {
      const msoCopy = deepClone(mso.value);
      
      applyPatch(msoCopy, deepClone(macro));
      const result = compare(mso.value, msoCopy).length === 0;
      return result
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
      visibleInputs, visibleUpmixers, visibleDiracSlots, visibleRemoteMacros, visibleExtraMacros, macroIsActive, executeMacro,
      powerOn, setInput, setUpmix, powerOff, 
      setNextNightMode, toggleLoudness, setNextDtsDialogEnh, toggleToneControl, toggleGlobalPEQ,
      ...useStream(),
      handleInputClicked, handleUpmixClicked, inputRecentlyInteracted, upmixRecentlyInteracted, 
      handleDiracSlotClicked, diracSlotRecentlyInteracted,
      handleVolumeDownLongPress, handleVolumeUpLongPress, handleVolumeLongPressUp,
      handleVolumeDownPress, handleVolumeUpPress, handleMute, 
      setNightOff, setNightAuto, setNightOn, setLoudnessOff, setLoudnessOn, setToneControlOff, setToneControlOn, setGlobalPEQOff, setGlobalPEQOn,setDtsDialogEnh,
      currentlyRecordingSlot,
      inputLoaded, inputSelectedAndLoading,
      experimental, isMobileMode, toggleUpmixWideSynth,
      displayVolume,
      handleLipsyncDownPress, handleLipsyncUpPress, handleLipsyncDownLongPress, handleLipsyncUpLongPress, handleLipsyncLongPressUp
    };
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

* {
    /* make no text selectable on home page - attempt to fix stuck volume button */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

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
    line-height: 1.9;
  }

  .vol-btn, .vol-btn:focus, .vol-btn:active {
    background-color: rgba(0,0,0,0) !important;
    box-shadow: none !important;
    outline:none;
    border:none;
    width:6rem;
    height:6rem;
    /* margin:1rem; */
  }

  .lipsync-display {
    font-weight: bold;
    font-size:2rem;
    cursor: pointer;
    color:white;
    line-height: 1.9;
  }

  .lipsync-btn, .lipsync-btn:focus, .lipsync-btn:active {
    background-color: rgba(0,0,0,0) !important;
    box-shadow: none !important;
    outline:none;
    border:none;
    width:6rem;
    height:3rem;
    margin:.5rem;
  }

  .yellow-text-btn {
    color:yellow;
  }
  .fillheight {
    opacity: .9;
  }

  .icon-col {
    width: 6.25rem;
    padding-right:0;
    /* padding-left:0; */
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

  .card {
    background-color: black;
    min-height:5.5rem;
  }

  .card .card-body {
    background-color: black;
  }

  .desktop-card {
    border: rgba(255,255,255,.11) 1px solid;
    border-radius: 8px;
    margin-bottom:1rem;
  }

  .mobile-card {
    border-bottom: rgba(255,255,255,.11) 1px solid;
    border-radius: 0;
  }



</style>











