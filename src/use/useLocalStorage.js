import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

// IP address of HTP-1, used to connect to websocket
const websocketIp = ref(localStorage.getItem('websocketIp'));

// Active tab on settings modal, by index
const settingsActiveTab = ref(localStorage.getItem('settingsActiveTab') ? parseInt(localStorage.getItem('settingsActiveTab')) : 0);

// EQ group by setting - 0 to group by channel, 1 to group by band
const eqGroupBy = ref(localStorage.getItem('eqGroupBy') ? parseInt(localStorage.getItem('eqGroupBy')) : 0);

const maxWaitTimeToSendToMso = ref(localStorage.getItem('maxWaitTimeToSendToMso') ? parseInt(localStorage.getItem('maxWaitTimeToSendToMso')) : 600);

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
    eqGroupBy.value = newEqGroupBy;
    localStorage.setItem('eqGroupBy', newEqGroupBy);
  }

  function setMaxWaitTimeToSendToMso(newMaxWaitTime) {
    maxWaitTimeToSendToMso.value = newMaxWaitTime;
    localStorage.setItem('maxWaitTimeToSendToMso', newMaxWaitTime);
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
  };
}