import { ref, watch, computed } from 'vue';
import { useWebSocket } from './useWebSocket.js';
import { applyPatch, compare } from 'fast-json-patch/index.mjs';
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

  const currentDiracSlot = computed(() => {
    return mso.value.cal?.slots[mso.value.cal?.currentdiracslot];
  });

  const diracBCEnabled = computed(() => {
    return mso.value.cal?.slots[mso.value.cal?.currentdiracslot].hasBCFilter;
  });

  const showCrossoverControls = computed(() => {
    return !(mso.value.cal?.diracactive=='on' && diracBCEnabled.value);
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
    console.log('!!!!!!!!!!!!!! setVolume', volumeLevel);
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

    mso.value.cal.diracactive = diracActive;

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
    mso.value.speakers.groups[spkCode].fc = parseInt(centerFreq);

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

  function toggleCEC() {
    mso.value.CEC.cecOnSw = mso.value.CEC.cecOnSw === 'off' ? 'on' : 'off';

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/CEC/cecOnSw`, value: mso.value.CEC.cecOnSw}
    );
  }

  function setTVSoundSrcDefault(inp) {
    mso.value.stat.TVSoundSrcDefault = inp;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/stat/TVSoundSrcDefault`, value: mso.value.stat.TVSoundSrcDefault}
    );
  }

  function toggleCECAllowPowerKey() {
    mso.value.CEC.allowpwrk = !mso.value.CEC.allowpwrk;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/CEC/allowpwrk`, value: mso.value.CEC.allowpwrk}
    );
  }

  function toggleCECAllowVolKey() {
    mso.value.CEC.allowvolk = !mso.value.CEC.allowvolk;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/CEC/allowvolk`, value: mso.value.CEC.allowvolk}
    );
  }

  function toggleCECAllowSysAudioOff() {
    mso.value.CEC.allowsaf = !mso.value.CEC.allowsaf;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/CEC/allowsaf`, value: mso.value.CEC.allowsaf}
    );
  }

  function toggleCECAllowInputChange() {
    mso.value.CEC.allowinp = !mso.value.CEC.allowinp;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/CEC/allowinp`, value: mso.value.CEC.allowinp}
    );
  }

  function toggleCECAllowStandby() {
    mso.value.CEC.allowstdb = !mso.value.CEC.allowstdb;

    commandsToSend.value = addCommand(
      commandsToSend.value,
      {'op': 'replace', 'path': `/CEC/allowstdb`, value: mso.value.CEC.allowstdb}
    );
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
        // debouncedSendCommands();
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
    showCrossoverControls, currentDiracSlot,
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