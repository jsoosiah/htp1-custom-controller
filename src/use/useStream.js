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

export default function useStream() {
    // Exports
    function streamTypeIcon(arg) {
        if (!arg) return '';
        if (!arg.raw) return '';

        switch (arg.raw.streamType) {
            case DAE_DECODE_PCM:
                return 'pcm.svg';
            case DAE_DECODE_AC3:
                return 'dolby-audio-white.svg'; // Dolby Digital
            case DAE_DECODE_DDP:
                if (arg.raw.streamInfoBytes[0] & STREAM_INFO_FLAGS_DA_ATMOS) {
                    if (arg.raw.streamInfoBytes[0] & STREAM_INFO_FLAGS_DD_CANT_DECODE_ATMOS)
                        return 'dolby-atmos-white.svg'; // Legacy
                    else
                        return 'dolby-atmos-white.svg';
                }
                else
                    return 'dolby-audio-white.svg'; // Dolby Digital Plus
            case DAE_DECODE_THD:
                if (arg.raw.streamInfoBytes[0] & STREAM_INFO_FLAGS_DA_ATMOS) {
                    if (arg.raw.streamInfoBytes[0] & STREAM_INFO_FLAGS_DD_CANT_DECODE_ATMOS)
                        return 'dolby-atmos-white.svg'; // Legacy
                    else
                        return 'dolby-atmos-white.svg';
                }
                else
                    return 'dolby-audio-white.svg'; // Dolby TrueHD
            case DAE_DECODE_STREAM_TYPE_MAT_PCM_CHANNEL:       // Dolby MAT
                return 'pcm.svg';
            case DAE_DECODE_STREAM_TYPE_MAT_PCM_OBJECT:       // Dolby Atmos
                return 'dolby-atmos-white.svg';  

            case DAE_DECODE_DTS_STREAM_TYPE_DTS_X:
            case DAE_DECODE_DTS_STREAM_TYPE_DTS_X_MA:
            case DAE_DECODE_DTS_STREAM_TYPE_DTS_X_GAME:
                return 'dts-x-white.svg';
            case DAE_DECODE_DTS_STREAM_TYPE_MA:
                return 'dts-hdma-white.svg';
            case DAE_DECODE_DTSHD:
            case DAE_DECODE_DTS_STREAM_TYPE_HIRES:
                return 'dts-hd-white.svg';
            case DAE_DECODE_DTS:
            case DAE_DECODE_DTS12:
            case DAE_DECODE_DTS13:
            case DAE_DECODE_DTS14:
            case DAE_DECODE_DTS16:
            case DAE_DECODE_DTS_STREAM_TYPE_LEGACY:
            case DAE_DECODE_DTS_STREAM_TYPE_ES_MATRIX:
            case DAE_DECODE_DTS_STREAM_TYPE_ES_DISCRETE:
            case DAE_DECODE_DTS_STREAM_TYPE_9624:
            case DAE_DECODE_DTS_STREAM_TYPE_ES_8CH_DISCRETE:
            case DAE_DECODE_DTS_STREAM_TYPE_LBR:
            case DAE_DECODE_DTS_STREAM_TYPE_LOSSLESS:
                // DTS "other" image.
                return 'dts-white.svg';
            default:
                return '';
        }
    }
    function upmixerIcon(arg) {
        if (!arg) return '';
        if (!arg.raw) return '';
        switch (arg.raw.streamInfoBytes[1])             {
            case SysPlaybackMode_none:
            case SysPlaybackMode_multiChStereo:
            case SysPlaybackMode_mono:
            case SysPlaybackMode_multiChMono:
            case SysPlaybackMode_direct:
                return 'direct.svg'
            case SysPlaybackMode_Native:
                return '';
            case SysPlaybackMode_stereo:
                return 'stereo.svg';
            case SysPlaybackMode_dolbySurround:
                return 'dolby-audio-white.svg';
            case SysPlaybackMode_dolbyAtmos:
                return 'dolby-atmos-white.svg';
            case SysPlaybackMode_dtsX:
            case SysPlaybackMode_dtsNeuralX:
                return 'dts-white.svg';
            case SysPlaybackMode_Auro3D:
                return 'auro-codec.svg';
            case SysPlaybackMode_AuroMatic:
                return 'auromatic-cropped.svg';
        default:
                return '';
        }
    }

    return { streamTypeIcon, upmixerIcon };
}
