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
                Channel Select {{showCrossoverControls}}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="channame in visibleChannels" :key="channame">
              <td>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="channel" :id="`radio-${channame}`" :value="channame" :checked="mso.sgen?.select === channame" @click="setSignalGeneratorChannel(channame)">
                  <label class="form-check-label" :for="`radio-${channame}`">
                    {{translatedSpkName(channame)}} <br/>
                    <small v-if="visibleChannels.length !== activeChannels.length && channame === 'sub1'" class="text-muted">
                      Individual subwoofer channels are unavailable when Dirac Bass Control is enabled.
                    </small>
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
            <tr v-for="signal in signalOptions" :key="signal.value">
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

  import TwoStateButton from './buttons/TwoStateButton.vue';
  import MultiStateButtonGroup from './buttons/MultiStateButtonGroup.vue';

  export default {
    name: 'SignalGenerator',
    setup() {

      const { mso, toggleSignalGenerator, setSignalGeneratorChannel, setSignalGeneratorSignalType,
      setSignalGeneratorOff, setSignalGeneratorOn, showCrossoverControls } = useMso();
      const { getActiveChannels, spkName } = useSpeakerGroups();

      const signalOptions = [
        {'label': '"THX-like" band limited noise', 'value': 'thx'},
        {'label': 'Louder reference noise', 'value': 'dolby'},
        {'label': 'Polarity pulse', 'value': 'pulse'},
        {'label': 'Left input as signal', 'value': 'left'},
        {'label': 'Right input as signal', 'value': 'right'},
      ];

      const lf = new Intl.ListFormat('en');

      const activeChannels = computed(() => {
        return getActiveChannels(mso.value.speakers?.groups);
      });

      const visibleChannels = computed(() => {
        console.log('visible', visibleChannels)
        return activeChannels.value.filter(
          channame => showCrossoverControls.value || (channame != 'sub2' && channame != 'sub3' && channame != 'sub4' && channame != 'sub5')
        );
      });

      function translatedSpkName(channame) {
        if (!showCrossoverControls.value && channame === 'sub1') {
          // let subLabel = 'Subwoofer 1';
          let subs = ['Subwoofer 1'];
          for (const channame of activeChannels.value) {
            // console.log('channame', channame)
            if (channame.startsWith('sub')) {
              const subNumber = channame[channame.length - 1];
              if (subNumber > 1) {
                subs.push(subNumber);
              }
            }
          }
          return lf.format(subs);
        }
        return spkName(channame);
      }

      return { 
        mso, toggleSignalGenerator, setSignalGeneratorChannel, setSignalGeneratorSignalType, 
        activeChannels, visibleChannels, translatedSpkName, signalOptions, setSignalGeneratorOff, setSignalGeneratorOn, showCrossoverControls
      };
    },
    components: {
      TwoStateButton,
      MultiStateButtonGroup
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