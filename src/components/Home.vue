<template>
    <div v-if="state !== 'OPEN'" class="connecting-overlay">
      <div class="card connecting-card">
        <div class="card-body">
          <h5 class="card-title">Please Wait</h5>
          Connection was lost. Reconnecting...
        </div>
      </div>
    </div>
    <div v-if="loading" class="loading-indicator">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <template v-if="!mso?.powerIsOn">
      <div class="container">
        <div class="row mt-5">
          <div class="col-md-12 text-center">
            <p>Unit is in standby mode. Click below to power on.</p>
            <button class="btn btn-dark rounded-circle menu-btn" @click="powerOn()">
              <font-awesome-icon size="lg" :icon="['fas', 'power-off']" />
            </button>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- Input Label, Menu Buttons -->
      <div class="container">
        <div class="row mt-2">
          <div class="col text-left">
            <span class="current-input-label">{{mso.inputs[mso.input].label}}</span>
          </div>
          <div class="col text-right">
            <button class="btn btn-dark rounded-circle menu-btn" @click="powerOff()">
              <font-awesome-icon size="lg" :icon="['fas', 'power-off']" />
            </button>
          </div>
        </div>
        <!-- Program Format, Blank, Listening Format   -->
        <div class="row mt-2">
          <div class="col text-left">
            <h5>Program Format: {{mso.status.DECProgramFormat}}</h5>
            <div>
              {{mso.status.DECSourceProgram}}
            </div>
          </div>
          <div class="col text-right">
            <h5>Listening Format: {{mso.status.ENCListeningFormat}}</h5>
            <!-- Surround Mode -->
            <!--             <h5>Surround Mode</h5>      -->
            <!--             <div>{{mso.status.SurroundMode}}</div>   -->
            <div>
                {{mso.status.SurroundMode}}
            </div>
          </div>
        </div>
        <!-- Program Format Logo, Volumn Text, Listening Format Logo -->
        <div class="row mt-2">
          <div class="col text-left">
            <img v-if="streamTypeIcon(mso.status)" class="fillheight" :src="require(`@/assets/${streamTypeIcon(mso.status)}`)+'#svgView(preserveAspectRatio(xMinYMin))'">
          </div>
          <div class="col-auto text-center">
            <span class="vol-display">{{mso.volume}} dB</span>
          </div>
          <div class="col text-right">
            <img v-if="upmixerIcon(mso.status)" class="fillheight float-right" :src="require(`@/assets/${upmixerIcon(mso.status)}`)+'#svgView(preserveAspectRatio(xMaxYMax))'">
          </div>
        </div>
        <!-- Volume Buttons -->
        <div class="row mt-2">
          <div class="col-md-12 text-center">
            <button type="button" class="btn btn-dark vol-btn" @click="setVolume(mso.volume - 1)">
              <font-awesome-icon size="4x" :icon="['fas', 'volume-down']" />
            </button>
            <button type="button" class="btn btn-dark vol-btn" @click="setVolume(mso.volume + 1)">
              <font-awesome-icon size="4x" :icon="['fas', 'volume-up']" />
            </button>
          </div>
        </div>
        <!-- Input Select -->
        <div class="row mt-2">
          <div class="col-md-12 text-center">
              <h5>Input Select</h5>
                <button class="btn home-btn" :class="{'btn-dark': key !== mso.input, 'btn-light': key === mso.input}" @click="setInput(key)" v-for="(inp, key) in visibleInputs">
                  {{ inp.label }}
                </button>
          </div>
        </div>
        <!-- Upmix Select -->
        <div class="row mt-2" v-if="mso.stat.systemAudio">
          <div class="col-md-12 text-center">
              <h5>Upmix Select</h5>
              <button class="btn home-btn" :class="{'btn-dark': key !== mso.upmix.select, 'btn-light': key === mso.upmix.select}" @click="setUpmix(key)" v-for="(upmix, key) in visibleUpmixers">
                {{ upmix.label }}
              </button>
          </div>
        </div>
        <!-- Modes -->
        <div class="row mt-2">
          <div class="col-md-12 text-center">
              <h5>Modes</h5>
              <button class="btn home-btn" 
                  @click="setNextNightMode()"
                  :class="{'btn-light':mso.night=='on','btn-dark':mso.night=='auto'||mso.night==='off','yellow-text-btn':mso.night==='auto'}" aria-label="night mode">
                  Night {{mso.night}}
              </button>
              <button class="btn home-btn" 
                  @click="toggleDirac()"
                  v-if = "mso.cal.slots[mso.cal.currentdiracslot].checksum !== 31802"
                  :class="{'btn-light':mso.cal.diracactive=='on','btn-dark':mso.cal.diracactive=='bypass'||mso.cal.diracactive==='off','yellow-text-btn':mso.cal.diracactive==='bypass'}" aria-label="Dirac status">
                  Dirac {{mso.cal.diracactive}}
                  {{ mso.cal.diracactive=='on' && mso.cal.slots[mso.cal.currentdiracslot].hasBCFilter ? ' BC' : '   '}}
              </button>
              <button class="btn home-btn" 
                  v-if = "mso.cal.slots[mso.cal.currentdiracslot].checksum === 31802"
                  aria-label="Dirac status">
                  No Filter
              </button>
              <button class="btn home-btn" 
                  @click="toggleLoudness()"
                  :class="{'btn-light':mso.loudness === 'on', 'btn-dark':mso.loudness === 'off'}">
                  Loudness {{mso.loudness}}
              </button>
              <!-- Can't use "mso.status.raw.streamInfoBytes[0] & 16" as & has special meaning in Angularjs -->
              <button class="btn home-btn" @click="setNextDtsDialogEnh()"
                            :class="{'btn-light':mso.dialogEnh > 0, 'btn-dark':mso.dialogEnh === 0}">
          {{ ((((mso.status.raw.streamType>=33) && (mso.status.raw.streamType<=44) &&
                                  ((mso.status.raw.streamInfoBytes[0] % 32) >= 16))) ? 'DTS ' : '') }} 
                                  Dialog Enhance {{ mso.dialogEnh == 0 ? 'off' : mso.dialogEnh  + ' dB' }}
              </button>
          </div>
        </div>
        <!-- Video Status -->
        <div v-if="mso.stat.displayVideoStat" class="row ml-2 mt-2"  >
            <div class="col-md-12 text-center">
                video status: {{mso.videostat.VideoResolution}} {{mso.videostat.VideoColorSpace}} 
                {{mso.videostat.VideoMode}} {{mso.videostat.HDRstatus}} {{mso.videostat.VideoBitDepth}} 
                {{mso.videostat.Video3D}}
            </div>
        </div>
      </div>
    </template>

</template>

<script>

import useMso from '@/use/useMso.js';
import useStream from '@/use/useStream.js';

export default {
  setup() {
    return { ...useMso(), ...useStream() };
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .connecting-overlay {
    width:100%;
    height:100%;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
    position:fixed;
  }

  .connecting-card {
    width:18rem;
    height: 9rem;
    /*margin: 0 auto;*/
    position: fixed;
    left: 50%;
    top:50%;
    margin-left: -9rem;
    margin-top: -4.5rem;
    color: #212529;
  }

  .loading-indicator {
    position:fixed;
    opacity: 50%;
    z-index: 9999;
    text-align: right;
    vertical-align: text-bottom;
    bottom:0;
    right:0;
    padding:0.5rem;
  }

  .current-input-label {
    font-size:2rem;
  }

  .menu-btn {
    min-height:3.5rem;
    min-width: 3.5rem;
  }

  .vol-display {
    font-weight: bold;
    font-size:3rem;
  }

  .vol-btn {
    background: none;
    outline:none;
    border:none;
    width:6rem;
    height:6rem;
    margin:1rem;
  }

  .home-btn {
    min-height: 3rem;
    min-width: 6rem;
    margin: 0.5rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .yellow-text-btn {
    color:yellow;
  }
  .fillheight {
    max-height:4rem;
    max-width:8rem;
    display: block;
  }
</style>
