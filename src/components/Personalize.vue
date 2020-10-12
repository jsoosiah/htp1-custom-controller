<template>
  <div class="transition-container">
    <h5>Personalize Interface</h5>
    <h6>Shortcuts</h6>
    <table class="table table-sm table-responsive table-striped">
      <thead>
        <tr>
          <th>Show Shortcut</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="custom-control custom-switch">
              <input 
                type="checkbox" 
                class="custom-control-input" 
                :id="'visible-'+'home'" 
                :checked="mso.personalize?.shortcuts.home" 
                @click="toggleShortcut('home')"
              >
              <label class="custom-control-label" :for="'visible-'+'home'">Home</label>
            </div>
          </td>
        </tr>
        <tr
          v-for="route in settingsRoutes"
          :key="route.path"
        >
          <td>
            <div class="custom-control custom-switch">
              <input 
                type="checkbox" 
                class="custom-control-input" 
                :id="'visible-'+route.path" 
                :checked="mso.personalize?.shortcuts[route.path]" 
                @click="toggleShortcut(route.path)"
              >
              <label class="custom-control-label" :for="'visible-'+route.path">{{ route.meta.label }}</label>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="custom-control custom-switch">
              <input 
                type="checkbox" 
                class="custom-control-input" 
                :id="'visible-'+'power'" 
                :checked="mso.personalize?.shortcuts.power" 
                @click="toggleShortcut('power')"
              >
              <label class="custom-control-label" :for="'visible-'+'power'">Power Off</label>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

  import useMso from '@/use/useMso.js';
  import useInputs from '@/use/useInputs.js';

  import { settingsRoutes } from '@/router.js';

  import TwoStateButton from './buttons/TwoStateButton.vue';

  export default {
    name: 'Inputs',
    setup() {

      function getFormatDetectOptions(menuSounds) {
        switch (menuSounds) {
          case 1:
            return [];
          case 2:
            return [
              {label: 'Auto', value: 'auto'},
              {label: 'Biased', value: 'biased'}
            ];
          case 3:
            return [
              {label: 'Auto', value: 'auto'},
              {label: 'Biased', value: 'biased'},
              {label: 'Indicated', value: 'indicated'}
            ];
        } 
      }

      return { ...useMso(), ...useInputs(), settingsRoutes };
    },
    components: {
      TwoStateButton,
    }
  }
</script>

<style scoped>
  th {
    font-size: 80%;
  }

  table .form-control {
    min-width: 6rem;
  }

  .numeric-input .form-control {
    min-width: auto;
  }

  div.bluetooth-input {
    width: 10rem;
  }
</style>