import { ref, computed } from 'vue';

const windowWidth = ref(0);

const isMobileMode = computed(() => {
  return windowWidth.value <= 768; // break point px width for mobile
});

const isXl = computed(() => {
  return windowWidth.value >= 1200;
});

const isLg = computed(() => {
  return windowWidth.value >= 992;
});

const isMd = computed(() => {
  return windowWidth.value >= 768;
});

const isSm = computed(() => {
  return windowWidth.value >= 576;
});

const isXs = computed(() => {
  return windowWidth.value < 576;
})

export default function useResponsive() {
  return { windowWidth, isMobileMode, isXl, isLg, isMd, isSm, isXs };
}