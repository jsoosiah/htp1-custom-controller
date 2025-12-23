<template>
  <span style="position:relative">
    <three-state-button
      v-if="!diracNoFilter"
      :button-text="`Dirac Live ${ mso?.cal?.diracactive=='on' ? filterTypeToCssClass(mso?.cal?.slots[mso?.cal?.currentdiracslot].filterType, mso?.cal?.slots[mso?.cal?.currentdiracslot].name).toUpperCase() : ''} ${mso?.cal?.diracactive}`"
      :states="{'off': 0, 'on': 1, 'bypass': 2}"
      :state-value="mso?.cal?.diracactive"
      :home-button="props.homeButton"
      :show-state-indicators="props.homeButton"
      aria-label="Dirac Live status"
      min-width="9rem"
      @btn-click="toggleDirac()"
    />
    <three-state-button 
      v-if="diracNoFilter"
      button-text="Dirac Live No Filter"
      :states="{'off': 0}"
      :state-value="'off'"
      :home-button="props.homeButton"
      aria-label="Dirac Live status"
    />
    <div class="ml-2" style="position:absolute;top:1.8rem;left:0.75rem;z-index:1">
      <template v-if="diracErrorState === 'INACTIVE'">
        <span style="width:7.5rem;height:0.25rem;padding:0;opacity:0.5" class="badge badge-secondary">&nbsp;</span>
      </template>
      <template v-else-if="diracErrorState === 'GREEN'">
        <span style="width:7.5rem;height:0.25rem;padding:0" class="badge badge-success">&nbsp;</span>
      </template>
      <template v-else-if="diracErrorState === 'YELLOW'">
        <span style="width:7.5rem;height:0.25rem;padding:0" class="badge badge-warning">&nbsp;</span>
      </template>
      <template v-else>
        <span style="width:7.5rem;height:0.25rem;padding:0" class="badge badge-danger">&nbsp;</span>
      </template>
    </div>
  </span>
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

      const { mso, toggleDirac, diracNoFilter, filterTypeToCssClass, diracErrorState } = useMso();

      return { mso, toggleDirac, props, diracNoFilter, filterTypeToCssClass, diracErrorState };
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