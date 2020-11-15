<template>
  <div class="custom-btn-group">
    <button
      class="btn btn-sm"
      :class="buttonClasses"
      @click="clicked"
    >
      {{ `${((((mso.status?.raw?.streamType >= 33) && (mso.status?.raw?.streamType <= 44) &&
        ((mso.status?.raw?.streamInfoBytes[0] % 32) >= 16))) ? 'DTS ' : '')}
        Dialog Enhance ${mso.dialogEnh == 0 ? 'off' : mso.dialogEnh + ' dB'}` }}
    </button>
    <transition name="mfade">
      <ol
        v-if="props.showStateIndicators"
        v-show="recentlyInteracted"
        class="carousel-indicators"
      >
        <li :class="{'active':mso.dialogEnh === 0}" />
        <li :class="{'active-bright':mso.dialogEnh === 1}" />
        <li :class="{'active-bright':mso.dialogEnh === 2}" />
        <li :class="{'active-bright':mso.dialogEnh === 3}" />
        <li :class="{'active-bright':mso.dialogEnh === 4}" />
        <li :class="{'active-bright':mso.dialogEnh === 5}" />
        <li :class="{'active-bright':mso.dialogEnh === 6}" />
      </ol>
    </transition>
  </div>
</template>

<script>

  import { computed, ref } from 'vue';

  import useMso from '@/use/useMso.js';

  export default {
    name: 'DialogEnhanceButton',
    props: {
      homeButton: {
        type: Boolean,
        default: false
      },
      showStateIndicators: {
        type: Boolean,
        default: false,
      }
    },
    setup(props) {

      const { mso, setNextDtsDialogEnh } = useMso();

      const recentlyInteracted = ref(false);
      let recentlyInteractedTimeout;

      const buttonClasses = computed(() => {
        if (props.homeButton) {
          return {
            'home-btn': props.homeButton,
            'btn-dark': mso.value.dialogEnh === 0,
            'btn-light': mso.value.dialogEnh > 0
          };
        } else {
          return {
            'home-btn': props.homeButton,
            'btn-secondary': mso.value.dialogEnh !== 1,
            'btn-success': mso.value.dialogEnh > 0
          };
        }
      });

      function clicked() {
        setNextDtsDialogEnh();
        recentlyInteracted.value = true;
        clearTimeout(recentlyInteractedTimeout);
        recentlyInteractedTimeout = setTimeout(() => {
          recentlyInteracted.value = false;
        }, 3000);
      }

      return { mso, clicked, props, buttonClasses, recentlyInteracted };
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
    min-width: 10.75rem;
    margin: 0.5rem;
    text-transform: uppercase;
  }

  .yellow-text-btn {
    color: yellow;
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

</style>