<template>
  <div class="peq-drag-editor" ref="containerRef">
    <svg
      ref="svgRef"
      :width="svgWidth"
      :height="svgHeight"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Background -->
      <rect width="100%" height="100%" :fill="'transparent'" rx="4" />

      <!-- Horizontal grid lines and dB labels -->
      <g v-for="db in dbGridLines" :key="`db-${db}`">
        <line
          :x1="leftPad"
          :x2="svgWidth - rightPad"
          :y1="dbToY(db)"
          :y2="dbToY(db)"
          :stroke="darkMode ? '#333' : '#ddd'"
          stroke-width="1"
        />
        <text
          :x="leftPad - 6"
          :y="dbToY(db) + 4"
          text-anchor="end"
          :fill="darkMode ? '#888' : '#666'"
          font-size="11"
        >{{ db > 0 ? '+' : '' }}{{ db }}dB</text>
      </g>

      <!-- 0dB center line (brighter) -->
      <line
        :x1="leftPad"
        :x2="svgWidth - rightPad"
        :y1="dbToY(0)"
        :y2="dbToY(0)"
        :stroke="darkMode ? '#555' : '#bbb'"
        stroke-width="1.5"
      />

      <!-- Vertical frequency grid lines and labels -->
      <g v-for="freq in freqGridLines" :key="`freq-${freq}`">
        <line
          :x1="freqToX(freq)"
          :x2="freqToX(freq)"
          :y1="topPad"
          :y2="svgHeight - bottomPad"
          :stroke="darkMode ? '#333' : '#ddd'"
          stroke-width="1"
        />
        <text
          :x="freqToX(freq)"
          :y="svgHeight - bottomPad + 14"
          text-anchor="middle"
          :fill="darkMode ? '#888' : '#666'"
          font-size="11"
        >{{ formatFreq(freq) }}</text>
      </g>

      <!-- Combined EQ curve for current channel -->
      <polyline
        v-if="combinedCurvePoints.length > 1"
        :points="combinedCurvePoints.map(p => `${p.x},${p.y}`).join(' ')"
        fill="none"
        :stroke="darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'"
        stroke-width="2"
        stroke-linejoin="round"
      />

      <!-- Individual band curves (faint) -->
      <polyline
        v-for="(band, i) in visibleBands"
        :key="`curve-${i}`"
        :points="getBandCurvePoints(band).map(p => `${p.x},${p.y}`).join(' ')"
        fill="none"
        :stroke="getBandColor(band.originalIndex, 0.35)"
        stroke-width="1.5"
        stroke-dasharray="4,3"
        stroke-linejoin="round"
      />

      <!-- Q handles (spikes on sides of ball) -->
      <g v-for="(band, i) in visibleBands" :key="`q-handle-${i}`">
        <!-- Left Q handle -->
        <line
          :x1="freqToX(band.Fc) - ballRadius - 2"
          :y1="dbToY(band.gaindB)"
          :x2="freqToX(band.Fc) - ballRadius - 2 - qHandleWidth(band)"
          :y2="dbToY(band.gaindB)"
          :stroke="getBandColor(band.originalIndex, 0.8)"
          stroke-width="2"
        />
        <line
          :x1="freqToX(band.Fc) - ballRadius - 2 - qHandleWidth(band)"
          :y1="dbToY(band.gaindB) - 7"
          :x2="freqToX(band.Fc) - ballRadius - 2 - qHandleWidth(band)"
          :y2="dbToY(band.gaindB) + 7"
          :stroke="getBandColor(band.originalIndex, 0.8)"
          stroke-width="2"
        />
        <!-- Left Q drag zone (invisible, wider for easier grabbing) -->
        <rect
          :x="freqToX(band.Fc) - ballRadius - 2 - qHandleWidth(band) - 8"
          :y="dbToY(band.gaindB) - 12"
          width="16"
          height="24"
          fill="transparent"
          style="cursor: ew-resize"
          @mouseenter="hoveredBandIndex = band.originalIndex"
          @mouseleave="hoveredBandIndex = null"
          @mousedown.stop="startQDrag($event, band.originalIndex, 'left')"
          @touchstart.prevent.stop="startQDragTouch($event, band.originalIndex, 'left')"
        />

        <!-- Right Q handle -->
        <line
          :x1="freqToX(band.Fc) + ballRadius + 2"
          :y1="dbToY(band.gaindB)"
          :x2="freqToX(band.Fc) + ballRadius + 2 + qHandleWidth(band)"
          :y2="dbToY(band.gaindB)"
          :stroke="getBandColor(band.originalIndex, 0.8)"
          stroke-width="2"
        />
        <line
          :x1="freqToX(band.Fc) + ballRadius + 2 + qHandleWidth(band)"
          :y1="dbToY(band.gaindB) - 7"
          :x2="freqToX(band.Fc) + ballRadius + 2 + qHandleWidth(band)"
          :y2="dbToY(band.gaindB) + 7"
          :stroke="getBandColor(band.originalIndex, 0.8)"
          stroke-width="2"
        />
        <!-- Right Q drag zone -->
        <rect
          :x="freqToX(band.Fc) + ballRadius + 2 + qHandleWidth(band) - 8"
          :y="dbToY(band.gaindB) - 12"
          width="16"
          height="24"
          fill="transparent"
          style="cursor: ew-resize"
          @mouseenter="hoveredBandIndex = band.originalIndex"
          @mouseleave="hoveredBandIndex = null"
          @mousedown.stop="startQDrag($event, band.originalIndex, 'right')"
          @touchstart.prevent.stop="startQDragTouch($event, band.originalIndex, 'right')"
        />
      </g>

      <!-- Band nodes (balls) - rendered in reverse order so band 1 is on top when overlapping -->
      <g
        v-for="(band, i) in reversedVisibleBands"
        :key="`band-${band.originalIndex}`"
        :transform="`translate(${freqToX(band.Fc)}, ${dbToY(band.gaindB)})`"
        :style="{ cursor: dragging?.bandIndex === band.originalIndex && dragging?.type === 'band' ? 'grabbing' : 'grab' }"
        @mouseenter="hoveredBandIndex = band.originalIndex"
        @mouseleave="hoveredBandIndex = null"
        @mousedown.stop="startBandDrag($event, band.originalIndex)"
        @touchstart.prevent.stop="startBandDragTouch($event, band.originalIndex)"
      >
        <!-- Outer ring (highlight when selected) -->
        <circle
          :r="ballRadius + 3"
          :fill="activeBandIndex === band.originalIndex ? getBandColor(band.originalIndex, 0.3) : 'transparent'"
          :stroke="activeBandIndex === band.originalIndex ? getBandColor(band.originalIndex, 0.9) : 'transparent'"
          stroke-width="1.5"
        />
        <!-- Ball -->
        <circle
          :r="ballRadius"
          :fill="darkMode ? '#1a1a1a' : '#ffffff'"
          :stroke="getBandColor(band.originalIndex, 1.0)"
          stroke-width="2.5"
        />
        <!-- Band label -->
        <text
          text-anchor="middle"
          dominant-baseline="central"
          :fill="getBandColor(band.originalIndex, 1.0)"
          font-size="11"
          font-weight="bold"
          style="pointer-events: none; user-select: none"
        >{{ getBandLabel(band) }}</text>
      </g>

      <!-- Tooltip / info overlay for active band -->
      <g v-if="(hoveredBandIndex !== null || dragging !== null) && hoveredBand" style="pointer-events: none">
        <rect
          :x="tooltipX"
          :y="tooltipY"
          :width="tooltipW"
          :height="tooltipH"
          rx="4"
          :fill="darkMode ? 'rgba(30,30,30,0.92)' : 'rgba(255,255,255,0.92)'"
          :stroke="getBandColor(hoveredBandIndex ?? dragging?.bandIndex, 0.7)"
          stroke-width="1"
        />
        <text
          :x="tooltipX + 8"
          :y="tooltipY + 16"
          :fill="darkMode ? '#eee' : '#222'"
          font-size="11"
          font-weight="bold"
        >Band {{ (hoveredBandIndex ?? dragging?.bandIndex) + 1 }}: {{ filterTypeName(hoveredBand.FilterType) }}</text>
        <text :x="tooltipX + 8" :y="tooltipY + 31" :fill="darkMode ? '#ccc' : '#444'" font-size="11">
          Fc: {{ Number(hoveredBand.Fc).toFixed(1) }} Hz
        </text>
        <text :x="tooltipX + 8" :y="tooltipY + 45" :fill="darkMode ? '#ccc' : '#444'" font-size="11">
          Gain: {{ Number(hoveredBand.gaindB).toFixed(2) }} dB  |  Q: {{ Number(hoveredBand.Q).toFixed(2) }}
        </text>
      </g>

      <!-- Chart border -->
      <rect
        :x="leftPad"
        :y="topPad"
        :width="svgWidth - leftPad - rightPad"
        :height="svgHeight - topPad - bottomPad"
        fill="none"
        :stroke="darkMode ? '#444' : '#ccc'"
        stroke-width="1"
      />
    </svg>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { debounce } from 'lodash-es';

// ── Filter type constants ─────────────────────────────────────────────────────
const FILTER_PEAK   = 0;
const FILTER_LS     = 1; // Low shelf
const FILTER_HS     = 2; // High shelf
const FILTER_AP     = 3; // All pass
const FILTER_LPF    = 4; // Low pass
const FILTER_HPF    = 5; // High pass

// ── Frequency response math (same as PeqChart.vue) ───────────────────────────
const NUM_SAMPLES = 128;
const SAMPLE_RATE = 48000;

function computeBandResponse(band) {
  const { Fc, gaindB, Q, FilterType } = band;

  let ft = FilterType;
  let g  = gaindB;
  if (ft === FILTER_AP)  { ft = FILTER_PEAK; g = 0; } // all-pass: render flat
  if (ft === FILTER_LPF || ft === FILTER_HPF) { g = 0; } // LPF/HPF: no gain

  const A    = Math.pow(10, g / 40);
  const w0   = 2 * Math.PI * Fc / SAMPLE_RATE;
  const cosw = Math.cos(w0);
  const sinw = Math.sin(w0);
  const Qv   = Math.max(Q, 1e-6);

  let b0, b1, b2, a0, a1, a2;

  if (ft === FILTER_PEAK) {
    const alpha = sinw / (2 * Qv);
    b0 = 1 + alpha * A;  b1 = -2 * cosw; b2 = 1 - alpha * A;
    a0 = 1 + alpha / A;  a1 = -2 * cosw; a2 = 1 - alpha / A;
  } else if (ft === FILTER_LS) {
    const alpha = sinw / 2 * Math.sqrt((A + 1/A) * (1/Qv - 1) + 2);
    b0 =  A*((A+1) - (A-1)*cosw + 2*Math.sqrt(A)*alpha);
    b1 = 2*A*((A-1) - (A+1)*cosw);
    b2 =  A*((A+1) - (A-1)*cosw - 2*Math.sqrt(A)*alpha);
    a0 =    (A+1) + (A-1)*cosw + 2*Math.sqrt(A)*alpha;
    a1 = -2*((A-1) + (A+1)*cosw);
    a2 =    (A+1) + (A-1)*cosw - 2*Math.sqrt(A)*alpha;
  } else if (ft === FILTER_LPF) {
    const alpha = sinw / (2 * Qv);
    b0 = (1 - cosw) / 2; b1 = 1 - cosw;  b2 = (1 - cosw) / 2;
    a0 =  1 + alpha;      a1 = -2 * cosw; a2 = 1 - alpha;
  } else if (ft === FILTER_HPF) {
    const alpha = sinw / (2 * Qv);
    b0 =  (1 + cosw) / 2; b1 = -(1 + cosw); b2 = (1 + cosw) / 2;
    a0 =   1 + alpha;      a1 = -2 * cosw;   a2 = 1 - alpha;
  } else { // FILTER_HS
    const alpha = sinw / 2 * Math.sqrt((A + 1/A) * (1/Qv - 1) + 2);
    b0 =  A*((A+1) + (A-1)*cosw + 2*Math.sqrt(A)*alpha);
    b1 =-2*A*((A-1) + (A+1)*cosw);
    b2 =  A*((A+1) + (A-1)*cosw - 2*Math.sqrt(A)*alpha);
    a0 =    (A+1) - (A-1)*cosw + 2*Math.sqrt(A)*alpha;
    a1 =  2*((A-1) - (A+1)*cosw);
    a2 =    (A+1) - (A-1)*cosw - 2*Math.sqrt(A)*alpha;
  }

  // Normalize by a0
  b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;

  const result = [];
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const f   = 10 * Math.pow(2000, i / (NUM_SAMPLES - 1));
    const phi = Math.pow(Math.sin(2 * Math.PI * f / (2 * SAMPLE_RATE)), 2);
    let r = (Math.pow(b0+b1+b2,2) - 4*(b0*b1+4*b0*b2+b1*b2)*phi + 16*b0*b2*phi*phi)
          / (Math.pow(1+a1+a2,2)  - 4*(a1+4*a2+a1*a2)*phi      + 16*a2*phi*phi);
    r = r < 0 ? 0 : Math.sqrt(r);
    let db = 20 * Math.log10(r);
    if (!isFinite(db) || isNaN(db)) db = -100;
    result.push({ f, db });
  }
  return result;
}

// ── Color palette (mirrors PeqChart.vue) ─────────────────────────────────────
const COLOR_PALETTE = [
  [30,144,255],[255,69,58],[52,199,89],[255,149,0],
  [175,82,222],[0,199,190],[255,59,48],[90,200,250],
  [255,204,0],[88,86,214],[255,45,85],[50,215,75],
  [191,90,242],[64,200,224],[255,159,10],[162,132,94]
];

export default {
  name: 'PeqDragEditor',

  props: {
    // Array of band objects { Fc, gaindB, Q, FilterType, bypass }
    bands: {
      type: Array,
      required: true
    },
    // Limits
    minFreq:  { type: Number, default: 15 },
    maxFreq:  { type: Number, default: 20000 },
    minGain:  { type: Number, default: -20 },
    maxGain:  { type: Number, default: 20 },
    minQ:     { type: Number, default: 0.1 },
    maxQ:     { type: Number, default: 10 },
    darkMode: { type: Boolean, default: false },
  },

  emits: [
    'update:freq',   // (bandIndex, newFreq)
    'update:gain',   // (bandIndex, newGain)
    'update:q',      // (bandIndex, newQ)
  ],

  setup(props, { emit }) {

    // ── Layout constants ────────────────────────────────────────────────────
    const leftPad   = 48;
    const rightPad  = 20;
    const topPad    = 16;
    const bottomPad = 28;
    const ballRadius = 14;

    const containerRef = ref(null);
    const svgRef       = ref(null);
    const svgWidth     = ref(900);
    const svgHeight    = ref(400);

    // ── Drag state ──────────────────────────────────────────────────────────
    const dragging = ref(null); // { type: 'band'|'q', bandIndex, startX, startY, startFc, startGain, startQ, side }
    const activeBandIndex  = ref(null);
    // Tracks which band the mouse is hovering — drives tooltip visibility
    const hoveredBandIndex = ref(null);

    // ── Coordinate helpers ──────────────────────────────────────────────────
    const chartW = computed(() => svgWidth.value  - leftPad - rightPad);
    const chartH = computed(() => svgHeight.value - topPad  - bottomPad);

    function freqToX(freq) {
      const logMin = Math.log10(props.minFreq);
      const logMax = Math.log10(props.maxFreq);
      const t = (Math.log10(Math.max(freq, props.minFreq)) - logMin) / (logMax - logMin);
      return leftPad + t * chartW.value;
    }

    function xToFreq(x) {
      const logMin = Math.log10(props.minFreq);
      const logMax = Math.log10(props.maxFreq);
      const t = (x - leftPad) / chartW.value;
      return Math.pow(10, logMin + t * (logMax - logMin));
    }

    // Auto-scaling Y axis.
    // Default ±20 dB. If any band uses LPF or HPF, the floor extends to -60 dB.
    const effectiveMaxGain = computed(() => {
      const bandMax = Math.max(...props.bands.map(b => b.gaindB ?? 0), 0);
      return Math.min(20, Math.max(20, Math.ceil(bandMax / 5) * 5));
    });
    const effectiveMinGain = computed(() => {
      const hasLpfHpf = props.bands.some(b => b.FilterType === FILTER_LPF || b.FilterType === FILTER_HPF);
      const floor = hasLpfHpf ? -40 : -20;
      const bandMin = Math.min(...props.bands.map(b => b.gaindB ?? 0), 0);
      return Math.max(-60, Math.min(floor, Math.floor(bandMin / 5) * 5));
    });

    function dbToY(db) {
      const t = (db - effectiveMaxGain.value) / (effectiveMinGain.value - effectiveMaxGain.value);
      return topPad + t * chartH.value;
    }

    function yToDb(y) {
      const t = (y - topPad) / chartH.value;
      return effectiveMaxGain.value + t * (effectiveMinGain.value - effectiveMaxGain.value);
    }

    // ── Grid definitions ────────────────────────────────────────────────────
    const dbGridLines = computed(() => {
      const lines = [];
      for (let db = effectiveMinGain.value; db <= effectiveMaxGain.value; db += 5) lines.push(db);
      return lines;
    });
    const freqGridLines = [20, 30, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];

    function formatFreq(f) {
      return f >= 1000 ? (f / 1000) + 'k' : f.toString();
    }

    // ── Band helpers ────────────────────────────────────────────────────────
    function getBandColor(index, alpha = 1.0) {
      const [r, g, b] = COLOR_PALETTE[index % COLOR_PALETTE.length];
      return `rgba(${r},${g},${b},${alpha})`;
    }

    function filterTypeName(type) {
      const names = { 0: 'Peak', 1: 'Low Shelf', 2: 'High Shelf', 3: 'All Pass', 4: 'LPF', 5: 'HPF' };
      return names[type] ?? 'Peak';
    }

    function getBandLabel(band) {
      if (band.FilterType === FILTER_LS)  return 'LS';
      if (band.FilterType === FILTER_HS)  return 'HS';
      if (band.FilterType === FILTER_LPF) return 'LP';
      if (band.FilterType === FILTER_HPF) return 'HP';
      return String(band.originalIndex + 1);
    }

    // Only show non-bypassed bands.
    // During drag, merge pending values for immediate visual feedback
    // before the debounced emit reaches the device and props update.
    const visibleBands = computed(() =>
      props.bands
        .map((b, i) => ({
          ...b,
          Fc:     pendingFreq.value[i] ?? b.Fc,
          gaindB: pendingGain.value[i] ?? b.gaindB,
          Q:      pendingQ.value[i]    ?? b.Q,
          originalIndex: i,
        }))
        .filter(b => !b.bypass)
    );

    // Reversed order for ball rendering: SVG paints last element on top,
    // so reversing ensures band 1 is always on top when bands overlap.
    const reversedVisibleBands = computed(() => [...visibleBands.value].reverse());

    const activeBand = computed(() =>
      activeBandIndex.value !== null ? props.bands[activeBandIndex.value] : null
    );
    const hoveredBand = computed(() => {
      // Show tooltip for hovered band, or for the band being dragged
      const idx = hoveredBandIndex.value ?? dragging.value?.bandIndex ?? null;
      return idx !== null ? props.bands[idx] : null;
    });

    // Q handle visual width: wider = lower Q (inversely mapped)
    function qHandleWidth(band) {
      // Map Q range [0.1 – 10] to handle width [30 – 4] pixels
      const t = (Math.log10(band.Q) - Math.log10(props.minQ))
              / (Math.log10(props.maxQ) - Math.log10(props.minQ));
      return Math.round(30 - t * 26);
    }

    // ── Frequency response curves ───────────────────────────────────────────
    function getBandCurvePoints(band) {
      try {
        return computeBandResponse(band).map(({ f, db }) => ({
          x: freqToX(f),
          y: dbToY(Math.max(effectiveMinGain.value, Math.min(effectiveMaxGain.value, db)))
        }));
      } catch {
        return [];
      }
    }

    // Sum all visible bands for the combined curve
    const combinedCurvePoints = computed(() => {
      if (visibleBands.value.length === 0) return [];

      // Sum dB values at each sample point
      const sumDb = new Array(NUM_SAMPLES).fill(0);
      for (const band of visibleBands.value) {
        try {
          const pts = computeBandResponse(band);
          pts.forEach((p, i) => { sumDb[i] += p.db; });
        } catch { /* skip bad bands */ }
      }

      return sumDb.map((db, i) => {
        const f = 10 * Math.pow(2000, i / (NUM_SAMPLES - 1));
        return {
          x: freqToX(f),
          y: dbToY(Math.max(effectiveMinGain.value, Math.min(effectiveMaxGain.value, db)))
        };
      });
    });

    // ── Tooltip position ────────────────────────────────────────────────────
    const tooltipW = 150;
    const tooltipH = 62;

    const tooltipX = computed(() => {
      const idx = hoveredBandIndex.value ?? dragging.value?.bandIndex ?? null;
      if (idx === null) return 0;
      const fc = pendingFreq.value[idx] ?? props.bands[idx]?.Fc ?? 1000;
      const bx = freqToX(fc);
      // Center tooltip on ball, clamped within chart area
      const centered = bx - tooltipW / 2;
      const minX = leftPad;
      const maxX = svgWidth.value - rightPad - tooltipW;
      return Math.max(minX, Math.min(maxX, centered));
    });
    const tooltipY = computed(() => {
      const idx = hoveredBandIndex.value ?? dragging.value?.bandIndex ?? null;
      if (idx === null) return 0;
      const gain = pendingGain.value[idx] ?? props.bands[idx]?.gaindB ?? 0;
      const by = dbToY(gain);
      const aboveY = by - ballRadius - 8 - tooltipH;
      // Default: above the ball. If not enough room, show below.
      return aboveY > topPad ? aboveY : by + ballRadius + 8;
    });

    // ── SVG element pointer position helper ────────────────────────────────
    function getSvgPoint(event) {
      const svg  = svgRef.value;
      const rect = svg.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      return {
        x: (clientX - rect.left) * (svg.viewBox.baseVal.width  || svgWidth.value)  / rect.width,
        y: (clientY - rect.top)  * (svg.viewBox.baseVal.height || svgHeight.value) / rect.height,
      };
    }

    // ── Drag: band node (freq + gain) ───────────────────────────────────────
    function startBandDrag(event, bandIndex) {
      const pt = getSvgPoint(event);
      activeBandIndex.value = bandIndex;
      dragging.value = {
        type: 'band',
        bandIndex,
        startX:    pt.x,
        startY:    pt.y,
        startFc:   props.bands[bandIndex].Fc,
        startGain: props.bands[bandIndex].gaindB,
      };
    }

    function startBandDragTouch(event, bandIndex) {
      startBandDrag(event, bandIndex);
    }

    // ── Drag: Q handle ──────────────────────────────────────────────────────
    function startQDrag(event, bandIndex, side) {
      const pt = getSvgPoint(event);
      activeBandIndex.value = bandIndex;
      dragging.value = {
        type:   'q',
        bandIndex,
        side,
        startX: pt.x,
        startQ: props.bands[bandIndex].Q,
      };
    }

    function startQDragTouch(event, bandIndex, side) {
      startQDrag(event, bandIndex, side);
    }

    // ── Mouse/touch move ────────────────────────────────────────────────────
    function onMouseMove(event) {
      if (!dragging.value) return;
      handleDragMove(getSvgPoint(event));
    }

    function onTouchMove(event) {
      if (!dragging.value) return;
      handleDragMove(getSvgPoint(event));
    }

    // Pending values used for immediate visual feedback during drag.
    // The actual emit is debounced so the device is only updated when dragging pauses.
    const pendingFreq = ref({});  // { [bandIndex]: value }
    const pendingGain = ref({});
    const pendingQ    = ref({});

    const emitFreq = debounce((bandIndex, value) => {
      emit('update:freq', bandIndex, value);
    }, 100, { leading: false, trailing: true });

    const emitGain = debounce((bandIndex, value) => {
      emit('update:gain', bandIndex, value);
    }, 100, { leading: false, trailing: true });

    const emitQ = debounce((bandIndex, value) => {
      emit('update:q', bandIndex, value);
    }, 100, { leading: false, trailing: true });

    function handleDragMove(pt) {
      const d = dragging.value;
      if (!d) return;

      if (d.type === 'band') {
        // Horizontal → frequency (log scale)
        const dxPixels = pt.x - d.startX;
        const logMin = Math.log10(props.minFreq);
        const logMax = Math.log10(props.maxFreq);
        const logStart = Math.log10(d.startFc);
        const dLog = dxPixels / chartW.value * (logMax - logMin);
        const newFc = Math.round(Math.pow(10, Math.max(logMin, Math.min(logMax, logStart + dLog))) * 10) / 10;

        // Vertical → gain (linear); skipped for filter types that have no gain
        const ft = props.bands[d.bandIndex]?.FilterType;
        const gainLocked = ft === FILTER_AP || ft === FILTER_LPF || ft === FILTER_HPF;

        pendingFreq.value = { ...pendingFreq.value, [d.bandIndex]: newFc };
        emitFreq(d.bandIndex, newFc);

        if (!gainLocked) {
          const dyPixels = pt.y - d.startY;
          const dGain = -dyPixels / chartH.value * (effectiveMaxGain.value - effectiveMinGain.value);
          const newGain = Math.round(Math.max(effectiveMinGain.value, Math.min(effectiveMaxGain.value, d.startGain + dGain)) * 10) / 10;
          pendingGain.value = { ...pendingGain.value, [d.bandIndex]: newGain };
          emitGain(d.bandIndex, newGain);
        }

      } else if (d.type === 'q') {
        // Horizontal → Q (drag outward = lower Q = wider band)
        const dx = pt.x - d.startX;
        // Left handle: drag left = increase Q (narrower), right = decrease
        // Right handle: drag right = increase Q, left = decrease
        const direction = d.side === 'left' ? -1 : 1;
        const sensitivity = 0.015; // Q units per pixel
        const dQ = -direction * dx * sensitivity;

        const logMinQ = Math.log10(props.minQ);
        const logMaxQ = Math.log10(props.maxQ);
        const logStartQ = Math.log10(d.startQ);
        const newLogQ = Math.max(logMinQ, Math.min(logMaxQ, logStartQ + dQ));
        const newQ = Math.round(Math.pow(10, newLogQ) * 10) / 10;

        // Update pending value immediately for smooth visual feedback
        pendingQ.value = { ...pendingQ.value, [d.bandIndex]: newQ };

        // Debounced: only send to device after 100ms of stillness
        emitQ(d.bandIndex, newQ);
      }
    }

    // ── Mouse/touch end ─────────────────────────────────────────────────────
    function onMouseUp() {
      if (dragging.value) {
        const { bandIndex } = dragging.value;
        // Clear pending overrides for this band so props take over after emit settles
        const { [bandIndex]: _f, ...restF } = pendingFreq.value;
        const { [bandIndex]: _g, ...restG } = pendingGain.value;
        const { [bandIndex]: _q, ...restQ } = pendingQ.value;
        pendingFreq.value = restF;
        pendingGain.value = restG;
        pendingQ.value    = restQ;
      }
      dragging.value = null;
    }

    function onTouchEnd() {
      onMouseUp();
    }

    // ── Resize observer ─────────────────────────────────────────────────────
    let resizeObserver = null;

    onMounted(() => {
      if (containerRef.value) {
        resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            svgWidth.value = Math.max(400, entry.contentRect.width);
          }
        });
        resizeObserver.observe(containerRef.value);
        svgWidth.value = containerRef.value.clientWidth || 900;
      }
    });

    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
    });

    return {
      // refs
      containerRef, svgRef,
      // dimensions
      svgWidth, svgHeight, leftPad, rightPad, topPad, bottomPad, ballRadius,
      // coordinate helpers
      freqToX, dbToY,
      // grid
      dbGridLines, freqGridLines, formatFreq,
      // band data
      visibleBands, reversedVisibleBands, activeBand, activeBandIndex,
      hoveredBandIndex, hoveredBand,
      // visuals
      getBandColor, getBandLabel, filterTypeName, qHandleWidth,
      getBandCurvePoints, combinedCurvePoints,
      // tooltip
      tooltipX, tooltipY, tooltipW, tooltipH,
      // drag handlers
      dragging,
      startBandDrag, startBandDragTouch,
      startQDrag,    startQDragTouch,
      onMouseMove, onMouseUp, onTouchMove, onTouchEnd,
    };
  }
};
</script>

<style scoped>
.peq-drag-editor {
  width: 100%;
  user-select: none;
  touch-action: none;
}

svg {
  display: block;
  width: 100%;
  height: auto;
}
</style>
