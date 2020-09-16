<template>
  <button class="btn home-btn" 
      @click="toggleDirac()"
      v-if = "mso.cal.slots[mso.cal.currentdiracslot].checksum !== 31802"
      :class="{'btn-light':mso.cal.diracactive==='on','btn-dark':mso.cal.diracactive==='bypass'||mso.cal.diracactive==='off','yellow-text-btn':mso.cal.diracactive==='bypass','btn-off':mso.cal.diracactive==='off'}" aria-label="Dirac status">
      Dirac {{mso.cal.diracactive}}
      {{ mso.cal.diracactive=='on' && mso.cal.slots[mso.cal.currentdiracslot].hasBCFilter ? ' BC' : '   '}}
  </button>
  <button class="btn home-btn" 
      v-if = "mso.cal.slots[mso.cal.currentdiracslot].checksum === 31802"
      aria-label="Dirac status">
      No Filter
  </button>
</template>

<script>

  import useMso from '@/use/useMso.js';

  export default {
    name: 'DiracButton',
    setup() {

      const { mso, toggleDirac } = useMso();

      return { mso, toggleDirac };
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