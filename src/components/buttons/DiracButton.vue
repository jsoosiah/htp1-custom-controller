<template>
  <three-state-button
    v-if="!diracNoFilter"
    :button-text="`Dirac ${ mso?.cal?.diracactive=='on' ? filterTypeToCssClass(mso?.cal?.slots[mso?.cal?.currentdiracslot].filterType, mso?.cal?.slots[mso?.cal?.currentdiracslot].name).toUpperCase() : ''} ${mso?.cal?.diracactive}`"
    :states="{'off': 0, 'on': 1, 'bypass': 2}"
    :state-value="mso?.cal?.diracactive"
    :home-button="props.homeButton"
    :show-state-indicators="props.homeButton"
    aria-label="Dirac status"
    min-width="7.125rem"
    @btn-click="toggleDirac()"
  />
  <three-state-button 
    v-if="diracNoFilter"
    button-text="Dirac No Filter"
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
    components: {
      ThreeStateButton
    }, 
    props: {
      homeButton: Boolean,
    },
    setup(props) {

      const { mso, toggleDirac, diracNoFilter, filterTypeToCssClass } = useMso();

      return { mso, toggleDirac, props, diracNoFilter, filterTypeToCssClass };
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