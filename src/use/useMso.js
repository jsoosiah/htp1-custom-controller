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

const allUpmixers = computed(() => {
  const filtered = {};
  if (mso.value.upmix) {
    for (const upmixKey in mso.value.upmix) {
      if (typeof mso.value.upmix[upmixKey] === 'object') {
        filtered[upmixKey] = mso.value.upmix[upmixKey];
        filtered[upmixKey].label = upmixLabels[upmixKey];
        filtered[upmixKey].value = upmixKey;
      }
    }
  }

  return filtered;
});

// loading indicator, when commands have been 
// sent to MSO and a response is being awaited
const loading = ref(true);

// list of commands to send to MSO based on user interactions
// interactions are debounced so commands for rapid interactions
// will be sent in bulk instead of individually
const commandsToSend = ref([]);

// list of commands received from MSO, which need to be applied to local state
const commandsReceived = ref([]);

let commandsToSendTouchedTimer, commandsReceivedTouchedTimer;
const userInteractionTimerInterval = 250;
const commandsToSendTouchedFlag = ref(false);
const commandsReceivedTouchedFlag = ref(false);

/**
* Composition function which exposes the MSO state, as well 
* as an API to interact with MSO, abstracting away all 
* websocket interactions to keep components clean.
*/
export default function useMso() {

  const { data, state, send, close } = useWebSocket(websocketurl);

  function powerOff() {
    // TODO show a bootstrap modal instead
    if (confirm("The power will be turned off.")) {
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

  // TODO enforce min/max volume
  function setVolume(volumeLevel) {
    mso.value.volume = volumeLevel;
    // modifying commandsToSend directly with commandsToSend.push
    // does not seem to trigger the watch function below,
    // so instead create a new array with the new value appended
    commandsToSend.value = addCommand(
      commandsToSend.value, 
      {'op':'replace', 'path': '/volume', 'value': volumeLevel}
    );
  }

  function toggleMute() {
    mso.value.muted = !mso.value.muted;
    commandsToSend.value = addCommand(
      commandsToSend.value, 
      {'op':'replace', 'path': '/muted', 'value': mso.value.muted}
    )
  }

  function setInput(inpid) {
    mso.value.input = inpid;
    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op':'replace', 'path': '/input', 'value': inpid}
    );
  }

  function setUpmix(upmixKey) {
    mso.value.upmix.select = upmixKey;
    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op':'replace', 'path': '/upmix/select', 'value': upmixKey}
    );
  }

  function toggleUpmixHomevis(upmix) {
    mso.value.upmix[upmix].homevis = !mso.value.upmix[upmix].homevis;
    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op':'replace', 'path': `/upmix/${upmix}/homevis`, 'value': mso.value.upmix[upmix].homevis}
    );
  }

  function toggleUpmixCenterSpread() {
    mso.value.upmix.dolby.cs = !mso.value.upmix.dolby.cs;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op':'replace', 'path': `/upmix/dolby/cs`, 'value': mso.value.upmix.dolby.cs}
    );
  }

  function toggleUpmixWideSynth() {
    mso.value.upmix.dts.ws = !mso.value.upmix.dts.ws;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op':'replace', 'path': `/upmix/dts/ws`, 'value': mso.value.upmix.dts.ws}
    );
  }

  function setAuroMaticPreset(preset) {
    mso.value.upmix.auro.preset = parseInt(preset);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op':'replace', 'path': `/upmix/auro/preset`, 'value': mso.value.upmix.auro.preset}
    );
  }

  function setAuroMaticStrength(strength) {
    mso.value.upmix.auro.strength = parseInt(strength);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op':'replace', 'path': `/upmix/auro/strength`, 'value': mso.value.upmix.auro.strength}
    );
  }

  function setDefaultAuroMaticStrength() {
    setAuroMaticStrength(13);
  }

  function toggleReinforceBass() {

    if (!diracBCEnabled.value) {
      mso.value.bassenhance = mso.value.bassenhance === 'off' ? 'on' : 'off';

      commandsToSend.value = addCommand(
        commandsToSend.value,
        {'op':'replace', 'path': `/bassenhance`, 'value': mso.value.bassenhance}
      );
    }
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

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op':'replace', 'path': '/night', 'value': mso.value.night}
    );
  }

  function toggleDirac() {

    let diracActive;

    switch(mso.value.cal.diracactive) {
      case 'on':
        // mso.value.cal.diracactive = 'bypass';
        diracActive = 'bypass';
        break;
      case 'off':
        // mso.value.cal.diracactive = 'on';
        diracActive = 'on';
        break;
      default:
      case 'bypass':
        // mso.value.cal.diracactive = 'off';
        diracActive = 'off';
        break;
    }

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op':'replace', 'path': '/cal/diracactive', 'value': diracActive}
    );
  }

  function toggleLoudness() {
    mso.value.loudness = mso.value.loudness === 'off' ? 'on' : 'off';

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op':'replace', 'path': '/loudness', 'value': mso.value.loudness}
    );
  }

  function setNextDtsDialogEnh() {
    mso.value.dialogEnh = (mso.value.dialogEnh + 1) % 7;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op':'replace', 'path': '/dialogEnh', 'value': mso.value.dialogEnh}
    );
  }

  // TODO validate
  function toggleSpeakerChannel(spkCode) {
    mso.value.speakers.groups[spkCode].present = !mso.value.speakers.groups[spkCode].present;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/speakers/groups/${spkCode}/present`, value: mso.value.speakers.groups[spkCode].present}
    );
  }

  function setSpeakerSize(spkCode, sizeCode) {
    mso.value.speakers.groups[spkCode].size = sizeCode;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/speakers/groups/${spkCode}/size`, value: mso.value.speakers.groups[spkCode].size}
    );
  }

  function setCenterFreq(spkCode, centerFreq) {
    mso.value.speakers.groups[spkCode].fc = centerFreq;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/speakers/groups/${spkCode}/fc`, value: mso.value.speakers.groups[spkCode].fc}
    );
  }

  function setMinVolume(minVol) {
    mso.value.cal.vpl = parseInt(minVol);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': '/cal/vpl', value: mso.value.cal.vpl}
    );
  }

  function setMaxVolume(maxVol) {
    mso.value.cal.vph = parseInt(maxVol);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': '/cal/vph', value: mso.value.cal.vph}
    );
  }

  function setMaxOutputLevel(outputLevel) {
    mso.value.cal.ampsense = parseFloat(outputLevel);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': '/cal/ampsense', value: mso.value.cal.ampsense}
    );
  }

  function setLipsyncDelay(lipsyncDelay) {
    mso.value.cal.lipsync = parseInt(lipsyncDelay);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': '/cal/lipsync', value: mso.value.cal.lipsync}
    );
  }

  function setDiracSlot(slotNumber) {
    mso.value.cal.currentdiracslot = slotNumber;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': '/cal/currentdiracslot', value: mso.value.cal.currentdiracslot}
    );
  }

  function setUserDelay(channel, delay) {
    currentDiracSlot.value.channels[channel].delay = parseFloat(delay);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/cal/slots/${mso.value.cal.currentdiracslot}/channels/${channel}/delay`, value: currentDiracSlot.value.channels[channel].delay}
    );
  }

  function setUserTrim(channel, trim) {
    currentDiracSlot.value.channels[channel].trim = parseFloat(trim);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/cal/slots/${mso.value.cal.currentdiracslot}/channels/${channel}/trim`, value: currentDiracSlot.value.channels[channel].trim}
    );
  }

  function toggleSignalGenerator() {
    mso.value.sgen.sgensw = mso.value.sgen.sgensw === 'off' ? 'on' : 'off';

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/sgen/sgensw`, value: mso.value.sgen.sgensw}
    );
  }

  function setSignalGeneratorChannel(channel) {
    mso.value.sgen.select = channel;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/sgen/select`, value: mso.value.sgen.select}
    );
  }

  function setSignalGeneratorSignalType(signalType) {
    mso.value.sgen.signalType = signalType;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/sgen/signalType`, value: mso.value.sgen.signalType}
    );
  }

  function toggleToneControl() {
    mso.value.eq.tc = !mso.value.eq.tc;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/eq/tc`, value: mso.value.eq.tc}
    );
  }

  function setBassCornerFrequency(freq) {
    mso.value.eq.bass.freq = parseFloat(freq);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/eq/bass/freq`, value: mso.value.eq.bass.freq}
    );
  }

  function setTrebleCornerFrequency(freq) {
    mso.value.eq.treble.freq = parseFloat(freq);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/eq/treble/freq`, value: mso.value.eq.treble.freq}
    );
  }

  function setBassBoostCutLevel(level) {
    mso.value.eq.bass.level = parseFloat(level);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/eq/bass/level`, value: mso.value.eq.bass.level}
    );
  }

  function setTrebleBoostCutLevel(level) {
    mso.value.eq.treble.level = parseFloat(level);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/eq/treble/level`, value: mso.value.eq.treble.level}
    );
  }

  function setLoudnessCalibration(loudness) {
    mso.value.loudnessCal = parseFloat(loudness);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/loudnessCal`, value: mso.value.loudnessCal}
    );
  }

  function toggleGlobalPEQ() {
    mso.value.peq.peqsw = !mso.value.peq.peqsw;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/peq/peqsw`, value: mso.value.peq.peqsw}
    );
  }

  function setPEQCenterFrequency(channel, slot, centerFreq) {
    mso.value.peq.slots[slot].channels[channel].Fc = parseFloat(centerFreq);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/peq/slots/${slot}/channels/${channel}/Fc`, value: mso.value.peq.slots[slot].channels[channel].Fc}
    );
  }

  function setPEQGain(channel, slot, gain) {
    mso.value.peq.slots[slot].channels[channel].gaindB = parseFloat(gain);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/peq/slots/${slot}/channels/${channel}/gaindB`, value: mso.value.peq.slots[slot].channels[channel].gaindB}
    );
  }

  function setPEQQuality(channel, slot, q) {
    mso.value.peq.slots[slot].channels[channel].Q = parseFloat(q);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/peq/slots/${slot}/channels/${channel}/Q`, value: mso.value.peq.slots[slot].channels[channel].Q}
    );
  }

  function setPEQFilterType(channel, slot, filterType) {
    mso.value.peq.slots[slot].channels[channel].FilterType = parseInt(filterType);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/peq/slots/${slot}/channels/${channel}/FilterType`, value: mso.value.peq.slots[slot].channels[channel].FilterType}
    );
  }

  function setInputLabel(input, label) {
    mso.value.inputs[input].label = label;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/inputs/${input}/label`, value: mso.value.inputs[input].label}
    );
  }

  function toggleInputVisible(input) {
    mso.value.inputs[input].visible = !mso.value.inputs[input].visible;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/inputs/${input}/visible`, value: mso.value.inputs[input].visible}
    );
  }

  function setInputFormatDetectOption(input, formatDetectOption) {
    mso.value.inputs[input].formatDetectOption = formatDetectOption;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/inputs/${input}/formatDetectOption`, value: mso.value.inputs[input].formatDetectOption}
    );
  }

  function toggleInputUHD(input) {
    mso.value.inputs[input].uhd = !mso.value.inputs[input].uhd;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/inputs/${input}/uhd`, value: mso.value.inputs[input].uhd}
    );
  }

  function setBluetoothDiscoverableTime(time) {
    mso.value.bluetooth.discoverabletime = parseInt(time);

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/bluetooth/discoverabletime`, value: mso.value.bluetooth.discoverabletime}
    );
  }

  function enableBluetoothDiscovery() {
    send('btdiscover ' + mso.value.bluetooth.discoverabletime);
  }

  const currentDiracSlot = computed(() => {
    return mso.value.cal.slots[mso.value.cal.currentdiracslot];
  });

  const diracBCEnabled = computed(() => {
    return mso.value.cal.slots[mso.value.cal.currentdiracslot].hasBCFilter;
  });

  const showCrossoverControls = computed(() => {
    console.log('showCrossoverControls', mso.value.cal.diracactive, diracBCEnabled.value)
    return !(mso.value.cal.diracactive=='on' && diracBCEnabled.value);
  });

  function sendCommands() {
    console.log('sendCommands', commandsToSend.value.length)
    if (commandsToSend.value.length > 0) {
      loading.value = true;
      send('changemso ' + JSON.stringify(commandsToSend.value));
      console.log('changemso', commandsToSend.value.length, commandsToSend.value[0]);
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
    maxWait: 500,
  });

  function receiveCommands() {
    if (commandsReceived.value.length > 0) {
      console.log('receiveCommands', commandsReceived.value.length, commandsReceived.value[0]);
      applyPatch(mso.value, commandsReceived.value);
      // console.log('receiveCommands mso result', mso.value);

      // if (commandsToSend.value.length > 0) {
      //   commandsToSend.value = [];
      // }
      
      if (commandsReceived.value.length > 0) {
        commandsReceived.value = [];
      }

    } else {
      console.log('skip receiveCommands', commandsToSend.value.length, commandsReceived.value.length);
    }
  
    
    loading.value = false;
  }

  const debouncedReceiveCommands = debounce(receiveCommands, 250);

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
          // update received. only process received commands if commandsToSend is empty;
          // otherwise we will store the received commands and wait for the next update
          if (Array.isArray(arg)) {
            for (const cmd of arg) {
              commandsReceived.value = addCommand(commandsReceived.value, cmd);
            }
          } else {
            console.log('msoupdate non-array', arg)
            commandsReceived.value = addCommand(commandsReceived.value, arg);
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

      commandsToSendTouchedFlag.value = true;

      clearTimeout(commandsToSendTouchedTimer);
      commandsToSendTouchedTimer = setTimeout(() => {
        commandsToSendTouchedFlag.value = false;
      }, userInteractionTimerInterval);

      debouncedSendCommands();
    }
  );

  // watch commandsReceived, and apply them to local MSO state
  // after user interaction has stopped for x ms
  watch(
    commandsReceived,
    val => {

      commandsReceivedTouchedFlag.value = true;

      clearTimeout(commandsReceivedTouchedTimer);
      commandsReceivedTouchedTimer = setTimeout(() => {
        commandsReceivedTouchedFlag.value = false;
        // only receive commands if commands have not been sent and received for x ms
        if (!commandsToSendTouchedFlag.value && !commandsReceivedTouchedFlag.value) {
          debouncedReceiveCommands();
        }
      }, userInteractionTimerInterval);
    }
  );

  return { 
    mso, visibleInputs, visibleUpmixers, allUpmixers,
    powerOff, powerOn,
    setVolume, toggleMute, setInput, setUpmix, 
    toggleUpmixHomevis, toggleUpmixCenterSpread, toggleUpmixWideSynth,
    setAuroMaticPreset, setAuroMaticStrength, setDefaultAuroMaticStrength,
    toggleReinforceBass,
    setNextNightMode, toggleDirac, toggleLoudness, setNextDtsDialogEnh,
    toggleSpeakerChannel, setSpeakerSize, setCenterFreq,
    setMinVolume, setMaxVolume, setMaxOutputLevel, setLipsyncDelay, setDiracSlot,
    setUserDelay, setUserTrim,
    toggleSignalGenerator, setSignalGeneratorChannel, setSignalGeneratorSignalType,
    toggleToneControl, setBassCornerFrequency, setTrebleCornerFrequency, 
    setBassBoostCutLevel, setTrebleBoostCutLevel, setLoudnessCalibration,
    toggleGlobalPEQ, setPEQCenterFrequency, setPEQGain, setPEQQuality, setPEQFilterType,
    setInputLabel, toggleInputVisible, setInputFormatDetectOption, toggleInputUHD, 
    setBluetoothDiscoverableTime, enableBluetoothDiscovery,
    showCrossoverControls, currentDiracSlot,
    state, loading,
    commandsToSend, commandsReceived, commandsToSendTouchedFlag, commandsReceivedTouchedFlag // debug
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