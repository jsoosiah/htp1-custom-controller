<template>
  <div class="custom-btn-group">
    <button 
      class="btn btn-sm" 
      :class="buttonClasses" @click="clicked"
      :style="{'min-width': props.minWidth}"
    >
      {{props.buttonText}}
    </button>
    <transition name="mfade">
      <ol class="carousel-indicators" v-if="props.showStateIndicators" v-show="recentlyInteracted">
        <li :class="{'active':props.states[props.stateValue] === 0}"></li>
        <li :class="{'active':props.states[props.stateValue] === 2}"></li>
        <li :class="{'active-bright':props.states[props.stateValue] === 1}"></li>
      </ol>
    </transition>
  </div>
</template>

<script>

  import { computed, ref } from 'vue';

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
      },
      showStateIndicators: {
        type: Boolean,
        default: false,
      },
      minWidth: {
        type: String,
        default: '6rem',
      }
    },
    setup(props, { emit }) {

      const recentlyInteracted = ref(false);
      let recentlyInteractedTimeout;

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

      function clicked(e) {
        e.preventDefault();
        emit('btn-click');
        recentlyInteracted.value = true;
        clearTimeout(recentlyInteractedTimeout);
        recentlyInteractedTimeout = setTimeout(() => {
          recentlyInteracted.value = false;
        }, 3000);
      }

      return { props, buttonClasses, clicked, recentlyInteracted };
    },
    emits: ['btn-click']
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

  .btn-dark, .btn-secondary {
    color: #dedad6;
  }

  .yellow-text-btn {
    color: yellow;
  }

  .carousel-indicators {
    top: 3.1rem;
  }

  .carousel-indicators li {
    background-color: #444;
  }

  .carousel-indicators li.active{
    background-color: #444;
  }

  .carousel-indicators li.active-bright{
    background-color: #ddd;
  }

  .custom-btn-group {
    position: relative;
    display: inline-flex;
    vertical-align: middle;
    z-index: 1;
  }

  .mfade-enter-active,
  .mfade-leave-active {
    transition: opacity .5s ease;
  }

  .mfade-enter-from,
  .mfade-leave-to {
    opacity: 0;
  }

  button.btn:focus {
    outline:none;
    box-shadow: none;
  }

  .btn-dark:focus {
    background-color: #343a40;
  }

</style>