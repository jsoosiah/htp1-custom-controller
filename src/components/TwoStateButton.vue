<template>
  <button class="btn btn-sm" :class="{[props.homeButton?'btn-light':'btn-success']: props.stateOn, [props.homeButton?'btn-dark':'btn-secondary']: !props.stateOn, 'home-btn': props.homeButton}">
    {{props.buttonText}}
  </button>
</template>

<script>

  import { watch } from 'vue';

  export default {
    name: 'TwoStateButton',
    props: {
      stateOn: {
        type: Boolean,
        required: true
      },
      homeButton: {
        type: Boolean,
        default: false
      },
      buttonText: {
        type: String,
        required: true,
      }
    },
    setup(props) {
      return { props };
    }
  }
</script>

<style scoped>
  .btn {
    text-transform: uppercase;
    font-weight: 600;
    min-width: 7rem;
  }

  .home-btn {
    min-height: 3rem;
    
    margin: 0.5rem;
  }

  .btn-dark, .btn-secondary {
    color: #dedad6;
  }

</style>