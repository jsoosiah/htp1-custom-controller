<template>
  <three-state-button
    v-if = "mso.cal.slots[mso.cal.currentdiracslot].checksum !== 31802"
    :button-text="`Dirac ${mso.cal.diracactive}
      ${ mso.cal.diracactive=='on' && mso.cal.slots[mso.cal.currentdiracslot].hasBCFilter ? ' BC' : '   '}`"
    :states="{'off': 0, 'on': 1, 'bypass': 2}"
    :state-value="mso.cal.diracactive"
    @click="toggleDirac()"
    :home-button="props.homeButton"
    aria-label="Dirac status"
  />
  <three-state-button 
    v-if = "mso.cal.slots[mso.cal.currentdiracslot].checksum === 31802"
    button-text="No Filter"
    :states="{'off': 0}"
    :state-value="'off'"
    :home-button="props.homeButton"
    aria-label="Dirac status"
  />
</template>

<script>

  import useMso from '@/use/useMso.js';

  import ThreeStateButton from './ThreeStateButton.vue';

  export default {
    name: 'DiracButton',
    setup(props) {

      const { mso, toggleDirac } = useMso();

      return { mso, toggleDirac, props };
    }, 
    props: {
      className: String,
      homeButton: Boolean,
    },
    components: {
      ThreeStateButton
    }
  }
</script>

<style scoped>
  .home-btn {
    min-height: 3rem;
    min-width: 6rem;
    margin: 0.5rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .yellow-text-btn {
    color:yellow;
  }
</style>