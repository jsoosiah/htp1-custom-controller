<template>
  <!-- Modal -->
  <div 
    class="modal fade show" 
    id="settingsModal" 
    tabindex="-1" 
    aria-labelledby="settingsModalLabel"
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title" id="settingsModalLabel"><font-awesome-icon size="lg" :icon="['fas', 'cog']" /> System Configuration</h4>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal()">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
          <nav class="navbar nav-fill nav-pills bg-light navbar-light">
            <a 
              class="nav-link" 
              :class="{'active': props.activeTab === key}" @click="setActiveTab(key)" 
              href="javascript:void(0)" 
              v-for="(tab, key) in allTabs"
              :key="key"
            >
              <component :is="tab.icon"></component> {{tab.label}}
            </a>
          </nav>
        <div class="modal-body text-left">
          <transition mode="out-in" name="tabfade">
            <keep-alive>
              <suspense>
                <component 
                  :is="allTabs[props.activeTab].component" 
                  :key="allTabs[props.activeTab].component"
                />
                <template #fallback>
                  loading
                </template>
              </suspense>
            </keep-alive>
          </transition>
        </div>
      </div>
    </div>
  </div>
  <div 
    class="modal-backdrop fade show" 
    @click="closeModal()"
  >
  </div>
</template>

<script>

import { ref, defineAsyncComponent } from 'vue';

// import Speakers from './Speakers.vue';
// import Calibration from './Calibration.vue';
// import SignalGenerator from './SignalGenerator.vue';
// import Peq from './Peq.vue';
// import ToneControl from './ToneControl.vue';
// import Inputs from './Inputs.vue';
// import SoundEnhancement from './SoundEnhancement.vue';
// import Connectivity from './Connectivity.vue';
// import System from './System.vue';

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

export default {
  name: 'Settings',
  props: {
    activeTab: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {

    const tabLoaded = ref(true);

    const allTabs = ref([
      {'label': 'Speakers', 'component': 'speakers', icon: 'speakers-icon' },
      {'label': 'Calibration', 'component': 'calibration', icon: 'calibration-icon' },
      {'label': 'Signal Generator', 'component': 'signal-generator', icon: 'sgen-icon' },
      {'label': 'PEQ', 'component': 'peq', icon: 'peq-icon' },
      {'label': 'Tone Control', 'component': 'tone-control', icon: 'tone-control-icon' },
      {'label': 'Inputs', 'component': 'inputs', icon: 'inputs-icon' },
      {'label': 'Sound Enhancement', 'component': 'sound-enhancement', icon: 'upmix-icon' },
      {'label': 'Connectivity', 'component': 'connectivity', icon: 'network-icon' },
      {'label': 'Macros', 'component': 'macros', icon: 'macros-icon'},
      {'label': 'System', 'component': 'system', icon: 'system-icon' },
      {'label': 'About', 'component': 'about', icon: 'about-icon' },
    ]);

    async function setActiveTab(tab) {
      tabLoaded.value = false;
      
      setTimeout(() => {
        emit('active-tab-change', tab);
        tabLoaded.value = true;
      }, 100)
    }

    function closeModal() {
      emit('close');
    }

    return { props, setActiveTab, allTabs, closeModal, tabLoaded };
  },
  components: {
    Speakers: defineAsyncComponent(() => import('./Speakers.vue')),
    Calibration: defineAsyncComponent(() => import('./Calibration.vue')),
    SignalGenerator: defineAsyncComponent(() => import('./SignalGenerator.vue')),
    Peq: defineAsyncComponent(() => import('./Peq.vue')),
    ToneControl: defineAsyncComponent(() => import('./ToneControl.vue')),
    Inputs: defineAsyncComponent(() => import('./Inputs.vue')),
    SoundEnhancement: defineAsyncComponent(() => import('./SoundEnhancement.vue')),
    Connectivity: defineAsyncComponent(() => import('./Connectivity.vue')),
    Macros: defineAsyncComponent(() => import('./Macros.vue')),
    System: defineAsyncComponent(() => import('./System.vue')),
    About: defineAsyncComponent(() => import('./About.vue')),
    // Speakers,
    // Calibration,
    // SignalGenerator,
    // Peq,
    // ToneControl,
    // Inputs,
    // SoundEnhancement,
    // Connectivity,
    // System,
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
  },
  emits: ['active-tab-change', 'close']
}
</script>

<style scoped>

  .modal-title {
    line-height: 1;
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

  div {
    color: #212529;
  }

  .modal {
    display: block;
  }

  .nav-link {
    text-transform: uppercase;
    font-size: .8rem;
    font-weight: 600;
    padding:0.5rem 0.675rem;
    border-radius: 0;
  }

  .material-icons {
    font-size: 18px;
  }

  svg {
    fill: #007bff;
    height: 18px;
  }

  .active svg {
    fill: white;
  }

  .modal-title svg {
    margin: 0.3rem 0rem;
  }

  .tabfade-enter-active,
  .tabfade-leave-active {
    transition: opacity 0s ease;
  }
  .tabfade-enter, .tabfade-leave-to
  /* .component-fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }


  .transition-container {
    display: block;
    z-index: 9;
    opacity: 1;
    /*position: fixed;*/
  }


</style>