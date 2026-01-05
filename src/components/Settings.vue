<template>
  <div class="container">
    <div class="background-settings" />
    <div class="row">
      <nav
        id="sidebarMenu"
        class="col-md-3 col-lg-2 d-md-block sidebar collapse nav-pills"
        :class="{'bg-dark': darkMode, 'bg-light': !darkMode}"
      >
        <div class="sidebar-sticky">
          <ul class="nav flex-column">
            <li class="nav-item">
              <router-link 
                class="nav-link"
                to="/"
              >
                <home-icon style="margin-top:-2px" />
                Home
              </router-link>
            </li>
            <li 
              v-for="(tab) in settingsRoutes"
              :key="tab.path"
              class="nav-item"
            >
              <template v-if="tab.meta?.icon">
                <router-link 
                  class="nav-link" 
                  :class="{'active': `/settings/${tab.path}` === $route.path}" 
                  :to="tab.path"
                >
                  <component 
                    :is="tab.meta?.icon"
                    style="margin-top:-2px"
                  /> {{ tab.meta?.label }}
                </router-link>
              </template>
              <template v-else>
                <hr>
              </template>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                href="javascript:void(0)"
                @click="powerOff"
              >
                <power-icon style="margin-top:-2px" /> Power Off
              </a>
            </li>
          </ul>
        </div>
      </nav>
      <main
        role="main"
        class="col-md-9 ml-sm-auto col-lg-10 px-md-3"
      >
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script>

import { settingsRoutes } from '@/router.js';
import useLocalStorage from '@/use/useLocalStorage.js';

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
import SystemIcon from './icons/SystemIcon.vue';
import ConfigsIcon from './icons/ConfigsIcon.vue';
import UpmixIcon from './icons/UpmixIcon.vue';
import MacrosIcon from './icons/MacrosIcon.vue';
import PersonalizeIcon from './icons/PersonalizeIcon.vue';
import AboutIcon from './icons/AboutIcon.vue';
import HelpIcon from './icons/HelpIcon.vue';
import PowerIcon from './icons/PowerIcon.vue';
import VolumeIcon from './icons/VolumeIcon.vue';

export default {
  name: 'Settings',
  components: {
    HomeIcon,
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
  emits: ['power-dialog'],
  setup(props, { emit }) {

    const { darkMode } = useLocalStorage();

    function powerOff() {
      emit('power-dialog');
    }

    return { settingsRoutes, powerOff, darkMode };
  },
}
</script>

<style scoped>

  div.background-settings {
    background-color: var(--settings-background);
    width:100vw;
    height:100vh;
    position:fixed;
    top:0;
    left:0;
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

  .sidebar .active svg {
    fill: white;
    /* stroke: white; */
  }

  .sidebar svg {
    /* fill: gray; */
    /* fill:#007bff; */
    /* stroke:#007bff; */
    /* max-width: 1.5rem; */
    /* max-height: 1.5rem; */
  }

  .sidebar a {
    /* fill: gray; */
    /* color:#007bff; */
  }

  .nav-link {
    text-transform: uppercase;
    font-size: .8rem;
    font-weight: 600;
    padding:0.5rem 0.675rem;
    border-radius: 0;
  }

  .sidebar {
    padding: 0;
  }

  ::v-deep(.btn) {
    text-transform: uppercase;
    font-weight: 600;
  }

  ::v-deep(.numeric-input) {
    width: 7.5rem;
  }

  ::v-deep(.numeric-input) input {
    text-align: right;
  }

</style>