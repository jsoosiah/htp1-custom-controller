<template>
  <table class="table table-sm table-striped table-responsive-sm">
    <tbody v-for="speakerGroup in props.speakerGroups" :key="speakerGroup.header">
      <tr></tr>
      <tr>
        <th colspan="3">{{speakerGroup.header}} <small class="text-muted" v-if="speakerGroup.subtitle">{{speakerGroup.subtitle}}</small></th>
      </tr>
      <tr v-for="spk in speakerGroup.speakers" :key="spk.code">
        <td>
          <div class="custom-control custom-switch">
            <input 
              type="checkbox" 
              class="custom-control-input" 
              :id="'check-'+spk.code" 
              :checked="mso.speakers?.groups[spk.code]?.present" 
              @change="toggleSpeakerGroup(spk.code)"
              :disabled="!allSpeakerToggles[spk.code].enabled"
            />
            <label 
              :class="{'custom-control-label':spk.code !== 'lr', 'hidden-switch-label': spk.code === 'lr'}" 
              :for="'check-'+spk.code"
              :id="'tooltip-container-' + spk.code"
              v-tooltip="allSpeakerToggles[spk.code]"
            >
              {{spk.label}} 
            <font-awesome-icon 
              :icon="['fas', 'question-circle']"
              v-if="!allSpeakerToggles[spk.code].enabled && allSpeakerToggles[spk.code].message"
            /></label>
          </div>
        </td>
        <td class="text-right">
          <template v-if="showCenterFreqControlsForSpeaker(spk.code)">
            <label class="sr-only" :for="'xo-'+spk.code">Crossover Frequency Center (Hz)</label>
            <div class="input-group input-group-sm numeric-input float-right">
              <div class="input-group-prepend">
                <div class="input-group-text">fc</div>
              </div>
              <input type="number" step="10" min="40" max="200" class="form-control" :id="'xo-'+spk.code" :value="mso.speakers?.groups[spk.code]?.fc" @change="({ type, target }) => setCenterFreq(spk.code, target.value)" >
              <div class="input-group-append">
                <div class="input-group-text">Hz</div>
              </div>
            </div>
          </template>
        </td>
        <td class="text-right">
          <template v-if="showCrossoverControlsForSpeaker(spk.code)">
            <div class="btn-group btn-group-sm" role="group" aria-label="Speaker Size">
              <button v-if="showDolby(spk.code)" @click="setSpeakerSize(spk.code, 'd')" type="button" class="btn" :class="{'btn-primary': mso.speakers?.groups[spk.code].size === 'd', 'btn-secondary': mso.speakers?.groups[spk.code].size !== 'd'}">Dolby</button>
              <button @click="setSpeakerSize(spk.code, 's')" type="button" class="btn" :class="{'btn-primary': mso.speakers?.groups[spk.code].size === 's', 'btn-secondary': mso.speakers?.groups[spk.code].size !== 's'}">Small</button>
              <button @click="setSpeakerSize(spk.code, 'l')" type="button" class="btn" :class="{'btn-primary': mso.speakers?.groups[spk.code].size === 'l', 'btn-secondary': mso.speakers?.groups[spk.code].size !== 'l'}">Large</button>
            </div>
          </template>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>

  import { watchEffect, computed, onMounted } from 'vue';
  import { Tooltip } from '@/directives/Tooltip.js';

  import useMso from '@/use/useMso.js';

  export default {
    'name': 'SpeakerGroupCrossoverControls',
    'props': {
      speakerGroups: Array
    },
    setup(props) {

      const { mso, showCrossoverControls, toggleSpeakerGroup, 
        setSpeakerSize, setCenterFreq, activeChannels } = useMso();

      // rule states the conditions for which the toggle should be enabled
      // all rules in the array will be combined with AND
      // if the toggle is disabled, message is displayed to the user as the reason 
      const speakerGroupValidations = computed(() => {

        const groups = mso.value.speakers.groups;

        return {
          'lr': [
              {rule: false, message: null} // always disable LR toggle
            ], 
          'sub2': [
              {rule: groups.sub1.present, message: 'Subwoofer must be enabled before Subwoofer 2.'}
            ], 
          'sub3': [
              {rule: groups.sub2.present, message: 'Subwoofer 2 must be enabled before Subwoofer 3.'}
            ], 
          'sub4': [
              {rule: groups.sub3.present, message: 'Subwoofer 3 must be enabled before Subwoofer 4.'}
            ], 
          'sub5': [
              {rule: groups.sub4.present, message: 'Subwoofer 4 must be enabled before Subwoofer 5.'}
            ], 
          'lrb': [
              {rule: groups.lrs.present, message: 'L/R Surround must be enabled before L/R Rear Surround.'}
            ], 
          'lrw': [
              {rule: groups.lrb.present, message: 'L/R Rear Surround must be enabled before L/R Wide.'}
            ], 
          'lrhf': [
              {rule: !groups.lrtf.present, message: 'L/R Top Front must be disabled to enable L/R Front Height.'},
              {rule: groups.lrs.present || !groups.lrtm.present, message: 'L/R Surround must be enabled or L/R Top Middle must be disabled to enable L/R Front Height.'}
            ], 
          'lrtf': [
              {rule: !groups.lrhf.present, message: 'L/R Front Height must be disabled to enable L/R Top Front.'},
              {rule: groups.lrs.present || !groups.lrtm.present, message: 'L/R Surround must be enabled or L/R Top Middle must be disabled to enable L/R Top Front.'}
            ], 
          'lrtm': [
              {rule: groups.c.present || groups.lrb.present, message: 'Center or L/R Rear Surround must be enabled before L/R Top Middle.'},
              {rule: (!(groups.lrhf.present || groups.lrtf.present) || (groups.lrhr.present || groups.lrtr.present)), message: 'If L/R Top Front or L/R Front Height is enabled, then L/R Top Rear or L/R Rear Height must be enabled before L/R Top Middle'}
            ], 
          'lrhr': [
              {rule: !groups.lrtr.present, message: 'L/R Top Rear must be disabled to enable L/R Rear Height.'},
              {rule: groups.lrtf.present || groups.lrhf.present, message: 'L/R Top Front or L/R Front Height must be enabled before L/R Rear Height.'}
            ], 
          'lrtr': [
              {rule: !groups.lrhr.present, message: 'L/R Rear Height must be disabled to enable L/R Top Rear.'},
              {rule: groups.lrtf.present || groups.lrhf.present, message: 'L/R Top Front or L/R Front Height must be enabled before L/R Top Rear.'}
            ]
          };
      });

      const allSpeakerToggles = computed(() => {

        const result = {};

        for (const group of props.speakerGroups) {
          for (const speaker of group.speakers) {
            result[speaker.code] = enableSpeakerToggle(speaker.code);
          }
        }

        return result;
      });

      function enableSpeakerToggle(spkCode) {

        const result = {
          enabled: true,
          message: ''
        };

        const groups = mso.value.speakers.groups;

        if (!groups[spkCode].present) {
          // if 16 channels are already set, disable toggles that are off to prevent adding more speakers

          let limit = 16;
          if (spkCode !== 'c' && !spkCode.startsWith('sub')) {
            limit = 15;
          }

          if (activeChannels.value.length >= limit && spkCode !== 'lr') {
            // return false;
            result.enabled = false;
            result.message = 'A maximum of 16 speakers is allowed.';
            return result;
          }

          const validations = speakerGroupValidations.value[spkCode]; //getSpeakerGroupValidations(spkCode, groups);

          if (validations && validations.length > 0) {
            for (const validation of validations) {
              // console.log('validations', spkCode, validations)
              if (!validation.rule) {
                result.enabled = false;
                result.message = validation.message;
                return result;
              }
            }
          }
        }

        return result;
      }

      function showCrossoverControlsForSpeaker(spkCode) {
        // console.log('showCrossoverControls', showCrossoverControls)
        return showCrossoverControls.value && !spkCode?.startsWith('sub');
      }

      function showCenterFreqControlsForSpeaker(spkCode) {
        return showCrossoverControlsForSpeaker(spkCode) && mso.value.speakers?.groups[spkCode].size !== 'l';
      }

      function showDolby(spkCode) {
        return spkCode.includes('t'); // top
      }

      return { 
        mso, showCrossoverControls, toggleSpeakerGroup, setSpeakerSize, setCenterFreq,
        showCrossoverControlsForSpeaker, showCenterFreqControlsForSpeaker, showDolby,
        props, allSpeakerToggles
      };
    },
    directives: {
      Tooltip
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

  .input-group, .btn-group {
    margin:.1rem;
  }

  table td {
    height: 2.2rem;
  }

  td {
    padding:0 0.3rem;
  }

  .hidden-switch-label {
    padding: 0;
    margin:0;
  }

</style>