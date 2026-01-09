<template>
  <multi-state-button-group
    v-if="!diracNoFilter"
    :states="[{value: 0, label: 'Dirac Live Off'}, {value: 2, label: 'Dirac Live Bypass'}, {value: 1, label: `Dirac Live ${(filterTypeToCssClass(diracFilterType, mso?.cal?.slots[mso?.cal?.currentdiracslot].name).toUpperCase())} On`}]"
    :state-value="mso.cal?.diracactive === 'on' ? 1 : mso.cal?.diracactive === 'off' ? 0 : 2"
    :home-button="props.homeButton"
    @set-on="setDiracOn"
    @set-off="setDiracOff"
    @set-other="setDiracBypass"
  />

  <multi-state-button-group
    v-if="diracNoFilter"
    :states="[{value: 0, label: 'Dirac Live No Filter'}]"
    :state-value="0"
    :home-button="props.homeButton"
  />

  <span class="ml-2">
    <template v-if="diracErrorState === 'INACTIVE'">
      <span v-tooltip="{'message': 'Dirac Live filter is not active.'}" :id="`${props.tooltipId}-tooltipinactive`">
        <span style="width:4rem" class="badge badge-secondary">Inactive</span>
        <font-awesome-icon class="ml-1" :icon="['fas', 'question-circle']" />
      </span>
    </template>
    <template v-else-if="diracErrorState === 'GREEN'">
      <span v-tooltip="{'message': 'Dirac Live calibration is active and filters are operating as expected.'}" :id="`${props.tooltipId}-tooltipsuccess`">
        <span style="width:4rem" class="badge badge-success">Active</span>
      </span>
      
    </template>
    <template v-else-if="diracErrorState === 'YELLOW'">
      <span v-tooltip="{'message': 'Dirac Live calibration is in an unexpected state. Try toggling Dirac Live off and back on to fix it.'}" :id="`${props.tooltipId}-tooltipwarning`">
        <span style="width:4rem" class="badge badge-warning">Warning</span>
        <font-awesome-icon class="ml-1" :icon="['fas', 'question-circle']" />
      </span>
    </template>
    <template v-else>
      <span v-tooltip="{'message': 'Dirac Live filter has failed to load. Try rebooting the HTP-1 to fix it.'}" :id="`${props.tooltipId}-tooltiperror`">
        <span style="width:4rem" class="badge badge-danger">Error</span>
        <font-awesome-icon class="ml-1" :icon="['fas', 'question-circle']" />
      </span>
      <div
        class="alert alert-danger small mt-3"
        role="alert"
      >
        Dirac Live filter has failed to load. Try restarting Dirac Live Server or restarting the HTP-1 to fix it.
        <button class="btn btn-sm btn-danger d-block mt-3" @click="concordRestart()">Restart Dirac Live Server</button>
      </div>
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
      tooltipId: String,
    },
    setup(props) {

      const { mso, setDiracOff, diracFilterType, setDiracBypass, setDiracOn, diracNoFilter, filterTypeToCssClass, diracErrorState, concordRestart } = useMso();

      return { mso, setDiracOff, diracFilterType, setDiracBypass, setDiracOn, diracNoFilter, filterTypeToCssClass, diracErrorState, concordRestart, props };
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