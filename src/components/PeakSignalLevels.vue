<template>
  <div class="row">
    <h6>Peak Level Measurement</h6>
    <dismissable-alert alert-key="volume-peak-measurement">
      You can measure how much headroom you need by enabling the peak volume meters while playing your loudest material.  The headroom is set ideally when the peak volume reaches just to 0dB and not above.
    </dismissable-alert>
  </div>
  <div class="row mb-3">
    <div class="col-auto">
      <two-state-button
        :button-text="`Peak VU Monitoring: ${peakSignalMonitoringEnabled ? 'on':'off'}`"
        :state-on="peakSignalMonitoringEnabled"
        @click="togglePeakSignalMonitoring()"
      />
    </div>
    <div class="col-auto">
      <button
        v-if="peakSignalMonitoringEnabled"
        type="button"
        class="btn btn-sm btn-primary float-right"
        @click="clearVuPeakLevels"
      >
        Clear Peak Levels
      </button>
    </div>
  </div>
  <div class="row">
    <table
      v-if="peakSignalMonitoringEnabled"
      class="table table-sm table-striped table-responsive"
    >
      <thead>
        <tr>
          <th>
            Channel
          </th>
          <th>
            Peak Signal Level
          </th>
          <th>
            Raw Vu Value
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="channame in activeChannels"
          :key="channame"
          :class="{'table-danger':vuMap[channame].clipped,'text-danger':vuMap[channame].clipped, 'font-weight-bold':vuMap[channame].clipped}"
        >
          <td>
            {{ spkName(channame) }}
          </td>
          <td
            class="text-right"
          >
            <span
              v-if="vuMap[channame].active"
              :class="{'text-success':!vuMap[channame].clipped && vuMap[channame].value > 0, 'text-secondary':!vuMap[channame].clipped && vuMap[channame].value === 0}"
            >
              {{
                vuMap[channame].dBFS
              }}
              dBFS
            </span>
          </td>
          <td class="text-right">
            {{ vuMap[channame].value }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

  import { computed, onActivated, onDeactivated, watch, ref } from 'vue';

  import useMso from '@/use/useMso.js';
  import useSpeakerGroups from '@/use/useSpeakerGroups.js';

  import { Tooltip } from '@/directives/Tooltip.js';
import TwoStateButton from './buttons/TwoStateButton.vue';
import DismissableAlert from './buttons/DismissableAlert.vue';

  export default {
    name: 'PeakSignalLevels',
    components: {
      TwoStateButton,
      DismissableAlert
    },
    setup(props) {

      const { mso, toggleSignalGenerator, setSignalGeneratorChannel, setSignalGeneratorChannel2, 
        setSignalGeneratorSignalType, setSignalGeneratorOff, setSignalGeneratorOn, 
        showCrossoverControls, setSineFrequency, setSineAmplitude, setUpmix, setVolume, updateVu, commandsReceived, eventHash,
        clearVuPeakLevels,setVuPeakMode } = useMso();
      const { getActiveChannels, spkName, reverseAllChannelCodes } = useSpeakerGroups();

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

      const peakSignalMonitoringEnabled = ref(false);

      let VU_REFRESH_INTERVAL = 2000; // ms
      let lastVuReceived = 0;

      const vuValToDBFS = [-72,
-70,
-68,
-66,
-64,
-62,
-60,
-58,
-56,
-54,
-52,
-50,
-48,
-46,
-44,
-42,
-40,
-38,
-36,
-34,
-32,
-30,
-28,
-26,
-24,
-22,
-20,
-19,
-18,
-17,
-16,
-15,
-14,
-13,
-12,
-11,
-10,
-9,
-8,
-7,
-6,
-5.5,
-5,
-4.5,
-4,
-3.5,
-3,
-2.5,
-2,
-1.5,
-1,
-0.75,
-0.5,
-0.25,
0,
0.25,
0.5,
0.75,
1,
1.5,
2,
3,
4.5,
6];

      const activeChannels = computed(() => {
        return getActiveChannels(mso.value.speakers?.groups);
      });

      const vuMap = computed(() => {
        const result = {};
        
        for (const ch of activeChannels.value) {
          const vu =  mso.value.vu ? mso.value.vu[reverseAllChannelCodes[ch]]: 0;
          const value = vu & 0x3F;
          result[ch] = {
            active: 0 !==(vu & 0x80),
            clipped: (vu & 0x40) > 0,
            value: value,
            // dBFS: value * 2 - 96,
            dBFS: vuValToDBFS[value],
          };
        }
      
        return result;
      });

      let stopWatcher;
      let vuInterval;

      function togglePeakSignalMonitoring() {
        peakSignalMonitoringEnabled.value = !peakSignalMonitoringEnabled.value;

        if (peakSignalMonitoringEnabled.value) {
          setVuPeakMode();

          // watch for vu received
          stopWatcher = watch(eventHash, () => {
            if (commandsReceived.value.filter(cmd => cmd.path === '/vu').length > 0) {
              lastVuReceived = Date.now();
            }
          });

          vuInterval = setInterval(() => {
            if ((Date.now() - lastVuReceived) > VU_REFRESH_INTERVAL && peakSignalMonitoringEnabled.value) {
              console.log('do updatevu');
              updateVu();
            } else {
              console.log('skip updatevu', Date.now() - lastVuReceived, peakSignalMonitoringEnabled.value);
            }
          }, VU_REFRESH_INTERVAL)
        } else {
          if (stopWatcher) {
            stopWatcher();
          }
          
          clearInterval(vuInterval);
        }
      }

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

      // clear scan interval if 
      // navigating away from this page
      onDeactivated(() => {
        if (peakSignalMonitoringEnabled.value) {
          togglePeakSignalMonitoring();
        }
      });

      return { 
        mso, toggleSignalGenerator, setSignalGeneratorChannel, setSignalGeneratorChannel2, setSignalGeneratorSignalType, 
        activeChannels, spkName, signalOptions, setSignalGeneratorOff, setSignalGeneratorOn, showCrossoverControls,
        setSineFrequency, setSineAmplitude, setUpmix, setVolume, vuMap, channelDisabled, showTooltip, handleSelect, isChecked,
        clearVuPeakLevels,setVuPeakMode, peakSignalMonitoringEnabled, togglePeakSignalMonitoring
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