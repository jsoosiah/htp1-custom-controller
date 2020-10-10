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
    <router-link to="/experimental/settings/macros" class="sgen-on-warning">
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
      <nav class="navbar navbar-expand px-0" style="z-index:1">
        <ul class="navbar-nav mr-auto">
        <li class="nav-item">
        <router-link 
          class="nav-link px-0"
          to="/experimental"
        >
          <font-awesome-icon size="lg" :icon="['fas', 'home']" />
          <label>Home</label>
        </router-link>
        </li>
        </ul>
        <button 
          class="navbar-toggler" 
          type="button" 
          data-toggle="collapse" 
          data-target="#navbarSupportedContent" 
          aria-controls="navbarSupportedContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav ml-auto">

            <li class="nav-item" v-for="route in filteredSettingsRoutes" :key="route.path">
              <router-link
                class="nav-link"
                :class="{'active': $route.path === `/experimental/settings/${route.path}`}"
                :to="`/experimental/settings/${route.path}`"
              >
                <component :is="route.meta.icon" /> 
              </router-link>
            </li>
            <li class="nav-item">
              <a class="nav-link" @click="powerOff">
                <font-awesome-icon size="lg" :icon="['fas', 'power-off']" />
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

import { computed } from 'vue';

import { settingsRoutes } from '@/router.js';

import useMso from '@/use/useMso.js';

import ExperimentalHome from './components/ExperimentalHome.vue';
import IpSelect from './components/IpSelect.vue';

import CalibrationIcon from './components/icons/CalibrationIcon';
import PeqIcon from './components/icons/PeqIcon';
import ToneControlIcon from './components/icons/ToneControlIcon';
import InputsIcon from './components/icons/InputsIcon';
import NetworkIcon from './components/icons/NetworkIcon';
import SgenIcon from './components/icons/SgenIcon';
import SpeakersIcon from './components/icons/SpeakersIcon';
import SystemIcon from './components/icons/SystemIcon';
import UpmixIcon from './components/icons/UpmixIcon';
import MacrosIcon from './components/icons/MacrosIcon';
import AboutIcon from './components/icons/AboutIcon';
import HelpIcon from './components/icons/HelpIcon';

export default {
  name: 'ExperimentalApp',
  components: {
    ExperimentalHome,
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
    AboutIcon,
    HelpIcon,
  },
  setup() {

    const filteredSettingsRoutes = computed(() => 
      settingsRoutes.filter(route => 
        route.path === 'calibration' || route.path === 'peq' || route.path === 'tone-control' || route.path === 'about'
      )
    );

    return { filteredSettingsRoutes, ...useMso() };
  }
}
</script>

<style>
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

  .hiding {
    transition: opacity 0.1s ease;
    opacity: 0;
  }

  .showing {
    transition: opacity 0.1s ease;
    opacity: 1;
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

  .navbar a label {
    text-transform: uppercase;
    font-size: .8rem;
    font-weight: 600;
    padding-left:.4rem;
    cursor: pointer;
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
</style>
