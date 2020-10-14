<template>
  <div class="transition-container">
    <h5>Personalize Interface</h5>
    <div class="row">
      <div class="col">
        <h6>Status Display</h6>
        <div class="mb-3">
          <div class="custom-control custom-switch">
            <input 
              type="checkbox" 
              class="custom-control-input" 
              id="display-video" 
              :checked="mso.stat?.displayVideoStat" 
              @click="toggleVideoStatusHomePage()"
            >
            <label class="custom-control-label" for="display-video">
              Display Video Status on Home Page
            </label>
          </div>
          <div class="custom-control custom-switch">
            <input 
              type="checkbox" 
              class="custom-control-input" 
              id="display-audio" 
              :checked="mso.stat?.displayAudioStat" 
              @click="toggleExtendedAudioStatus()"
            >
            <label class="custom-control-label" for="display-audio">
              Display Audio Sample Rate on Home Page
            </label>
          </div>
        </div>
        <h6>Modes</h6>
        <table class="table table-sm table-responsive table-striped">
          <thead>
            <tr>
              <th>Show Button</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="mode in modes"
              :key="mode.code"
            >
              <td>
                <div class="custom-control custom-switch">
                  <input 
                    type="checkbox" 
                    class="custom-control-input" 
                    :id="'showmode-'+mode.code" 
                    :checked="mso.personalize?.modes[mode.code]" 
                    @click="toggleShowMode(mode.code)"
                  >
                  <label class="custom-control-label" :for="'showmode-'+mode.code">{{ mode.label }}</label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
                    :id="'shortcut-'+'home'" 
                    :checked="mso.personalize?.shortcuts.home" 
                    @click="toggleShortcut('home')"
                  >
                  <label class="custom-control-label" :for="'shortcut-'+'home'">Home</label>
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
                    :id="'shortcut-'+route.path" 
                    :checked="mso.personalize?.shortcuts[route.path]" 
                    @click="toggleShortcut(route.path)"
                  >
                  <label class="custom-control-label" :for="'shortcut-'+route.path">{{ route.meta.label }}</label>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div class="custom-control custom-switch">
                  <input 
                    type="checkbox" 
                    class="custom-control-input" 
                    :id="'shortcut-'+'power'" 
                    :checked="mso.personalize?.shortcuts.power" 
                    @click="toggleShortcut('power')"
                  >
                  <label class="custom-control-label" :for="'shortcut-'+'power'">Power Off</label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-auto">
        <h6>Preview</h6>
        <div class="home-preview pt-2">
          <home />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import useMso from '@/use/useMso.js';
  import useInputs from '@/use/useInputs.js';

  import { settingsRoutes } from '@/router.js';

  import Home from './Home.vue';
  import TwoStateButton from './buttons/TwoStateButton.vue';

  export default {
    name: 'Inputs',
    setup() {

      const modes = [
        {code: 'dirac', label: 'Dirac'},
        {code: 'peq', label: 'PEQ'},
        {code: 'tone', label: 'Tone Control'},
        {code: 'loudness', label: 'Loudness'},
        {code: 'dialogenh', label: 'Dialog Enhance'},
        {code: 'night', label: 'Night'},
      ];

      return { ...useMso(), ...useInputs(), modes, settingsRoutes };
    },
    components: {
      Home,
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

  div.home-preview {
    max-width: 400px;
    background-color: black;
  }
</style>