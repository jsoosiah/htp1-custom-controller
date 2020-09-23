<template>
    <div v-if="loading" class="loading-indicator">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div class="fixed-top text-center" style="z-index: 9999999999999999" v-if="mso?.sgen?.sgensw === 'on'">
      <span class="sgen-on-warning">Signal Generator On</span>
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
            <span class="current-input-label">{{mso.inputs[mso.input].label}}</span>
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
            <h5>Program Format: {{mso.status.DECProgramFormat}}</h5>
            <div>
              {{mso.status.DECSourceProgram}}
            </div>
          </div>
          <div class="col text-right">
            <h5>Listening Format: {{mso.status.ENCListeningFormat}}</h5>
            <!-- Surround Mode -->
            <!--             <h5>Surround Mode</h5>      -->
            <!--             <div>{{mso.status.SurroundMode}}</div>   -->
            <div>
                {{mso.status.SurroundMode}}
            </div>
          </div>
        </div>
        <!-- Program Format Logo, Volumn Text, Listening Format Logo -->
        <div class="row mt-2">
          <div class="col text-left">
            <img v-if="streamTypeIcon(mso.status)" class="fillheight" :src="require(`@/assets/${streamTypeIcon(mso.status)}`)+'#svgView(preserveAspectRatio(xMinYMin))'">
          </div>
          <div class="col-auto text-center">
            <span class="vol-display" :class="{'text-danger':mso.muted}" @click="toggleMute()">{{mso.volume}} dB</span>
          </div>
          <div class="col text-right">
            <img v-if="upmixerIcon(mso.status)" class="fillheight float-right" :src="require(`@/assets/${upmixerIcon(mso.status)}`)+'#svgView(preserveAspectRatio(xMaxYMax))'">
          </div>
        </div>
        <!-- Volume Buttons -->
        <div class="row mt-2">
          <div class="col-md-12 text-center">
            <button type="button" class="btn btn-dark vol-btn" @click="setVolume(mso.volume - 1)">
              <font-awesome-icon  :class="{'text-danger':mso.muted}" size="4x" :icon="['fas', 'volume-down']" />
            </button>
            <button type="button" class="btn btn-dark vol-btn" @click="setVolume(mso.volume + 1)">
              <font-awesome-icon  :class="{'text-danger':mso.muted}" size="4x" :icon="['fas', 'volume-up']" />
            </button>
          </div>
        </div>
        <!-- Input Select -->
        <div class="row mt-2">
          <div class="col-md-12 text-center">
              <h5>Input Select</h5>
              <two-state-button 
                v-for="(inp, key) in visibleInputs"
                :button-text="inp.label"
                :state-on="key === mso.input"
                :home-button="true"
                @click="setInput(key)"
              />
          </div>
        </div>
        <!-- Upmix Select -->
        <div class="row mt-2" v-if="mso.stat.systemAudio">
          <div class="col-md-12 text-center">
              <h5>Upmix Select</h5>
              <two-state-button 
                v-for="(upmix, key) in visibleUpmixers"
                :button-text="upmix.label"
                :state-on="key === mso.upmix.select"
                :home-button="true"
                @click="setUpmix(key)" 
              />
          </div>
        </div>
        <!-- Modes -->
        <div class="row mt-2">
          <div class="col-md-12 text-center">
              <h5>Modes</h5>
              <!-- Night Mode -->
              <three-state-button 
                :button-text="`Night ${mso.night}`"
                :states="{'off': 0, 'on': 1, 'auto': 2}"
                :state-value="mso.night"
                :home-button="true"
                @click="setNextNightMode()"
              />
              <!-- Dirac -->
              <dirac-button 
                :home-button="true"
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
              <!-- Tone Control -->
              <two-state-button 
                :button-text="`Tone Control ${mso.eq?.tc ? 'on' : 'off'}`"
                :state-on="mso.eq?.tc"
                :home-button="true"
                @click="toggleToneControl()"
              />
              <!-- PEQ -->
              <two-state-button 
                :button-text="`PEQ ${mso.peq?.peqsw ? 'on' : 'off'}`"
                :state-on="mso.peq?.peqsw"
                :home-button="true"
                @click="toggleGlobalPEQ()"
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

import { ref } from 'vue';

import useLocalStorage from '@/use/useLocalStorage.js';
import useMso from '@/use/useMso.js';
import useStream from '@/use/useStream.js';

import Settings from './Settings.vue';
import TwoStateButton from './TwoStateButton.vue';
import ThreeStateButton from './ThreeStateButton.vue';
import DiracButton from './DiracButton.vue';
import IpSelect from './IpSelect.vue';

export default {
  setup() {

    const { settingsActiveTab, setSettingsActiveTab } = useLocalStorage();

    const settingsModalIsOpen = ref(false);

    function toggleSettingsModal() {
      settingsModalIsOpen.value = !settingsModalIsOpen.value;
    }

    function setActiveTab(tab) {
      activeTab.value = tab;
    }

    return { 
      ...useMso(), ...useStream(),
      settingsModalIsOpen, toggleSettingsModal,
      settingsActiveTab, setSettingsActiveTab
    };
  },
  components: {
    Settings,
    DiracButton,
    TwoStateButton,
    ThreeStateButton,
    IpSelect,
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
    font-size:2rem;
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

</style>
