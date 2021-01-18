<template>
  <div class="transition-container">
    <h5>Personalize Interface</h5>
    <div class="row">
      <div class="col">
        <h6>Homepage Status Display</h6>
        <div class="mb-3">
          <table class="table table-sm table-striped table-responsive select">
            <thead>
              <tr>
                <th>
                  Top Left Label (Desktop Mode)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="topLabel in topLabels"
                :key="`left-${topLabel.code}`"
              >
                <td>
                  <div class="form-check">
                    <input 
                      :id="`radio-left-${topLabel.code}`" 
                      class="form-check-input" 
                      type="radio" 
                      name="left-label" 
                      :value="topLabel.code" 
                      :checked="mso.personalize?.homeLabels?.topLeft === topLabel.code" 
                      @click="setTopLeftLabel(topLabel.code)"
                    >
                    <label 
                      class="form-check-label" 
                      :for="`radio-left-${topLabel.code}`"
                    >
                      {{ topLabel.label }}
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <table class="table table-sm table-striped table-responsive select">
            <thead>
              <tr>
                <th>
                  Top Right Label (Desktop Mode)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="topLabel in topLabels"
                :key="`right-${topLabel.code}`"
              >
                <td>
                  <div class="form-check">
                    <input 
                      :id="`radio-right-${topLabel.code}`" 
                      class="form-check-input" 
                      type="radio" 
                      name="right-label" 
                      :value="topLabel.code" 
                      :checked="mso.personalize?.homeLabels?.topRight === topLabel.code" 
                      @click="setTopRightLabel(topLabel.code)"
                    >
                    <label 
                      class="form-check-label" 
                      :for="`radio-right-${topLabel.code}`"
                    >
                      {{ topLabel.label }}
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="custom-control custom-switch">
            <input 
              id="display-video" 
              type="checkbox" 
              class="custom-control-input" 
              :checked="mso.stat?.displayVideoStat" 
              @click="toggleVideoStatusHomePage()"
            >
            <label
              class="custom-control-label"
              for="display-video"
            >
              Display Video Status on Homepage
            </label>
          </div>
          <div class="custom-control custom-switch">
            <input 
              id="display-audio" 
              type="checkbox" 
              class="custom-control-input" 
              :checked="mso.stat?.displayAudioStat" 
              @click="toggleExtendedAudioStatus()"
            >
            <label
              class="custom-control-label"
              for="display-audio"
            >
              Display Audio Sample Rate on Homepage
            </label>
          </div>
        </div>
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
                    :id="'shortcut-'+'home'" 
                    type="checkbox" 
                    class="custom-control-input" 
                    :checked="mso.personalize?.shortcuts.home" 
                    @click="toggleShortcut('home')"
                  >
                  <label
                    class="custom-control-label"
                    :for="'shortcut-'+'home'"
                  >Home</label>
                </div>
              </td>
            </tr>
            <tr
              v-for="route in customizableSettingsRoutes"
              :key="route.path"
            >
              <td>
                <div class="custom-control custom-switch">
                  <input 
                    :id="'shortcut-'+route.path" 
                    type="checkbox" 
                    class="custom-control-input" 
                    :checked="mso.personalize?.shortcuts[route.path]" 
                    @click="toggleShortcut(route.path)"
                  >
                  <label
                    class="custom-control-label"
                    :for="'shortcut-'+route.path"
                  >{{ route.meta.label }}</label>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div class="custom-control custom-switch">
                  <input 
                    :id="'shortcut-'+'power'" 
                    type="checkbox" 
                    class="custom-control-input" 
                    :checked="mso.personalize?.shortcuts.power" 
                    @click="toggleShortcut('power')"
                  >
                  <label
                    class="custom-control-label"
                    :for="'shortcut-'+'power'"
                  >Power Off</label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <template v-if="mso.personalize?.shortcuts?.power === true">
          <h6>Power Off Shortcut Buttons</h6>
          <table class="table table-sm table-responsive table-striped">
            <thead>
              <tr>
                <th>Show Button</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="powerButton in powerButtons"
                :key="powerButton.code"
              >
                <td>
                  <div class="custom-control custom-switch">
                    <input 
                      :id="'powerbutton-'+powerButton.code" 
                      type="checkbox" 
                      class="custom-control-input" 
                      :checked="mso.personalize?.powerDialogButtons[powerButton.code]" 
                      @click="toggleShowPowerDialogButton(powerButton.code)"
                    >
                    <label
                      class="custom-control-label"
                      :for="'powerbutton-'+powerButton.code"
                    >{{ powerButton.label }}</label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
        <h6>Homepage Modes</h6>
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
                    :id="'showmode-'+mode.code" 
                    type="checkbox" 
                    class="custom-control-input" 
                    :checked="mso.personalize?.modes[mode.code]" 
                    @click="toggleShowMode(mode.code)"
                  >
                  <label
                    class="custom-control-label"
                    :for="'showmode-'+mode.code"
                  >{{ mode.label }}</label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <h6>Homepage Dirac Slots</h6>
        <table class="table table-sm table-responsive table-striped">
          <thead>
            <tr>
              <th>Show Button</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(slot, key) in mso.cal?.slots"
              :key="key"
            >
              <td>
                <div class="custom-control custom-switch">
                  <input 
                    :id="'showdiracslot-'+key" 
                    type="checkbox" 
                    class="custom-control-input" 
                    :checked="mso.personalize?.diracSlots[key]" 
                    @click="toggleShowDiracSlot(key)"
                  >
                  <label
                    class="custom-control-label"
                    :for="'showdiracslot-'+key"
                  >{{ slot.name }}</label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <h6>Homepage Macros</h6>
        <table
          v-if="mso.svronly"
          class="table table-sm table-responsive table-striped"
        >
          <thead>
            <tr>
              <th>Show Button</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(name, key) in mso.svronly.macroNames"
              :key="key"
            >
              <td>
                <div class="custom-control custom-switch">
                  <input 
                    :id="'showmacro-'+key" 
                    type="checkbox" 
                    class="custom-control-input" 
                    :checked="mso.personalize?.macros[key]" 
                    @click="toggleShowMacro(key)"
                  >
                  <label
                    class="custom-control-label"
                    :for="'showmacro-'+key"
                  >{{ mso.svronly.macroNames[key] }}</label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <h6>Notices</h6>
        <button 
          class="btn btn-sm btn-primary mb-3"
          @click="resetDismissedAlerts"
        >
          Restore All Dismissed Notices
        </button>
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

  import { computed } from 'vue';

  import useMso from '@/use/useMso.js';
  import useInputs from '@/use/useInputs.js';

  import { settingsRoutes } from '@/router.js';

  import Home from './Home.vue';

  export default {
    name: 'Inputs',
    components: {
      Home,
    },
    setup() {

      const modes = [
        {code: 'dirac', label: 'Dirac'},
        {code: 'peq', label: 'PEQ'},
        {code: 'tone', label: 'Tone Control'},
        {code: 'loudness', label: 'Loudness'},
        {code: 'dialogenh', label: 'Dialog Enhance'},
        {code: 'night', label: 'Night'},
        {code: 'ws', label: 'Wide Synth'},
      ];

      const topLabels = [
        {code: null, label: 'None'},
        {code: 'current-input', label: 'Current Input'},
        {code: 'unit-name', label: 'Unit Name'},
      ];

      const powerButtons = [
        {code: 'shutdown', label: 'Shutdown'},
        {code: 'sleep', label: 'Sleep'},
        {code: 'restart', label: 'Restart'},
        {code: 'cancel', label: 'Cancel'},
      ];

      const customizableSettingsRoutes = computed(() => {
        return settingsRoutes.filter(route => route.meta?.label);
      });

      return { ...useMso(), ...useInputs(), modes, customizableSettingsRoutes, topLabels, powerButtons };
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
    max-width: 27rem;
    background-color: black;
  }

  table.select th {
    font-size:87.5%;
    font-weight: normal;
    border-top: 0px;
  }

</style>