<template>
    <div v-if="loading" class="loading-indicator">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div class="fixed-top text-center" style="z-index: 9999999999999999" v-if="mso?.sgen?.sgensw === 'on'">
      <a class="sgen-on-warning" @click="openSignalGeneratorSettings">
        Signal Generator On 
        <span v-if="!(settingsModalIsOpen && settingsActiveTab === SIGNAL_GENERATOR_TAB)"><br/>(Click to Open Signal Generator Settings)</span>
      </a>
    </div>
    <div class="fixed-top text-center" style="z-index: 9999999999999999" v-if="calToolConnected">
      <span class="sgen-on-warning">Dirac Calibration in Progress - Currently in Readonly Mode</span>
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
        <div class="row mt-2">
          <div class="col text-left">
            <a 
              class="current-input-label"
              @click="openInputSettings"
            >
              {{mso.inputs && mso.inputs[mso.input].label}}
            </a>
          </div>
          <div class="col text-right">
            <transition name="mfade">
              <div class="transition-container-fixed" v-if="settingsModalIsOpen">
                <settings 
                  @close="toggleSettingsModal()" 
                  @active-tab-change="setSettingsActiveTab"
                  :active-tab="settingsActiveTab"
                />
              </div>
            </transition>

            <button class="btn btn-dark rounded-circle menu-btn" @click="toggleSettingsModal()">
              <font-awesome-icon size="lg" :icon="['fas', 'cog']" />
            </button>
            <button class="btn btn-dark rounded-circle menu-btn" @click="powerOff()">
              <font-awesome-icon size="lg" :icon="['fas', 'power-off']" />
            </button>
          </div>
        </div>
        <!-- Program Format, Blank, Listening Format   -->
        <div class="row mt-2">
          <div class="col text-left">
            <h5>Program Format: {{mso.status?.DECProgramFormat}}</h5>
            <div>
              {{mso.status?.DECSourceProgram}}
            </div>
          </div>
          <div class="col text-right">
            <h5>Listening Format: {{mso.status?.ENCListeningFormat}}</h5>
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
              v-long-press-up="handleVolumeDownLongPressUp"
            >
              <font-awesome-icon  :class="{'text-danger':mso.muted}" size="4x" :icon="['fas', 'volume-down']" />
            </button>
            <button 
              type="button" 
              class="btn btn-dark vol-btn" 
              v-press="handleVolumeUpPress"
              v-long-press="handleVolumeUpLongPress"
              v-long-press-up="handleVolumeUpLongPressUp"
            >
              <font-awesome-icon  :class="{'text-danger':mso.muted}" size="4x" :icon="['fas', 'volume-up']" />
            </button>
          </div>
        </div>
        <!-- Input Select -->
        <div class="row mt-2">
          <div class="col-md-12 text-center" :class="{'experimental': experimental}">
              <h5><span class="link" @click="openInputSettings">Input Select</span></h5>
              <div class="inputs-container my-3">
                <two-state-button 
                  v-for="(inp, key) in visibleInputs"
                  :key="key"
                  :button-text="inp.label"
                  :state-on="key === mso.input"
                  :home-button="true"
                  @click="setInput(key)"
                />
              </div>
          </div>
        </div>
        <!-- Upmix Select -->
        <div class="row mt-2" v-if="mso.stat.systemAudio">
          <div class="col-md-12 text-center" :class="{'experimental': experimental}">
              <h5><span class="link" @click="openSoundEnhancementSettings">Upmix Select</span></h5>
              <div class="upmix-container my-3">
                <two-state-button 
                  v-for="(upmix, key) in visibleUpmixers"
                  :key="key"
                  :button-text="upmix.label"
                  :state-on="key === mso.upmix.select"
                  :home-button="true"
                  @click="setUpmix(key)" 
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
                @click="toggleGlobalPEQ()"
              />
              <!-- Tone Control -->
              <two-state-button 
                :button-text="`Tone Control ${mso.eq?.tc ? 'on' : 'off'}`"
                :state-on="mso.eq?.tc"
                :home-button="true"
                @click="toggleToneControl()"
              />
              <!-- Loudness -->
              <two-state-button 
                :button-text="`Loudness ${mso.loudness}`" 
                :state-on="mso.loudness === 'on'" 
                :home-button="true"
                @click="toggleLoudness()"
              />
              <!-- Dialog Enhance --> 
              <two-state-button 
                :button-text="`${((((mso.status?.raw?.streamType>=33) && (mso.status?.raw?.streamType<=44) &&
                                  ((mso.status?.raw?.streamInfoBytes[0] % 32) >= 16))) ? 'DTS ' : '')}
                                  Dialog Enhance ${mso.dialogEnh == 0 ? 'off' : mso.dialogEnh  + ' dB'}` "
                :state-on="mso.dialogEnh > 0"
                :home-button="true"
                @click="setNextDtsDialogEnh()"
              />
              <!-- Night Mode -->
              <three-state-button 
                :button-text="`Night ${mso.night}`"
                :states="{'off': 0, 'on': 1, 'auto': 2}"
                :state-value="mso.night"
                :home-button="true"
                @click="setNextNightMode()"
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

import { ref, defineAsyncComponent, computed } from 'vue';
import { debounce } from 'lodash-es';

import useLocalStorage from '@/use/useLocalStorage.js';
import useMso from '@/use/useMso.js';
import useStream from '@/use/useStream.js';

import { LongPress, LongPressUp, Press } from '@/directives/Press.js';

import TwoStateButton from './TwoStateButton.vue';
import ThreeStateButton from './ThreeStateButton.vue';
import MultiStateButtonGroup from './MultiStateButtonGroup.vue';
import DiracButton from './DiracButton.vue';
import DiracButtonGroup from './DiracButtonGroup.vue';
import IpSelect from './IpSelect.vue';

// ms length required to hold button before it is considered a long press
const LONG_PRESS_THRESHOLD = 400; 

const SOUND_ENHANCEMENTS_TAB = 6;
const INPUTS_TAB = 5;
const SIGNAL_GENERATOR_TAB = 2;

export default {
  setup() {

    const { settingsActiveTab, setSettingsActiveTab } = useLocalStorage();

    const { 
      mso, setVolume, toggleMute,
      loading, calToolConnected, state,
      visibleInputs, visibleUpmixers, powerOn, setInput, setUpmix, powerOff, 
      setNextNightMode, toggleLoudness, setNextDtsDialogEnh, toggleToneControl, toggleGlobalPEQ,
      setNightOff, setNightAuto, setNightOn, setLoudnessOff, setLoudnessOn, 
      setToneControlOff, setToneControlOn, setGlobalPEQOff, setGlobalPEQOn, setDtsDialogEnh
    } = useMso();

    const experimental = computed(() => window.location.href.includes('experimental'));

    const settingsModalIsOpen = ref(false);
    // const holdingVolumeUp = ref(false);
    // const holdingVolumeDown = ref(false);

    // timeouts for detecting if the user held down
    // long enough to trigger the long press state
    let volumeUpDetectHoldingTimeout;
    let volumeDownDetectHoldingTimeout;

    // intervals for performing the actual volume adjustments
    let incrementVolumeInterval;
    let decrementVolumeInterval;

    function handleMute(e) {
      e.preventDefault();
      toggleMute();
    }

    function handleVolumeDownLongPress() {
      clearInterval(decrementVolumeInterval);
      decrementVolumeInterval = setInterval(handleVolumeDownPress, 150);
    } 

    function handleVolumeDownLongPressUp() {
      clearInterval(decrementVolumeInterval);
    }

    function handleVolumeUpLongPress () {
      clearInterval(incrementVolumeInterval);
      incrementVolumeInterval = setInterval(handleVolumeUpPress, 150);
    }

    function handleVolumeUpLongPressUp() {
      clearInterval(incrementVolumeInterval);
    }

    function handleVolumeDownPress() {
      setVolume(mso.value.volume - 1);
    }

    function handleVolumeUpPress() {
      setVolume(mso.value.volume + 1);
    }

    function toggleSettingsModal() {
      settingsModalIsOpen.value = !settingsModalIsOpen.value;
    }

    function openSignalGeneratorSettings() {
      setSettingsActiveTab(SIGNAL_GENERATOR_TAB);
      settingsModalIsOpen.value = true;
    }

    function openInputSettings() {
      setSettingsActiveTab(INPUTS_TAB);
      settingsModalIsOpen.value = true;
    }

    function openSoundEnhancementSettings() {
      setSettingsActiveTab(SOUND_ENHANCEMENTS_TAB);
      settingsModalIsOpen.value = true;
    }

    return { 
      mso, setVolume, toggleMute,
      loading, calToolConnected, state,
      visibleInputs, visibleUpmixers,
      powerOn, setInput, setUpmix, powerOff, 
      setNextNightMode, toggleLoudness, setNextDtsDialogEnh, toggleToneControl, toggleGlobalPEQ,
      ...useStream(),
      settingsModalIsOpen, toggleSettingsModal,
      settingsActiveTab, setSettingsActiveTab,
      handleVolumeDownLongPress, handleVolumeDownLongPressUp, handleVolumeUpLongPress, handleVolumeUpLongPressUp,
      handleVolumeDownPress, handleVolumeUpPress,
      handleMute, openSignalGeneratorSettings, openInputSettings, openSoundEnhancementSettings, SIGNAL_GENERATOR_TAB,
      setNightOff, setNightAuto, setNightOn,
      setLoudnessOff, setLoudnessOn,
      setToneControlOff, setToneControlOn,
      setGlobalPEQOff, setGlobalPEQOn,
      setDtsDialogEnh,
      experimental
    };
  },
  components: {
    Settings: defineAsyncComponent(() => import('./Settings.vue')),
    DiracButton,
    DiracButtonGroup,
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
    font-size:2.3rem;
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

  .vol-btn {
    background: none;
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

  .experimental::v-deep(.home-btn) {
    margin: .03125rem;
    outline: 1px solid black;
    padding: 1rem;
  }

  .link {
    cursor: pointer;
  }

</style>
