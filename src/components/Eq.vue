<template>
  <h6>Parametric Equalization Filters <small class="text-muted">up to 16 bands are available</small></h6>
  <div class="alert alert-info small" role="alert">
    Note that a gain of 0dB is equivalent to bypassing the filter; * denotes channels that have been modified and have active PEQ filters
  </div>

  <nav class="nav nav-pills bg-light">
    <a 
      v-for="(channame, index) in activeChannels"
      class="nav-link" 
      :class="{'active': selectedChannel === index}" 
      @click="setSelectedChannel(index)" 
      href="javascript:void(0)" 
    >
      {{spkName(channame)}} {{ hasModifications(channame) ? '*' : '' }}
    </a>
  </nav>
  <table class="table table-sm table-responsive-md table-striped">
    <thead>
      <tr>
        <th>Band</th>
        <th class="text-right">Center Freq. (Hz)</th>
        <th class="text-right">Gain (dB)</th>
        <th class="text-right">Q</th>
        <th class="text-right">Filter Type</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(slot, index) in mso.peq.slots">
        <td>Band {{index + 1}}</td>
        <td class="text-right">
          <input 
            type="number" 
            class="form-control form-control-sm text-right" 
            :value="slot.channels[activeChannels[selectedChannel]].Fc" 
            @change="({ type, target }) => setPEQFc(channame, slot, target.value)" 
            min="15" 
            max="20000" 
            step=".1"
          />
        </td>
        <td class="text-right">
          <input 
            type="number" 
            class="form-control form-control-sm text-right" 
            :value="slot.channels[activeChannels[selectedChannel]].gaindB" 
            @change="({ type, target }) => setPEQGain(channame, slot, target.value)" 
            min="-20" 
            max="20" 
            step=".1"
          />
        </td>
        <td class="text-right">
          <input 
            type="number" 
            class="form-control form-control-sm text-right" 
            :value="slot.channels[activeChannels[selectedChannel]].Q" 
            @change="({ type, target }) => setPEQQ(channame, slot, target.value)" 
            min=".1" 
            max="10" 
            step=".1"
          />
        </td>
        <td class="text-right">
            <select class="form-control form-control-sm">
              <option 
                v-for="filterType in filterTypes" 
                :value="filterType.value"
                :selected="filterType.value === slot.channels[activeChannels[selectedChannel]].FilterType"
              >
                {{filterType.label}}
              </option>
            </select>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>

  import { ref, computed } from 'vue';

  import useMso from '@/use/useMso.js';
  import useSpeakerGroups from '@/use/useSpeakerGroups.js';

  export default {
    name: 'Eq',
    setup() {
      const { mso } = useMso();
      const { getActiveChannels, spkName } = useSpeakerGroups();

      const activeChannels = computed(() => {
        return getActiveChannels(mso.value.speakers.groups);
      });

      const selectedChannel = ref(0);

      function setSelectedChannel(chanNumber) {
        selectedChannel.value = chanNumber;
      }

      function hasModifications(channame) {
        return mso.value.peq.slots.filter(
          slot => slot.channels[channame].gaindB !== 0
        ).length > 0;
      }

      const filterTypes = [
        { label: 'PEQ', value: 0 },
        { label: 'Low Shelf', value: 1 },
        { label: 'High Shelf', value: 2 }
      ];

      return {
        ...useMso(), activeChannels, spkName, selectedChannel, setSelectedChannel, hasModifications, filterTypes
      };
    }
  }
</script>

<style scoped>
  .nav-link {
    text-transform: uppercase;
    font-size: .8rem;
    font-weight: 600;
    padding:0.5rem 0.675rem;
    border-radius: 0;
  }

  th {
    font-size:80%;
  }
</style>