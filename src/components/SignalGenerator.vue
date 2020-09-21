<template>
  <div class="container">
    <div class="row mb-3">
      <div class="col">
        <h5>Signal Generator</h5>
        <two-state-button v-bind:button-text="`Signal Generator: ${mso.sgen?.sgensw}`" v-bind:state-on="mso.sgen?.sgensw === 'on'" @click="toggleSignalGenerator()" />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <table class="table table-sm table-striped">
          <thead>
            <tr>
              <th>
                Channel Select
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="channame in activeChannels">
              <td>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="channel" :id="`radio-${channame}`" :value="channame" :checked="mso.sgen?.select === channame" @click="setSignalGeneratorChannel(channame)">
                  <label class="form-check-label" :for="`radio-${channame}`">
                    {{spkName(channame)}}
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col">
        <table class="table table-sm table-striped">
          <thead>
            <tr>
              <th>
                Signal Select
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="signal in signalOptions">
              <td>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="signal" :id="`radio-${signal.value}`" :value="signal.value" :checked="mso.sgen?.signalType === signal.value" @click="setSignalGeneratorSignalType(signal.value)">
                  <label class="form-check-label" :for="`radio-${signal.value}`">
                    {{signal.label}}
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>

  import { computed } from 'vue';

  import useMso from '@/use/useMso.js';
  import useSpeakerGroups from '@/use/useSpeakerGroups.js';

  import TwoStateButton from './TwoStateButton.vue';

  export default {
    name: 'SignalGenerator',
    setup() {

      const { mso, toggleSignalGenerator, setSignalGeneratorChannel, setSignalGeneratorSignalType } = useMso();
      const { getActiveChannels, spkName } = useSpeakerGroups();

      const signalOptions = [
        {'label': '"THX-like" band limited noise', 'value': 'thx'},
        {'label': 'Louder reference noise', 'value': 'dolby'},
        {'label': 'Polarity pulse', 'value': 'pulse'},
        {'label': 'Left input as signal', 'value': 'left'},
        {'label': 'Right input as signal', 'value': 'right'},
      ];

      const activeChannels = computed(() => {
        return getActiveChannels(mso.value.speakers?.groups);
      });

      return { 
        mso, toggleSignalGenerator, setSignalGeneratorChannel, setSignalGeneratorSignalType, 
        activeChannels, spkName, signalOptions 
      };
    },
    components: {
      TwoStateButton
    }
  }
</script>

<style scoped>
  th {
    font-size:80%;
  }

  .col {
    padding-left: 0;
  }
</style>