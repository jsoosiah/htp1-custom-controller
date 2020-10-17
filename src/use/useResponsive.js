import { ref, computed } from 'vue';

const windowWidth = ref(0);

const isMobileMode = computed(() => {
  return windowWidth.value <= 768; // break point px width for mobile
});

export default function useResponsive() {
  return { windowWidth, isMobileMode };
}