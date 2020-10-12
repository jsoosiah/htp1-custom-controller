<template>
  <div class="container">
    <div class="background-light"></div>
     <div class="row">
      <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse nav-pills">
        <div class="sidebar-sticky">
          <ul class="nav flex-column">
            <li 
              class="nav-item"
              v-for="(tab) in settingsRoutes"
              :key="tab.path"
            >
              <router-link 
                class="nav-link" 
                :class="{'active': `/experimental/settings/${tab.path}` === $route.path}" 
                :to="tab.path"
              >
                <component :is="tab.meta.icon"></component> {{tab.meta.label}}
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
      <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
        <router-view v-slot="{ Component, route }">
          <keep-alive v-if="route.meta.keepAlive !== false">
            <component :is="Component" />
          </keep-alive>
          <component 
            v-if="route.meta.keepAlive === false"
            :is="Component" 
          />
        </router-view>
      </main>
    </div>
  </div>
</template>

<script>

import { ref } from 'vue';

import { settingsRoutes } from '@/router.js';

import useMso from '@/use/useMso.js';

import CalibrationIcon from './icons/CalibrationIcon';
import PeqIcon from './icons/PeqIcon';
import ToneControlIcon from './icons/ToneControlIcon';
import InputsIcon from './icons/InputsIcon';
import NetworkIcon from './icons/NetworkIcon';
import SgenIcon from './icons/SgenIcon';
import SpeakersIcon from './icons/SpeakersIcon';
import SystemIcon from './icons/SystemIcon';
import UpmixIcon from './icons/UpmixIcon';
import MacrosIcon from './icons/MacrosIcon';
import AboutIcon from './icons/AboutIcon';
import HelpIcon from './icons/HelpIcon';
import PowerIcon from './icons/PowerIcon';

export default {
  name: 'ExperimentalSettings',
  setup() {

    const { powerOff } = useMso();

    return { settingsRoutes, powerOff };
  },
  components: {
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
    PowerIcon,
  }
}
</script>

<style scoped>
  div.container {
    /* background-color: white; */
  }

  div.background-light {
    background-color: white;
    width:100vw;
    height:100vh;
    position:fixed;
    top:0;
    left:0;
    z-index: -1;
  }

  .mfade-enter-active,
  .mfade-leave-active {
    transition: opacity .1s ease;
    z-index: 0;
  }

  .mfade-enter-from,
  .mfade-leave-to {
    opacity: 0;
    z-index: 0;
  }

  .sidebar .active svg {
    fill: white;
  }

  .sidebar svg {
    /* fill: gray; */
    fill:#007bff;
  }

  .sidebar a {
    /* fill: gray; */
    color:#007bff;
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