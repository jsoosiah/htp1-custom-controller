<template>
  <div class="custom-btn-group">
    <button 
      class="btn btn-sm" 
      :class="{[props.homeButton?'btn-light':props.muteButton?'btn-danger':'btn-success']: props.stateOn, 
               [props.homeButton?'btn-dark':'btn-secondary']: !props.stateOn && !props.stateLoading, 
        
               'btn-progress-bar-animated': props.stateLoading,
               'home-btn': props.homeButton}"
      :style="{'min-width': props.minWidth}"
      @click="clicked"
    >
      {{ props.buttonText }}
    </button>
    <transition name="mfade">
      <ol
        v-if="props.showStateIndicators"
        v-show="props.recentlyInteracted || recentlyInteracted"
        class="carousel-indicators"
      >
        <li
          v-if="!props.singleIndicator"
          :class="{'active':!props.stateOn}"
        />
        <li :class="{'active-bright':props.stateOn}" />
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
      stateLoading: {
        type: Boolean,
        default: false,
      },
      homeButton: {
        type: Boolean,
        default: false
      },
      muteButton: {
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
      },
      recentlyInteracted: {
        type: Boolean,
        default: false,
      },
      singleIndicator: {
        type: Boolean,
        default: false,
      }
    },
    emits: ['btn-click'],
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

  .btn-progress-bar-animated {
    background-color: #6c757d;
    color:#dedad6;
    background-image: 
      repeating-linear-gradient(
        -45deg, 
        transparent, 
        transparent .75rem,
        rgba(0,0,0,.15) .75rem,
        rgba(0,0,0,.15) 1.5rem
      );
    background-size: 200% 200%;
    animation: barberpole 10s linear infinite;
  }

@keyframes barberpole {
  100% {
    background-position: 100% 100%;
  }
}

</style>