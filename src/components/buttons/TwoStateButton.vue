<template>
  <div class="custom-btn-group">
    <button 
      class="btn btn-sm" 
      :class="{[props.homeButton?'btn-light':'btn-success']: props.stateOn, [props.homeButton?'btn-dark':'btn-secondary']: !props.stateOn, 'home-btn': props.homeButton}"
      @click="clicked"
    >
      {{props.buttonText}}
    </button>
    <transition name="mfade">
      <ol class="carousel-indicators" v-if="props.showStateIndicators" v-show="recentlyInteracted">
        <li :class="{'active':!props.stateOn}"></li>
        <li :class="{'active-bright':props.stateOn}"></li>
      </ol>
    </transition>
  </div>
</template>

<script>

  import { watch, ref } from 'vue';

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
      },
      showStateIndicators: {
        type: Boolean,
        default: false,
      }
    },
    setup(props, { emit }) {

      const recentlyInteracted = ref(false);
      let recentlyInteractedTimeout;

      function clicked(e) {
        e.preventDefault();
        emit('btn-click');
        recentlyInteracted.value = true;
        clearTimeout(recentlyInteractedTimeout);
        recentlyInteractedTimeout = setTimeout(() => {
          recentlyInteracted.value = false;
        }, 3000);
      }

      return { props, recentlyInteracted, clicked };
    },
    emits: ['btn-click']
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

</style>