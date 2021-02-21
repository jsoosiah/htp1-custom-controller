<template>
  <div class="container">
    <div class="row justify-content-between">
      <div class="col-auto">
        <h5>Volume Control Setup</h5>
      </div>
      <div class="col-auto">
        <div class="custom-control custom-switch">
          <input 
            id="display-adv-input" 
            type="checkbox" 
            class="custom-control-input" 
            :checked="showAdvancedVolumeSettings" 
            @click="toggleShowAdvancedVolumeSettings()"
          >
          <label
            class="custom-control-label"
            for="display-adv-input"
          >
            Show Advanced Settings
          </label>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <dismissable-alert alert-key="volume-main">
          Advanced users may wish to configure the operation of the volume control. 

          The master volume of the system is the result of analog volume control and digital volume control.  Several items can be adjusted under user control.
        </dismissable-alert>
      </div>
    </div>
    <div class="row">
      <h6>Volume Limits</h6>
    </div>
    <div class="row">
      <dismissable-alert alert-key="volume-limits">
        The minimum and maximum volume sets limits on the master volume of the system. 
      </dismissable-alert>
    </div>
    <div class="row">
      <div class="col-xs-auto">
        <div class="form-group">
          <label
            for="inputEmail3"
            class="col-form-label col-form-label-sm"
          >Min. Volume</label>
          <div class="container">
            <div class="row">
              <div class="col">
                <div class="input-group input-group-sm numeric-input">
                  <input
                    type="number"
                    class="form-control"
                    aria-label="Minimum volume"
                    aria-describedby="basic-addon2"
                    :value="mso.cal?.vpl"
                    min="-100"
                    max="-60"
                    @change="({ type, target }) => setMinVolume(target.value)"
                  >
                  <div class="input-group-append">
                    <span
                      id="basic-addon2"
                      class="input-group-text"
                    >dB</span>
                  </div>
                </div>
              </div>
              <div class="col">
                <button 
                  class="btn btn-sm btn-primary form-control"
                  @click="setDefaultMinVolume()"
                >
                  Default
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-auto">
        <div class="form-group">
          <label
            for="inputEmail3"
            class="col-form-label col-form-label-sm"
          >Max. Volume</label>
          <div class="container">
            <div class="row">
              <div class="col">
                <div class="input-group input-group-sm numeric-input">
                  <input
                    type="number"
                    class="form-control"
                    aria-label="Minimum volume"
                    aria-describedby="basic-addon2"
                    :value="mso.cal?.vph"
                    min="-59"
                    max="22"
                    @change="({ type, target }) => setMaxVolume(target.value)"
                  >
                  <div class="input-group-append">
                    <span
                      id="basic-addon2"
                      class="input-group-text"
                    >dB</span>
                  </div>
                </div>
              </div>
              <div class="col">
                <button 
                  class="btn btn-sm btn-primary form-control"
                  @click="setDefaultMaxVolume()"
                >
                  Default
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <h6>Output Level</h6>
      <dismissable-alert alert-key="volume-output-level">
        The maximum output level controls the limit of the analog volume control.  It is intended to allow users to adjust the output of the HTP-1 to match their amplifier(s).  The <a
          :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
          target="_blank"
        >user guide</a> includes a more detailed discussion of the issues that go into choosing the right output level. 
      </dismissable-alert>
    </div>
    <div class="row">
      <div class="col-xs-auto">
        <div class="form-group">
          <label
            for="inputEmail3"
            class="col-form-label col-form-label-sm"
          >Max. Output Level</label>
          <div class="container">
            <div class="row">
              <div class="col">
                <div class="input-group input-group-sm numeric-input">
                  <input
                    type="number"
                    class="form-control"
                    aria-label="Minimum volume"
                    aria-describedby="basic-addon2"
                    :value="mso.cal?.ampsense"
                    min="0.1"
                    max="4"
                    step="0.1"
                    @change="({ type, target }) => setMaxOutputLevel(target.value)"
                  >
                  <div class="input-group-append">
                    <span
                      id="basic-addon2"
                      class="input-group-text"
                    >Vrms</span>
                  </div>
                </div>
              </div>
              <div class="col">
                <button 
                  class="btn btn-sm btn-primary form-control"
                  @click="setDefaultMaxOutputLevel()"
                >
                  Default
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template v-if="showAdvancedVolumeSettings">
      <div class="row">
        <h6>Zero Point</h6>
        <dismissable-alert alert-key="volume-zero-point">
          Set zero point to this many dB below full scale.  The default master volume display reads in dB full scale.  This control changes only the number displayed on the front panel.  While the default reads in dB full scale, some users prefer to set the zero point to match the amount of headroom in the system.
        </dismissable-alert>
      </div>
      <div class="row">
        <div class="col-xs-auto">
          <div class="form-group">
            <label
              for="inputEmail3"
              class="col-form-label col-form-label-sm "
            >Zero Point</label>
            <div class="container">
              <div class="row">
                <div class="col">
                  <div class="input-group input-group-sm numeric-input">
                    <input
                      type="number"
                      class="form-control"
                      aria-label="Minimum volume"
                      aria-describedby="basic-addon2"
                      :value="mso.cal?.zeroPoint"
                      :min="-100"
                      :max="22"
                      @change="({ type, target }) => setZeroPoint(target.value)"
                    >
                    <div class="input-group-append">
                      <span
                        id="basic-addon2"
                        class="input-group-text"
                      >dB</span>
                    </div>
                  </div>
                </div>
                <div class="col-xs-auto">
                  <button 
                    class="btn btn-sm btn-primary form-control"
                    @click="setDefaultZeroPoint()"
                  >
                    Default
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row mb-3">
        <table class="small text-muted">
          <tr>
            <td>Current internal master volume:</td>
            <td class="text-right">
              {{ mso.volume }} dB
            </td>
          </tr>
          <tr>
            <td>Current display master volume:</td>
            <td class="text-right">
              {{ displayVolume }} dB
            </td>
          </tr>
        </table>
      </div>
      <div class="row">
        <h6>Headroom</h6>
        <dismissable-alert alert-key="volume-headroom">
          When the analog volume is as high as it can go, the digital volume begins to be turned up.  Eventually loud passages may clip.  When the volume is turned down, the digital volume is reduced until the specified amount of headroom is available.  Then the analog volume control takes over.  The default headroom is 12dB.  If your system includes a lot of bass boost from Dirac or PEQ you may want to specify more headroom.
        </dismissable-alert>
      </div>
      <div class="row">
        <div class="col-xs-auto">
          <div class="form-group">
            <label
              for="inputEmail3"
              class="col-form-label col-form-label-sm"
            >Max. Digital Headroom</label>
            <div class="container">
              <div class="row">
                <div class="col">
                  <div class="input-group input-group-sm numeric-input">
                    <input
                      type="number"
                      class="form-control"
                      aria-label="Minimum volume"
                      aria-describedby="basic-addon2"
                      :value="mso.cal?.headroom"
                      min="0"
                      max="30"
                      step="1"
                      @change="({ type, target }) => setHeadroom(target.value)"
                    >
                    <div class="input-group-append">
                      <span
                        id="basic-addon2"
                        class="input-group-text"
                      >dB</span>
                    </div>
                  </div>
                </div>
                <div class="col-xs-auto">
                  <button 
                    class="btn btn-sm btn-primary form-control"
                    @click="setDefaultHeadroom()"
                  >
                    Default
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <peak-signal-levels />
    </template>
  </div>
</template>

<script>

import useMso from '@/use/useMso';
import useLocalStorage from '@/use/useLocalStorage';

import DismissableAlert from './buttons/DismissableAlert.vue';
import PeakSignalLevels from './PeakSignalLevels.vue';

export default {
  components: {
    DismissableAlert,
    PeakSignalLevels,
  },
  setup() {
    return { ...useMso(), ...useLocalStorage() };
  }
}
</script>

<style scoped>
  .col-auto, .col, .col-xs-auto {
    padding-left: 0;
  }
</style>