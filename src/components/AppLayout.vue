<template>
  <div
    v-if="loading"
    class="loading-indicator"
  >
    <div
      class="spinner-border text-primary"
      role="status"
    >
      <span class="sr-only">Loading...</span>
    </div>
  </div>
  <div
    v-if="isDemoMode"
    class="fixed-top mx-auto"
  >
    <a
      class="sgen-on-warning"
      @click="exitDemoMode()"
    >Currently in Demo Mode - Click to Exit</a>
  </div>
  <div
    v-if="mso?.sgen?.sgensw === 'on'"
    class="fixed-top mx-auto"
  >
    <router-link
      class="sgen-on-warning"
      to="/settings/signal-generator"
    >
      Signal Generator On <font-awesome-icon :icon="['fas', 'external-link-alt']" />
    </router-link>
  </div>
  <div
    v-if="calToolConnected"
    class="fixed-top mx-auto"
  >
    <span class="sgen-on-warning">Dirac Calibration in Progress - Currently in Readonly Mode</span>
  </div>
  <div
    v-if="diracFilterTransferInProgress"
    class="connecting-overlay"
  >
    <filter-transfer-in-progress />
  </div>
  <div
    v-if="currentlyRecordingSlot"
    class="fixed-top mx-auto"
  >
    <router-link
      to="/settings/macros"
      class="sgen-on-warning"
    >
      Currently Recording - {{ currentlyRecordingSlot }} <font-awesome-icon :icon="['fas', 'external-link-alt']" />
    </router-link>
  </div>
  <div
    v-if="debouncedState !== 'OPEN'"
    class="connecting-overlay"
  >
    <ip-select :focus="state !== 'OPEN'" />
  </div>
  <div v-if="btRequestDetails?.type === 'requestconfirmation'">
    <bluetooth-pairing-request />
  </div>
  <template v-if="mso?.stat?.updateprogmsg.updating !== undefined && mso?.stat?.updateprogmsg.updating">
    <div class="container">
      <div class="row pt-5">
        <div class="col-md-12 text-center">
          <h1
            v-if="mso.stat.updateprogmsg.title !== undefined"
            class="standby-msg"
          >
            {{ mso.stat.updateprogmsg.title }}
          </h1>
          <h1
            v-else
            class="standby-msg"
          >
            System Update in Progress
          </h1>
        </div>
      </div>
      <div class="row pt-5">
        <div class="col-md-12 text-center">
          <div
            class="progress"
            style="height:4px;"
          >
            <div
              class="progress-bar progress-bar-striped"
              role="progressbar"
              :style="{width: `${mso.stat.updateprogmsg.percent}%`}"
              :aria-valuenow="mso.stat.updateprogmsg.percent"
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      </div>
      <div class="row pt-5">
        <div class="col-md-12 text-center">
          <h2 class="standby-msg">
            {{ mso.stat.updateprogmsg.msg }}
          </h2>
        </div>
      </div>
    </div>
  </template>
  <template v-else-if="!mso?.powerIsOn">
    <div class="container">
      <div class="row pt-5">
        <div class="col-md-12 text-center">
          <p class="standby-msg">
            Unit is in standby mode. Click below to power on.
          </p>
          <button
            class="btn btn-dark rounded-circle menu-btn"
            @click="powerOn()"
          >
            <font-awesome-icon
              size="lg"
              :icon="['fas', 'power-off']"
            />
          </button>
        </div>
      </div>
      <div class="row justify-content-center pt-5">
        <div class="col-auto text-center">
          <h5 class="text-muted">
            Quick Links
          </h5>
          <ul>
            <li>
              <a
                target="_blank"
                :href="`http://${websocketIp}/history.html`"
              >View Release History and Perform Updates</a>
            </li>
            <li>
              <a
                target="_blank"
                :href="`http://${websocketIp}/feedback`"
              >Submit Feedback</a>
            </li>
            <li>
              <a
                target="_blank"
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
              >
                User Manual
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <div 
      v-if="showPowerDialog" 
      class="connecting-overlay"
      @click.self="toggleShowPowerDialog(true)"
    >
      <power-dialog
        :personalize="personalizePowerDialog"
        @click.self="toggleShowPowerDialog(true)"
        @cancel="toggleShowPowerDialog(true)"
      />
    </div>
    <div
      class="container"
      style="z-index:1"
    >
      <nav
        class="navbar p-0"
        style="z-index:1"
      >
        <ul
          class="navbar-nav mr-auto"
          :class="{'shortcut-nav': isMobileMode}"
        >
          <!-- If desktop mode -->
          <!-- If desktop mode home screen, hamburger button goes directly to settings --> 
          <li 
            v-if="!isMobileMode"
            class="nav-item shortcut-icon px-0"
            :class="[$route.path !== '/' ? ['d-xl-none', 'd-lg-none', 'd-md-none'] : '' ]"
          >
            <!-- class="d-xl-none d-lg-none d-md-none" -->
            <router-link 
              class="settings-status"
              :to="`/settings/${settingsRoutes[1].path}`"
            >
              <font-awesome-icon
                size="lg"
                :icon="['fas', 'cog']"
              /> Settings
            </router-link>
          </li>
          <!-- If desktop mode settings, show status and click to go home --> 
          <li 
            class="small text-muted"
            :class="[$route.path === '/' ? 'd-none' : ['d-none', 'd-md-block'] ]"
          >
            <router-link 
              class="settings-status"
              to="/"
            >
              {{ displayVolume }} dB &middot; {{ mso.inputs && mso.inputs[mso.input].label }} &middot; {{ mso.upmix && upmixLabels[mso.upmix.select] }}
            </router-link>
          </li>
          <!-- If mobile mode, always show hamburger button menu --> 
          <!-- Hamburger menu --> 
          <li 
            v-if="isMobileMode"
            class="nav-item shortcut-icon px-0"
            :class="[$route.path !== '/' ? ['d-xl-none', 'd-lg-none', 'd-md-none'] : '' ]"
          >
            <!-- class="d-xl-none d-lg-none d-md-none" -->
            <button 
              class="navbar-toggler" 
              type="button" 
              data-toggle="collapse" 
              data-target="#navbarSupportedContent" 
              aria-controls="navbarSupportedContent" 
              aria-expanded="false" 
              aria-label="Toggle navigation"
              @click="toggleShowMobileMenu"
            >
              <span class="navbar-toggler-icon" />
            </button>
          </li>
          <li
            v-if="isMobileMode"
            class="small text-muted shortcut-icon"
          >
            <router-link 
              class="settings-status"
              to="/"
            >
              {{ displayVolume }} dB &middot; {{ mso.inputs && mso.inputs[mso.input].label }} &middot; {{ mso.upmix && upmixLabels[mso.upmix.select] }}
            </router-link>
          </li>
        </ul>
        <!-- Shortcut icons --> 
        <nav class="navbar navbar-expand-lg">
          <ul class="navbar-nav ml-auto shortcut-nav">
            <li
              v-if="mso.personalize?.shortcuts.home"
              class="nav-item shortcut-icon"
            >
              <router-link 
                class="nav-link"
                to="/"
              >
                <home-icon />
              </router-link>
            </li>
            <li
              v-for="route in filteredSettingsRoutes"
              :key="route.path"
              class="nav-item shortcut-icon"
            >
              <router-link
                class="nav-link"
                :class="{'active': $route.path === `/settings/${route.path}`}"
                :to="`/settings/${route.path}`"
              >
                <component
                  :is="route.meta?.icon"
                  v-if="route.meta?.icon"
                /> 
              </router-link>
            </li>
            <li
              v-if="mso.personalize?.shortcuts.power"
              class="nav-item shortcut-icon dropdown"
            >
              <a
                class="nav-link"
                @click="toggleShowPowerDialog(true)"
              >
                <power-icon />
              </a>
            </li>
          </ul>
        </nav>

        <!-- Full navigation menu for mobile --> 
        <div
          id="navbarSupportedContent"
          class="collapse navbar-collapse"
          :class="{show: showMobileMenu}"
        >
          <ul
            class="navbar-nav ml-auto nav-pills"
            :class="{'full-nav': $route.path !== '/'}"
          >
            <li class="nav-item">
              <router-link 
                class="nav-link"
                :class="{'home-active': $route.path === '/'}"
                to="/"
              >
                <home-icon />
                Home
              </router-link>
            </li>
            <li
              v-for="route in settingsRoutes"
              :key="route.path"
              class="nav-item"
            >
              <router-link
                class="nav-link"
                :class="{'active': $route.path === `/settings/${route.path}`}"
                :to="`/settings/${route.path}`"
              >
                <component
                  :is="route.meta?.icon"
                  v-if="route.meta?.icon"
                /> {{ route.meta?.label }}
              </router-link>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                @click="toggleShowPowerDialog(false)"
              >
                <power-icon /> Power Off
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
    <router-view v-slot="{ Component }">
      <transition
        name="mfade"
        mode="out-in"
      >
        <keep-alive>
          <component 
            :is="Component" 
            @power-dialog="toggleShowPowerDialog(false)"
          />
        </keep-alive>
      </transition>
    </router-view>
  </template>
</template>

<script>

import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

import { settingsRoutes } from '@/router.js';

import useMso from '@/use/useMso.js';
import useWebSocket from '@/use/useWebSocket.js';
import useResponsive from '@/use/useResponsive.js';
import useLocalStorage from "@/use/useLocalStorage.js";
import useBluetoothManager from '@/use/useBluetoothManager.js';

import IpSelect from './IpSelect.vue';
import FilterTransferInProgress from './FilterTransferInProgress.vue';
import BluetoothPairingRequest from './BluetoothPairingRequest.vue';
import PowerDialog from './PowerDialog.vue';

import HomeIcon from './icons/HomeIcon.vue';
import CalibrationIcon from './icons/CalibrationIcon.vue';
import FilteredBassEqIcon from './icons/FilteredBassEqIcon.vue';
import PeqIcon from './icons/PeqIcon.vue';
import ToneControlIcon from './icons/ToneControlIcon.vue';
import LoudnessIcon from './icons/LoudnessIcon.vue';
import InputsIcon from './icons/InputsIcon.vue';
import NetworkIcon from './icons/NetworkIcon.vue';
import SgenIcon from './icons/SgenIcon.vue';
import SpeakersIcon from './icons/SpeakersIcon.vue';
import PersonalizeIcon from './icons/PersonalizeIcon.vue';
import SystemIcon from './icons/SystemIcon.vue';
import ConfigsIcon from './icons/ConfigsIcon.vue';
import UpmixIcon from './icons/UpmixIcon.vue';
import MacrosIcon from './icons/MacrosIcon.vue';
import AboutIcon from './icons/AboutIcon.vue';
import HelpIcon from './icons/HelpIcon.vue';
import PowerIcon from './icons/PowerIcon.vue';
import VolumeIcon from './icons/VolumeIcon.vue';

export default {
  name: 'App',
  components: {
    HomeIcon,
    IpSelect,
    FilterTransferInProgress,
    BluetoothPairingRequest,
    PowerDialog,
    CalibrationIcon,
    PeqIcon,
    ToneControlIcon,
    LoudnessIcon,
    InputsIcon,
    NetworkIcon,
    SgenIcon,
    SpeakersIcon,
    SystemIcon,
    UpmixIcon,
    MacrosIcon,
    PersonalizeIcon,
    AboutIcon,
    HelpIcon,
    PowerIcon,
    ConfigsIcon,
    VolumeIcon,
    FilteredBassEqIcon,
  },
  setup() {

    const { mso, state } = useMso();
    const { findServers, websocketIp, setWebsocketIp } = useWebSocket();
    const { windowWidth, isMobileMode } = useResponsive();
    const { userCss, darkMode, isDemoMode } = useLocalStorage();
    const route = useRoute();

    const showMobileMenu = ref(false);
    const showPowerDialog = ref(false);

    const personalizePowerDialog = ref(false);
    
    function onInput() {
      console.log('oninput', this.scrollHeight);
      this.style.height = "auto";
      this.style.height = (this.scrollHeight) + "px";
    }

    function initializeTextAreas() {
      setTimeout(() => {
        // auto resize textareas
        const tx = document.querySelectorAll("textarea");
        console.log('initializeTextAreas', tx.length);
        for (let i = 0; i < tx.length; i++) {
          tx[i].removeEventListener("input", onInput);
          tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
          tx[i].addEventListener("input", onInput);
        }
      }, 100);
    }

    onMounted(() => {
      updateWindowWidth();
      window.addEventListener('resize', updateWindowWidth);

      if (!websocketIp.value) {
        
        let ipv4Regex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;

        // Check if the current URL contains an IPv4 address
        let match = window.location.href.match(ipv4Regex);

        // If there's a match, connect to that IP
        if (match) {
          let ipAddress = match[0];
          websocketIp.value = ipAddress;
        } else {
          findServers(80, '192.168.1.', 2, 255, 20, 4000);
        }
      }

      initializeTextAreas();
    });

    onUnmounted(() => {
      window.removeEventListener('resize', updateWindowWidth);
    });

    watch(
      () => route.path,
      async newPath => {
        setTimeout(() => {
          showMobileMenu.value = false;
          initializeTextAreas();
        }, 100);
      }
    );

    watch(state, () => {
      if (state.value === 'OPEN') {
        window.ipcRenderer?.send('connected', true);
        initializeTextAreas();
      } else {
        window.ipcRenderer?.send('connected', false);
      }
    });

    watch(
      userCss,
      () => {
        const style = document.getElementById('user-css');
        if (style) {
          console.log('userCss', userCss.value);
          style.innerHTML = userCss.value;
        }
        
      },
      {
        immediate: true,
      }
    )

    watch(
      darkMode,
      () => {
        console.log('dm watch', darkMode.value);
        if (darkMode.value) {
          document.documentElement.setAttribute('data-theme', 'darkMode'); // sets the data-theme attribute
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      },
      {
        immediate: true,
      }
    )

    function updateWindowWidth() {
      windowWidth.value = window.innerWidth;
    }

    function toggleShowMobileMenu() {
      showMobileMenu.value = !showMobileMenu.value;
    }

    function toggleShowPowerDialog(personalize) {
      console.log('toggleShowPowerDialog', personalize)
      personalizePowerDialog.value = personalize;
      showPowerDialog.value = !showPowerDialog.value;
    }

    function exitDemoMode() {
      setWebsocketIp('');
      findServers(80, '192.168.1.', 2, 255, 20, 4000);
    }

    const filteredSettingsRoutes = computed(() => 
      settingsRoutes.filter(route => 
        mso.value.personalize && mso.value.personalize.shortcuts[route.path]
      )
    );

    const debouncedState = ref(state.value);

    let setDebouncedStateTimeout = null;

    watch(
      state,
      () => {
        if (state.value === 'OPEN')  {
          // only update state with OPEN after the 
          // connection has stayed open for 250 ms
          setDebouncedStateTimeout = setTimeout(() => {
            debouncedState.value = state.value;
          }, 250);
        } else {
          debouncedState.value = state.value;
          clearTimeout(setDebouncedStateTimeout);
        }
      }
    );

    return { settingsRoutes, filteredSettingsRoutes, showMobileMenu, 
      showPowerDialog, toggleShowPowerDialog, personalizePowerDialog,
      toggleShowMobileMenu, isMobileMode, ...useMso(), ...useBluetoothManager(), 
      websocketIp, userCss, debouncedState, isDemoMode, exitDemoMode,
    };
  }
}
</script>

<style scoped>

  .nav-link {
    text-transform: uppercase;
    font-size: .8rem;
    font-weight: 600;
    padding:0.5rem 0.675rem;
    border-radius: 0;
  }

  .shortcut-icon .nav-link {
    padding-left:0;
    padding-right:0;
  }

  div.home {
    color:#dedad6;
    background-color: black;
  }

  .home svg {
    fill:rgba(255,255,255,.5);
  }

  .settings svg {
    fill: rgba(0,0,0,.5);
  }

  .navbar .active svg {
    fill: black;
  }

  .navbar .active {
    color: black;
  }

  .connecting-overlay {
    width:200%;
    height:200%;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
    position:fixed;
    top:0;
    left:0;
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
    color:magenta;
  }

  .navbar {
    background-color:rgba(0,0,0,0);
    z-index:0;
  }

  .navbar a {
    color: gray;
  }

  .navbar a label, .nav-item {
    text-transform: uppercase;
    font-size: .8rem;
    font-weight: 600;
    padding-left:.4rem;
    cursor: pointer;
  }

  .nav-item svg {
    fill: gray;
  }

  .navbar.navbar-expand svg {
    fill:gray;
  }

  .navbar-light svg {
    /* fill: gray; */
    fill:#007bff;
  }

  .navbar-light a {
    /* fill: gray; */
    color:#007bff;
  }

  .fixed-top {
    max-width: 14rem;
    /* width:auto; */
    /* background: rgba(255,0,0,.5); */
    text-align:center;
  }

  .menu-btn {
    min-height:3.5rem;
    min-width: 3.5rem;
    margin-left: 1rem;
  }

  .standby-msg {
    color: #dedad6;
  }

  .navbar-toggler {
    padding-left:0rem;
    padding-right:0;
  }

  .navbar-toggler-icon {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28128, 128, 128, 1%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
    background-position: 50% 50%;
    background-attachment: scroll;
    background-clip: border-box;
    background-color: rgba(0, 0, 0, 0);
    background-origin: padding-box;
    background-position: 50% 50%;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    /* padding-left: .5rem; */
    /* padding-right:0; */
    width: 24px;
  }

  .shortcut-nav {
    flex-direction: row;
    align-items: center;
  }

  .nav-item {
    padding:0;
  }

  .shortcut-icon {
    padding: 0rem .5rem;
  }

  .full-nav .active svg {
    fill: white;
  }

  .full-nav svg {
    /* fill: gray; */
    /* fill:#007bff; */
  }

  .full-nav a {
    /* fill: gray; */
    /* color:#007bff; */
  }

  .full-nav a.active {
    /* fill: gray; */
    color:white;
  }

  .settings-status:hover {
    text-decoration: none;
  }

  a.home-active {
    color:white;
  }

  a.home-active svg {
    fill: white;
  }

  ul {
    list-style-type: none;
    padding-left: 0;
  }

</style>
