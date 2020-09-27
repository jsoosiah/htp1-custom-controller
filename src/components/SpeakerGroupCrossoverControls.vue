<template>
  <table class="table table-sm table-striped table-responsive-sm">
    <tbody v-for="speakerGroup in props.speakerGroups">
      <tr></tr>
      <tr>
        <th colspan="3">{{speakerGroup.header}} <small class="text-muted" v-if="speakerGroup.subtitle">{{speakerGroup.subtitle}}</small></th>
      </tr>
      <tr v-for="spk in speakerGroup.speakers">
        <td>
          <div class="custom-control custom-switch">
            <input 
              type="checkbox" 
              class="custom-control-input" 
              :id="'check-'+spk.code" 
              :checked="mso.speakers?.groups[spk.code]?.present" 
              @change="toggleSpeakerGroup(spk.code)"
              :disabled="!enableSpeakerToggle(spk.code)"
            />
            <label :class="{'custom-control-label':spk.code !== 'lr', 'hidden-switch-label': spk.code === 'lr'}" :for="'check-'+spk.code">{{spk.label}}</label>
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

  import useMso from '@/use/useMso.js';

  export default {
    'name': 'SpeakerGroupCrossoverControls',
    'props': {
      speakerGroups: Array
    },
    setup(props) {

      const { mso, showCrossoverControls, toggleSpeakerGroup, 
        setSpeakerSize, setCenterFreq, activeChannels } = useMso();

      function enableSpeakerToggle(spkCode) {

        const groups = mso.value.speakers.groups;

        if (!groups[spkCode].present) {
          // if 16 channels are already set, disable toggles that are off to prevent adding more speakers
          if (activeChannels.value.length >= 16) {
            return false;
          }

          if (spkCode === 'lr') { // always disable LR toggle 
            return false;
          } else if (spkCode === 'sub5') { // sub5 requires sub4
            return groups.sub4.present;
          } else if (spkCode === 'sub4') { // sub4 requires sub3
            return groups.sub3.present;
          } else if (spkCode === 'sub3') { // sub3 requires sub2
            return groups.sub2.present;
          } else if (spkCode === 'sub2') { // sub2 requires sub1
            return groups.sub1.present;
          } else if (spkCode === 'lrb') { // backs require side surrounds
            return groups.lrs.present;
          } else if (spkCode === 'lrw') { // wides require backs
            return groups.lrb.present;
          } else if (spkCode === 'lrhf') { // height front requires no top fronts, not (no surrounds and top middle)
            return !groups.lrtf.present && !(!groups.lrs.present && groups.lrtm.present);
          } else if (spkCode === 'lrtf') { // top front requires no height fronts, not (no surrounds and top middle)
            return !groups.lrhf.present && !(!groups.lrs.present && groups.lrtm.present);
          } else if (spkCode === 'lrhr') { // height rear requires height/top fronts, no top rears
            return (groups.lrtf.present || groups.lrhf.present) && !groups.lrtr.present;
          } else if (spkCode === 'lrtr') { // top rear requires height/top fronts, no height rears
            return (groups.lrtf.present || groups.lrhf.present) && !groups.lrhr.present;
          } else if (spkCode === 'lrtm') { // top middle requires center or backs, and if height/top fronts, then also height/top rears
            return (groups.c.present || groups.lrb.present) && (!(groups.lrhf.present || groups.lrtf.present) || (groups.lrhr.present || groups.lrtr.present));
          }
        }

        return true;
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
        props, enableSpeakerToggle
      };
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