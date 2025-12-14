<template>
  <table class="table table-sm table-striped table-responsive">
    <thead>
      <tr>
        <th>
          {{ title }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="channame in activeChannels"
        :key="channame"
      >
        <td>
          <div class="form-check">
            <input
              :id="`radio-${channame}-${secondChannel}`"
              class="form-check-input"
              type="radio"
              :name="`channel-${secondChannel}`"
              :value="channame"
              :checked="isChecked(channame)"
              :disabled="channelDisabled(channame)"
              @click="handleSelect(channame)"
            >
            <label 
              class="form-check-label" 
              :for="`radio-${channame}-${secondChannel}`"
            >
              {{ spkName(channame) }} 
              <font-awesome-icon 
                v-if="showTooltip(channame)"
                :id="`tooltip-container-left-${channame}-${secondChannel}`"
                v-tooltip="{
                  enabled: !(showTooltip(channame)),
                  message: 'Individual subwoofer channels are unavailable when Dirac Live Bass Control is enabled; Subwoofer 1 sends signal to all subwoofers.'
                }"
                :icon="['fas', 'question-circle']"
              />
            </label>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>

  import { computed, onActivated, onDeactivated, watch } from 'vue';

  import useMso from '@/use/useMso.js';
  import useSpeakerGroups from '@/use/useSpeakerGroups.js';

  import { Tooltip } from '@/directives/Tooltip.js';

  export default {
    name: 'SignalGenerator',
    directives: {
      Tooltip
    },
    props: {
      title: {
        type: String,
        required: true,
      },
      showLevels: {
        type: Boolean,
        default: true,
      },
      secondChannel: {
        type: Boolean,
        default: false,
      }
    },
    setup(props) {

      const { mso, toggleSignalGenerator, setSignalGeneratorChannel, setSignalGeneratorChannel2, 
        setSignalGeneratorSignalType, setSignalGeneratorOff, setSignalGeneratorOn, 
        showCrossoverControls, setSineFrequency, setSineAmplitude, setUpmix, setVolume, 
        clearVuPeakLevels,setVuPeakMode } = useMso();
      const { getActiveChannels, spkName } = useSpeakerGroups();

      const signalOptions = [
        {'label': '"THX-like" band limited noise', 'value': 'thx'},
        {'label': 'Full bandwidth pink noise', 'value': 'pink'},
        {'label': 'Louder reference noise', 'value': 'dolby'},
        {'label': 'Polarity pulse', 'value': 'pulse'},
        {'label': 'Sinewave', 'value': 'sine'},
        {'label': 'Left input as signal', 'value': 'left'},
        {'label': 'Right input as signal', 'value': 'right'},
        {'label': 'Left and right input as signal', 'value': 'both'},
      ];

      const activeChannels = computed(() => {
        return getActiveChannels(mso.value.speakers?.groups);
      });

      function channelDisabled(channame) {
        return !showCrossoverControls.value && (channame !== 'sub1' && channame.startsWith('sub'));
      }

      function showTooltip(channame) {
        return !showCrossoverControls.value && channame === 'sub1';
      }

      function isChecked(channame) {
        if (props.secondChannel) {
          return (mso.value.sgen?.select2 === channame);
        } else {
          return (mso.value.sgen?.select === channame); 
        }
      }

      function handleSelect(channame) {
        if (props.secondChannel) {
          setSignalGeneratorChannel2(channame);
        } else {
          setSignalGeneratorChannel(channame);
        }
      }

      return { 
        mso, toggleSignalGenerator, setSignalGeneratorChannel, setSignalGeneratorChannel2, setSignalGeneratorSignalType, 
        activeChannels, spkName, signalOptions, setSignalGeneratorOff, setSignalGeneratorOn, showCrossoverControls,
        setSineFrequency, setSineAmplitude, setUpmix, setVolume, channelDisabled, showTooltip, handleSelect, isChecked,
        clearVuPeakLevels,setVuPeakMode
      };
    }
  }
</script>

<style scoped>
  th {
    font-size:80%;
  }

  .col-auto, .col {
    padding-left: 0;
  }

  .numeric-input {
    width: 9.5rem;
  }
</style>