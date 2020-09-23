import { ref, watch, computed } from 'vue';
import useWebSocket from './useWebSocket.js';
import { applyPatch } from 'fast-json-patch/index.mjs';
import { debounce } from 'lodash-es';

// local nmstat state, used to display values on the interface
const nmstat = ref({});

const condetails = ref({});

// loading indicator, when commands have been 
// sent to MSO and a response is being awaited
const loading = ref(true);

/**
* Composition function which exposes the nmstat state, as well 
* as an API to interact with netapply, abstracting away all 
* network-related websocket interactions to keep components clean.
*/
export default function useNetworkManager() {

  const { data, state, send, close } = useWebSocket();

  function scan() {
    console.log('scan: entering');
    send(`netapply {"action":"nmstat"}`);
  }

  function wificonfig(ssid, password) {
    console.log('wificonfig', ssid, password)
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

  function applyNetworkConfig(netconfig) {
    console.log('applyNetworkConfig', netconfig);
    send(`netapply {"action": "conedit", "config":${JSON.stringify(netconfig)} }`);
  }

  function receiveNMConDetail(detail) {
    condetails.value = detail;
  }

  function receiveNMCons(cons) {

  }

  function receiveNMStat(nms) {
    console.log('receiveNMStat', nms);
    nmstat.value = nms;
  }

  // NetworkManager uses CIDR-type notation for IP addresses. These are helper functions.
  function int2ip(ipInt) {
    return ((ipInt >>> 24) + '.' + (ipInt >> 16 & 255) + '.' + (ipInt >> 8 & 255) + '.' + (ipInt & 255));
  }

  function ip2int(ip) {
    return ip.split('.').reduce((ipInt, octet) => ((ipInt << 8) + parseInt(octet, 10)), 0) >>> 0;
  }

  function cidr2mask(cidr) {
    return int2ip(parseInt('1'.repeat(cidr) + '0'.repeat(32 - cidr), 2));
  }

  function mask2cidr(mask) {
    return ip2int(mask).toString(2).indexOf('0');
  }


  // watch websocket state, once open, request scan to 
  // retrieve full nmstat state to hold in local state
  // watch(
  //   state,
  //   val => {
  //     switch (val) {
  //       case 'OPEN':
  //         scan();
  //         break;
  //     }
  //   }
  // );

  // watch websocket messages and keep local nmstat state up to date
  watch(
    data, 
    val => {
      const { verb, arg } = parseMSO(val);
      console.log('received verb', verb, arg);
      if (verb === 'wifinetworks') {

      } else if (verb === 'nmcondetail') {
        receiveNMConDetail(arg);
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
    nmstat, condetails, applyNetworkConfig,
    scan, wificonfig, wificonnect, wifidisconnect, wififorget, 
    getConDetails, wifipower, reseteth0, receiveNMConDetail, receiveNMCons,
    int2ip, ip2int, cidr2mask, mask2cidr,
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