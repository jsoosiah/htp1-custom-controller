import { ref, watch, computed } from 'vue';
import { useWebSocket } from './useWebSocket.js';
import { applyPatch } from 'fast-json-patch/index.mjs';
import { debounce } from 'lodash-es';

// local nmstat state, used to display values on the interface
const nmstat = ref({});

// loading indicator, when commands have been 
// sent to MSO and a response is being awaited
const loading = ref(true);

/**
* Composition function which exposes the nmstat state, as well 
* as an API to interact with nmstat, abstracting away all 
* websocket interactions to keep components clean.
*/
export default function useNetworkStat() {

  const { data, state, send, close } = useWebSocket();

  function scan() {
    console.log('scan: entering');
    send(`netapply {"action":"nmstat"}`);
  }

  function wificonfig(ssid, password) {
    if (password) {
      send(`netapply {"action":"add", "ssid":${JSON.stringify(ssid)}, "password":${JSON.stringify(password)} }`);
    }
  }

  function wificonnect(conid) {
    send(`netapply {"action":"connect", "conid":"${conid}" }`);
  }

  function wifidisconnect(conid) {
    send(`netapply {"action":"disconnect", "conid":"${conid}" }`);
  }

  function wififorget(conid) {
    send(`netapply {"action":"delete", "conid":"${conid}" }`);
  }

  function getConDetails(conid) {
    send(`netapply {"action":"getcondetail", "conid":"${conid}" }`);
  }

  function wifipower(enable) {
    send(`netapply {"action":"radio", "enable":${enable} }`);
  }

  function reseteth0() {
    send(`netapply {"action":"reset" }`);
  }

  function receiveNMConDetail(detail) {

  }

  function receiveNMCons(cons) {

  }

  function receiveNMStat(nms) {
    console.log('receiveNMStat', nms);
    nmstat.value = nms;
  }

  // watch websocket state, once open, request scan to 
  // retrieve full nmstat state to hold in local state
  watch(
    state,
    val => {
      switch (val) {
        case 'OPEN':
          scan();
          break;
      }
    }
  );

  // watch websocket messages and keep local nmstat state up to date
  watch(
    data, 
    val => {
      const { verb, arg } = parseMSO(val);
      console.log('received verb', verb);
      if (verb === 'wifinetworks') {

      } else if (verb === 'nmcondetail') {

          
      } else if (verb === 'nmcons') {

      } else if (verb === 'nmstat') {
        receiveNMStat(arg)
      } else if (verb === 'error') {
        // oh no
        console.log('error', arg);
      }

      loading.value = false;
    },
    { lazy: true }
  );

  return { 
    nmstat, 
    scan, wificonfig, wificonnect, wifidisconnect, wififorget, 
    getConDetails, wifipower, reseteth0, receiveNMConDetail, receiveNMCons,     
    state, loading,
  };
}

// helper to parse MSO message into verb and argument object
function parseMSO(cmd) {
  const i = cmd.indexOf(' ');
  return i > 0 ? {
    verb: cmd.slice(0, i),
    arg: JSON.parse(cmd.slice(i + 1))
  } : {
    verb: cmd,
    arg: undefined
  }
}

// create a new array with newCmd appended to cmdList 
// and all commands of type newCmd filtered out of cmdList,
// since those should be unnecessary  
function addCommand(cmdList, newCmd) {
  const newCmdList = cmdList.filter(
    cmd => {
      return !(cmd.op === newCmd.op && cmd.path === newCmd.path);
      // return true;
    }
  );

  newCmdList.push(newCmd);
  
  return newCmdList;
}