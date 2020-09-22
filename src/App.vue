<template>
  <Home />
  <Debug v-if="debug" />
</template>

<script>
import Home from './components/Home.vue';
import Debug from './components/Debug.vue';

export default {
  name: 'App',
  components: {
    Home,
    Debug
  },
  computed: {
    debug: () => window.location.href.includes('debug')
  }
}
</script>

<style>
  body {
    color:#dedad6;
    background-color: black;
  }

  .hiding {
    transition: opacity 0.1s ease;
    opacity: 0;
  }

  .showing {
    transition: opacity 0.1s ease;
    opacity: 1;
  }
  
</style>
