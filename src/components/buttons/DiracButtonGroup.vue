<template>
  <multi-state-button-group
    v-if="!diracNoFilter"
    :states="[{value: 0, label: 'Dirac Off'}, {value: 2, label: 'Dirac Bypass'}, {value: 1, label: `Dirac ${(filterTypeToCssClass(diracFilterType, mso?.cal?.slots[mso?.cal?.currentdiracslot].name).toUpperCase())} On`}]"
    :state-value="mso.cal?.diracactive === 'on' ? 1 : mso.cal?.diracactive === 'off' ? 0 : 2"
    :home-button="props.homeButton"
    @set-on="setDiracOn"
    @set-off="setDiracOff"
    @set-other="setDiracBypass"
  />

  <multi-state-button-group
    v-if="diracNoFilter"
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

      const { mso, setDiracOff, diracFilterType, setDiracBypass, setDiracOn, diracNoFilter, filterTypeToCssClass } = useMso();

      return { mso, setDiracOff, diracFilterType, setDiracBypass, setDiracOn, diracNoFilter, filterTypeToCssClass, props };
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