<template>
  <div
    class="btn-group"
    :class="{'btn': props.homeButton}"
  >
    <button
      v-for="(state) in props.states"
      :key="state.value"
      class="btn btn-sm" 
      :class="buttonClasses(state.value)"
      @click="e => setState(e, state.value)"
    >
      {{ state.label }}
    </button>
  </div>
</template>

<script>

  export default {
    name: 'MultiStateButtonGroup',
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
    },
    emits: ['set-off', 'set-on', 'set-other'],
    setup(props, { emit }) {

      function buttonClasses(buttonValue) {
        if (props.homeButton) {
          return {
            'home-btn': props.homeButton,
            // buttons that are not enabled
            'btn-off-home': props.stateValue !== buttonValue, 
            // if the ON button is enabled
            'btn-light': buttonValue === 1 && props.stateValue === 1,
            // if the off/other buttons are enabled
            'btn-dark': buttonValue !== 1 && props.stateValue === buttonValue,
            // if the other button is enabled
            'yellow-text-btn': buttonValue === 2 && props.stateValue === 2
          };
        } else {
          return {
            'home-btn': props.homeButton,
            // buttons that are not enabled
            'btn-off': props.stateValue !== buttonValue, 
            // if the ON button is enabled
            'btn-success': buttonValue === 1 && props.stateValue === 1,
            // if the off/other buttons are enabled
            'btn-secondary': buttonValue !== 1 && props.stateValue === buttonValue,
            // if the other button is enabled
            'yellow-text-btn': buttonValue === 2 && props.stateValue === 2
          };
        }
      }

      function setState(e, stateValue) {
        console.log('buttonc clicked', e)
        e.target.blur();
        switch(stateValue) {
          case 0:
            emit('set-off');
            break;
          case 1: 
            emit('set-on');
            break;
          case 2:
            emit('set-other');
            break;
        }
      }

      return { props, buttonClasses, setState };
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
    /*margin: 0.5rem;*/
    text-transform: uppercase;
  }

  .yellow-text-btn {
    color: yellow;
  }

  .btn-dark {
    color: #dedad6;
  }

  .btn-group-vertical button {
    height: 3rem;
    font-weight: 600;
  }

  .btn-off-home {
    color: #666;
    background-color: #191919;
  }

  .yellow-text-btn {
    color:yellow;
  }

  .btn-success {
    /*margin: .03125rem;*/
    /*outline: 1px solid rgba(0,0,0,.5);*/
    /*border-left: .03125rem solid rgba(40,167,68,.5);*/
    border-left: .03125rem solid rgba(0,0,0,.5);
    border-right: .03125rem solid rgba(40,167,68,.5);
  }

  .btn-off {
    border-left: .03125rem solid rgba(0,0,0,.25);
    border-right: .03125rem solid rgba(0,0,0,.25);
  }

</style>