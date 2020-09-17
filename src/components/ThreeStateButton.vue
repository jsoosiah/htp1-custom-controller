<template>
  <button class="btn" :class="buttonClasses">
    {{props.buttonText}}
  </button>
</template>

<script>

  import { computed } from 'vue';

  export default {
    name: 'ThreeStateButton',
    props: {
      states: {
        type: Object,
        required: true
      },
      // 0 = off
      // 1 = on
      // else = partial/other
      stateValue: {
        // type: Number,
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
      const buttonClasses = computed(() => {
        if (props.homeButton) {
          return {
            'home-btn': props.homeButton,
            'btn-dark': props.states[props.stateValue] !== 1,
            'btn-light': props.states[props.stateValue] === 1,
            'yellow-text-btn': props.states[props.stateValue] !== 0 && props.states[props.stateValue] !== 1
          };
        } else {
          return {
            'home-btn': props.homeButton,
            'btn-secondary': props.states[props.stateValue] !== 1,
            'btn-success': props.states[props.stateValue] === 1,
            'yellow-text-btn': props.states[props.stateValue] !== 0 && props.states[props.stateValue] !== 1
          };
        }
      });

      return { props, buttonClasses };
    }
  }
</script>

<style scoped>
  .btn {
    text-transform: uppercase;
    font-weight: 600;
  }

  .home-btn {
    min-height: 3rem;
    min-width: 6rem;
    margin: 0.5rem;
    text-transform: uppercase;
  }

  .yellow-text-btn {
    color: yellow;
  }

  .btn-dark, .btn-secondary {
    color: #dedad6;
  }
</style>