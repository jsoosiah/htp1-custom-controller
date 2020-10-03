<template>
  <div style="position:relative">
    <img class="speaker-mapping" :class="{'speaker-mapping-enlarged': enlarged, 'speaker-mapping-standard': !enlarged}" @click="toggleEnlarged()" :src="require('@/assets/HTP-1_back.webp')" />
    <span 
      class="speaker-label" 
      :class="{'speaker-label-enlarged': enlarged, 
      'speaker-label-standard': !enlarged, 
      'hot': mso.speakers?.groups[reverseBmg[speakerLabels[spk?.trim()].toLowerCase()]].present !== false}" 
      v-for="(spk, i) in mso.speakers?.mapping" 
      :key="spk"
      :style="{left: 3.25 + (100 * i/19) + '%'}"
    >{{ speakerLabels[spk?.trim()] }}</span>
  </div>
</template>

<script>

  import { ref } from 'vue';

  import useMso from '@/use/useMso.js';
  import useSpeakerGroups from '@/use/useSpeakerGroups.js';

  export default {
    name: 'SpeakerMap',
    setup() {
      
      const { mso } = useMso();
      const { reverseBmg } = useSpeakerGroups();

      const enlarged = ref(false);

      function toggleEnlarged() {
        enlarged.value = !enlarged.value;
      }

      const speakerLabels = {
        'Left front': 'L',
        'Right front': 'R',
        'Center': 'C',
        'Subwoofer': 'Sub1',
        'Subwoofer 2': 'Sub2',
        'Subwoofer 3': 'Sub3',
        'Subwoofer 4': 'Sub4',
        'Subwoofer 5': 'Sub5',
        'Left Surround': 'LS',
        'Right Surround': 'RS',
        'Left Back': 'LB',
        'Right Back': 'RB',
        'Left Top Front': 'LTF',
        'Right Top Front': 'RTF',
        'Left Top Middle': 'LTM',
        'Right Top Middle': 'RTM',
        'Left Top Rear': 'LTR',
        'Right Top Rear': 'RTR',
        'Left High Front': 'LFH',
        'Right High Front': 'RFH',
        'Left High Rear': 'LRH',
        'Right High Rear': 'RRH',
        'Left Wide': 'LW',
        'Right Wide': 'RW'
      };

    console.log(reverseBmg);

      for (let i = 0; i < mso.value.speakers?.mapping.length; i++) {
        let spk = mso.value.speakers?.mapping[i];
        console.log('mapping',i, spk,speakerLabels[spk?.trim()].toLowerCase(), reverseBmg[speakerLabels[spk?.trim()].toLowerCase()])
      }

//{{speakerLabels[spk?.trim()].toLowerCase()}} {{reverseBmg[speakerLabels[spk?.trim()].toLowerCase()]

      return { mso, reverseBmg, enlarged, toggleEnlarged, speakerLabels };
    }
  }
</script>

<style scoped>

  .speaker-mapping {
    cursor: pointer;
  }

  .speaker-mapping-standard {
    width:100%;
  }

  .speaker-mapping-enlarged {
    width: 1200px;
  }

  .speaker-label {
    text-align: center;
    width: 5.4%;
    position: absolute;
    bottom:20%;
    left:0;
    font-weight: 600;
    color:#bbb;
  }

  .hot {
    color:lawngreen;
  }

  .speaker-label-standard {
    font-weight: normal;
    font-size:min(1vw,1rem);
  }
</style>