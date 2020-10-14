<template>
  <div v-if="loading" class="loading-indicator">
    <div class="spinner-border text-primary" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>
  <div class="fixed-top mx-auto" style="z-index: 9999999999999999" v-if="mso?.sgen?.sgensw === 'on'">
    <a class="sgen-on-warning" @click="openSettingsToTab(SIGNAL_GENERATOR_TAB)">
      Signal Generator On <font-awesome-icon  :icon="['fas', 'external-link-alt']" />
    </a>
  </div>
  <div class="fixed-top mx-auto" style="z-index: 9999999999999999" v-if="calToolConnected">
    <span class="sgen-on-warning">Dirac Calibration in Progress - Currently in Readonly Mode</span>
  </div>
  <div class="fixed-top mx-auto" style="z-index: 9999999999999999" v-if="currentlyRecordingSlot">
    <router-link to="/settings/macros" class="sgen-on-warning">
      Currently Recording - {{currentlyRecordingSlot}} <font-awesome-icon  :icon="['fas', 'external-link-alt']" />
    </router-link>
  </div>
  <div v-if="state !== 'OPEN'" class="connecting-overlay">
    <ip-select />
  </div>
  <template v-if="!mso?.powerIsOn">
    <div class="container">
      <div class="row mt-5">
        <div class="col-md-12 text-center">
          <p class="standby-msg">Unit is in standby mode. Click below to power on.</p>
          <button class="btn btn-dark rounded-circle menu-btn" @click="powerOn()">
            <font-awesome-icon size="lg" :icon="['fas', 'power-off']" />
          </button>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="container" style="z-index:1">
      <nav class="navbar px-0 pt-0" style="z-index:1">
        <ul class="navbar-nav mr-auto">
          <!-- If desktop mode -->
          <!-- If desktop mode home screen, hamburger button goes directly to settings --> 
          <li 
            class="nav-item shortcut-icon px-0"
            :class="[$route.path !== '/' ? ['d-xl-none', 'd-lg-none', 'd-md-none'] : '' ]"
            v-if="!isMobileMode"
          > <!-- class="d-xl-none d-lg-none d-md-none" -->
            <router-link 
              class="settings-status"
              :to="`/settings/${settingsRoutes[0].path}`"
            >
              <font-awesome-icon size="lg" :icon="['fas', 'cog']" /> Settings
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
              {{mso.volume}} dB &middot; {{mso.inputs && mso.inputs[mso.input].label}} &middot; {{mso.upmix && upmixLabels[mso.upmix.select]}}
            </router-link>
          </li>
          <!-- If mobile mode, always show hamburger button menu --> 
          <!-- Hamburger menu --> 
          <li 
            class="nav-item shortcut-icon px-0"
            :class="[$route.path !== '/' ? ['d-xl-none', 'd-lg-none', 'd-md-none'] : '' ]"
            v-if="isMobileMode"
          > <!-- class="d-xl-none d-lg-none d-md-none" -->
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
              <span class="navbar-toggler-icon"></span>
            </button>
          </li>
        </ul>
        <!-- Shortcut icons --> 
        <div>
          <ul class="navbar-nav ml-auto shortcut-nav">
            <li class="nav-item shortcut-icon" v-if="mso.personalize?.shortcuts.home">
              <router-link 
                class="nav-link"
                to="/"
              >
                <home-icon />
              </router-link>
            </li>
            <li class="nav-item shortcut-icon" v-for="route in filteredSettingsRoutes" :key="route.path">
              <router-link
                class="nav-link"
                :class="{'active': $route.path === `/settings/${route.path}`}"
                :to="`/settings/${route.path}`"
              >
                <component :is="route.meta.icon" /> 
              </router-link>
            </li>
            <li class="nav-item shortcut-icon" v-if="mso.personalize?.shortcuts.power">
              <a class="nav-link" @click="powerOff">
                <power-icon />
              </a>
            </li>
          </ul>
        </div>

        <!-- Full navigation --> 
        <div class="collapse navbar-collapse" :class="{show: showMobileMenu}" id="navbarSupportedContent">
          <ul class="navbar-nav ml-auto nav-pills" :class="{'full-nav': $route.path !== '/'}">
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
            <li class="nav-item" v-for="route in settingsRoutes" :key="route.path">
              <router-link
                class="nav-link"
                :class="{'active': $route.path === `/settings/${route.path}`}"
                :to="`/settings/${route.path}`"
              >
                <component :is="route.meta.icon" /> {{route.meta.label}}
              </router-link>
            </li>
            <li class="nav-item">
              <a class="nav-link" @click="powerOff">
                <power-icon /> Power Off
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
    <router-view v-slot="{ Component }">
      <transition name="mfade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </template>
</template>

<script>

import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

import { settingsRoutes } from '@/router.js';

import useMso from '@/use/useMso.js';

import IpSelect from './IpSelect.vue';

import HomeIcon from './icons/HomeIcon';
import CalibrationIcon from './icons/CalibrationIcon';
import PeqIcon from './icons/PeqIcon';
import ToneControlIcon from './icons/ToneControlIcon';
import InputsIcon from './icons/InputsIcon';
import NetworkIcon from './icons/NetworkIcon';
import SgenIcon from './icons/SgenIcon';
import SpeakersIcon from './icons/SpeakersIcon';
import PersonalizeIcon from './icons/PersonalizeIcon';
import SystemIcon from './icons/SystemIcon';
import UpmixIcon from './icons/UpmixIcon';
import MacrosIcon from './icons/MacrosIcon';
import AboutIcon from './icons/AboutIcon';
import HelpIcon from './icons/HelpIcon';
import PowerIcon from './icons/PowerIcon';

export default {
  name: 'App',
  components: {
    HomeIcon,
    IpSelect,
    CalibrationIcon,
    PeqIcon,
    ToneControlIcon,
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
  },
  setup() {

    const { mso } = useMso();
    const route = useRoute();

    const showMobileMenu = ref(false);
    const windowWidth = ref(0);

    onMounted(() => {
      updateWindowWidth();
      window.addEventListener('resize', updateWindowWidth);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', updateWindowWidth);
    });

    const isMobileMode = computed(() => {
      return windowWidth.value <= 768; // break point px width for mobile
    });

    watch(
      () => route.path,
      async newPath => {
        setTimeout(() => {
          showMobileMenu.value = false;
        }, 100);
      }
    );

    function updateWindowWidth() {
      windowWidth.value = window.innerWidth;
    }

    function toggleShowMobileMenu() {
      showMobileMenu.value = !showMobileMenu.value;
    }

    const filteredSettingsRoutes = computed(() => 
      settingsRoutes.filter(route => 
        mso.value.personalize && mso.value.personalize.shortcuts[route.path]
      )
    );

    return { settingsRoutes, filteredSettingsRoutes, showMobileMenu, toggleShowMobileMenu, isMobileMode, ...useMso() };
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
    /* max-width: 400px; */
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
    fill:#007bff;
  }

  .full-nav a {
    /* fill: gray; */
    color:#007bff;
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

</style>
