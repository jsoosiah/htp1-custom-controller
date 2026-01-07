<template>
  <div class="row mt-2 justify-content-center">
    <!-- Left button -->
    <div class="col-auto text-left" :class="{ 'px-0': isMobileMode }">
      <button
        v-press="onDownPress"
        v-long-press="onDownLongPress"
        v-long-press-up="onLongPressUp"
        type="button"
        class="btn btn-dark plus-minus-btn"
      >
        <font-awesome-icon
          :class="iconClass"
          :style="{'font-size': iconSize}"
          :icon="downIcon"
        />
      </button>
    </div>

    <!-- Center display -->
    <div class="col-auto text-center" :class="{ 'px-0': isMobileMode }" :style="{'width':displayTextWidth, 'padding': 0}">
      <span
        v-if="onDisplayPress"
        v-press="onDisplayPress"
        class="plus-minus-display"
        :style="{'font-size': displayFontSize}"
        :class="[displayTextClass, iconClass]"
      >
        <slot>{{ displayText }}</slot>
      </span>

      <span v-else :style="{'font-size': displayFontSize}" class="plus-minus-display" :class="[displayTextClass, iconClass]">
        <slot>{{ displayText }}</slot>
      </span>
    </div>

    <!-- Right button -->
    <div class="col-auto text-right"  :class="{ 'px-0': isMobileMode }">
      <button
        v-press="onUpPress"
        v-long-press="onUpLongPress"
        v-long-press-up="onLongPressUp"
        type="button"
        class="btn btn-dark plus-minus-btn"
      >
        <font-awesome-icon
          :class="iconClass"
          :style="{'font-size': iconSize}"
          :icon="upIcon"
        />
      </button>
    </div>
  </div>
</template>

<script>
import {computed} from 'vue';

import { LongPress, LongPressUp, Press } from '@/directives/Press.js';

export default {
  name: 'PlusMinusControl',
  directives: {
    LongPress,
    LongPressUp,
    Press,
  },
  props: {
    isMobileMode: {
      type: Boolean,
      default: false,
    },
    displayFontSize: {
      type: [String],
      requred: false,
      default: '1.75rem',
    },
    // extra class for display text (e.g. text-danger binding)
    displayTextClass: {
      type: [String, Array, Object],
      default: '',
    },
    displayTextWidth: {
      type: String,
      default: '11.5rem',
    },
    // class/binding for icons (e.g. {'text-danger': mso.muted})
    iconClass: {
      type: [String, Array, Object],
      default: '',
    },

    // icons
    downIcon: {
      type: [Array, String],
      required: true,
    },
    upIcon: {
      type: [Array, String],
      required: true,
    },
    iconSize: {
      type: String,
      default: '2x',
    },

    // display content (slot overrides this)
    displayText: {
      type: String,
      default: '',
    },

    // handlers
    onDownPress: {
      type: Function,
      required: true,
    },
    onUpPress: {
      type: Function,
      required: true,
    },
    onDownLongPress: {
      type: Function,
      default: null,
    },
    onUpLongPress: {
      type: Function,
      default: null,
    },
    onLongPressUp: {
      type: Function,
      default: null,
    },
    // optional click/press handler for display
    onDisplayPress: {
      type: Function,
      default: null,
    },
  },
  setup(props) {
    const lineHeight = computed(() => {
      console.log("props", props)
      return parseFloat(props.displayFontSize) > 2 ? 1.65 : 2.2;
    });

    return { lineHeight };
  }
};
</script>


<style scoped>

  .plus-minus-display {
    font-weight: bold;
    /* font-size:2rem; */
    cursor: pointer;
    color:white;
    /* line-height: 2; */
    line-height: v-bind('lineHeight')
  }

  .plus-minus-btn, .plus-minus-btn:focus, .plus-minus-btn:active {
    background-color: rgba(0,0,0,0) !important;
    box-shadow: none !important;
    outline:none;
    border:none;
    width:5rem;
    height:3rem;
    margin:.5rem 0 .5rem 0;
  }
</style>