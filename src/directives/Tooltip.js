import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling

const tippies = {};

function updateTippies(el, binding) {

  console.log('updateTippies', el.id);

  if (el.id) {
    if (tippies[el.id]) {
      tippies[el.id].destroy();
    }
  
    if (!binding.value.enabled && binding.value.message) {
      tippies[el.id] = tippy(el, {
        content: binding.value.message,
        placement: 'right'
      });
    }
  }
}

export const Tooltip = {
  beforeMount(el, binding) {
    updateTippies(el, binding);
  },
  updated(el, binding) {
    updateTippies(el, binding);
  },
};

// TODO destroy/update