<template>
  <div style="position:relative">
    <img
      class="speaker-mapping"
      :class="{'speaker-mapping-enlarged': enlarged, 'speaker-mapping-standard': !enlarged}"
      :src="speakerMapUrl"
      @click="toggleEnlarged()"
    >
    <span 
      v-for="(spk, i) in mso.speakers?.mapping" 
      :key="spk" 
      class="speaker-label" 
      :class="{'speaker-label-enlarged': enlarged, 
               'speaker-label-standard': !enlarged, 
               'hot': mso.speakers?.groups[reverseBmg[speakerLabels[spk?.trim()].toLowerCase()]].present !== false,
               'shaker': reverseBmg[speakerLabels[spk?.trim()].toLowerCase()] === seatShakerChannel ? '*' : ''}"
               
      :style="{left: 3.25 + (100 * i/19) + '%'}"
    >{{ speakerLabels[spk?.trim()] }}</span>
  </div>
</template>

<script>

  import { ref } from 'vue';

  import useMso from '@/use/useMso.js';
  import useSpeakerGroups from '@/use/useSpeakerGroups.js';

  import speakerMapUrl from '@/assets/HTP-1_back.webp';

  export default {
    name: 'SpeakerMap',
    setup() {
      
      const { mso, seatShakerChannel } = useMso();
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

    // console.log("reverseBmg", reverseBmg);

      for (let i = 0; i < mso.value.speakers?.mapping.length; i++) {
        let spk = mso.value.speakers?.mapping[i];
        // console.log('mapping',i, spk,speakerLabels[spk?.trim()], speakerLabels)
        // console.log('mapping',i, spk,speakerLabels[spk?.trim()].toLowerCase(), reverseBmg[speakerLabels[spk?.trim()].toLowerCase()])
      }

//{{speakerLabels[spk?.trim()].toLowerCase()}} {{reverseBmg[speakerLabels[spk?.trim()].toLowerCase()]

      return { mso, reverseBmg, enlarged, toggleEnlarged, speakerLabels, speakerMapUrl, seatShakerChannel };
    }
  }
</script>

<style scoped>
  .speaker-mapping-standard {
    width:100%;
    cursor:zoom-in;
  }

  .speaker-mapping-enlarged {
    width: 1200px;
    cursor:zoom-out;
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

  .shaker {
    color: yellow;
  }
</style>