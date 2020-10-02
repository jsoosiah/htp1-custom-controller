<template>
  <Home />
</template>

<script>
import Home from './components/Home.vue';

export default {
  name: 'App',
  components: {
    Home,
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
