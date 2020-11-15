import 'hammerjs';

// ms length required to hold button before it is considered a long press
const LONG_PRESS_THRESHOLD = 350; 

export const LongPress = {
  beforeMount(el, binding) {
    if (typeof binding.value === 'function') {
      // eslint-disable-next-line no-undef
      const mc = new Hammer(el);
      mc.get("press").set({ time: LONG_PRESS_THRESHOLD });
      mc.on('press', binding.value);
    }
  }
};

export const LongPressUp = {
  beforeMount(el, binding) {
    if (typeof binding.value === 'function') {
    // eslint-disable-next-line no-undef
    const mc = new Hammer(el);
    mc.on('pressup pan touchmove touchcancel touchend', binding.value);
    }
  }
};

export const Press = {
  beforeMount(el, binding) {
    if (typeof binding.value === 'function') {
      // eslint-disable-next-line no-undef
      const mc = new Hammer(el);
      mc.get("press").set({ time: 0 });
      mc.on('press', binding.value);
    }
  }
};