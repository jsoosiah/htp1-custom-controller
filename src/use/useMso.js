import { ref, watch, computed } from 'vue';
import { useWebSocket } from './useWebSocket.js';
import { applyPatch } from 'fast-json-patch/index.mjs';
import { debounce } from 'lodash-es';

// websocket URL - note that the IP address is hard-coded in development mode
const websocketurl = `ws://${process.env.NODE_ENV === 'production' ? window.location.host : '192.168.1.13'}/ws/controller`;

// local MSO state, used to display values on the interface
const mso = ref({});

// visible MSO inputs, computed from MSO state
const visibleInputs = computed(() => {
  const filtered = {};
  if (mso.value.inputs) {
    for (const inpKey in mso.value.inputs) {
      if (mso.value.inputs[inpKey].visible) {
        filtered[inpKey] = mso.value.inputs[inpKey];
      }
    }
  }
  return filtered;
});

// map upmix codes to labels,
// used internally by visibleUpmixers
const upmixLabels = {
  'off': 'Direct',
  'native': 'Native',
  'dolby': 'Dolby Surround',
  'dts': 'DTS Neural:X',
  'auro': 'Auro-3D',
  'mono': 'Mono',
  'stereo': 'Stereo'
}

// visible upmixers, computed from MSO state
const visibleUpmixers = computed(() => {
  const filtered = {};
  if (mso.value.upmix) {
    for (const upmixKey in mso.value.upmix) {
      if (mso.value.upmix[upmixKey].homevis) {
        filtered[upmixKey] = mso.value.upmix[upmixKey];
        filtered[upmixKey].label = upmixLabels[upmixKey];
      }
    }
  }

  return filtered;
});

// loading indicator, when commands have been 
// sent to MSO and a response is being awaited
const loading = ref(true);

// list of commands to send to MSO
// interactions are debounced so rapid interactions
// will be sent in bulk instead of individually
const commandsToSend = ref([]);

/**
* Composition function which exposes the MSO state, as well 
* as an API to interact with MSO, abstracting away all 
* websocket interactions to keep components clean.
*/
export default function useMso() {

  const { data, state, send, close } = useWebSocket(websocketurl);

  function powerOff() {
    // TODO show a bootstrap modal instead
    if (confirm("Are you sure you want to turn off the power?")) {
      commandsToSend.value = [
        {'op':'replace', 'path': '/powerIsOn', 'value': false}
      ]
    }
  }

  function powerOn() {
    commandsToSend.value = [
      {'op':'replace', 'path': '/powerIsOn', 'value': true}
    ]
  }

  function setVolume(volumeLevel) {
    mso.value.volume = volumeLevel;
    // modifying commandsToSend directly with commandsToSend.push
    // does not seem to trigger the watch function below,
    // so instead create a new array with the new value appended

    // filter out previous volume commands as they aren't needed
    const newCommandsToSend = commandsToSend.value.filter(
      cmd => !(cmd.op === 'replace' && cmd.path === '/volume')
    );

    newCommandsToSend.push(
      {'op':'replace', 'path': '/volume', 'value': volumeLevel}
    )

    commandsToSend.value = newCommandsToSend;
  }

  function setInput(inpid) {
    mso.value.input = inpid;
    commandsToSend.value = [
      ...commandsToSend.value,
      {'op':'replace', 'path': '/input', 'value': inpid}
    ];
  }

  function setUpmix(upmixKey) {
    mso.value.upmix.select = upmixKey;
    commandsToSend.value = [
      ...commandsToSend.value,
      {'op':'replace', 'path': '/upmix/select', 'value': upmixKey}
    ];
  }

  function setNextNightMode() {
    switch(mso.value.night) {
      case 'auto':
        mso.value.night = 'on';
        break;
      case 'off':
        mso.value.night = 'auto';
        break;
      default:
      case 'on':
        mso.value.night = 'off';
    }

    commandsToSend.value = [
      ...commandsToSend.value,
      {'op':'replace', 'path': '/night', 'value': mso.value.night}
    ];
  }

  function toggleDirac() {
    switch(mso.value.cal.diracactive) {
      case 'on':
        mso.value.cal.diracactive = 'bypass';
        break;
      case 'off':
        mso.value.cal.diracactive = 'on';
        break;
      default:
      case 'bypass':
        mso.value.cal.diracactive = 'off';
        break;
    }
  }

  function toggleLoudness() {
    mso.value.loudness = mso.value.loudness === 'off' ? 'on' : 'off';

    commandsToSend.value = [
      ...commandsToSend.value,
      {'op':'replace', 'path': '/loudness', 'value': mso.value.loudness}
    ];
  }

  function setNextDtsDialogEnh() {
    mso.value.dialogEnh = (mso.value.dialogEnh + 1) % 7;

    commandsToSend.value = [
      ...commandsToSend.value,
      {'op':'replace', 'path': '/dialogEnh', 'value': mso.value.dialogEnh}
    ];
  }

  function sendCommands() {
    if (commandsToSend.value.length > 0) {
      loading.value = true;
      send('changemso ' + JSON.stringify(commandsToSend.value));
      console.log('changemso', commandsToSend.value);
      commandsToSend.value = [];
    }
  }

  // send commands 250 ms after user interaction stopped
  const debouncedSendCommands = debounce(sendCommands, 250, {
    // use a max wait time of 500 ms, so the user does see
    // their interactions cause changes every 500 ms at maximum
    // if the user rapidly adjusts volume from -50 dB to 0 dB,
    // this allows the volume to gradually increase around every 
    // 3 dB, instead of only suddenly updating the volume to 0 dB
    // at the end
    maxWait: 500 
  });

  // watch websocket messages and keep local mso state up to date
  watch(
    data, 
    val => {
      const { verb, arg } = parseMSO(val);
      console.log('received verb', verb);
      if (verb === 'mso') {
        // full mso object
        mso.value = arg;
        console.log(mso.value)
      } else if (verb === 'msoupdate') {
        // update received. only apply patch if commandsToSend is empty;
        // otherwise we will ignore this update and wait for the next one
        if (commandsToSend.value.length === 0) {
          console.log('apply msoupdate', arg);
          applyPatch(mso.value, arg);
        } else {
          console.log('skip update', arg, commandsToSend);
        }
      } else if (verb === 'error') {
        // oh no
        console.log('error', arg);
      }

      loading.value = false;
    },
    { lazy: true }
  );

  // watch websocket state, once open, send getmso to 
  // retrieve full mso state to hold in local state
  watch(
    state,
    val => {
      switch (val) {
        case 'OPEN':
          send('getmso');
          break;
      }
    }
  );

  // watch commandsToSend, and send them to MSO
  // after user interaction has stopped for x ms
  watch(
    commandsToSend,
    val => {
      debouncedSendCommands();
    }
  )

  return { 
    mso, visibleInputs, visibleUpmixers, 
    powerOff, powerOn,
    setVolume, setInput, setUpmix, 
    setNextNightMode, toggleDirac, toggleLoudness, setNextDtsDialogEnh,
    state, loading 
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