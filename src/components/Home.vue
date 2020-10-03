<template>
    <div v-if="loading" class="loading-indicator">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div class="fixed-top text-center" style="z-index: 9999999999999999" v-if="mso?.sgen?.sgensw === 'on'">
      <a class="sgen-on-warning" @click="openSettingsToTab(SIGNAL_GENERATOR_TAB)">
        Signal Generator On 
        <span v-if="!(settingsModalIsOpen && settingsActiveTab === SIGNAL_GENERATOR_TAB)"><br/>(Click to Open Signal Generator Settings)</span>
      </a>
    </div>
    <div class="fixed-top text-center" style="z-index: 9999999999999999" v-if="calToolConnected">
      <span class="sgen-on-warning">Dirac Calibration in Progress - Currently in Readonly Mode</span>
    </div>
    <div class="fixed-top text-center" style="z-index: 9999999999999999" v-if="currentlyRecordingSlot">
      <a @click="openSettingsToTab(MACROS_TAB)" class="sgen-on-warning">Currently Recording - {{currentlyRecordingSlot}}</a>
    </div>
    <div v-if="state !== 'OPEN'" class="connecting-overlay">
      <ip-select />
    </div>
    <template v-if="!mso?.powerIsOn">
      <div class="container">
        <div class="row mt-5">
          <div class="col-md-12 text-center">
            <p>Unit is in standby mode. Click below to power on.</p>
            <button class="btn btn-dark rounded-circle menu-btn" @click="powerOn()">
              <font-awesome-icon size="lg" :icon="['fas', 'power-off']" />
            </button>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- Input Label, Menu Buttons -->
      <div class="container">
        <div class="row justify-content-between mt-2">
          <div class="col-auto">
            <a 
              class="current-input-label"
              @click="openSettingsToTab(INPUTS_TAB)"
            >
              {{mso.inputs && mso.inputs[mso.input].label}}
            </a>
          </div>
          <div class="col-auto">
            <transition name="mfade">
              <div class="transition-container-fixed" v-show="settingsModalIsOpen">
                <keep-alive>
                  <settings 
                    v-if="settingsModalIsOpen"
                    @close="toggleSettingsModal()" 
                    @active-tab-change="setSettingsActiveTab"
                    :active-tab="settingsActiveTab"
                  />
                </keep-alive>
              </div>
            </transition>

            <button class="btn btn-dark rounded-circle menu-btn" @click="toggleSettingsModal()">
              <font-awesome-icon size="lg" :icon="['fas', 'cog']" />
            </button>
            <button class="btn btn-dark rounded-circle menu-btn" @click="openSettingsToTab(HELP_TAB)">
              <font-awesome-icon size="lg" :icon="['fas', 'question-circle']" />
            </button>
            <button class="btn btn-dark rounded-circle menu-btn" @click="powerOff()">
              <font-awesome-icon size="lg" :icon="['fas', 'power-off']" />
            </button>
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
            <!-- Surround Mode -->
            <!--             <h5>Surround Mode</h5>      -->
            <!--             <div>{{mso.status?.SurroundMode}}</div>   -->
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
          <div class="col-md-12 text-center" :class="{'experimental': experimental}">
              <h5><span class="link" @click="openSettingsToTab(INPUTS_TAB)">Input Select</span></h5>
              <div class="inputs-container my-3">
                <two-state-button 
                  v-for="(inp, key) in visibleInputs"
                  :key="key"
                  :button-text="inp.label"
                  :state-on="key === mso.input"
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
          <div class="col-md-12 text-center" :class="{'experimental': experimental}">
              <h5><span class="link" @click="openSettingsToTab(SOUND_ENHANCEMENTS_TAB)">Upmix Select</span></h5>
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
        <div class="row mt-2" v-if="!experimental">
          <div class="col-md-12 text-center">
              <h5>Modes</h5>
              <!-- Dirac -->
              <dirac-button 
                :home-button="true"
              />
              <!-- PEQ -->
              <two-state-button 
                :button-text="`PEQ ${mso.peq?.peqsw ? 'on' : 'off'}`"
                :state-on="mso.peq?.peqsw"
                :home-button="true"
                @btn-click="toggleGlobalPEQ()"
                :show-state-indicators="true"
              />
              <!-- Tone Control -->
              <two-state-button 
                :button-text="`Tone Control ${mso.eq?.tc ? 'on' : 'off'}`"
                :state-on="mso.eq?.tc"
                :home-button="true"
                @btn-click="toggleToneControl()"
                :show-state-indicators="true"
                min-width="10rem"
              />
              <!-- Loudness -->
              <two-state-button 
                :button-text="`Loudness ${mso.loudness}`" 
                :state-on="mso.loudness === 'on'" 
                :home-button="true"
                @btn-click="toggleLoudness()"
                :show-state-indicators="true"
                min-width="7.5rem"
              />
              <!-- Dialog Enhance --> 
              <dialog-enhance-button :home-button="true" :show-state-indicators="true" />

              <!-- Night Mode -->
              <three-state-button 
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
        <div class="row mt-2" v-if="experimental">
          <div class="col-md-12 text-center experimental">
            <h5>Modes (Experimental)</h5>
            
            <dirac-button-group :home-button="true" />

            <multi-state-button-group
              :states="[{value: 0, label: 'PEQ Off'}, {value: 1, label: 'PEQ On'}]"
              :state-value="mso.peq?.peqsw ? 1 : 0"
              :home-button="true"
              @set-on="setGlobalPEQOn"
              @set-off="setGlobalPEQOff"
            />

            <multi-state-button-group
              :states="[{value: 0, label: 'Tone Control Off'}, {value: 1, label: 'Tone Control On'}]"
              :state-value="mso.eq?.tc ? 1 : 0"
              :home-button="true"
              @set-on="setToneControlOn"
              @set-off="setToneControlOff"
            />

            <multi-state-button-group
              :states="[{value: 0, label: 'Loudness Off'}, {value: 1, label: 'Loudness On'}]"
              :state-value="mso.loudness === 'on' ? 1 : 0"
              :home-button="true"
              @set-on="setLoudnessOn"
              @set-off="setLoudnessOff"
            />

            <multi-state-button-group
              :states="[{value: 0, label: 'Night Off'}, {value: 2, label: 'Night Auto'}, {value: 1, label: 'Night On'}]"
              :state-value="mso.night === 'on' ? 1 : mso.night === 'off' ? 0 : 2"
              :home-button="true"
              @set-on="setNightOn"
              @set-off="setNightOff"
              @set-other="setNightAuto"
            />
          </div>
        </div>
        <!-- Video Status -->
        <div v-if="mso.stat.displayVideoStat" class="row ml-2 mt-2"  >
            <div class="col-md-12 text-center">
                video status: {{mso.videostat.VideoResolution}} {{mso.videostat.VideoColorSpace}} 
                {{mso.videostat.VideoMode}} {{mso.videostat.HDRstatus}} {{mso.videostat.VideoBitDepth}} 
                {{mso.videostat.Video3D}}
            </div>
        </div>
      </div>
    </template>

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

    function openSettingsModal() {
      document.body.classList.add('modal-open');
      settingsModalIsOpen.value = true;
    }

    function closeSettingsModal() {
      document.body.classList.remove('modal-open');
      settingsModalIsOpen.value = false;
    }

    function toggleSettingsModal() {
      if (!settingsModalIsOpen.value) {
        openSettingsModal();
      } else {
        closeSettingsModal();
      }
    }

    function openSettingsToTab(selectedTab) {
      setSettingsActiveTab(selectedTab);
      openSettingsModal();
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

    return { 
      mso, setVolume, toggleMute,
      loading, calToolConnected, state,
      visibleInputs, visibleUpmixers,
      powerOn, setInput, setUpmix, powerOff, 
      setNextNightMode, toggleLoudness, setNextDtsDialogEnh, toggleToneControl, toggleGlobalPEQ,
      ...useStream(),
      handleInputClicked, handleUpmixClicked, inputRecentlyInteracted, upmixRecentlyInteracted,
      settingsModalIsOpen, toggleSettingsModal,
      settingsActiveTab, setSettingsActiveTab,
      handleVolumeDownLongPress, handleVolumeUpLongPress, handleVolumeLongPressUp,
      handleVolumeDownPress, handleVolumeUpPress, handleMute, 
      SIGNAL_GENERATOR_TAB, INPUTS_TAB, SOUND_ENHANCEMENTS_TAB, MACROS_TAB, HELP_TAB, openSettingsToTab,
      setNightOff, setNightAuto, setNightOn, setLoudnessOff, setLoudnessOn, setToneControlOff, setToneControlOn, setGlobalPEQOff, setGlobalPEQOn,setDtsDialogEnh,
      currentlyRecordingSlot,
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

  .connecting-overlay {
    width:100%;
    height:100%;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
    position:fixed;
  }

  .loading-indicator {
    position:fixed;
    /*opacity: 50%;*/
    z-index: 9999999999999999;
    text-align: right;
    vertical-align: text-bottom;
    bottom:0;
    right:0;
    margin:1rem;
    width:2rem;
    height:2rem;
    /*color:white;*/
  }

  .current-input-label {
    font-size:min(2.3rem, 9vw);
    /* font-size: 1vw; */
    color:inherit;
    cursor: pointer;
  }

  .current-input-label:hover {
    text-decoration: none;
  }

  .menu-btn {
    min-height:3.5rem;
    min-width: 3.5rem;
    margin-left: 1rem;
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

  .sgen-on-warning {
    text-transform: uppercase;
    font-weight: bold;
    color: magenta;
    background: rgba(0,0,0,0.75);
    padding:0.25rem 0.5rem;
    cursor: pointer;
  }

  .sgen-on-warning:hover {
    text-decoration: none;
  }

  .mfade-enter-active,
  .mfade-leave-active {
    transition: opacity .1s ease;
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

  .experimental::v-deep(.home-btn) {
    margin: .03125rem;
    outline: 1px solid black;
    padding: 1rem;
  }

  .link {
    cursor: pointer;
  }

  button.btn:focus {
    outline:none;
    box-shadow: none;
  }

</style>
