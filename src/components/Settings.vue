<template>
  <!-- Modal -->
  <div class="modal fade show" id="settingsModal" tabindex="-1" aria-labelledby="settingsModalLabel">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="settingsModalLabel">System Configuration</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal()">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
          <nav class="navbar nav-fill nav-pills bg-light navbar-light">
            <a class="nav-link" :class="{'active': activeTab === key}" @click="setActiveTab(key)" href="javascript:void(0)" v-for="(tab, key) in allTabs">{{tab.label}}</a>
          </nav>
        <div class="modal-body text-left">
          <component :is="allTabs[activeTab].component"></component>
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

export default {
  name: 'Settings',
  setup(props, { emit }) {

    onMounted(() => {
      document.body.classList.add('modal-open');
    });

    onUnmounted(() => {
      document.body.classList.remove('modal-open');
    });

    const activeTab = ref(5);
    const allTabs = ref([
      {'label': 'Speakers', 'component': 'speakers' },
      {'label': 'Calibration', 'component': 'calibration' },
      {'label': 'Signal Generator', 'component': 'signal-generator' },
      {'label': 'EQ', 'component': 'eq' },
      {'label': 'Inputs', 'component': 'inputs' },
      {'label': 'Sound Enhancement', 'component': 'sound-enhancement' },
      {'label': 'Connectivity', 'component': 'connectivity' },
      {'label': 'System', 'component': 'system' },
    ]);

    function setActiveTab(tab) {
      activeTab.value = tab;
    }

    function closeModal() {
      emit('close');
    }

    return { activeTab, setActiveTab, allTabs, closeModal };
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
</style>