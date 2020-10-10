<template>
  <div class="container">
    <div class="background-light"></div>
    <!--
    <nav aria-label="breadcrumb" class="small">
      <ol class="breadcrumb">
        <li 
          v-for="match in $route.matched"
          class="breadcrumb-item"
          :key="match.path"
        >
          <router-link
            :to="match.path"
          >
            {{match.meta.label}}
          </router-link>
        </li>
      </ol>
    </nav>
    -->
    <nav class="navbar nav-fill nav-pills bg-light navbar-light mb-3">
      <router-link 
        class="nav-link" 
        :class="{'active': `/experimental/settings/${tab.path}` === $route.path}" 
        v-for="(tab) in settingsRoutes"
        :key="tab.path"
        :to="tab.path"
      >
        <component :is="tab.meta.icon"></component> {{tab.meta.label}}
      </router-link>
    </nav>
    <router-view v-slot="{ Component }">
      <transition name="mfade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script>

import { ref } from 'vue';

import { settingsRoutes } from '@/router.js';

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

export default {
  name: 'ExperimentalSettings',
  setup() {
    return { settingsRoutes };
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

  .navbar .active svg {
    fill: white;
  }

  .nav-link {
    text-transform: uppercase;
    font-size: .8rem;
    font-weight: 600;
    padding:0.5rem 0.675rem;
    border-radius: 0;
  }

  .navbar {
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