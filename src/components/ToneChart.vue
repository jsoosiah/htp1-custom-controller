<template>
  <div class="tone-chart-container" ref="containerRef">
    <canvas ref="chartRef" class="tone-canvas" />
    <svg
      ref="svgRef"
      class="tone-svg"
      :width="svgWidth"
      :height="svgHeight"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Bass ball (low shelf) -->
      <g
        v-if="chartReady"
        :style="`transform: translate(${bassX}px, ${bassY}px); cursor: ${dragTarget === 'bass' ? 'grabbing' : 'grab'}; transition: ${dragTarget === 'bass' ? 'none' : 'transform 0.15s ease-in-out'}`"
        @mouseenter="hoveredTarget = 'bass'"
        @mouseleave="hoveredTarget = null"
        @mousedown.prevent="startDrag('bass', $event)"
        @touchstart.prevent="startDragTouch('bass', $event)"
      >
        <circle
          r="14"
          :fill="dragTarget === 'bass' ? (toneEnabled ? 'rgba(30,144,255,0.85)' : 'rgba(160,160,160,0.85)') : (toneEnabled ? 'rgba(30,144,255,0.55)' : 'rgba(160,160,160,0.55)')"
          :stroke="toneEnabled ? 'rgba(30,144,255,0.9)' : 'rgba(160,160,160,0.9)'"
          :stroke-width="dragTarget === 'bass' ? 3 : 2"
        />
        <text
          text-anchor="middle"
          dominant-baseline="central"
          fill="white"
          font-size="10"
          font-weight="bold"
          style="pointer-events: none; user-select: none"
        >B</text>
      </g>

      <!-- Treble ball (high shelf) -->
      <g
        v-if="chartReady"
        :style="`transform: translate(${trebleX}px, ${trebleY}px); cursor: ${dragTarget === 'treble' ? 'grabbing' : 'grab'}; transition: ${dragTarget === 'treble' ? 'none' : 'transform 0.15s ease-in-out'}`"
        @mouseenter="hoveredTarget = 'treble'"
        @mouseleave="hoveredTarget = null"
        @mousedown.prevent="startDrag('treble', $event)"
        @touchstart.prevent="startDragTouch('treble', $event)"
      >
        <circle
          r="14"
          :fill="dragTarget === 'treble' ? (toneEnabled ? 'rgba(30,144,255,0.85)' : 'rgba(160,160,160,0.85)') : (toneEnabled ? 'rgba(30,144,255,0.55)' : 'rgba(160,160,160,0.55)')"
          :stroke="toneEnabled ? 'rgba(30,144,255,0.9)' : 'rgba(160,160,160,0.9)'"
          :stroke-width="dragTarget === 'treble' ? 3 : 2"
        />
        <text
          text-anchor="middle"
          dominant-baseline="central"
          fill="white"
          font-size="10"
          font-weight="bold"
          style="pointer-events: none; user-select: none"
        >T</text>
      </g>

      <!-- Tooltip — same style as PeqDragEditor -->
      <g v-if="(dragTarget || hoveredTarget) && chartReady" style="pointer-events: none">
        <rect
          :x="tooltipX"
          :y="tooltipY"
          :width="tooltipW"
          :height="tooltipH"
          rx="4"
          :fill="darkMode ? 'rgba(30,30,30,0.92)' : 'rgba(255,255,255,0.92)'"
          stroke="rgba(30,144,255,0.7)"
          stroke-width="1"
        />
        <!-- Title row: Bass / Treble -->
        <text
          :x="tooltipX + 8"
          :y="tooltipY + 16"
          :fill="darkMode ? '#eee' : '#222'"
          font-size="11"
          font-weight="bold"
          style="user-select: none"
        >{{ (dragTarget || hoveredTarget) === 'bass' ? 'Bass' : 'Treble' }}</text>
        <!-- Corner frequency row -->
        <text
          :x="tooltipX + 8"
          :y="tooltipY + 31"
          :fill="darkMode ? '#ccc' : '#444'"
          font-size="11"
          style="user-select: none"
        >Corner: {{ tooltipFreqText }}</text>
        <!-- Level row -->
        <text
          :x="tooltipX + 8"
          :y="tooltipY + 45"
          :fill="darkMode ? '#ccc' : '#444'"
          font-size="11"
          style="user-select: none"
        >Level: {{ tooltipLevelText }}</text>
      </g>
    </svg>
  </div>
</template>

<script>
  import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
  import { cloneDeep, debounce, isEqual } from 'lodash-es';
  import Chart from 'chart.js';

  const NUM_SAMPLES = 128;
  const BASS_FREQ_MIN   = 20;
  const BASS_FREQ_MAX   = 500;
  const TREBLE_FREQ_MIN = 600;
  const TREBLE_FREQ_MAX = 8000;
  const GAIN_MIN = -12;
  const GAIN_MAX = 12;
  const CHART_FREQ_MIN = 10;
  const CHART_FREQ_MAX = 20000;

  function getBorderColor(rgb) {
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, .8)`;
  }
  function getBackgroundColor(rgb) {
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, .15)`;
  }
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  export default {
    name: 'ToneChart',
    emits: ['update:bassFreq', 'update:bassLevel', 'update:trebleFreq', 'update:trebleLevel'],
    props: {
      bassFreq:    { type: Number, required: true },
      bassLevel:   { type: Number, required: true },
      trebleFreq:  { type: Number, required: true },
      trebleLevel: { type: Number, required: true },
      darkMode:    { type: Boolean, default: false },
      toneEnabled: { type: Boolean, default: true },
    },
    setup(props, { emit }) {

      const chartRef     = ref(null);
      const svgRef       = ref(null);
      const containerRef = ref(null);

      // SVG dimensions — width from ResizeObserver (same as PeqDragEditor), height from canvas
      const svgWidth  = ref(900);
      const svgHeight = ref(400);

      // Chart plot area in CSS pixel coordinates
      const plotArea   = ref({ left: 0, right: 900, top: 0, bottom: 400 });
      const chartReady = ref(false);

      let myChart = null;
      let resizeObserver = null;
      const localToneSettings = ref({});

      const gridLinesColor = computed(() => props.darkMode ? '#333' : '#ccc');
      const responseColor  = computed(() => props.toneEnabled ? [30, 144, 255] : [160, 160, 160]);

      // Pending drag values for immediate visual feedback
      const pendingBassFreq    = ref(null);
      const pendingBassLevel   = ref(null);
      const pendingTrebleFreq  = ref(null);
      const pendingTrebleLevel = ref(null);

      const effectiveBassFreq    = computed(() => pendingBassFreq.value    ?? props.bassFreq);
      const effectiveBassLevel   = computed(() => pendingBassLevel.value   ?? props.bassLevel);
      const effectiveTrebleFreq  = computed(() => pendingTrebleFreq.value  ?? props.trebleFreq);
      const effectiveTrebleLevel = computed(() => pendingTrebleLevel.value ?? props.trebleLevel);

      // ── Coordinate helpers — same pattern as PeqDragEditor ───────────────

      /** Frequency (Hz) to SVG x pixel (logarithmic interpolation within plotArea) */
      function freqToX(freq) {
        const pa = plotArea.value;
        const logMin = Math.log10(CHART_FREQ_MIN);
        const logMax = Math.log10(CHART_FREQ_MAX);
        const t = (Math.log10(Math.max(freq, CHART_FREQ_MIN)) - logMin) / (logMax - logMin);
        return pa.left + t * (pa.right - pa.left);
      }

      /** Gain (dB) to SVG y pixel (linear, 0=top at +12dB, 1=bottom at -12dB) */
      function gainToY(gain) {
        const pa = plotArea.value;
        const t = (gain - GAIN_MAX) / (GAIN_MIN - GAIN_MAX);
        return pa.top + t * (pa.bottom - pa.top);
      }

      /** SVG x pixel to frequency (Hz) */
      function xToFreq(x) {
        const pa = plotArea.value;
        const t = (x - pa.left) / (pa.right - pa.left);
        const logMin = Math.log10(CHART_FREQ_MIN);
        const logMax = Math.log10(CHART_FREQ_MAX);
        return Math.pow(10, logMin + clamp(t, 0, 1) * (logMax - logMin));
      }

      /** SVG y pixel to gain (dB) */
      function yToGain(y) {
        const pa = plotArea.value;
        const t = (y - pa.top) / (pa.bottom - pa.top);
        return GAIN_MAX + clamp(t, 0, 1) * (GAIN_MIN - GAIN_MAX);
      }

      // Compute shelf filter response (dB) at a given frequency for ball positioning
      function shelfResponseAtFreq(freq, level, filterType) {
        const sr = 48000.0;
        const A  = Math.pow(10, level / 40);
        const w0 = 2 * Math.PI * freq / sr;
        const c  = Math.cos(w0), s = Math.sin(w0);
        const al = s / 2 * Math.sqrt((A + 1/A) * (1/0.707 - 1) + 2);
        let b0, b1, b2, a0, a1, a2;
        if (filterType === 'low') {
          b0 =  A*((A+1) - (A-1)*c + 2*Math.sqrt(A)*al);
          b1 = 2*A*((A-1) - (A+1)*c);
          b2 =  A*((A+1) - (A-1)*c - 2*Math.sqrt(A)*al);
          a0 =    (A+1) + (A-1)*c + 2*Math.sqrt(A)*al;
          a1 = -2*((A-1) + (A+1)*c);
          a2 =    (A+1) + (A-1)*c - 2*Math.sqrt(A)*al;
        } else {
          b0 =  A*((A+1) + (A-1)*c + 2*Math.sqrt(A)*al);
          b1 = -2*A*((A-1) + (A+1)*c);
          b2 =  A*((A+1) + (A-1)*c - 2*Math.sqrt(A)*al);
          a0 =    (A+1) - (A-1)*c + 2*Math.sqrt(A)*al;
          a1 =  2*((A-1) - (A+1)*c);
          a2 =    (A+1) - (A-1)*c - 2*Math.sqrt(A)*al;
        }
        b0/=a0; b1/=a0; b2/=a0; a1/=a0; a2/=a0;
        const phi = Math.pow(Math.sin(2 * Math.PI * freq / (2 * sr)), 2);
        let r = (Math.pow(b0+b1+b2,2) - 4*(b0*b1+4*b0*b2+b1*b2)*phi + 16*b0*b2*phi*phi)
              / (Math.pow(1+a1+a2,2)  - 4*(a1+4*a2+a1*a2)*phi        + 16*a2*phi*phi);
        r = Math.sqrt(Math.max(0, r));
        const db = 20 * Math.log10(r);
        return isFinite(db) ? db : 0;
      }

      const bassX   = computed(() => chartReady.value ? freqToX(effectiveBassFreq.value) : 0);
      const bassY   = computed(() => chartReady.value ? gainToY(shelfResponseAtFreq(effectiveBassFreq.value, effectiveBassLevel.value, 'low')) : 0);
      const trebleX = computed(() => chartReady.value ? freqToX(effectiveTrebleFreq.value) : 0);
      const trebleY = computed(() => chartReady.value ? gainToY(shelfResponseAtFreq(effectiveTrebleFreq.value, effectiveTrebleLevel.value, 'high')) : 0);

      // Tooltip — same style as PeqDragEditor
      const dragTarget    = ref(null);
      const hoveredTarget = ref(null); // 'bass' | 'treble' | null

      const tooltipW   = 140;
      const tooltipH   = 62;
      const ballRadius = 14;

      const tooltipX = computed(() => {
        const active = dragTarget.value || hoveredTarget.value;
        if (!active) return 0;
        const x = active === 'bass' ? bassX.value : trebleX.value;
        return clamp(x - tooltipW / 2, plotArea.value.left, plotArea.value.right - tooltipW);
      });
      const tooltipY = computed(() => {
        const active = dragTarget.value || hoveredTarget.value;
        if (!active) return 0;
        const y = active === 'bass' ? bassY.value : trebleY.value;
        const aboveY = y - ballRadius - 8 - tooltipH;
        return aboveY > plotArea.value.top ? aboveY : y + ballRadius + 8;
      });
      const tooltipFreqText = computed(() => {
        const active = dragTarget.value || hoveredTarget.value;
        if (!active) return '';
        if (active === 'bass') return `${effectiveBassFreq.value.toFixed(0)} Hz`;
        return `${(effectiveTrebleFreq.value / 1000).toFixed(1)} kHz`;
      });
      const tooltipLevelText = computed(() => {
        const active = dragTarget.value || hoveredTarget.value;
        if (!active) return '';
        const lvl = active === 'bass' ? effectiveBassLevel.value : effectiveTrebleLevel.value;
        return `${lvl.toFixed(1)} dB`;
      });

      // ── Drag — same getSvgPoint pattern as PeqDragEditor ─────────────────

      function getSvgPoint(event) {
        const svg  = svgRef.value;
        const rect = svg.getBoundingClientRect();
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        return {
          x: (clientX - rect.left) * (svgWidth.value  / rect.width),
          y: (clientY - rect.top)  * (svgHeight.value / rect.height),
        };
      }

      let dragStartPt   = { x: 0, y: 0 };
      let dragStartFreq = 0;
      let dragStartGain = 0;

      function startDrag(target, event) {
        dragTarget.value = target;
        dragStartPt   = getSvgPoint(event);
        dragStartFreq = target === 'bass' ? effectiveBassFreq.value  : effectiveTrebleFreq.value;
        dragStartGain = target === 'bass' ? effectiveBassLevel.value : effectiveTrebleLevel.value;
      }
      function startDragTouch(target, event) { startDrag(target, event); }

      function applyDrag(pt) {
        if (!dragTarget.value) return;
        const pa    = plotArea.value;
        const plotW = pa.right  - pa.left;
        const plotH = pa.bottom - pa.top;

        // Horizontal: log-scale frequency delta
        const logMin = Math.log10(CHART_FREQ_MIN);
        const logMax = Math.log10(CHART_FREQ_MAX);
        const dLog   = (pt.x - dragStartPt.x) / plotW * (logMax - logMin);
        let newFreq  = dragStartFreq * Math.pow(10, dLog);

        // Vertical: linear gain delta (Y axis inverted)
        const dGain = -(pt.y - dragStartPt.y) / plotH * (GAIN_MAX - GAIN_MIN);
        let newGain = Math.round(dragStartGain + dGain);

        if (dragTarget.value === 'bass') {
          newFreq = clamp(Math.round(newFreq), BASS_FREQ_MIN, BASS_FREQ_MAX);
          newGain = clamp(newGain, GAIN_MIN, GAIN_MAX);
          pendingBassFreq.value  = newFreq;
          pendingBassLevel.value = newGain;
          debouncedEmitBass(newFreq, newGain);
        } else {
          newFreq = clamp(Math.round(newFreq / 100) * 100, TREBLE_FREQ_MIN, TREBLE_FREQ_MAX);
          newGain = clamp(newGain, GAIN_MIN, GAIN_MAX);
          pendingTrebleFreq.value  = newFreq;
          pendingTrebleLevel.value = newGain;
          debouncedEmitTreble(newFreq, newGain);
        }
        debouncedUpdateChart();
      }

      function onMouseMove(event) { if (dragTarget.value) applyDrag(getSvgPoint(event)); }
      function onTouchMove(event) { if (dragTarget.value) applyDrag(getSvgPoint(event)); }
      function onMouseUp() {
        if (dragTarget.value) {
          dragTarget.value = null;
          pendingBassFreq.value = pendingBassLevel.value = null;
          pendingTrebleFreq.value = pendingTrebleLevel.value = null;
        }
      }
      function onTouchEnd() { onMouseUp(); }

      const debouncedEmitBass = debounce((freq, level) => {
        emit('update:bassFreq', freq);
        emit('update:bassLevel', level);
      }, 50);
      const debouncedEmitTreble = debounce((freq, level) => {
        emit('update:trebleFreq', freq);
        emit('update:trebleLevel', level);
      }, 50);

      // ── Chart.js ──────────────────────────────────────────────────────────
      onMounted(() => {
        // Width from ResizeObserver — identical pattern to PeqDragEditor
        if (containerRef.value) {
          resizeObserver = new ResizeObserver(() => {
            // Re-read Chart.js plotArea on resize — updates svgWidth/Height too
            readPlotArea();
          });
          resizeObserver.observe(containerRef.value);
        }

        const ctx = chartRef.value.getContext('2d');
        const chartData = [];
        updateChartData(chartData);

        setTimeout(() => {
          myChart = Chart.Line(ctx, {
            type: 'bar',
            data: { datasets: chartData },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              showLines: true,
              scales: {
                yAxes: [{
                  scaleLabel: { display: true, labelString: 'Gain (dB)' },
                  ticks: { min: GAIN_MIN, max: GAIN_MAX, stepSize: 6 },
                  gridLines: { color: gridLinesColor.value },
                }],
                xAxes: [{
                  type: 'logarithmic',
                  ticks: {
                    min: CHART_FREQ_MIN,
                    max: CHART_FREQ_MAX,
                    callback: function(value) {
                      const show = [10,20,30,40,60,80,100,200,400,600,1000,2000,4000,6000,8000,10000,20000];
                      if (!show.includes(value)) return '';
                      return value >= 1000 ? (value / 1000) + 'k' : value.toString();
                    },
                    minRotation: 0, maxRotation: 50,
                  },
                  scaleLabel: { display: true, labelString: 'Frequency (Hz)' },
                  gridLines: { color: gridLinesColor.value },
                }],
              },
              tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                  title: (items) => items.map(i => i.xLabel.toFixed(2) + ' Hz'),
                  label: (item, data) => `${data.datasets[item.datasetIndex].label}: ${item.yLabel.toFixed(2)} dB`,
                },
              },
              legend: { display: false },
              animation: { duration: 150, easing: 'easeInOutQuad', onComplete: () => { if (!chartReady.value) readPlotArea(); } },
            },
          });
          readPlotArea();
        }, 100);
      });

      onBeforeUnmount(() => { resizeObserver?.disconnect(); });

      /**
       * Convert Chart.js chartArea (canvas device pixels) to CSS pixels.
       * scaleX/Y = offsetWidth/height divided by canvas.width/height accounts for devicePixelRatio.
       */
      function readPlotArea() {
        if (!myChart || !chartRef.value) return;
        const canvas = chartRef.value;
        const ca = myChart.chart?.chartArea;
        if (!ca || !ca.right) return; // Chart hasn't rendered yet

        // Use Chart.js raw device-pixel values directly — no scaling.
        // SVG width/height are set to the same device-pixel dimensions as the canvas,
        // and the SVG is CSS-scaled to match via width:100%/height:100%.
        plotArea.value = {
          left:   ca.left,
          right:  ca.right,
          top:    ca.top,
          bottom: ca.bottom,
        };

        // SVG coordinate space = canvas device pixels
        svgWidth.value  = canvas.width;
        svgHeight.value = canvas.height;
        chartReady.value = true;
      }

      // Chart data helpers
      function intializeData() {
        const data = [];
        for (let i = 0; i < NUM_SAMPLES; i++) data.push({ x: 0, y: 0 });
        return data;
      }
      function initializeSingleSeriesData(label, color) {
        return {
          label, data: intializeData(),
          borderColor: getBorderColor(color),
          backgroundColor: getBackgroundColor(color),
          pointBackgroundColor: 'rgba(0,0,0,0)',
          pointBorderColor: 'rgba(0,0,0,0)',
          pointRadius: 16, borderWidth: 2,
        };
      }
      function updateChartData(datasets) {
        const bFreq  = pendingBassFreq.value    ?? props.bassFreq;
        const bLevel = pendingBassLevel.value   ?? props.bassLevel;
        const tFreq  = pendingTrebleFreq.value  ?? props.trebleFreq;
        const tLevel = pendingTrebleLevel.value ?? props.trebleLevel;
        if (datasets.length > 0) {
          datasets[0].borderColor     = getBorderColor(responseColor.value);
          datasets[0].backgroundColor = getBackgroundColor(responseColor.value);
          computeCombinedSeriesData(datasets[0], bFreq, bLevel, tFreq, tLevel);
        } else {
          datasets.push(initializeSingleSeriesData('Response', responseColor.value));
          computeCombinedSeriesData(datasets[0], bFreq, bLevel, tFreq, tLevel);
        }
      }
      function updateChart() {
        if (!myChart) return;
        myChart.options.scales.yAxes[0].gridLines.color = gridLinesColor.value;
        myChart.options.scales.xAxes[0].gridLines.color = gridLinesColor.value;
        updateChartData(myChart.chart.config.data.datasets);
        myChart.chart.update();
        // Note: readPlotArea is called via animation.onComplete — no need to call here
      }
      const debouncedUpdateChart = debounce(updateChart, 50, { maxWait: 50, leading: true, trailing: true });

      // Biquad shelf filter math
      function computeCombinedSeriesData(s, bFreq, bLevel, tFreq, tLevel) {
        const sr = 48000.0;
        const Ab  = Math.pow(10, bLevel / 40);
        const w0b = 2 * Math.PI * bFreq / sr;
        const cb  = Math.cos(w0b), sb = Math.sin(w0b);
        const alb = sb / 2 * Math.sqrt((Ab + 1/Ab) * (1/0.707 - 1) + 2);
        let b0b =    Ab*((Ab+1) - (Ab-1)*cb + 2*Math.sqrt(Ab)*alb);
        let b1b =  2*Ab*((Ab-1) - (Ab+1)*cb);
        let b2b =    Ab*((Ab+1) - (Ab-1)*cb - 2*Math.sqrt(Ab)*alb);
        let a0b =      (Ab+1) + (Ab-1)*cb + 2*Math.sqrt(Ab)*alb;
        let a1b = -2*((Ab-1) + (Ab+1)*cb);
        let a2b =      (Ab+1) + (Ab-1)*cb - 2*Math.sqrt(Ab)*alb;
        b0b/=a0b; b1b/=a0b; b2b/=a0b; a1b/=a0b; a2b/=a0b;

        const At  = Math.pow(10, tLevel / 40);
        const w0t = 2 * Math.PI * tFreq / sr;
        const ct  = Math.cos(w0t), st = Math.sin(w0t);
        const alt = st / 2 * Math.sqrt((At + 1/At) * (1/0.707 - 1) + 2);
        let b0t =    At*((At+1) + (At-1)*ct + 2*Math.sqrt(At)*alt);
        let b1t = -2*At*((At-1) + (At+1)*ct);
        let b2t =    At*((At+1) + (At-1)*ct - 2*Math.sqrt(At)*alt);
        let a0t =      (At+1) - (At-1)*ct + 2*Math.sqrt(At)*alt;
        let a1t =  2*((At-1) - (At+1)*ct);
        let a2t =      (At+1) - (At-1)*ct - 2*Math.sqrt(At)*alt;
        b0t/=a0t; b1t/=a0t; b2t/=a0t; a1t/=a0t; a2t/=a0t;

        for (let i = 0; i < NUM_SAMPLES; i++) {
          const f   = 10 * Math.pow(2000, i / (NUM_SAMPLES - 1));
          const phi = Math.pow(Math.sin(2 * Math.PI * f / (2 * sr)), 2);
          let rb = (Math.pow(b0b+b1b+b2b,2) - 4*(b0b*b1b+4*b0b*b2b+b1b*b2b)*phi + 16*b0b*b2b*phi*phi)
                 / (Math.pow(1+a1b+a2b,2)   - 4*(a1b+4*a2b+a1b*a2b)*phi          + 16*a2b*phi*phi);
          rb = Math.sqrt(Math.max(0, rb));
          let rt = (Math.pow(b0t+b1t+b2t,2) - 4*(b0t*b1t+4*b0t*b2t+b1t*b2t)*phi + 16*b0t*b2t*phi*phi)
                 / (Math.pow(1+a1t+a2t,2)   - 4*(a1t+4*a2t+a1t*a2t)*phi          + 16*a2t*phi*phi);
          rt = Math.sqrt(Math.max(0, rt));
          let r = 20 * Math.log10(rb * rt);
          if (!isFinite(r) || isNaN(r)) r = -100;
          s.data[i] = { x: f, y: r };
        }
      }

      watch(
        props,
        (newProps) => {
          const s = {
            bassFreq: newProps.bassFreq, bassLevel: newProps.bassLevel,
            trebleFreq: newProps.trebleFreq, trebleLevel: newProps.trebleLevel,
            toneEnabled: newProps.toneEnabled,
          };
          if (!isEqual(s, localToneSettings.value)) {
            debouncedUpdateChart();
            localToneSettings.value = cloneDeep(s);
          }
        },
        { deep: true }
      );

      return {
        chartRef, svgRef, containerRef,
        svgWidth, svgHeight, chartReady,
        bassX, bassY, trebleX, trebleY,
        dragTarget, hoveredTarget, tooltipX, tooltipY, tooltipW, tooltipH, tooltipFreqText, tooltipLevelText,
        startDrag, startDragTouch,
        onMouseMove, onMouseUp, onTouchMove, onTouchEnd,
      };
    }
  };
</script>

<style scoped>
  .tone-chart-container {
    position: relative;
    width: 100%;
    min-height: 400px;
    user-select: none;
    touch-action: none;
  }
  .tone-canvas {
    display: block;
    width: 100%;
    min-height: 400px;
  }
  .tone-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: block;
  }


</style>
