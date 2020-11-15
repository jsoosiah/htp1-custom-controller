<template>
  <div
    v-if="!mso.personalize?.dismissedAlerts[props.alertKey]"
    class="alert alert-dismissible small"
    :class="props.class"
    role="alert"
  >
    <slot />
    <button 
      type="button" 
      class="close" 
      data-dismiss="alert" 
      aria-label="Close"
      @click="dismissAlert(props.alertKey)"
    >
      <span aria-hidden="true">×</span>
    </button>
  </div>
</template>

<script>

  import useMso from '@/use/useMso.js';

  export default {
    name: 'DismissableAlert',
    props: {
      class: {
        type: String,
        default: 'alert-info'
      },
      alertKey: {
        type: String,
        required: true,
      }
    },
    setup(props) {

      return { ...useMso(), props };
    },
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

  .close {
    font-size: 1rem;
  }
</style>