import {invert} from 'lodash-es';

// group to single channel
const bmg = {
  "lr": ["lf", "rf"],
  "c": ["c"],
  "lrs": ["ls", "rs"],
  "lrb": ["lb", "rb"],
  "sub1": ["sub1"],
  "sub2": ["sub2"],
  "sub3": ["sub3"],
  "sub4": ["sub4"],
  "sub5": ["sub5"],
  "lrw": ["lw", "rw"],
  "lrtf": ["ltf", "rtf"],
  "lrtm": ["ltm", "rtm"],
  "lrtr": ["ltr", "rtr"],
  "lrhf": ["lfh", "rfh"],
  "lrhr": ["lhb", "rhb"],
};

const allChannelCodes = ['lf', 'rf', 'c', 
'sub1', 'sub2', 'sub3', 
'ls', 'rs', 'lb', 'rb', 
'ltf', 'rtf', 'ltm', 'rtm','ltr', 'rtr',
'lw','rw',
'lfh', 'rfh', 'lhb', 'rhb',
'sub4', 'sub5',
];

const reverseAllChannelCodes = invert(allChannelCodes);

// single channel to group, for speaker map display only
// note that LF and RF become L and R; LHB and RHB become LRH, RRH
const reverseBmg = {
  "l": "lr",
  "r": "lr",
  "lf": "lr",
  "rf": "lr",
  "c": "c",
  "ls": "lrs",
  "rs": "lrs",
  "lb": "lrb",
  "rb": "lrb",
  "sub1": "sub1",
  "sub2": "sub2",
  "sub3": "sub3",
  "sub4": "sub4",
  "sub5": "sub5",
  "lw": "lrw",
  "rw": "lrw",
  "ltf": "lrtf",
  "rtf": "lrtf",
  "ltm": "lrtm",
  "rtm": "lrtm",
  "ltr": "lrtr",
  "rtr": "lrtr",
  "lfh": "lrhf",
  "rfh": "lrhf",
  "lrh": "lrhr",
  "rrh": "lrhr",
  "lhb": "lrhr",
  "rhb": "lrhr",
};

const bmgNames = {
  "lr": "L/R Front",
  "c": "Center",
  "lrs": "L/R Surround",
  "lrb": "L/R Back",
  "lrw": "L/R Wide",
  "lrtf": "L/R Top Front",
  "lrtm": "L/R Top Mid",
  "lrtr": "L/R Top Rear",
  "lrhf": "L/R High Front",
  "lrhr": "L/R High Rear",
  "sub": "Subwoofers"
};

export default function useSpeakerGroups() {
  /** Format the name of the given speaker
   *
   * @param {String} spkId
   */
  function spkName(spkId) {
    if (spkId == 'c') return "Center";
    if (spkId == 'cs') return "Center Surround";
    if (spkId == 'lfe') return "LFE";
    if (spkId.startsWith('sub')) return 'Subwoofer ' + spkId.slice(-1);
    var side = (spkId.startsWith('l') ? 'Lef' : 'Righ') + 't ';
    spkId = spkId.slice(1);
    switch (spkId) {
      case 'f': return side + "Front";
      case 'tf': return side + "Top Front";
      case 'tm': return side + "Top Middle";
      case 'tr': return side + "Top Rear";
      case 'fh': return side + "Front Height";
      case 'hb': return side + "Rear Height";
      case 's': return side + "Surround";
      case 's1': return side + "Surround 1";
      case 'w': return side + "Wide";
      case 'b': return side + "Back";
      case 'scr': return side + "Screen";
      case 'rs1': return side + "Rear Surround 1";
      case 'rs2': return side + "Rear Surround 2";
      case 'cs': return side + "Center Surround";
    }
  }

  /** Parse one or more speaker groups into an array of speakers associated with it.
   *
   * @param spg One or more string(s), or array(s) of string(s) of the speaker groups to be given. Invalid entries are ignored.
   * @returns An array of speaker identifiers corresponding to the speaker groups.
   */
  function spgToSp(...spg) {
    return spg.flat().map(x => bmg[x]).flat().filter(x => x);
  }

  function getActiveChannels(spg, seatshakerChannel) {
    var allKeys = Object.keys(bmg);
    var filterFn = (spgName) => {
      if (spgName == 'lr') return true;
      if (spgName === seatshakerChannel) return true;
      return spg && spg[spgName]?.present;
    };
    var filtered = allKeys.filter(filterFn);
    var translated = spgToSp(filtered);
    return (translated);
  }

  return { bmg, reverseBmg, bmgNames, spkName, spgToSp, getActiveChannels, allChannelCodes, reverseAllChannelCodes };
}
