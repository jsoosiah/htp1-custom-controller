// Reference:  avController/controller/apm.h

// stream types:  (Legacy TI)
const DAE_DECODE_PCM    = 0x08;
const DAE_DECODE_AC3    = 0x0a;
const DAE_DECODE_DTS    = 0x0b;
const DAE_DECODE_DTS12  = 0x0e;
const DAE_DECODE_DTS13  = 0x0f;
const DAE_DECODE_DTS14  = 0x10;
const DAE_DECODE_DTS16  = 0x11;
const DAE_DECODE_DDP    = 0x17;
const DAE_DECODE_DTSHD  = 0x18;
const DAE_DECODE_THD    = 0x19;

// stream types:  (DTS X extension)
const DAE_DECODE_DTS_STREAM_TYPE_LEGACY         = 0x21;
const DAE_DECODE_DTS_STREAM_TYPE_ES_MATRIX      = 0x22;
const DAE_DECODE_DTS_STREAM_TYPE_ES_DISCRETE    = 0x23;
const DAE_DECODE_DTS_STREAM_TYPE_9624           = 0x24;
const DAE_DECODE_DTS_STREAM_TYPE_ES_8CH_DISCRETE = 0x25;
const DAE_DECODE_DTS_STREAM_TYPE_HIRES          = 0x26;
const DAE_DECODE_DTS_STREAM_TYPE_MA             = 0x27;
const DAE_DECODE_DTS_STREAM_TYPE_LBR            = 0x28;
const DAE_DECODE_DTS_STREAM_TYPE_LOSSLESS       = 0x29;
const DAE_DECODE_DTS_STREAM_TYPE_DTS_X          = 0x2A;
const DAE_DECODE_DTS_STREAM_TYPE_DTS_X_MA       = 0x2B;
const DAE_DECODE_DTS_STREAM_TYPE_DTS_X_GAME     = 0x2C;
const DAE_DECODE_STREAM_TYPE_MAT_PCM_CHANNEL    = 0x30;
const DAE_DECODE_STREAM_TYPE_MAT_PCM_OBJECT     = 0x31;

// Stream is being decoded as ATMOS
const STREAM_INFO_FLAGS_DA_ATMOS = 0x08;
// The stream appears to be Atmos but is being decoded in legacy mode.
const STREAM_INFO_FLAGS_DD_CANT_DECODE_ATMOS = 0x01;

// Upmix modes.  Reference:  avController/controller/AvCtrl.h
const SysPlaybackMode_none          = 0; 
const SysPlaybackMode_stereo        = 2;  // not used.
const SysPlaybackMode_direct        = 3; 
const SysPlaybackMode_mono          = 4;  // not used.
const SysPlaybackMode_multiChStereo = 14;
const SysPlaybackMode_multiChMono   = 15;
const SysPlaybackMode_dolbySurround = 22;
const SysPlaybackMode_dtsNeuralX    = 23;
const SysPlaybackMode_Auro3D        = 24;  // replace SysPlaybackMode_Auro3DAuto
const SysPlaybackMode_Native        = 25;
const SysPlaybackMode_dolbyAtmos    = 31;
const SysPlaybackMode_dtsX          = 32;
const SysPlaybackMode_AuroMatic     = 33;  // replace SysPlaybackMode_Auro3DCodec

const dictionaryDecoder = { // Interpreted playback modes from avController/controller/mso.cpp and /SysUi.cpp
    "unknown"                                           : ["\xa0",              "",        10],
    "none"                                              : ["\xa0",              "",        10],
    "PCM"                                               : ["PCM",               "pcm-icon",          85],
    "Dolby Digital"                                     : ["Dolby Digital",     "dolby-audio-icon",  143],
    "Dolby AC3"                                         : ["AC-3",              "dolby-audio-icon",  143], // ?
    "Dolby Digital Plus (ATMOS, decoded as legacy)"     : ["DD+ Atmos",         "dolby-atmos-icon",  143],
    "Dolby Digital Plus (ATMOS)"                        : ["DD+ Atmos",         "dolby-atmos-icon",  143],
    "Dolby Digital Plus"                                : ["DD+",               "dolby-audio-icon",  143],
    "Dolby Digital Plus (Legacy)"                       : ["DD+",               "dolby-audio-icon",  143], // ?
    "Dolby TrueHD (ATMOS, decoded as legacy)"           : ["TrueHD Atmos",      "dolby-atmos-icon",  143],
    "Dolby TrueHD (ATMOS)"                              : ["TrueHD Atmos",      "dolby-atmos-icon",  143],
    "Dolby TrueHD"                                      : ["TrueHD",            "dolby-audio-icon",  143],
    "Dolby TrueHD (Legacy)"                             : ["TrueHD",            "dolby-audio-icon",  143], // ?
    "DTS"                                               : ["DTS",               "dts-icon",          178],
    "DTS12"                                             : ["DTS",               "dts-icon",          178],
    "DTS13"                                             : ["DTS",               "dts-icon",          178],
    "DTS14"                                             : ["DTS",               "dts-icon",          178],
    "DTS16"                                             : ["DTS",               "dts-icon",          178],
    "DTS-HD"                                            : ["DTS HD",            "dts-hd-icon",       215],
    "DTS HD"                                            : ["DTS HD",            "dts-hd-icon",       215], // ?
    "DTS Legacy"                                        : ["DTS",               "dts-icon",          178],
    "DTS Matrix"                                        : ["Matrix",            "dts-icon",          178],
    "DTS Discrete"                                      : ["Discrete",          "dts-icon",          178],
    "DTS 9624"                                          : ["96/24",             "dts-icon",          178],
    "DTS 8 channel discrete"                            : ["8 channel",         "dts-icon",          178],
    "DTS 8 channel"                                     : ["8 channel",         "dts-icon",          178], // ?
    "DTS HiRes"                                         : ["High Resolution",   "dts-hd-icon",       215],
    "DTS MA"                                            : ["Master Audio",      "dts-hdma-icon",     169],
    "DTS Low Bit Rate"                                  : ["Low Bit Rate",      "dts-icon",          178],
    "DTS Lossless"                                      : ["Lossless",          "dts-icon",          178],
    "DTS:X"                                             : ["DTS:X",             "dts-x-icon",        153],
    "DTS:X MA"                                          : ["DTS:X MA",          "dts-x-icon",        153],
    "DTS: Game"                                         : ["DTS Game",          "dts-icon",          178],
    "DTS Game"                                          : ["DTS Game",          "dts-icon",          178], // ?
    "Dolby MAT/PCM"                                     : ["MAT/PCM",           "dolby-atmos-icon",  143],
    "unknown"                                           : ["\xa0",              "",        10],
    "Unknown"                                           : ["\xa0",              "",        10], // ?
    "Auro3D"                                            : ["AURO-3D",           "auro-codec-icon",   70], // ?
    "LhRh"                                              : ["LhRh",              "",        10], // ?
    "LtRt"                                              : ["LtRt",              "",        10], // ?
    "DDEX"                                              : ["DDEX",              "dolby-audio-icon",  143], // ?
    "DRC"                                               : ["DRC",               "",        10] // ? 
}

const dictionaryUpmixer = { // Interpreted upmix modes from avController/controller/mso.cpp and /SysUi.cpp
    "Direct"                : ["Direct",            "pcm-icon",          85],
    "Dolby Surround"        : ["Dolby Surround",    "dolby-audio-icon",  143],
    "DTS Neural:X"          : ["Neural:X",          "dts-icon",          178],
    "Auro3D"                : ["AURO-3D",           "auro-codec-icon",         112],
    "AuroMatic"             : ["Auromatic",         "auromatic-cropped-icon",    102],
    "AuroMatic upmixed"     : ["Auromatic",         "auromatic-cropped-icon",    102], // ?
    "Auro3D decoded"        : ["AURO-3D",           "auro-codec-icon",         112], // ?
    "MultiChannel Stereo"   : ["All Stereo",        "stereo-icon",       85],
    "MultiChannel Mono"     : ["All Mono",          "mono-icon",         85],
    "Native"                : ["Native",            "pcm-icon",          85],
    "Native Dolby"          : ["Native",            "dolby-audio-icon",  143],
    "Native DTS"            : ["Native",            "dts-icon",          178],
    "Wide Synth"            : ["Wide Synth",        "",        10],
    "Native Dolby ATMOS"    : ["Native Atmos",      "dolby-atmos-icon",  143],
    "Native DTS:X"          : ["Native DTS:X",      "dts-x-icon",        153],
    "unrecognized"          : ["None",              "",        10],
    "None"                  : ["None",              "",        10] // ?
}

export default function useStream() {
    // Exports
    function streamTypeIcon(arg) {
        if (Object.prototype.hasOwnProperty.call(dictionaryDecoder, arg?.DECSourceProgram)) {
            return dictionaryDecoder[arg.DECSourceProgram][1];
        }

        return '';
    }
    function upmixerIcon(arg) {
        if (Object.prototype.hasOwnProperty.call(dictionaryUpmixer, arg?.SurroundMode)) {
            return dictionaryUpmixer[arg.SurroundMode][1];
        }

        return '';

    }

    return { streamTypeIcon, upmixerIcon };
}
