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
  <span class="ml-2">
    <template v-if="diracErrorState === 'INACTIVE'">
      <span v-tooltip="{'message': 'Dirac filter is not active.'}" :id="`tooltipinactive`">
        <span class="badge badge-secondary">Inactive</span>
        <font-awesome-icon class="ml-1" :icon="['fas', 'question-circle']" />
      </span>
    </template>
    <template v-else-if="diracErrorState === 'GREEN'">
      <span v-tooltip="{'message': 'Dirac calibration is active and filters are operating as expected.'}" :id="`tooltipsuccess`">
        <span class="badge badge-success">Active</span>
      </span>
    </template>
    <template v-else-if="diracErrorState === 'YELLOW'">
      <span v-tooltip="{'message': 'Dirac calibration is in an unexpected state. Try toggling Dirac off and back on to fix it.'}" :id="`tooltipwarning`">
        <span class="badge badge-warning">Warning</span>
        <font-awesome-icon class="ml-1" :icon="['fas', 'question-circle']" />
      </span>
    </template>
    <template v-else>
      <span v-tooltip="{'message': 'Dirac filter has failed to load. Try rebooting the HTP-1 to fix it.'}" :id="`tooltiperror`">
        <span class="badge badge-danger">Error</span>
        <font-awesome-icon class="ml-1" :icon="['fas', 'question-circle']" />
      </span>
    </template>
  </span>
</template>

<script>

  import { Tooltip } from '@/directives/Tooltip.js';
  import useMso from '@/use/useMso.js';

  import MultiStateButtonGroup from './MultiStateButtonGroup.vue';

  export default {
    name: 'DiracButtonGroup',
    directives: {
      Tooltip,
    },
    components: {
      MultiStateButtonGroup
    },
    props: {
      className: String,
      homeButton: Boolean,
    },
    setup(props) {

      const { mso, setDiracOff, diracFilterType, setDiracBypass, setDiracOn, diracNoFilter, filterTypeToCssClass, diracErrorState } = useMso();

      return { mso, setDiracOff, diracFilterType, setDiracBypass, setDiracOn, diracNoFilter, filterTypeToCssClass, diracErrorState, props };
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