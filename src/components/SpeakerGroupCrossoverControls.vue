<template>

      <tr v-for="spk in speakers">
        <td>
          <div class="custom-control custom-switch">
            <input type="checkbox" class="custom-control-input" :id="'check-'+spk.code" :checked="mso.speakers.groups[spk.code]?.present" @click="toggleSpeakerChannel(spk.code)">
            <label :class="{'custom-control-label':spk.code !== 'lr', 'hidden-switch-label': spk.code === 'lr'}" :for="'check-'+spk.code">{{spk.label}}</label>
          </div>
        </td>
        <td class="text-right float-right">
          <template v-if="showCenterFreqControlsForSpeaker(spk.code)">
            <label class="sr-only" :for="'xo-'+spk.code">Crossover Frequency Center (Hz)</label>
            <div class="input-group input-group-sm mb-2 xo-select">
              <div class="input-group-prepend">
                <div class="input-group-text">fc</div>
              </div>
              <input type="number" step="10" min="40" max="200" class="form-control" :id="'xo-'+spk.code" :value="mso.speakers.groups[spk.code]?.fc" @change="({ type, target }) => setCenterFreq(spk.code, target.value)" >
              <div class="input-group-append">
                <div class="input-group-text">Hz</div>
              </div>
            </div>
          </template>
        </td>
        <td class="text-right">
          <template v-if="showCrossoverControlsForSpeaker(spk.code)">
            <div class="btn-group btn-group-sm" role="group" aria-label="Speaker Size">
              <button v-if="showDolby(spk.code)" @click="setSpeakerSize(spk.code, 'd')" type="button" class="btn" :class="{'btn-primary': mso.speakers.groups[spk.code].size === 'd', 'btn-secondary': mso.speakers.groups[spk.code].size !== 'd'}">Dolby</button>
              <button @click="setSpeakerSize(spk.code, 's')" type="button" class="btn" :class="{'btn-primary': mso.speakers.groups[spk.code].size === 's', 'btn-secondary': mso.speakers.groups[spk.code].size !== 's'}">Small</button>
              <button @click="setSpeakerSize(spk.code, 'l')" type="button" class="btn" :class="{'btn-primary': mso.speakers.groups[spk.code].size === 'l', 'btn-secondary': mso.speakers.groups[spk.code].size !== 'l'}">Large</button>
            </div>
          </template>
        </td>
      </tr>
</template>

<script>

  import useMso from '@/use/useMso.js';

  export default {
    'name': 'SpeakerGroupCrossoverControls',
    'props': {
      speakers: Array
    },
    setup({ speakers }) {

      const { mso, showCrossoverControls, toggleSpeakerChannel, setSpeakerSize, setCenterFreq } = useMso();

      function showCrossoverControlsForSpeaker(spkCode) {
        // console.log('showCrossoverControls', showCrossoverControls)
        return showCrossoverControls.value && !spkCode?.startsWith('sub');
      }

      function showCenterFreqControlsForSpeaker(spkCode) {
        return showCrossoverControlsForSpeaker(spkCode) && mso.value.speakers.groups[spkCode].size !== 'l';
      }

      function showDolby(spkCode) {
        return spkCode.includes('t'); // top
      }

      return { 
        mso, showCrossoverControls, toggleSpeakerChannel, setSpeakerSize, setCenterFreq,
        showCrossoverControlsForSpeaker, showCenterFreqControlsForSpeaker, showDolby 
      };
    }
  }
</script>

<style scoped>
  .table-sm td {
    padding:0 0.3rem;
    min-height: 2.5rem;
  }

  .xo-select {
    width: 7.5rem;
  }

  .xo-select input {
    text-align: right;
  }

  .hidden-switch-label {
    padding: 0;
    margin:0;
  }

</style>