<template>
      <div class="alert alert-info small" role="alert">
        <p><a href="#speaker-map" class="alert-link">Speaker Map</a> shows the mapping on the back panel. If the speakers are not enabled, no sound will be produced.</p>

        <p>If current Dirac Filter Slot has Bass Control and Dirac is On, speaker size selections are not available. Speaker sizes can be changed if Dirac is off or in bypass mode.</p>

        <div class="row">
          <div class="col-auto">
            <div class="row">
              <div class="col">
                <div class="alert" :class="{'alert-text-muted': showCrossoverControls, 'alert-success': !showCrossoverControls}">
                  Dirac Live Bass Control is {{ showCrossoverControls ? 'off' : 'on' }}</div>
              </div>
              <div class="col-auto">
                <dirac-button />
              </div>
              <div class="col">
                <div class="alert" :class="{'alert-text-muted': !showCrossoverControls, 'alert-success': showCrossoverControls}">HTP-1 Bass Management is {{ showCrossoverControls ? 'on' : 'off' }}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
  <div class="container">
    <div class="row">
      <div class="col-lg">
        <h6>Speaker Selection</h6>
        <table class="table table-sm table-striped table-responsive-sm">
          <tbody>
            <tr></tr>
            <tr>
              <th colspan="3">Main Speaker Outputs</th>
            </tr>
            <speaker-group-crossover-controls v-bind:speakers="mainSpeakers" />
          </tbody>
          <tbody>
            <tr></tr>
            <tr>
              <th colspan="3">Surround Speaker Outputs</th>
            </tr>
            <speaker-group-crossover-controls v-bind:speakers="surroundSpeakers" />
          </tbody>
          <tbody>
            <tr></tr>
            <tr>
              <th colspan="3">Upper Speaker Outputs <small class="text-muted">Maximum of 6 highs/tops allowed</small></th>
            </tr>
            <speaker-group-crossover-controls v-bind:speakers="upperSpeakers" />
          </tbody>
        </table>
      </div>
      <div class="col-lg">
        <h6>Speaker Layout</h6>
        <SpeakerDiagram :class="diagramSpeakerVisibility" />
      </div>
    </div>
    <div class="row speaker-map-container">
      <h6 id="speaker-map">Speaker Map <small class="text-muted">Click image to zoom</small></h6>
      <SpeakerMap />
    </div>
  </div>
</template>

<script>

  import { computed } from 'vue';

  import useMso from '@/use/useMso.js';
  import SpeakerGroupCrossoverControls from './SpeakerGroupCrossoverControls.vue';
  import SpeakerDiagram from './SpeakerDiagram.vue';
  import SpeakerMap from './SpeakerMap.vue';
  import DiracButton from './DiracButton.vue';

  export default {
    name: 'Speakers',
    setup() {

      const { mso, showCrossoverControls } = useMso();

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

      const diagramSpeakerVisibility = computed(() => {
        const hideSpeakers = {};
        for (const spk of [...mainSpeakers, ...surroundSpeakers, ...upperSpeakers]) {
          if (mso.value.speakers.groups[spk.code].present === false) {
            hideSpeakers[`hide-${spk.code}`] = true;
          }
        }
        return hideSpeakers;
      });

      return { mso, showCrossoverControls, mainSpeakers, surroundSpeakers, upperSpeakers, diagramSpeakerVisibility };
    },
    components: {
      SpeakerDiagram,
      DiracButton,
      SpeakerGroupCrossoverControls,
      SpeakerMap
    }
  }
</script>

<style scoped>

  th {
    font-size: 80%;
  }

  small {
    font-size: 90%;
  }

  .alert-info {
    /*width: 100;*/
    margin:-1rem -1rem 1rem -1rem;
    border-radius: 0;
  }

  .alert-success {
    font-weight: 600;
  }

  .alert-text-muted {
    /*color: red;*/
    opacity: 0.75;
    border:  1px solid rgba(0,0,0,.1);
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

  .col-lg {
    padding: 0;
  }

  .speaker-map-container {
    overflow: auto;
  }
</style>