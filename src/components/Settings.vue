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
          <div :class="{'hiding':!tabLoaded, 'showing':tabLoaded}">
            <component 
              :is="allTabs[props.activeTab].component" 
              :key="allTabs[props.activeTab].component"
            />
          </div>
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

import { ref, onMounted, onUnmounted } from 'vue';

import Speakers from './Speakers.vue';
import Calibration from './Calibration.vue';
import SignalGenerator from './SignalGenerator.vue';
import Peq from './Peq.vue';
import ToneControl from './ToneControl.vue';
import Inputs from './Inputs.vue';
import SoundEnhancement from './SoundEnhancement.vue';
import Connectivity from './Connectivity.vue';
import System from './System.vue';

import CalibrationIcon from './icon/CalibrationIcon';
import PeqIcon from './icon/PeqIcon';
import ToneControlIcon from './icon/ToneControlIcon';
import InputsIcon from './icon/InputsIcon';
import NetworkIcon from './icon/NetworkIcon';
import SgenIcon from './icon/SgenIcon';
import SpeakersIcon from './icon/SpeakersIcon';
import SystemIcon from './icon/SystemIcon';
import UpmixIcon from './icon/UpmixIcon';

export default {
  name: 'Settings',
  props: {
    activeTab: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {

    onMounted(() => {
      document.body.classList.add('modal-open');
    });

    onUnmounted(() => {
      document.body.classList.remove('modal-open');
    });

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
      {'label': 'System', 'component': 'system', icon: 'system-icon' },
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
    Speakers,
    Calibration,
    SignalGenerator,
    Peq,
    ToneControl,
    Inputs,
    SoundEnhancement,
    Connectivity,
    System,
    CalibrationIcon,
    PeqIcon,
    ToneControlIcon,
    InputsIcon,
    NetworkIcon,
    SgenIcon,
    SpeakersIcon,
    SystemIcon,
    UpmixIcon,
  },
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

  .component-fade-enter-active {
    transition: opacity .15s ease;
  }

  .component-fade-leave-active {
    transition: opacity .5s ease;
  }

  .component-fade-leave-to {
    opacity: 0;
  }

  .component-fade-enter-to {
    opacity: 1;
  }

  .transition-container {
    display: block;
    z-index: 9;
    /*position: fixed;*/
  }


</style>