import { ref, watch } from 'vue';
import useWebSocket from './useWebSocket.js';

import useMso from './useMso.js';

// local nmstat state, used to display values on the interface
const btRequestDetails = ref({});

const { data, state, send } = useWebSocket();

const { loading } = useMso();

/**
* Composition function which exposes the btRequestDetails state, as well 
* as an API to interact with btreply, abstracting away all 
* bluetooth-related websocket interactions to keep components clean.
*/
export default function useBluetoothManager() {

  function handleBtEvent(ev) {
    console.log('handleBtEvent', ev);
    btRequestDetails.value = ev;
  }

  function acceptPair() {
    btRequestDetails.value = {};
    send('btreply {"reply":"accept"}');
  }

  function rejectPair() {
    btRequestDetails.value = {};
    send('btreply {"error":"reject"}');
  }

  // watch websocket messages and keep local nmstat state up to date
  watch(
    data, 
    val => {
      const { verb, arg } = parseMSO(val);
      if (verb === 'btevent') {
        handleBtEvent(arg);
      } else if (verb === 'error') {
        // oh no
        console.log('error', arg);
      }

      // loading.value = false;
    },
    { lazy: true }
  );

  return { 
    btRequestDetails,
    acceptPair, rejectPair,
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