<template>
  <!-- Modal -->
  <div class="modal fade show" id="settingsModal" tabindex="-1" aria-labelledby="settingsModalLabel">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="settingsModalLabel"><font-awesome-icon size="lg" :icon="['fas', 'cog']" /> System Configuration</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal()">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
          <nav class="navbar nav-fill nav-pills bg-light navbar-light">
            <a class="nav-link" :class="{'active': props.activeTab === key}" @click="setActiveTab(key)" href="javascript:void(0)" v-for="(tab, key) in allTabs"><component :is="tab.icon"></component> {{tab.label}}</a>
          </nav>
        <div class="modal-body text-left">
          <component :is="allTabs[props.activeTab].component"></component>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" @click="closeModal()"></div>
</template>

<script>

import { ref, onMounted, onUnmounted } from 'vue';

import Speakers from './Speakers.vue';
import Calibration from './Calibration.vue';
import SignalGenerator from './SignalGenerator.vue';
import Eq from './Eq.vue';
import Inputs from './Inputs.vue';
import SoundEnhancement from './SoundEnhancement.vue';
import Connectivity from './Connectivity.vue';
import System from './System.vue';

import CalibrationIcon from './icon/CalibrationIcon';
import EqIcon from './icon/EqIcon';
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

    const allTabs = ref([
      {'label': 'Speakers', 'component': 'speakers', icon: 'speakers-icon' },
      {'label': 'Calibration', 'component': 'calibration', icon: 'calibration-icon' },
      {'label': 'Signal Generator', 'component': 'signal-generator', icon: 'sgen-icon' },
      {'label': 'EQ', 'component': 'eq', icon: 'eq-icon' },
      {'label': 'Inputs', 'component': 'inputs', icon: 'inputs-icon' },
      {'label': 'Sound Enhancement', 'component': 'sound-enhancement', icon: 'upmix-icon' },
      {'label': 'Connectivity', 'component': 'connectivity', icon: 'network-icon' },
      {'label': 'System', 'component': 'system', icon: 'system-icon' },
    ]);

    function setActiveTab(tab) {
      // activeTab.value = tab;
      emit('active-tab-change', tab);
    }

    function closeModal() {
      emit('close');
    }

    return { props, setActiveTab, allTabs, closeModal };
  },
  components: {
    Speakers,
    Calibration,
    SignalGenerator,
    Eq,
    Inputs,
    SoundEnhancement,
    Connectivity,
    System,
    CalibrationIcon,
    EqIcon,
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

  .navbar {
    padding: 0;
  }

  ::v-deep .btn {
    text-transform: uppercase;
    font-weight: 600;
  }

  ::v-deep .numeric-input {
    width: 7.5rem;
  }

  ::v-deep .numeric-input input {
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
    margin: 0.2rem 0rem;
  }

</style>