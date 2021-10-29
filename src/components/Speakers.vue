<template>
  <div class="container">
    <div class="row">
      <h5>Speaker Selection</h5>
    </div>
    <div class="row">
      <dismissable-alert alert-key="speaker-bm">
        If the current Dirac Filter Slot has Bass Control and Dirac is On, speaker size and crossover controls are unavailable and must be configured using the Dirac software. Speaker sizes and crossovers can be changed if Dirac is off or in bypass mode.
      </dismissable-alert>
    </div>
    <div class="row">
      <dismissable-alert
        v-if="mso.cal?.speakerConfigMismatch"
        alert-key="speaker-filter-mismatch"
        class="alert-warning"
      >
        The selected Dirac calibration does not match the current speaker configuration. Uncalibrated channels are highlighted.
      </dismissable-alert>
    </div>
    <div class="row alert-row">
      <div class="col-lg-auto">
        <div :class="{'mb-3': !isLg}">
          <dirac-button-group :home-button="false" />
        </div>
      </div>
      <div class="col-lg">
        <div class="alert alert-secondary mb-3">
          <h6>
            Current bass manager: <img
              class="bm-icon"
              :src="require(`@/assets/${showCrossoverControls?'monolith-logo-small.svg':'dirac3.png'}`)+'#svgView(preserveAspectRatio(xMidYMid))'"
            > <span class="bm-status">{{ showCrossoverControls ? 'HTP-1' : 'Dirac' }}</span>
          </h6>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-7">
        <speaker-group-crossover-controls :speaker-groups="speakerGroups" />
      </div>
      <div class="col-lg-5">
        <SpeakerDiagram :class="diagramSpeakerVisibility" />
      </div>
    </div>
    <div
      v-if="showCrossoverControls"
      class="row"
    >
      <div class="col">
        <div class="row">
          <h5>Bass Manager</h5>
        </div>
        <div class="row">
          <div class="col-lg">
            <div class="form-group">
              <label
                for="inputEmail3"
                class="col-form-label col-form-label-sm "
              >LPF for LFE Channel</label>
              <div class="input-group input-group-sm numeric-input">
                <input
                  type="number"
                  class="form-control"
                  aria-label="Minimum volume"
                  aria-describedby="basic-addon2"
                  :value="mso.bassLpf"
                  min="40"
                  max="200"
                  step="10"
                  @change="({ type, target }) => setBassLpf(target.value)"
                >
                <div class="input-group-append">
                  <span
                    id="basic-addon2"
                    class="input-group-text"
                  >Hz</span>
                </div>
              </div>
              <small class="form-text text-muted">Sets the center frequency of the low pass filter for the LFE channel.</small>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-auto">
            <div class="form-group">
              <two-state-button 
                :button-text="`Reinforce Bass: ${mso.bassenhance}`" 
                :state-on="mso.bassenhance === 'on'" 
                :home-button="false"
                @click="toggleReinforceBass()"
              />
              <small class="form-text text-muted">Adds subwoofer signal to large speakers</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row speaker-map-container">
      <h5>Speaker Map <small class="text-muted">Click image to zoom</small></h5>
      <dismissable-alert alert-key="speaker-labels">
        Depending on the combination of selected speakers, the physical labels on the back panel may not match the actual speaker mapping. The correct mapping is shown below. If the speakers are not enabled, no sound will be produced. Enabled speaker channels are highlighted in green.
      </dismissable-alert>
      <SpeakerMap />
    </div>
  </div>
</template>

<script>

  import { computed } from 'vue';

  import useMso from '@/use/useMso.js';
  import useResponsive from '@/use/useResponsive.js';

  import SpeakerGroupCrossoverControls from './SpeakerGroupCrossoverControls.vue';
  import SpeakerDiagram from './SpeakerDiagram.vue';
  import SpeakerMap from './SpeakerMap.vue';
  import DiracButtonGroup from './buttons/DiracButtonGroup.vue';
  import DismissableAlert from './buttons/DismissableAlert.vue';
  import TwoStateButton from './buttons/TwoStateButton.vue';

  export default {
    name: 'Speakers',
    components: {
      SpeakerDiagram,
      DiracButtonGroup,
      SpeakerGroupCrossoverControls,
      SpeakerMap,
      DismissableAlert,
      TwoStateButton,
    },
    setup() {

      const { mso, showCrossoverControls, activeChannels } = useMso();
      const { isLg } = useResponsive();

      const mainSpeakers = [
        {'label': 'Left / Right', code: 'lr'},
        {'label': 'Center', code: 'c'},
        {'label': 'Subwoofer', code: 'sub1'},
        {'label': 'Subwoofer 2', code: 'sub2'},
        {'label': 'Subwoofer 3', code: 'sub3'},
        {'label': 'Subwoofer 4', code: 'sub4'},
        {'label': 'Subwoofer 5', code: 'sub5'},
      ];

      const surroundSpeakers = [
        {'label': 'L/R Surround', code: 'lrs'},
        {'label': 'L/R Rear Surround', code: 'lrb'},
        {'label': 'L/R Wide', code: 'lrw'},
      ]

      const upperSpeakers = [
        {'label': 'L/R Top Front', code: 'lrtf'},
        {'label': 'L/R Top Middle', code: 'lrtm'},
        {'label': 'L/R Top Rear', code: 'lrtr'},
        {'label': 'L/R Front Height', code: 'lrhf'},
        {'label': 'L/R Rear Height', code: 'lrhr'},
      ];

      const speakerGroups = [
        {
          header: 'Main Speaker Outputs',
          subtitle: null,
          speakers: mainSpeakers
        },
        {
          header: 'Surround Speaker Outputs',
          subtitle: null,
          speakers: surroundSpeakers
        },
        {
          header: 'Upper Speaker Outputs',
          subtitle: 'Maximum of 6 highs/tops allowed',
          speakers: upperSpeakers
        }
      ];

      const diagramSpeakerVisibility = computed(() => {
        const hideSpeakers = {};
        for (const spk of [...mainSpeakers, ...surroundSpeakers, ...upperSpeakers]) {
          if (mso.value.speakers?.groups[spk.code].present === false) {
            hideSpeakers[`hide-${spk.code}`] = true;
          }
        }
        return hideSpeakers;
      });

      return { 
        mso, showCrossoverControls, mainSpeakers, surroundSpeakers, upperSpeakers, 
        diagramSpeakerVisibility, speakerGroups, activeChannels, isLg
      };
    }
  }
</script>

<style scoped>

  .alert-box {
    width: 100%;
    /*margin:-1rem -1rem 1rem -1rem;*/
    /*border-radius: 0;*/
  }

  .alert-success {
    font-weight: 600;
  }

  .alert-text-muted {
    /*color: red;*/
    opacity: 0.75;
    border:  1px solid rgba(12,84,96,.125);
    border-radius: 0.25rem;
  }

  .bm-indicator {
    display:block;
    padding:0.25rem;
    margin:0.25rem 0;
  }

  .bm-enabled {
    /*background-color: #212529;*/
    color: #ffeeba;
    font-weight: 600;
  }

  .bm-status {
    min-width: 15rem;
    margin-bottom:0;
  }

  .bm-status-mobile {
    min-width: 15rem;
    margin-bottom:1rem;
  }

  .col-lg, .col-lg-auto, .col-md-auto, .col-lg-5, .col-lg-6, .col-lg-7 {
    padding-left: 0;
  }

  .speaker-map-container {
    overflow: auto;
  }

  .alert-row {
    align-items: baseline;
  }

  .bm-status {
    /* line-height: 1; */
    font-weight:bold;
    text-transform: uppercase;
    /* font-size: 1.25rem; */
  }

  .bm-icon {
    max-height:2rem;
    max-width:2rem;
    margin:-.125rem .25rem 0 .5rem;
  }

  .alert-secondary {
    margin-bottom:0;
  }

  .alert-secondary h6 {
    margin-bottom: 0;
  }
</style>