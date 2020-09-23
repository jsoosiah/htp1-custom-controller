import { ref, watch, computed } from 'vue';
import useWebSocket from './useWebSocket.js';
import { applyPatch, deepClone, compare } from 'fast-json-patch/index.mjs';
import { debounce } from 'lodash-es';

import useLoading from './useLoading.js';

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

// local MSO state, used to display values on the interface
const mso = ref({});

// list of commands to send to MSO based on user interactions
// interactions are debounced so commands for rapid interactions
// will be sent in bulk instead of individually
const commandsToSend = ref([]);

// list of commands received from MSO, which need to be applied to local state
const commandsReceived = ref([]);

// list of commands sent to MSO where a resonse has not yet been received
const commandsAwaitingResponse = ref([]);

/**
* Composition function which exposes the MSO state, as well 
* as an API to interact with MSO, abstracting away all 
* websocket interactions to keep components clean.
*/
export default function useMso() {

  const { loading } = useLoading();

  const { data, state, send, close } = useWebSocket();

  const localLoading = ref(false);

  // mso computed getters ------------------------------------

  // loading indicator, when commands have been 
  // sent to MSO and a response is being awaited
  // const loading = computed(() => commandsAwaitingResponse.value.length > 0);

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

  // visible upmixers, computed from MSO state
  const visibleUpmixers = computed(() => {
    const filtered = {};
    if (mso.value.upmix) {
      for (const upmixKey in mso.value.upmix) {
        if (mso.value.upmix[upmixKey].homevis) {
          filtered[upmixKey] = {...mso.value.upmix[upmixKey]};
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

  const currentDiracSlot = computed(() => {
    return mso.value.cal?.slots[mso.value.cal?.currentdiracslot];
  });

  const diracBCEnabled = computed(() => {
    return mso.value.cal?.slots[mso.value.cal?.currentdiracslot].hasBCFilter;
  });

  const showCrossoverControls = computed(() => {
    return !(mso.value.cal?.diracactive=='on' && diracBCEnabled.value);
  });

  const calToolConnected = computed(() => {
    return mso.value.cal?.caltoolconnected;
  });

  // mso mutators --------------------------------------------

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
    patchMso({'op':'replace', 'path': '/volume', 'value': volumeLevel});
  }

  function toggleMute() {
    patchMso({'op':'replace', 'path': '/muted', 'value': !mso.value.muted});
  }

  function setInput(inpid) {
    patchMso({'op':'replace', 'path': '/input', 'value': inpid});
  }

  function setUpmix(upmixKey) {
    patchMso({'op':'replace', 'path': '/upmix/select', 'value': upmixKey});
  }

  function toggleUpmixHomevis(upmix) {
    patchMso({'op':'replace', 'path': `/upmix/${upmix}/homevis`, 'value': !mso.value.upmix[upmix].homevis});
  }

  function toggleUpmixCenterSpread() {
    patchMso({'op':'replace', 'path': `/upmix/dolby/cs`, 'value': !mso.value.upmix.dolby.cs});
  }

  function toggleUpmixWideSynth() {
    patchMso({'op':'replace', 'path': `/upmix/dts/ws`, 'value': !mso.value.upmix.dts.ws});
  }

  function setAuroMaticPreset(preset) {
    patchMso({'op':'replace', 'path': `/upmix/auro/preset`, 'value': parseInt(preset)});
  }

  function setAuroMaticStrength(strength) {
    patchMso({'op':'replace', 'path': `/upmix/auro/strength`, 'value': parseInt(strength)});
  }

  function setDefaultAuroMaticStrength() {
    setAuroMaticStrength(13);
  }

  function toggleReinforceBass() {
    if (!diracBCEnabled.value) {
      patchMso({'op':'replace', 'path': `/bassenhance`, 'value': mso.value.bassenhance === 'off' ? 'on' : 'off'});
    }
  }

  function setNextNightMode() {

    let nightValue;

    switch(mso.value.night) {
      case 'auto':
        nightValue = 'on';
        break;
      case 'off':
        nightValue = 'auto';
        break;
      default:
      case 'on':
        nightValue = 'off';
    }

    patchMso({'op':'replace', 'path': '/night', 'value': nightValue});
  }

  function toggleDirac() {

    let diracActive;

    switch(mso.value.cal.diracactive) {
      case 'on':
        diracActive = 'bypass';
        break;
      case 'off':
        diracActive = 'on';
        break;
      default:
      case 'bypass':
        diracActive = 'off';
        break;
    }

    patchMso({'op':'replace', 'path': '/cal/diracactive', 'value': diracActive});
  }

  function toggleLoudness() {
    patchMso({'op':'replace', 'path': '/loudness', 'value': mso.value.loudness === 'off' ? 'on' : 'off'});
  }

  function setNextDtsDialogEnh() {
    patchMso({'op':'replace', 'path': '/dialogEnh', 'value': (mso.value.dialogEnh + 1) % 7});
  }

  // TODO validate
  function toggleSpeakerChannel(spkCode) {
    patchMso({'op': 'replace', 'path': `/speakers/groups/${spkCode}/present`, value: !mso.value.speakers.groups[spkCode].present});
  }

  function setSpeakerSize(spkCode, sizeCode) {
    patchMso({'op': 'replace', 'path': `/speakers/groups/${spkCode}/size`, value: sizeCode});
  }

  function setCenterFreq(spkCode, centerFreq) {
    patchMso({'op': 'replace', 'path': `/speakers/groups/${spkCode}/fc`, value: parseInt(centerFreq)});
  }

  function setMinVolume(minVol) {
    patchMso({'op': 'replace', 'path': '/cal/vpl', value: parseInt(minVol)});
  }

  function setMaxVolume(maxVol) {
    patchMso({'op': 'replace', 'path': '/cal/vph', value: parseInt(maxVol)});
  }

  function setMaxOutputLevel(outputLevel) {
    patchMso({'op': 'replace', 'path': '/cal/ampsense', value: parseFloat(outputLevel)});
  }

  function setLipsyncDelay(lipsyncDelay) {
    patchMso({'op': 'replace', 'path': '/cal/lipsync', value: parseInt(lipsyncDelay)});
  }

  function setDiracSlot(slotNumber) {
    patchMso({'op': 'replace', 'path': '/cal/currentdiracslot', value: slotNumber});
  }

  function setUserDelay(channel, delay) {
    patchMso({'op': 'replace', 'path': `/cal/slots/${mso.value.cal.currentdiracslot}/channels/${channel}/delay`, value: parseFloat(delay)});
  }

  function setUserTrim(channel, trim) {
    patchMso({'op': 'replace', 'path': `/cal/slots/${mso.value.cal.currentdiracslot}/channels/${channel}/trim`, value: parseFloat(trim)});
  }

  function toggleSignalGenerator() {
    patchMso({'op': 'replace', 'path': `/sgen/sgensw`, value: mso.value.sgen.sgensw === 'off' ? 'on' : 'off'});
  }

  function setSignalGeneratorChannel(channel) {
    patchMso({'op': 'replace', 'path': `/sgen/select`, value: channel});
  }

  function setSignalGeneratorSignalType(signalType) {
    patchMso({'op': 'replace', 'path': `/sgen/signalType`, value: signalType});
  }

  function toggleToneControl() {
    patchMso({'op': 'replace', 'path': `/eq/tc`, value: !mso.value.eq.tc});
  }

  function setBassCornerFrequency(freq) {
    patchMso({'op': 'replace', 'path': `/eq/bass/freq`, value: parseFloat(freq)});
  }

  function setTrebleCornerFrequency(freq) {
    patchMso({'op': 'replace', 'path': `/eq/treble/freq`, value: parseFloat(freq)});
  }

  function setBassBoostCutLevel(level) {
    patchMso({'op': 'replace', 'path': `/eq/bass/level`, value: parseFloat(level)});
  }

  function setTrebleBoostCutLevel(level) {
    patchMso({'op': 'replace', 'path': `/eq/treble/level`, value: parseFloat(level)});
  }

  function setLoudnessCalibration(loudness) {
    patchMso({'op': 'replace', 'path': `/loudnessCal`, value: parseFloat(loudness)});
  }

  function toggleGlobalPEQ() {
    patchMso({'op': 'replace', 'path': `/peq/peqsw`, value: !mso.value.peq.peqsw});
  }

  function setPEQCenterFrequency(channel, slot, centerFreq) {
    patchMso({'op': 'replace', 'path': `/peq/slots/${slot}/channels/${channel}/Fc`, value: parseFloat(centerFreq)});
  }

  function setPEQGain(channel, slot, gain) {
    patchMso({'op': 'replace', 'path': `/peq/slots/${slot}/channels/${channel}/gaindB`, value: parseFloat(gain)});
  }

  function setPEQQuality(channel, slot, q) {
    patchMso({'op': 'replace', 'path': `/peq/slots/${slot}/channels/${channel}/Q`, value: parseFloat(q)});
  }

  function setPEQFilterType(channel, slot, filterType) {
    patchMso({'op': 'replace', 'path': `/peq/slots/${slot}/channels/${channel}/FilterType`, value: parseInt(filterType)});
  }

  function setInputLabel(input, label) {
    patchMso({'op': 'replace', 'path': `/inputs/${input}/label`, value: label});
  }

  function toggleInputVisible(input) {
    patchMso({'op': 'replace', 'path': `/inputs/${input}/visible`, value: !mso.value.inputs[input].visible});
  }

  function setInputFormatDetectOption(input, formatDetectOption) {
    patchMso({'op': 'replace', 'path': `/inputs/${input}/formatDetectOption`, value: formatDetectOption});
  }

  function toggleInputUHD(input) {
    patchMso({'op': 'replace', 'path': `/inputs/${input}/uhd`, value: !mso.value.inputs[input].uhd});
  }

  function setBluetoothDiscoverableTime(time) {
    patchMso({'op': 'replace', 'path': `/bluetooth/discoverabletime`, value: parseInt(time)});
  }

  function enableBluetoothDiscovery() {
    send('btdiscover ' + mso.value.bluetooth.discoverabletime);
  }

  function toggleCEC() {
    patchMso({'op': 'replace', 'path': `/CEC/cecOnSw`, value: mso.value.CEC.cecOnSw === 'off' ? 'on' : 'off'});
  }

  function setTVSoundSrcDefault(inp) {
    patchMso({'op': 'replace', 'path': `/stat/TVSoundSrcDefault`, value: inp});
  }

  function toggleCECAllowPowerKey() {
    patchMso({'op': 'replace', 'path': `/CEC/allowpwrk`, value: !mso.value.CEC.allowpwrk});
  }

  function toggleCECAllowVolKey() {
    patchMso({'op': 'replace', 'path': `/CEC/allowvolk`, value: !mso.value.CEC.allowvolk});
  }

  function toggleCECAllowSysAudioOff() {
    patchMso({'op': 'replace', 'path': `/CEC/allowsaf`, value: !mso.value.CEC.allowsaf});
  }

  function toggleCECAllowInputChange() {
    patchMso({'op': 'replace', 'path': `/CEC/allowinp`, value: !mso.value.CEC.allowinp});
  }

  function toggleCECAllowStandby() {
    patchMso({'op': 'replace', 'path': `/CEC/allowstdb`, value: !mso.value.CEC.allowstdb});
  }

  function setUnitName(name) {
    patchMso({'op': 'replace', 'path': `/unitname`, value: name});
  }

  function toggleFastStart() {
    patchMso({'op': 'replace', 'path': `/fastStart`, value: mso.value.fastStart === 'off' ? 'on' : 'off'});
  }

  function toggleFastStartPassThrough() {
    patchMso({'op': 'replace', 'path': `/fastStartPassThrough`, value: mso.value.fastStartPassThrough === 'off' ? 'on' : 'off'});
  }

  function setPowerOnVol(volumeLevel) {
    patchMso({'op': 'replace', 'path': `/powerOnVol`, value: parseInt(volumeLevel)});
  }

  function setFrontPanelBrightness(brightness) {
    patchMso({'op': 'replace', 'path': `/hw/fpBright`, value: parseInt(brightness)});
  }

  function toggleVideoStatusHomePage() {
    patchMso({'op': 'replace', 'path': `/stat/displayVideoStat`, value: !mso.value.stat.displayVideoStat});
  }

  function toggleExtendedAudioStatus() {
    patchMso({'op': 'replace', 'path': `/stat/displayAudioStat`, value: !mso.value.stat.displayAudioStat});
  }

  function toggleAdvancedInputSettings() {
    patchMso({'op': 'replace', 'path': `/stat/displayAdvancedSettings`, value: !mso.value.stat.displayAdvancedSettings});
  }

  function toggleSupportTools() {
    patchMso({'op': 'replace', 'path': `/stat/enableSupportTools`, value: !mso.value.stat.enableSupportTools});
  }

  // danger
  function importMsoPatchList(patchList) {
    commandsToSend.value = patchList;
  }

  function patchMso(singlePatch) {
    // block changes if dirac calibration is in progress
    if (!calToolConnected.value) {
      // update local mso state
      applyPatch(mso.value, [singlePatch]);
      // add to commandsToSend, which will trigger its
      // watcher and queue it to be sent to the mso websocket
      commandsToSend.value = addCommand(commandsToSend.value, singlePatch);
    }
  }

  function sendCommands() {
    console.log('sendCommands', commandsToSend, commandsAwaitingResponse)
    if (commandsToSend.value.length > 0) {
      console.log('changemso', commandsToSend.value.length, commandsToSend.value[0]);
      send('changemso ' + JSON.stringify(commandsToSend.value));
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
    leading: true,
    trailing: true
  });

  function receiveCommands() {
    if (commandsReceived.value.length > 0) {
      console.log('receiveCommands', commandsReceived.value.length, commandsReceived.value[0]);
      
      if (commandsReceived.value.length > 0) {

        commandsAwaitingResponse.value = filterMatchingCommandList(
          commandsAwaitingResponse.value, commandsReceived.value
        );

        // only apply patch if not awaiting any more commands
        if (commandsAwaitingResponse.value.length === 0) {
          console.log('!!!! applyPatch', commandsReceived.value)
          
          // use this to trigger mso watcher, 
          // requires deep clone for every mso mutation
          // const newMso = deepClone(mso.value);
          // applyPatch(newMso, commandsReceived.value);
          // mso.value = newMso;

          // this does not trigger mso watcher
          // but does not require deep clone, so it's 
          // more lightweight if mso watcher isn't needed
          applyPatch(mso.value, commandsReceived.value);


          commandsReceived.value = [];

        } else {
          console.log('skip applyPatch', commandsAwaitingResponse.value)
        }
      }

    } else {
      console.log('skip receiveCommands', commandsToSend.value.length, commandsReceived.value.length);
    }
  }

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
        default:
          commandsAwaitingResponse.value = [];
      }
    }
  );

  // watch commandsToSend, add them to commandsAwaitingResponse
  // triggers the commandsAwaitingResponse watcher
  watch(
    commandsToSend,
    newCommandsToSend => {
      console.log('watch commandsToSend', newCommandsToSend.length, newCommandsToSend)
      if (newCommandsToSend.length > 0) {
        commandsAwaitingResponse.value = addCommandList(commandsAwaitingResponse.value, newCommandsToSend);
      }
    }
  );

  // watch commandsAwaitingResponse, if any are present, 
  // debounce send commands to MSO
  watch(
    commandsAwaitingResponse,
    newCommandsAwaitingResponse => {
      console.log('watch commandsAwaitingResponse', newCommandsAwaitingResponse.length)
      if (newCommandsAwaitingResponse.length > 0) {
        debouncedSendCommands();
        // sendCommands();
        localLoading.value = true;
      } else {
        localLoading.value = false;
      }

      
    }
  );

  // watch local loading indicator,
  // update global loading indicator
  watch(
    localLoading, 
    (newLocalLoading, oldLocalLoading) => {
      // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!! localLoading', newLocalLoading, oldLocalLoading);
      // if (newLocalLoading !== oldLocalLoading) {
        if (newLocalLoading) {
          loading.value += 1;
        } else {
          loading.value -= 1;
        }
      // }
    }
  );

  // watch commandsReceived, and apply them to local MSO state
  // after user interaction has stopped for x ms
  watch(
    commandsReceived,
    newCommandsReceived => {
      if (newCommandsReceived.length > 0) {
        receiveCommands();
      }
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
    toggleCEC, setTVSoundSrcDefault, toggleCECAllowPowerKey, toggleCECAllowVolKey, 
    toggleCECAllowSysAudioOff, toggleCECAllowInputChange, toggleCECAllowStandby,
    setUnitName, toggleFastStart, toggleFastStartPassThrough, setPowerOnVol,
    setFrontPanelBrightness, toggleVideoStatusHomePage, toggleExtendedAudioStatus,
    toggleAdvancedInputSettings, toggleSupportTools, importMsoPatchList,
    showCrossoverControls, currentDiracSlot, calToolConnected,
    state, loading,
    commandsToSend, commandsReceived, commandsAwaitingResponse // debug
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
  const newCmdList = filterMatchingCommandType(cmdList, newCmd);

  newCmdList.push(newCmd);
  
  return newCmdList;
}

function addCommandList(cmdList, newCmdList) {
  let result = [];
  for (const newCmd of newCmdList) {
    result = addCommand(cmdList, newCmd);
  }

  return result;
}

function filterMatchingCommandType(cmdList, newCmd) {
  return cmdList.filter(
    cmd => {
      return !(cmd.op === newCmd.op && cmd.path === newCmd.path);
      // return true;
    }
  );
}

// including value
function filterMatchingCommand(cmdList, newCmd) {
  return cmdList.filter(
    cmd => {
      return !(cmd.op === newCmd.op && cmd.path === newCmd.path && cmd.value === newCmd.value);
    }
  );
}

function filterMatchingCommandList(cmdList, newCmdList) {
  
  let result = [...cmdList];

  for (const newCmd of newCmdList) {
    result = filterMatchingCommand(result, newCmd);
  }

  return result;
}