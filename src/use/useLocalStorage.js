import { ref } from 'vue';

// IP address of HTP-1, used to connect to websocket
const websocketIp = ref(localStorage.getItem('websocketIp'));

// Active tab on settings modal, by index
const settingsActiveTab = ref(localStorage.getItem('settingsActiveTab') ? parseInt(localStorage.getItem('settingsActiveTab')) : 0);

// EQ group by setting - 0 to group by channel, 1 to group by band
const eqGroupBy = ref(localStorage.getItem('eqGroupBy') ? parseInt(localStorage.getItem('eqGroupBy')) : 0);

// Show channel mute controls on Calibration tab
const showChannelMuteControls = ref(localStorage.getItem('showChannelMuteControls') ? localStorage.getItem('showChannelMuteControls') : false);

const maxWaitTimeToSendToMso = ref(375);

const showAdvancedVolumeSettings = ref(localStorage.getItem('showAdvancedVolumeSettings') ? localStorage.getItem('showAdvancedVolumeSettings') : false);

export default function useLocalStorage() {

  function setWebsocketIp(url) {
    websocketIp.value = url;
    localStorage.setItem('websocketIp', url);
  }

  function setSettingsActiveTab(tab) {
    settingsActiveTab.value = tab;
    localStorage.setItem('settingsActiveTab', tab);
  }

  function setEqGroupBy(newEqGroupBy) {
    eqGroupBy.value = parseInt(newEqGroupBy);
    localStorage.setItem('eqGroupBy', newEqGroupBy);
  }

  function setMaxWaitTimeToSendToMso(newMaxWaitTime) {
    maxWaitTimeToSendToMso.value = newMaxWaitTime;
    localStorage.setItem('maxWaitTimeToSendToMso', newMaxWaitTime);
  }

  function toggleShowChannelMuteControls() {
    showChannelMuteControls.value = !showChannelMuteControls.value;
    localStorage.setItem('showChannelMuteControls', showChannelMuteControls.value);
  }

  function toggleShowAdvancedVolumeSettings() {
    showAdvancedVolumeSettings.value = !showAdvancedVolumeSettings.value;
    localStorage.setItem('showAdvancedVolumeSettings', showAdvancedVolumeSettings.value);
  }

  return {
    websocketIp,
    setWebsocketIp,
    eqGroupBy,
    setEqGroupBy,
    settingsActiveTab,
    setSettingsActiveTab,
    maxWaitTimeToSendToMso,
    setMaxWaitTimeToSendToMso,
    showChannelMuteControls,
    toggleShowChannelMuteControls,
    showAdvancedVolumeSettings,
    toggleShowAdvancedVolumeSettings
  };
}