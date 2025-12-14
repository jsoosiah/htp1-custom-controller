<template>
  <div class="container">
    <div class="row justify-content-between">
      <div class="col-auto">
        <h5>Balance</h5>
      </div>
    </div>
    <div
      class="row"
    >
      <div class="col">
        <dismissable-alert
          alert-key="balance-info"
          class="alert-info"
        >
          Balance controls are applied pre-Dirac Live and pre-bass-management.
        </dismissable-alert>
      </div>
    </div>
    <div class="row">
      <h6>
        Channel Trim
      </h6>
    </div>
    <div class="row">
      <table class="table table-sm table-responsive table-striped">
        <thead>
          <tr>
            <th>Channel</th>
            <th class="text-right">
              Channel Trim
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="channame in activeChannelsForTrim" 
            :key="channame"
          >
            <td style="padding-right: 1rem">
              {{ spkName(channame) }}
              <font-awesome-icon
              v-if="channame === seatShakerChannel"
              :icon="['fas', 'couch']"
            />
            </td>
            <td class="text-right">
              <div class="input-group input-group-sm numeric-input">
              <input
                type="number" 
                class="form-control form-control-sm text-right" 
                :value="mso.channeltrim.channels[channame]" 
                min="-12"
                max="12" 
                step=".25" 
                @change="({ type, target }) => setChannelTrim(channame, target.value)"
              />
            <div class="input-group-append">
              <span
                id="basic-addon2"
                class="input-group-text"
              >dB</span>
            </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>

import useMso from '@/use/useMso';
import useLocalStorage from '@/use/useLocalStorage';
import useSpeakerGroups from '@/use/useSpeakerGroups.js';

import TwoStateButton from './buttons/TwoStateButton.vue';
import DismissableAlert from './buttons/DismissableAlert.vue';

export default {
  components: {
    TwoStateButton,
    DismissableAlert
  },
  setup() {

    function formatDecimal(num) {
      return num?.toFixed(1);
    }


    const { spkName } = useSpeakerGroups();
    return { ...useMso(), ...useLocalStorage(), spkName, formatDecimal };
  }
}
</script>

<style scoped>
  .col-auto, .col, .col-xs-auto {
    padding-left: 0;
  }

  .table-sm td {
    padding:0 0.3rem;
  }
</style>