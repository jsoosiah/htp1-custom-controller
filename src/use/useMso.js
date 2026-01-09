import { ref, watch, computed } from 'vue';
import { applyPatch } from 'fast-json-patch/index.mjs';
import { cloneDeep, debounce, get, isArray, isEqual, maxBy } from 'lodash-es';

import useWebSocket from './useWebSocket.js';
import useLocalStorage from './useLocalStorage.js';
import useSpeakerGroups from './useSpeakerGroups.js';

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

const defaultPersonalizeShortcuts = {
  'about': true,
  'help': true,
  'power': true,
};

const defaultPersonalizeModes = {
  'dirac': true,
  'loudness': true,
  'dialogenh': true,
  'night': true,
};

const commandKeys = [
  'cmda',
  'cmdb',
  'cmdc',
  'cmdd',
  'preset1',
  'preset2',
  'preset3',
  'preset4'
];

// flag to apply bmlfec from bassLpf
let bmlfecApplied = false;

// flag to apply headroom from cal/headroom
let headroomApplied = false;

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

const loading = ref(false);

// if recording is currently enabled for a slot,
// it will be stored here and a notice will be shown
const currentlyRecordingSlot = ref(null);

const { eventHash, data, state, send } = useWebSocket();

const { getActiveChannels, reverseBmg } = useSpeakerGroups();

const { maxWaitTimeToSendToMso } = useLocalStorage();

// watchers ------------------------------------------

// watch websocket messages and keep local mso state up to date
watch(
  eventHash, 
  val => {
    const { verb, arg } = parseMSO(data.value);
    console.log('received verb', verb);
    if (verb === 'mso') {
      // full mso object
      mso.value = arg;
      applyProductRules();
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
      debouncedSendCommands.value();
      loading.value = true;
    } else {
      loading.value = false;
    }
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

// helper functions for watchers ---------------------------
function applyProductRules() {

  const groups = ['c', 'lrs', 'lrb', 'lrw', 'lrtf', 'lrtm', 'lrtr', 'lrhf', 'lrhr', 'sub1', 'sub2', 'sub3', 'sub4', 'sub5'];
  const spg = mso.value.speakers?.groups;

  if (spg) {
    for (const group of groups) {
      if (spg[group] === undefined) {
        initializeSpeakerGroup(group);
      }
    }

    // too many channels, disable speaker groups until under 16
    if (activeChannels.value.length > 16) {
      let over = activeChannels.value.length - 16;
      // iterate speaker groups in reverse order, 
      // excluding subs, so starting at index 8 = lrhr
      // and disable them until the total channel count <= 16
      for (let i = 8; i >= 0; i--) { 
        if (spg[groups[i]].present) {
          setSpeakerGroupPresent(groups[i], false);
          over -= 2;
        }
        
        // total channels is now 16 or less
        if (over <= 0) {
          break;
        }
      }
    }

    setSpeakerGroupPresent('lrb', spg.lrb.present && spg.lrs.present); // No backs when no surround
    setSpeakerGroupPresent('lrw', spg.lrw.present && spg.lrb.present); // No wides when no backs
    // console.log('lrhf?', spg.lrhf.present && (!spg.lrtf.present));
    setSpeakerGroupPresent('lrhf', spg.lrhf.present && (!spg.lrtf.present)); // No height front if top front present

    if ((!spg.lrs.present) && (spg.lrtm.present) && (spg.lrtf.present || spg.lrtr.present || spg.lrhf.present || spg.lrhr.present)) {
        setSpeakerGroupPresent('lrtf', false);
        setSpeakerGroupPresent('lrtr', false);
        setSpeakerGroupPresent('lrhf', false);
        setSpeakerGroupPresent('lrhr', false);
    }
    if ((!spg.lrs.present) && (!spg.lrtm.present) && (spg.lrtr.present || spg.lrhr.present)) {
        setSpeakerGroupPresent('lrtf', spg.lrtf.present && (!spg.lrhf.present));
        setSpeakerGroupPresent('lrtr', false);
        setSpeakerGroupPresent('lrhr', false);
    }
    if ((!spg.c.present) && (!spg.lrb.present)) {
        setSpeakerGroupPresent('lrtm', false);
    }
    spg.lrtf.present = spg.lrtf.present && (!spg.lrhf.present); // only one front allowed
    spg.lrtr.present = spg.lrtr.present && (!spg.lrhr.present); // only one rear allowed
    if ((!spg.lrtf.present) && (!spg.lrhf.present)) {
        setSpeakerGroupPresent('lrhr', false); // no fronts . clear rears
        setSpeakerGroupPresent('lrtr', false);
    }
    // No top middle when top front present but top rear not present
    if (spg.lrtm.present && spg.lrtf.present) {
        if ((!spg.lrtr.present) && (!spg.lrhr.present)) {
            setSpeakerGroupPresent('lrtm', false);
        }
    }
    if (spg.lrtm.present && spg.lrhf.present) {
        if ((!spg.lrtr.present) && (!spg.lrhr.present)) {
            setSpeakerGroupPresent('lrtm', false);
        }
    }

    setSpeakerGroupPresent('sub2', spg.sub2.present && spg.sub1.present); // No sub2 without sub
    setSpeakerGroupPresent('sub3', spg.sub3.present && spg.sub2.present); // No sub3 without sub2
    setSpeakerGroupPresent('sub4', spg.sub4.present && spg.sub3.present); // No sub4 without sub3
    setSpeakerGroupPresent('sub5', spg.sub5.present && spg.sub4.present); // No sub5 without sub4

    for (const groupName of Object.keys(spg)) {
      const group = spg[groupName];
      if (group.fc) {
        setCenterFreq(groupName, Math.round(group.fc / 10) * 10);
      }
    }

    if (mso.value.fastStart === 'off') {
        setFastStartPassThroughOff();
    }

    if (!mso.value.crda) {
      initializeWifiCountryCode();
    }

    // initialize custom attributes if not present
    if (!mso.value.sgen.select2) {
      _setSignalGeneratorChannel2();
    }

    for (let inputKey in mso.value.inputs) {
      if (mso.value.inputs) {
        if (!Object.prototype.hasOwnProperty.call(mso.value.inputs[inputKey], 'defaultUpmix')) {
          _setInputDefaultUpmix(inputKey);
        }
        if (!Object.prototype.hasOwnProperty.call(mso.value.inputs[inputKey], 'gain')) {
          _setInputVolumeTrim(inputKey);
        }
        if (!Object.prototype.hasOwnProperty.call(mso.value.inputs[inputKey], 'delay')) {
          initializeInputDelay(inputKey);
        }
        if (!Object.prototype.hasOwnProperty.call(mso.value.inputs[inputKey], 'diracslot')) {
          initializeInputDiracSlot(inputKey);
        }
        if (!Object.prototype.hasOwnProperty.call(mso.value.inputs[inputKey], 'macro')) {
          initializeInputRunMacro(inputKey);
        }
      }
    }

    if (!mso.value.loudnessCurve) {
      _setLoudnessCurve();
    }

    // personalization settings
    if (!mso.value.personalize) {
      initializePersonalize();
    } else {
      if (!mso.value.personalize.shortcuts) {
        initializeShortcuts();
      }

      if (!mso.value.personalize.modes) {
        initializeModes();
      }

      if (!mso.value.personalize.diracSlots) {
        initializeDiracSlots();
      }

      if (!mso.value.personalize.macros) {
        initializeShowMacros();
      }

      if (!mso.value.personalize.dismissedAlerts) {
        initializeDismissedAlerts();
      }

      if (!mso.value.personalize.homeLabels) {
        initializeHomeLabels();
      }

      if (!mso.value.personalize.powerDialogButtons) {
        initializePowerDialogButtons();
      }
    }

    if (!mso.value.svronly.macroNames) {
      initializeMacroNames();
    }

    if (!mso.value.svronly.extraMacros || isArray(mso.value.svronly.extraMacros)) {
      initializeExtraMacros();
    }

    if (!mso.value.bassLpf) {
      initializeBassLpf();
    } else {
      if (mso.value.powerIsOn && !bmlfecApplied) {
      // TODO remove once the MSO is read by avController
      send(`avcui "bmlfec ${mso.value.bassLpf}"`);
      bmlfecApplied = true;
      }
    }

    if (!mso.value.cal.headroom) {
      initializeHeadroom();
    } else {
      if (mso.value.powerIsOn && !headroomApplied) {
        // TODO remove once the MSO is read by avController
        send(`avcui "headroom ${mso.value.cal.headroom}"`);
        headroomApplied = true;
      }
    }

    if (!mso.value.cal.zeroPoint) {
      initializeZeroPoint();
    }

    if (!mso.value.secondVolume) {
      initializeSecondVolume();
    }

    for (let slot = 0; slot < mso.value.cal.slots.length; slot++) {
      // console.log(slot, typeof mso.value.cal.slots[slot].notes)
      if (typeof mso.value.cal.slots[slot].notes === 'undefined') {
        initializeDiracSlotNotes(slot);
      }
    }
  }
}

function patchMso(op, path, value) {
  const singlePatch = {
    'op': op,
    'path': path,
    'value': value,
  };

  // block changes if dirac calibration is in progress
  if (!calToolConnected.value) {

    // block cal changes if dirac filter transfer is in progress
    if (path.includes('/cal/') && diracFilterTransferInProgress.value) {
      return false;
    }

    // check if patch already matches local mso state
    const oldValue = get(mso.value, singlePatch.path.substring(1).split('/'));
    if (oldValue === singlePatch.value) {
      return false;
    }

    // update local mso state
    applyPatch(mso.value, [singlePatch]);
    // add to commandsToSend, which will trigger its
    // watcher and queue it to be sent to the mso websocket
    commandsToSend.value = addCommand(commandsToSend.value, singlePatch);
    return true;
  }

  return false;
}

function sendCommands() {
  console.log('sendCommands', commandsToSend, commandsAwaitingResponse)
  if (commandsToSend.value.length > 0) {
    console.log('changemso', commandsToSend.value.length, commandsToSend.value[0]);
    changemso(commandsToSend.value);
    
    commandsToSend.value = [];
  }
}

function changemso(commands) {
  send('changemso ' + JSON.stringify(commands));
}

// // send commands 250 ms after user interaction stopped
// const debouncedSendCommands = debounce(sendCommands, 250, {
//   // use a max wait time of 300 ms, so the user does see
//   // their interactions cause changes every 300 ms at maximum
//   // if the user rapidly adjusts volume from -50 dB to 0 dB,
//   // this allows the volume to gradually increase around every 
//   // 3 dB, instead of only suddenly updating the volume to 0 dB
//   // at the end
//   maxWait: 100,
//   leading: true,
//   trailing: true
// });

const debouncedSendCommands = computed(() => {
  return debounce(sendCommands, 250, {
    maxWait: maxWaitTimeToSendToMso.value,
    leading: true,
    trailing: true,
  });
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

        applyProductRules();

      } else {
        console.log('skip applyPatch', commandsAwaitingResponse.value)
      }
    }

  } else {
    console.log('skip receiveCommands', commandsToSend.value.length, commandsReceived.value.length);
  }
}

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

const visibleDiracSlots = computed(() => {
  const filtered = {};
  if (mso.value.personalize?.diracSlots) {
    for (let slotIndex in mso.value.personalize?.diracSlots) {
      if (slotIndex < mso?.value?.cal?.num_dirac_slots) {
        filtered[slotIndex] = mso.value.cal?.slots[slotIndex];
      }
    }
  }
  console.log(filtered)
  return filtered;
});

const visibleRemoteMacros = computed(() => {
  const filtered = {};
  if (mso.value.personalize?.macros) {
    for (let key in mso.value.personalize?.macros) {
      if (mso.value.svronly[key]) {
        filtered[key] = mso.value.svronly[key];
      } 
      // else if (mso.value.svronly.extraMacros[key]) {
        // filtered[key] = mso.value.svronly.extraMacros[key];
      // }
    }
  }

  return filtered;
});

const visibleExtraMacros = computed(() => {
  const filtered = {};
  if (mso.value.personalize?.macros) {
    for (let key in mso.value.personalize?.macros) {
      // if (mso.value.svronly[key]) {
        // filtered[key] = mso.value.svronly[key];
      // } else 
      if (mso.value.svronly.extraMacros[key]) {
        filtered[key] = mso.value.svronly.extraMacros[key];
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

const diracBCArtFilterExists = computed(() => {
  if (mso?.value?.cal?.slots) {
    for (const slot of mso?.value?.cal?.slots) {
      const filterType = filterTypeToCssClass(slot?.filterType, true).toUpperCase();
      if (slot?.valid && ['RC', 'BC', 'ART'].includes(filterType) ) {
        return true;
      }
    }
  }

  return false;
});

const peqEnabled = computed(() => {
  return mso?.value?.peq.location === "pre" || delayPeqAllowed.value !== 'blocked' || !diracBCArtFilterExists.value;
});

const peqWarning = computed(() => {
  return mso?.value?.peq.location !== "pre" && delayPeqAllowed.value !== 'OK' && diracBCArtFilterExists.value;
});

const diracFilterType = computed(() => {
  return currentDiracSlot.value?.filterType;
})

const currentDiracSlot = computed(() => {
  return mso.value.cal?.slots[mso.value.cal?.currentdiracslot];
});

const diracBCEnabled = computed(() => {
  return ['dirac live bass management', 'dirac live bass control', 'dirac active room treatment'].includes(diracFilterType.value?.toLowerCase());
});

const currentDiracFilterType = computed(() => {
  const filterType = filterTypeToCssClass(currentDiracSlot?.value?.filterType, true).toUpperCase();
  if (['RC', 'BC', 'ART'].includes(filterType)) {
    return filterType;
  }
  return 'RC';
});

const delayPeqAllowed = computed(() => {
  return mso?.value?.cal.post_delay_peq[currentDiracSlot?.value?.filterType];
});

const diracErrorState = computed(() => {
  if (diracNoFilter.value || mso.value?.cal?.diracactive !== "on") {
    return "INACTIVE";
  }

  if (mso.value?.status?.raw?.DiracError) {
    return "RED";
  }

  if (mso.value?.status?.DiracState && mso.value?.cal?.diracactive && mso.value?.status?.DiracState !== mso.value?.cal?.diracactive) {
    return "YELLOW";
  }

  return "GREEN";
});

const seatShakerChannel = computed(() => {
  if (mso.value?.speakers?.seatshaker?.present) {
    for (let i = 5; i >= 1; i--) {
      if (mso.value?.speakers?.groups[`sub${i}`]?.present) {
        return `sub${i+1}`;
      }
    }
    return "sub1";
  }
  return null;
});

const showCrossoverControls = computed(() => {
  return !(mso.value.cal?.diracactive=='on' && diracBCEnabled.value);
});

const calToolConnected = computed(() => {
  return mso.value.cal?.caltoolconnected;
});

const diracFilterTransferInProgress = computed(() => {
  return mso.value.cal?.filterxferinprogress;
});

const currentLayoutHasMatchingDiracFilter = computed(() => {
  return mso.value.cal?.availableFilterLayouts?.includes(mso.value.cal?.currentLayout);
});

const diracNoFilter = computed(() => {
  return mso?.value?.cal?.slots[mso.value?.cal?.currentdiracslot].checksum === 31802 || !currentLayoutHasMatchingDiracFilter.value;
});

const activeChannels = computed(() => {
  return getActiveChannels(mso.value.speakers?.groups, seatShakerChannel.value);
});

const activeChannelsForTrim = computed(() => {
  const out = [];
  let hasSub = false;

  for (const x of activeChannels.value) {
    if (x.startsWith('sub')) {
      hasSub = true;
    } else {
      out.push(x);
    }
  }
  if (hasSub) out.push('lfe');
  return out;
})

const diracMismatchedChannels = computed(() => {
  return activeChannels.value.filter(chan => 
    !chan.startsWith('sub')
    && currentDiracSlot.value.channels[chan].caldelay === 0 
    && currentDiracSlot.value.channels[chan].caltrim === 0
  );
});

const diracMismatchedChannelGroups = computed(() => {
  console.log('mismatched', diracMismatchedChannels.value)
  return [...new Set(diracMismatchedChannels.value.map(chan => reverseBmg[chan]))];
});

const powerIsOn = computed(() => {
  return mso.value.powerIsOn;
});

// apply zero point to master volume
const displayVolume = computed(() => {
  return mso.value.cal?.zeroPoint ? mso.value.volume - mso.value.cal.zeroPoint : mso.value.volume;
})

// watch mso power state
watch(
  powerIsOn,
  (newPower, oldPower) => {
    if (newPower != oldPower) {
      bmlfecApplied = false;
      headroomApplied = false;
    }
  }
)

function setDefaultsBeforePowerDown() {
  // set default upmix for current input if necessary
  const defaultUpmix = mso.value.inputs[mso.value.input].defaultUpmix;
  if (defaultUpmix && mso.value?.upmix.select !== defaultUpmix) {
    return [
      {'op':'replace', 'path': '/upmix/select', 'value': defaultUpmix}
    ];
  }

  return [];
}

function filterTypeToCssClass(filterType, slotName) {

  if (!slotName) {
    return "";
  }

  switch (filterType?.toLowerCase()) {
    case "dirac active room treatment":
      return "art";
    case "dirac live bass control":
      return "bc";
    case "dirac live bass management":
      return "bm";
    case "dirac live":
    default:
      return "rc";
  }
}

// mso mutators --------------------------------------------

function powerOff() {
  const commands = setDefaultsBeforePowerDown();
  commands.push({'op':'replace', 'path': '/powerAction', 'value': 'off'});
  commandsToSend.value = commands;
  return true;
}

function powerSleep() {
  const commands = setDefaultsBeforePowerDown();
  commands.push({'op':'replace', 'path': '/powerAction', 'value': 'sleep'});
  commandsToSend.value = commands;
  return true;
}

function powerRestart() {
  const commands = setDefaultsBeforePowerDown();
  commands.push({'op':'replace', 'path': '/powerAction', 'value': 'reboot'});
  commandsToSend.value = commands;
  return true;
}

function powerOn() {
  commandsToSend.value = [
    {'op':'replace', 'path': '/powerIsOn', 'value': true}
  ];

  return true;
}

function setVolume(volumeLevel) {
  const volInt = convertInt(volumeLevel, mso.value.powerOnVol, mso.value.cal?.vpl, mso.value.cal?.vph);

  return patchMso('replace', '/volume', volInt);
}

function toggleMute() {
  return patchMso('replace', '/muted', !mso.value.muted);
}

function setInput(inpid) {
  // caution: test erase video resolution from local MSO only
  // it should be corrected once the new input has been selected
  // only do this when switching to HDMI
  if (inpid.startsWith('h') && mso.value.input.startsWith('h')) {
    mso.value.videostat.VideoResolution = '-----';
    mso.value.videostat.VideoColorSpace = '---';
    mso.value.videostat.VideoMode = '--';
    mso.value.videostat.HDRstatus = '--';
    mso.value.videostat.VideoBitDepth = '--';
    mso.value.videostat.Video3D = '--';
  }

  if (inpid !== mso.value.input) {
    return patchMso('replace', '/input', inpid);
  } else if (inpid.startsWith('h')) {
    send(`avcui "hpe"`);
    return true;
  }

  return false;
}

function toggleSeatShaker() {
  return patchMso('replace', '/speakers/seatshaker/present', !mso.value?.speakers?.seatshaker?.present);
}

function setUpmix(upmixKey) {
  return patchMso('replace', '/upmix/select', upmixKey);
}

function toggleUpmixHomevis(upmix) {
  return patchMso('replace', `/upmix/${upmix}/homevis`, !mso.value.upmix[upmix].homevis);
}

function toggleUpmixCenterSpread() {
  return patchMso('replace', `/upmix/dolby/cs`, !mso.value.upmix.dolby.cs);
}

function toggleUpmixWideSynth() {
  return patchMso('replace', `/upmix/dts/ws`, !mso.value.upmix.dts.ws);
}

function setUpmixWideSynthOn() {
  return patchMso('replace', `/upmix/dts/ws`, true);
}

function setUpmixWideSynthOff() {
  return patchMso('replace', `/upmix/dts/ws`, false);
}

function setAuroMaticPreset(preset) {
  return patchMso('replace', `/upmix/auro/preset`, parseInt(preset));
}

function setAuroMaticStrength(strength) {
  return patchMso('replace', `/upmix/auro/strength`, parseInt(strength));
}

function setDefaultAuroMaticStrength() {
  setAuroMaticStrength(13);
}

function toggleReinforceBass() {
  if (!diracBCEnabled.value) {
    return patchMso('replace', `/bassenhance`, mso.value.bassenhance === 'off' ? 'on' : 'off');
  }
}

function setReinforceBassOff() {
  return patchMso('replace', `/bassenhance`, 'off');
}

function setReinforceBassOn() {
  if (!diracBCEnabled.value) {
    return patchMso('replace', `/bassenhance`, 'on');
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

  return patchMso('replace', '/night', nightValue);
}

function setNightMode(mode) {
  return patchMso('replace', '/night', mode);
}

function setNightOn() {
  return patchMso('replace', '/night', 'on');
}

function setNightAuto() {
  return patchMso('replace', '/night', 'auto');
}

function setNightOff() {
  return patchMso('replace', '/night', 'off');
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

  return patchMso('replace', '/cal/diracactive', diracActive);
}

function setDiracOn() {
  return patchMso('replace', '/cal/diracactive', 'on');
}

function setDiracBypass() {
  const setOn = setDiracOn();
  const setBypass = patchMso('replace', '/cal/diracactive', 'bypass');
  return setOn && setBypass;
}

function setDiracOff() {
  return patchMso('replace', '/cal/diracactive', 'off');
}

function toggleLoudness() {
  return patchMso('replace', '/loudness', mso.value.loudness === 'off' ? 'on' : 'off');
}

function setLoudnessOn() {
  return patchMso('replace', '/loudness', 'on');
}

function setLoudnessOff() {
  return patchMso('replace', '/loudness', 'off');
}

function setNextDtsDialogEnh() {
  return patchMso('replace', '/dialogEnh', (mso.value.dialogEnh + 1) % 7);
}

function setDtsDialogEnh(level) {
  return patchMso('replace', '/dialogEnh', parseInt(level));
}

function toggleSpeakerGroup(spkCode) {
  return patchMso( 'replace', `/speakers/groups/${spkCode}/present`, !mso.value.speakers.groups[spkCode].present);
}

function setSpeakerGroupPresent(spkCode, present) {
  return patchMso( 'replace', `/speakers/groups/${spkCode}/present`, present);
}

function initializeSpeakerGroup(spkCode) {
  // TODO does this work?
  return patchMso( 'add', `/speakers/groups/${spkCode}`, { present: false, size: 'l', fc: 40 });
}

function setSpeakerSize(spkCode, sizeCode) {
  return patchMso( 'replace', `/speakers/groups/${spkCode}/size`, sizeCode);
}

function setCenterFreq(spkCode, centerFreq) {
  return patchMso( 'replace', `/speakers/groups/${spkCode}/fc`, parseInt(centerFreq));
}

function setMinVolume(minVol) {
  return patchMso( 'replace', '/cal/vpl', parseInt(minVol));
}

function setDefaultMinVolume() {
  return setMinVolume(-100);
}

function setMaxVolume(maxVol) {
  return patchMso( 'replace', '/cal/vph', parseInt(maxVol));
}

function setDefaultMaxVolume() {
  return setMaxVolume(0);
}

function setMaxOutputLevel(outputLevel) {
  return patchMso( 'replace', '/cal/ampsense', convertFloat(outputLevel, 1.6, .1, 4));
}

function setDefaultMaxOutputLevel() {
  return setMaxOutputLevel(1.6);
}

function setHeadroom(headroom) {
  headroomApplied = false;
  return patchMso('replace', '/cal/headroom', convertFloat(headroom, 12, 0, 30))
}

function setDefaultHeadroom() {
  return setHeadroom(12);
}

function setLipsyncDelay(lipsyncDelay) {
  let delay = convertInt(lipsyncDelay, 0, 0, 340);

  return patchMso('replace', '/cal/lipsync', delay) && patchMso('replace', `/inputs/${mso.value?.input}/delay`, delay);
}

function setDiracSlot(slotNumber) {
  return patchMso( 'replace', '/cal/currentdiracslot', parseInt(slotNumber));
}

function setUserDelay(channel, delay) {
  return patchMso( 'replace', `/cal/slots/${mso.value.cal.currentdiracslot}/channels/${channel}/delay`, parseFloat(delay));
}

function setUserTrim(channel, trim) {
  return patchMso( 'replace', `/cal/slots/${mso.value.cal.currentdiracslot}/channels/${channel}/trim`, parseFloat(trim));
}

function setChannelTrim(channel, trim) {
  return patchMso( 'replace', `/channeltrim/channels/${channel}`, parseFloat(trim));
}

function initializeDiracSlotNotes(slotNumber) {
  return patchMso('add', `/cal/slots/${slotNumber}/notes`, '');
}

function setDiracSlotNotes(notes) {
  return patchMso('replace', `/cal/slots/${mso.value.cal.currentdiracslot}/notes`, notes);
}

function setMuteChannelOn(channel) {
  if (currentDiracSlot.value.channels[channel].mute === undefined) {
    // save existing user trim so it can be restored on unmute
    const preMuteTrim = patchMso('add', `/cal/slots/${mso.value.cal.currentdiracslot}/channels/${channel}/preMuteTrim`, 
      currentDiracSlot.value.channels[channel].trim);
    // set mute flag to true
    const mute =  patchMso( 'add', `/cal/slots/${mso.value.cal.currentdiracslot}/channels/${channel}/mute`, true);
    // apply -100 trim to achieve mute effect
    const trim = setUserTrim(channel, -100);

    return preMuteTrim && mute && trim;
  }

  return false;
}

function setMuteChannelOff(channel) {
  if (currentDiracSlot.value.channels[channel].mute === true) {
    // restore user trim 
    let trim;
    if (currentDiracSlot.value.channels[channel].preMuteTrim) {
      trim = setUserTrim(channel, currentDiracSlot.value.channels[channel].preMuteTrim);
    } else {
      trim = setUserTrim(channel, 0);
    }
    
    // remove mute flag
    const mute =  patchMso('remove', `/cal/slots/${mso.value.cal.currentdiracslot}/channels/${channel}/mute`);
    // remove saved user trim
    const preMuteTrim =  patchMso('remove', `/cal/slots/${mso.value.cal.currentdiracslot}/channels/${channel}/preMuteTrim`);

    return trim && mute && preMuteTrim;
  }

  return false;
}

function toggleMuteChannel(channel) {
  if (currentDiracSlot.value.channels[channel].mute) {
    return setMuteChannelOff(channel);
  }

  return setMuteChannelOn(channel);
}

function setMuteAllChannelsOn() {
  let result = true;
  for (let channel in currentDiracSlot.value.channels) {
    result = setMuteChannelOn(channel) && result;
  }

  return result;
}

function setMuteAllChannelsOff() {
  let result = true;
  for (let channel in currentDiracSlot.value.channels) {
    result = setMuteChannelOff(channel) && result;
  }

  return result;
}

function toggleAllMuteChannels() {
  let result = true;
  for (let channel in currentDiracSlot.value.channels) {
    result = toggleMuteChannel(channel) && result;
  }

  return result;
}

function toggleSignalGenerator() {
  return patchMso( 'replace', `/sgen/sgensw`, mso.value.sgen.sgensw === 'off' ? 'on' : 'off');
}

function setSignalGeneratorOff() {
  return patchMso( 'replace', `/sgen/sgensw`, 'off');
}

function setSignalGeneratorOn() {
  return patchMso( 'replace', `/sgen/sgensw`, 'on');
}

function setSignalGeneratorChannel(channel) {
  return patchMso( 'replace', `/sgen/select`, channel);
}

function _setSignalGeneratorChannel2(channel, op) {
  if (!op) {
    op = mso.value.sgen?.select2 ? 'replace' : 'add';
  }

  if (!channel) {
    channel = 'rf';
  }
  
  return patchMso( op, `/sgen/select2`, channel);
}

// Warning: custom attribute
function setSignalGeneratorChannel2(channel) {
  return _setSignalGeneratorChannel2(channel, 'replace');
}

function setSignalGeneratorSignalType(signalType) {
  return patchMso( 'replace', `/sgen/signalType`, signalType);
}

function setSineFrequency(freq) {
  let freqValue = convertInt(freq, 440, 10, 20000);
  return patchMso( 'replace', `/sgen/sinehz`, freqValue);
}

function setSineAmplitude(gain) {
  let gainValue = convertFloat(gain, -20, -140, 6);
  return patchMso( 'replace', `/sgen/sinedb`, gainValue);
}

function toggleToneControl() {
  return patchMso( 'replace', `/eq/tc`, !mso.value.eq.tc);
}

function setToneControlOn() {
  return patchMso( 'replace', `/eq/tc`, true);
}

function setToneControlOff() {
  return patchMso( 'replace', `/eq/tc`, false);
}

function setBassCornerFrequency(freq) {
  return patchMso( 'replace', `/eq/bass/freq`, convertFloat(freq, 20, 20, 500));
}

function setTrebleCornerFrequency(freq) {
  return patchMso( 'replace', `/eq/treble/freq`, convertFloat(freq, 8000, 501, 8000));
}

function setBassBoostCutLevel(level) {
  return patchMso( 'replace', `/eq/bass/level`, convertFloat(level, 0, -12, 12));
}

function setTrebleBoostCutLevel(level) {
  return patchMso( 'replace', `/eq/treble/level`, convertFloat(level, 0, -12, 12));
}

function setLoudnessCalibration(loudness) {
  return patchMso( 'replace', `/loudnessCal`, convertFloat(loudness,80, 50, 90));
}

// warning: custom attribute
function _setLoudnessCurve(op, curve) {
  if (!op) {
    op = mso.value.loudnessCurve ? 'replace' : 'add';
  }
  
  if (curve !== 'iso' && curve !== 'vintage') {
    curve = 'iso';
  }

  return patchMso( op, `/loudnessCurve`, curve);
}

function setLoudnessCurve(curve) {
  return _setLoudnessCurve('replace', curve);
}

function toggleGlobalPEQ() {
  return patchMso( 'replace', `/peq/peqsw`, !mso.value.peq.peqsw);
}

function setGlobalPEQOn() {
  return patchMso( 'replace', `/peq/peqsw`, true);
}

function setGlobalPEQOff() {
  return patchMso( 'replace', `/peq/peqsw`, false);
}

function setPEQSlot(bandNumber) {
  return patchMso( 'replace', `/peq/currentpeqslot`, parseInt(bandNumber));
}

function setPEQCenterFrequency(channel, slot, centerFreq) {

  let centerFreqValue = convertFloat(centerFreq, 100.0, 10.0, 20000.0);

  return patchMso( 'replace', `/peq/slots/${slot}/channels/${channel}/Fc`, centerFreqValue);
}

function setPEQGain(channel, slot, gain) {

  let gainValue = convertFloat(gain, 0.0, -99.0, 20.0);

  return patchMso( 'replace', `/peq/slots/${slot}/channels/${channel}/gaindB`, gainValue);
}

function setPEQQuality(channel, slot, q) {
  const filterType = mso?.value?.peq.slots[slot].channels[channel].FilterType;
  const minQ = filterType === 3 ? 0 : 0.1;
  // const minQ = 0.0;
  let qValue = convertFloat(q, 1.0, minQ, 10.0);

  return patchMso( 'replace', `/peq/slots/${slot}/channels/${channel}/Q`, qValue);
}

function setPEQFilterType(channel, slot, filterType) {
  filterType = convertInt(filterType, 0, 0, 3);
  let setQ = true;
  let setGain = true;
  const currentQ = mso?.value?.peq.slots[slot].channels[channel].Q;

  if (filterType === 3) {
    setGain = setPEQGain(channel, slot, 0);
  }
  else if (currentQ <= 0.1) {
    setQ = setPEQQuality(channel, slot, 1.0);
  }

  const setFilterType = patchMso( 'replace', `/peq/slots/${slot}/channels/${channel}/FilterType`, parseInt(filterType));

  return setQ && setGain && setFilterType;
}

function setPEQBypassOn(channel, slot) {
  console.log(mso.value.peq, channel, slot);
  if (mso.value.peq.slots[slot].channels[channel].bypass === undefined) {
    // save existing gain so it can be restored on bypass off
    const preBypassQ = patchMso('add', `/peq/slots/${slot}/channels/${channel}/preBypassQ`,
      mso.value.peq.slots[slot].channels[channel].Q);
    const preBypassGain = patchMso('add', `/peq/slots/${slot}/channels/${channel}/preBypassGain`,
      mso.value.peq.slots[slot].channels[channel].gaindB);
    const preBypassFilterType = patchMso('add', `/peq/slots/${slot}/channels/${channel}/preBypassFilterType`,
      mso.value.peq.slots[slot].channels[channel].FilterType);

    // set bypass flag to true
    const bypass = patchMso('add', `/peq/slots/${slot}/channels/${channel}/bypass`, true);

    // apply 0 gain to achieve bypass
    const gain = setPEQGain(channel, slot, 0);
    const filterType = setPEQFilterType(channel, slot, 0);

    return preBypassGain && preBypassFilterType && preBypassQ && bypass && gain && filterType;
  }

  return false;
}

function setPEQBypassOff(channel, slot) {
  if (mso.value.peq.slots[slot].channels[channel].bypass === true) {
    // restore gain
    let gainValue = 0;
    if (typeof mso.value.peq.slots[slot].channels[channel].preBypassGain !== 'undefined') {
      gainValue = mso.value.peq.slots[slot].channels[channel].preBypassGain;
    } 

    const gain = setPEQGain(channel, slot, gainValue);

    // restore filter type
    let filterTypeValue = 0;
    if (typeof mso.value.peq.slots[slot].channels[channel].preBypassFilterType !== 'undefined') {
      filterTypeValue = mso.value.peq.slots[slot].channels[channel].preBypassFilterType;
    }

    const filterType = setPEQFilterType(channel, slot, filterTypeValue);

    // restore q
    let q = true;
    if (typeof mso.value.peq.slots[slot].channels[channel].preBypassQ !== 'undefined') {
      const qValue = mso.value.peq.slots[slot].channels[channel].preBypassQ;
      q = setPEQQuality(channel, slot, qValue);
    }

    // remove bypass flag
    const bypass = patchMso('remove', `/peq/slots/${slot}/channels/${channel}/bypass`);

    // remove saved gain
    const preBypassGain = patchMso('remove', `/peq/slots/${slot}/channels/${channel}/preBypassGain`);
    const preBypassFilterType = patchMso('remove', `/peq/slots/${slot}/channels/${channel}/preBypassFilterType`);

    return gain && q && filterType && bypass && preBypassGain && preBypassFilterType;
  }

  return false;
}

function togglePEQBypass(channel, slot) {
  if (mso.value.peq.slots[slot].channels[channel].bypass) {
    return setPEQBypassOff(channel, slot);
  }

  return setPEQBypassOn(channel, slot);
}

function addBEQFlag(channel, slot) {
  return patchMso('add', `/peq/slots/${slot}/channels/${channel}/beq`, true);
}

function addBEQActive(underlying) {
  return patchMso('add', `/peq/beqActive`, underlying);
}

function removeBEQActive() {
  return patchMso('remove', '/peq/beqActive');
}

function resetPEQ(channel, slot) {

  const fc = setPEQCenterFrequency(channel, slot, 100);
  const gain = setPEQGain(channel, slot, 0);
  const q = setPEQQuality(channel, slot, 1);
  const filterType = setPEQFilterType(channel, slot, 0);

  return fc && gain && q && filterType;
}

function resetBEQ(channel, slot) {
  const removeBEQFlag = patchMso('remove', `/peq/slots/${slot}/channels/${channel}/beq`);
  const reset = resetPEQ(channel, slot);

  return removeBEQFlag && reset;
}

function setInputLabel(input, label) {
  return patchMso( 'replace', `/inputs/${input}/label`, label);
}

function toggleInputVisible(input) {
  return patchMso( 'replace', `/inputs/${input}/visible`, !mso.value.inputs[input].visible);
}

function setInputFormatDetectOption(input, formatDetectOption) {
  return patchMso( 'replace', `/inputs/${input}/formatDetectOption`, formatDetectOption);
}

// Warning: custom attribute
function _setInputDefaultUpmix(input, defaultUpmix, op) {
  if (!op) {
    op = Object.prototype.hasOwnProperty.call(mso.value.inputs[input], 'defaultUpmix') ? 'replace' : 'add';
  }

  if (!allUpmixers.value[defaultUpmix]) {
    defaultUpmix = null;
  }

  return patchMso( op, `/inputs/${input}/defaultUpmix`, defaultUpmix);
}

function setInputDefaultUpmix(input, defaultUpmix) {

  if (input === mso.value?.input && defaultUpmix !== 'Last Used') {
    setUpmix(defaultUpmix);
  }

  return _setInputDefaultUpmix(input, defaultUpmix, 'replace');
}

function _setInputVolumeTrim(input, trim, op) {
  if (!op) {
    op = Object.prototype.hasOwnProperty.call(mso.value.inputs[input], 'gain') ? 'replace' : 'add';
  }
  
  let trimValue = convertInt(trim, 0, -12, 12);
  return patchMso( 'replace', `/inputs/${input}/gain`, trimValue);
}

function initializeInputDelay(input) {
  return patchMso( 'add', `/inputs/${input}/delay`, 0);
}

function setInputDelay(input, delayStr) {
  let delay = convertInt(delayStr, 0, 0, 340);

  if (input === mso.value?.input) {
    return setLipsyncDelay(delay);
  }
  else {
    return patchMso('replace', `/inputs/${input}/delay`, delay);
  }
}

function initializeInputDiracSlot(input) {
  return patchMso('add', `/inputs/${input}/diracslot`, null);
}

function setInputDiracSlot(input, diracslot) {

  if (input === mso.value?.input) {
    setDiracSlot(diracslot);
  }

  return patchMso('replace', `/inputs/${input}/diracslot`, convertInt(diracslot, null, 0, 6));
}

function initializeInputRunMacro(input) {
  return patchMso('add', `/inputs/${input}/macro`, null);
}

function setInputRunMacro(input, macro) {
  return patchMso('replace', `/inputs/${input}/macro`, macro);
}

// Warning: custom attribute
function setInputVolumeTrim(input, trim) {
  return _setInputVolumeTrim(input, trim, 'replace');
}

function toggleInputUHD(input) {
  return patchMso( 'replace', `/inputs/${input}/uhd`, !mso.value.inputs[input].uhd);
}

function setBluetoothDiscoverableTime(time) {
  return patchMso( 'replace', `/bluetooth/discoverabletime`, parseInt(time));
}

function enableBluetoothDiscovery() {
  send('btdiscover ' + mso.value.bluetooth.discoverabletime);
}

function toggleCEC() {
  return patchMso( 'replace', `/CEC/cecOnSw`, mso.value.CEC.cecOnSw === 'off' ? 'on' : 'off');
}

function setCECOn() {
  return patchMso( 'replace', `/CEC/cecOnSw`, 'on');
}

function setCECOff() {
  return patchMso( 'replace', `/CEC/cecOnSw`, 'off');
}

function setTVSoundSrcDefault(inp) {
  return patchMso( 'replace', `/stat/TVSoundSrcDefault`, inp);
}

function toggleCECAllowPowerKey() {
  return patchMso( 'replace', `/CEC/allowpwrk`, !mso.value.CEC.allowpwrk);
}

function toggleCECAllowVolKey() {
  return patchMso( 'replace', `/CEC/allowvolk`, !mso.value.CEC.allowvolk);
}

function toggleCECAllowSysAudioOff() {
  return patchMso( 'replace', `/CEC/allowsaf`, !mso.value.CEC.allowsaf);
}

function toggleCECAllowInputChange() {
  return patchMso( 'replace', `/CEC/allowinp`, !mso.value.CEC.allowinp);
}

function toggleCECAllowStandby() {
  return patchMso( 'replace', `/CEC/allowstdb`, !mso.value.CEC.allowstdb);
}

function setUnitName(name) {
  return patchMso( 'replace', `/unitname`, name);
}

function toggleFastStart() {
  return patchMso( 'replace', `/fastStart`, mso.value.fastStart === 'off' ? 'on' : 'off');
}

function toggleFastStartPassThrough() {
  return patchMso( 'replace', `/fastStartPassThrough`, mso.value.fastStartPassThrough === 'off' ? 'on' : 'off');
}

function setFastStartPassThroughOff() {
  return patchMso( 'replace', `/fastStartPassThrough`, 'off');
}

function setFastStartPassThroughOn() {
  return patchMso( 'replace', `/fastStartPassThrough`, 'on');
}

function setFastStartOn() {
  return patchMso( 'replace', `/fastStart`, 'on');
}

function setFastStartOff() {
  return patchMso( 'replace', `/fastStart`, 'off');
}

function setPowerOnVol(volumeLevel) {
  return patchMso( 'replace', `/powerOnVol`, parseInt(volumeLevel));
}

function setFrontPanelBrightness(brightness) {
  return patchMso( 'replace', `/hw/fpBright`, convertInt(brightness, 7, 0, 7));
}

function toggleVideoStatusHomePage() {
  return patchMso( 'replace', `/stat/displayVideoStat`, !mso.value.stat.displayVideoStat);
}

function toggleExtendedAudioStatus() {
  return patchMso( 'replace', `/stat/displayAudioStat`, !mso.value.stat.displayAudioStat);
}

function toggleAdvancedInputSettings() {
  return patchMso( 'replace', `/stat/displayAdvancedSettings`, !mso.value.stat.displayAdvancedSettings);
}

function toggleSupportTools() {
  return patchMso( 'replace', `/stat/enableSupportTools`, !mso.value.stat.enableSupportTools);
}

function initializeWifiCountryCode() {
  return patchMso( 'add', '/crda', 'US');
}

function setWifiCountryCode(countryCode) {
  return patchMso( 'replace', '/crda', countryCode);
}

function initializePersonalize() {
  return patchMso( 'add', '/personalize', {
    shortcuts: defaultPersonalizeShortcuts,
    modes: defaultPersonalizeModes
  });
}

function initializeShortcuts() {
  return patchMso( 'add', '/personalize/shortcuts', defaultPersonalizeShortcuts);
}

function initializeModes() {
  return patchMso( 'add', '/personalize/modes', defaultPersonalizeModes);
}

function initializeDiracSlots() {
  return patchMso( 'add', '/personalize/diracSlots', {});
}

function initializeShowMacros() {
  return patchMso( 'add', '/personalize/macros', {});
}

function initializeDismissedAlerts() {
  return patchMso( 'add', '/personalize/dismissedAlerts', {});
}

function initializeHomeLabels() {
  return patchMso( 'add', '/personalize/homeLabels', {
    topLeft: 'current-input',
    topRight: 'unit-name'
  });
}

function initializePowerDialogButtons() {
  return patchMso( 'add', '/personalize/powerDialogButtons', {
    'shutdown': true,
    'restart': true,
    'sleep': true,
    'cancel': true,
  });
}

function initializeBassLpf() {
  return patchMso('add', '/bassLpf', 120);
}

function initializeHeadroom() {
  return patchMso('add', '/cal/headroom', 12);
}

function initializeZeroPoint() {
  return patchMso('add', '/cal/zeroPoint', 0);
}

function setZeroPoint(zeroPoint) {
  return patchMso('replace', '/cal/zeroPoint', convertInt(zeroPoint, 0, -100, 22));
}

function setDefaultZeroPoint() {
  return setZeroPoint(0);
}

function initializeSecondVolume() {
  return patchMso('add', '/secondVolume', -20);
}

function setSecondVolume(secVol) {
  return patchMso('replace', '/secondVolume', convertInt(secVol, -20, mso.value.cal?.vpl, mso.value.cal?.vph));
}

function setBassLpf(lpf) {
  let lpfValue = convertInt(lpf, 120, 40, 200);
  bmlfecApplied = false;
  return patchMso('replace', '/bassLpf', parseInt(lpfValue));
}

function toggleShowPowerDialogButton(button) {
  if (mso.value.personalize.powerDialogButtons[button]) {
    return patchMso( 'remove', `/personalize/powerDialogButtons/${button}`)
  } else {
    return patchMso( 'add', `/personalize/powerDialogButtons/${button}`, true);
  }
}

function setTopLeftLabel(label) {
  return patchMso( 'replace', '/personalize/homeLabels/topLeft', label);
}

function setTopRightLabel(label) {
  return patchMso( 'replace', '/personalize/homeLabels/topRight', label);
}

function dismissAlert(alertKey) {
  return patchMso( 'add', `/personalize/dismissedAlerts/${alertKey}`, true);
}

function resetDismissedAlerts() {
  return patchMso( 'replace', `/personalize/dismissedAlerts`, {});
}

function toggleShortcut(item) {

  const path = `/personalize/shortcuts/${item}`;

  if (mso.value.personalize.shortcuts[item]) {
    return patchMso( 'remove', path);
  } else {
    return patchMso( 'add', path, true);
  }
}

function toggleShowMode(mode) {

  const path = `/personalize/modes/${mode}`;

  if (mso.value.personalize.modes[mode]) {
    return patchMso( 'remove', path);
  } else {
    return patchMso( 'add', path, true);
  }
}

function toggleShowDiracSlot(slot) {
  const path = `/personalize/diracSlots/${slot}`;

  if (mso.value.personalize.diracSlots[slot]) {
    return patchMso( 'remove', path);
  } else {
    return patchMso( 'add', path, true);
  }
}

function toggleShowMacro(key) {
  const path = `/personalize/macros/${key}`;

  if (mso.value.personalize.macros[key]) {
    return patchMso( 'remove', path);
  } else {
    return patchMso( 'add', path, true);
  }
}

function executeMacro(macro) {
  let result = true;
  for (const cmd of macro) {
    result = patchMso(cmd.op, cmd.path, cmd.value) && result;
  }

  return result;
}

function initializeMacroNames() {
  return patchMso( 'add', '/svronly/macroNames', {
    'cmda': 'CMD A',
    'cmdb': 'CMD B',
    'cmdc': 'CMD C',
    'cmdd': 'CMD D',
    'preset1': 'Preset 1',
    'preset2': 'Preset 2',
    'preset3': 'Preset 3',
    'preset4': 'Preset 4',
  });
}

function initializeExtraMacros() {
  patchMso('remove', '/svronly/extraMacros');
  return patchMso('add', '/svronly/extraMacros', {});
}

function createExtraMacro() {
  if (mso.value.svronly.extraMacros) {
    const keys = Object.keys(mso.value.svronly.extraMacros);
    const newKey = keys.length > 0 ? (parseInt(maxBy(keys, k => parseInt(k))) + 1) : 1;
    // setMacroName(newKey, newKey);
    const removeName = patchMso('remove', `/svronly/macroNames/${newKey}`);
    const addName = patchMso('add', `/svronly/macroNames/${newKey}`, newKey);
    const addMacro = patchMso('add', `/svronly/extraMacros/${newKey}`, []);
    return removeName && addName && addMacro;
  }
}

function deleteExtraMacro(macroKey) {
  const removeName = patchMso('remove', `/svronly/macroNames/${macroKey}`);
  const removeMacro = patchMso('remove', `/svronly/extraMacros/${macroKey}`);
  return removeName && removeMacro;
}

function setMacroName(macroKey, name) {
  return patchMso( 'replace', `/svronly/macroNames/${macroKey}`, name);
}

function saveRecordedCommands(slot, commands) {
  if (!mso.value.svronly) {
    return false;
  }

  // patchMso( 'replace', 'path': `/svronly/${slot}`, value: [...mso.value.svronly[slot], ...commands]});
  changemso([{'op': 'replace', 'path': `/svronly/${slot}`, value: commands}]);
  send('getmso');
  return true;
}

function saveExtraRecordedCommands(slot, commands) {
  if (!mso.value.svronly.extraMacros) {
    return false;
  }

  // patchMso( 'replace', 'path': `/svronly/${slot}`, value: [...mso.value.svronly[slot], ...commands]});
  changemso([{'op': 'replace', 'path': `/svronly/extraMacros/${slot}`, value: commands}]);
  send('getmso');
  return true;
}

// danger
function importMsoPatchList(patchList) {
  commandsToSend.value = patchList;
}

// other state mutators
function setRecordingStarted(slot) {
  currentlyRecordingSlot.value = slot;
}

function setRecordingStopped() {
  currentlyRecordingSlot.value = null;
}

function updateVu() {
  console.log('call updateVu', new Date());
  send('avcui "vu"');
}

function setVuPeakMode() {
  send('avcui "vud 1"');
}

function clearVuPeakLevels() {
  send('avcui "vuc"');
  setVuPeakMode();
}

function commitSpeakerLayout () {
  send('avcui "commit lm"');
}

function concordRestart() {
  send('avcui "concord restart"');
}

/**
* Composition function which exposes the MSO state, as well 
* as an API to interact with MSO, abstracting away all 
* websocket interactions to keep components clean.
*/
export default function useMso() {

  return { 
    mso, visibleInputs, visibleUpmixers, visibleDiracSlots, 
    visibleRemoteMacros, visibleExtraMacros, allUpmixers, upmixLabels,
    powerOff, powerSleep, powerRestart, powerOn,
    setVolume, toggleMute, setInput, setUpmix, 
    toggleUpmixHomevis, toggleUpmixCenterSpread, toggleUpmixWideSynth,
    setUpmixWideSynthOff, setUpmixWideSynthOn,
    setAuroMaticPreset, setAuroMaticStrength, setDefaultAuroMaticStrength,
    toggleReinforceBass, setReinforceBassOn, setReinforceBassOff,
    setNextNightMode, setNightMode, toggleDirac, toggleLoudness, setNextDtsDialogEnh, setDtsDialogEnh,
    setDiracOff, setDiracBypass, setDiracOn,setDiracSlotNotes, filterTypeToCssClass,
    setNightOff, setNightAuto, setNightOn,
    setLoudnessOff, setLoudnessOn,
    setToneControlOff, setToneControlOn,
    toggleSpeakerGroup, setSpeakerSize, setCenterFreq, setBassLpf,
    commitSpeakerLayout,
    setMinVolume, setMaxVolume, setDefaultMinVolume, setDefaultMaxVolume,
    setMaxOutputLevel, setDefaultMaxOutputLevel, 
    setHeadroom, setDefaultHeadroom, setZeroPoint, setDefaultZeroPoint,
    setLipsyncDelay, setDiracSlot,
    setUserDelay, setUserTrim, toggleMuteChannel, setChannelTrim,
    setMuteAllChannelsOff, setMuteAllChannelsOn, toggleAllMuteChannels,
    toggleSignalGenerator, setSignalGeneratorOff, setSignalGeneratorOn,
    setSignalGeneratorChannel, setSignalGeneratorChannel2, setSignalGeneratorSignalType,
    setSineFrequency, setSineAmplitude,
    toggleToneControl, setBassCornerFrequency, setTrebleCornerFrequency, 
    setBassBoostCutLevel, setTrebleBoostCutLevel, setLoudnessCalibration, setLoudnessCurve,
    toggleGlobalPEQ, setGlobalPEQOff, setGlobalPEQOn,
    setPEQSlot, setPEQCenterFrequency, setPEQGain, 
    setPEQQuality, setPEQFilterType, resetPEQ, togglePEQBypass,
    addBEQFlag, resetBEQ,
    addBEQActive, removeBEQActive,
    setInputLabel, toggleInputVisible, setInputFormatDetectOption, toggleInputUHD, 
    setInputDefaultUpmix, setInputVolumeTrim, setInputDelay, setInputDiracSlot, setInputRunMacro,
    setBluetoothDiscoverableTime, enableBluetoothDiscovery,
    toggleCEC, setCECOff, setCECOn,
    setTVSoundSrcDefault, toggleCECAllowPowerKey, toggleCECAllowVolKey, 
    toggleCECAllowSysAudioOff, toggleCECAllowInputChange, toggleCECAllowStandby,
    toggleFastStart, setFastStartOff, setFastStartOn,
    toggleFastStartPassThrough, setFastStartPassThroughOff, setFastStartPassThroughOn,
    setUnitName, setPowerOnVol,
    setFrontPanelBrightness, toggleVideoStatusHomePage, toggleExtendedAudioStatus,
    toggleAdvancedInputSettings, toggleSupportTools, importMsoPatchList,
    saveRecordedCommands, saveExtraRecordedCommands, createExtraMacro, deleteExtraMacro,
    toggleShortcut, toggleShowMode, toggleShowDiracSlot, toggleShowMacro,
    setMacroName, commandKeys, executeMacro,
    setTopLeftLabel, setTopRightLabel, toggleShowPowerDialogButton,
    setWifiCountryCode, diracFilterType,
    showCrossoverControls, currentDiracSlot, calToolConnected, diracFilterTransferInProgress, 
    currentLayoutHasMatchingDiracFilter, diracNoFilter, seatShakerChannel,
    activeChannels, diracMismatchedChannels, diracMismatchedChannelGroups,
    activeChannelsForTrim,
    currentlyRecordingSlot, setRecordingStarted, setRecordingStopped,
    dismissAlert, resetDismissedAlerts,
    updateVu, clearVuPeakLevels, setVuPeakMode,
    setSecondVolume, toggleSeatShaker, diracErrorState, concordRestart,
    delayPeqAllowed, currentDiracFilterType, diracBCArtFilterExists, peqEnabled, peqWarning,
    displayVolume,
    state, loading,
    parseMSO, data, eventHash,
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
      return  !(cmd.op === newCmd.op && cmd.path === newCmd.path)
      || cmd.path === '/cal/diracactive'; // hack
      // return true;
    }
  );
}

// including value
function filterMatchingCommand(cmdList, newCmd) {
  return cmdList.filter(
    cmd => {
      return !(cmd.op === newCmd.op && cmd.path === newCmd.path 
        && isEqual(cmd.value, newCmd.value));
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

function convertInt(value, defaultValue, minValue, maxValue) {
  return convert(parseInt, value, defaultValue, minValue, maxValue);
}

function convertFloat(value, defaultValue, minValue, maxValue) {
  return convert(parseFloat, value, defaultValue, minValue, maxValue);
}

function convert(convertFunction, value, defaultValue, minValue, maxValue) {
  let intValue = convertFunction(value);

  if (isNaN(intValue)) {
    return defaultValue;
  } else if (intValue < minValue) {
    return minValue;
  } else if (intValue > maxValue) {
    return maxValue;
  }

  return intValue;
}