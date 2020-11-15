<template>
  <multi-state-button-group
    v-if="mso?.cal?.slots[mso?.cal?.currentdiracslot].checksum !== 31802"
    :states="[{value: 0, label: 'Dirac Off'}, {value: 2, label: 'Dirac Bypass'}, {value: 1, label: 'Dirac On' + (mso?.cal?.slots[mso?.cal?.currentdiracslot].hasBCFilter ? ' BC' : '   ')}]"
    :state-value="mso.cal?.diracactive === 'on' ? 1 : mso.cal?.diracactive === 'off' ? 0 : 2"
    :home-button="props.homeButton"
    @set-on="setDiracOn"
    @set-off="setDiracOff"
    @set-other="setDiracBypass"
  />

  <multi-state-button-group
    v-if="mso?.cal?.slots[mso?.cal?.currentdiracslot].checksum === 31802"
    :states="[{value: 0, label: 'Dirac No Filter'}]"
    :state-value="0"
    :home-button="props.homeButton"
  />
</template>

<script>

  import useMso from '@/use/useMso.js';

  import MultiStateButtonGroup from './MultiStateButtonGroup.vue';

  export default {
    name: 'DiracButtonGroup',
    components: {
      MultiStateButtonGroup
    },
    props: {
      className: String,
      homeButton: Boolean,
    },
    setup(props) {

      const { mso, setDiracOff, setDiracBypass, setDiracOn } = useMso();

      return { mso, setDiracOff, setDiracBypass, setDiracOn, props };
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