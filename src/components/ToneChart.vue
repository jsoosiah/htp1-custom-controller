<template>
  <div class="chart-container">
    <canvas ref="chartRef" />
  </div>
</template>

<script>

  import { ref, onMounted, watch, computed } from 'vue';
  import { cloneDeep, debounce, isEqual } from 'lodash-es';
  import Chart from 'chart.js';

  const NUM_SAMPLES = 128;

  const COLOR_RESPONSE = [30, 144, 255];   // Bright Blue for response

  function getBorderColor(rgb) {
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, .8)`;
  }

  function getBackgroundColor(rgb) {
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, .15)`;
  }

  export default {
    name: 'ToneChart',
    props: {
      bassFreq: {
        type: Number,
        required: true
      },
      bassLevel: {
        type: Number,
        required: true
      },
      trebleFreq: {
        type: Number,
        required: true
      },
      trebleLevel: {
        type: Number,
        required: true
      },
      darkMode: {
        type: Boolean, 
        default: false,
      },
      toneEnabled: {
        type: Boolean,
        default: true,
      }
    },
    setup(props) {

      const chartRef = ref(null);
      const localToneSettings = ref({});
      let myChart = null;

      const gridLinesColor = computed(() => props.darkMode ? '#333' : '#ccc');
      const responseColor = computed(() => props.toneEnabled ? [30, 144, 255] : [160, 160, 160]);

      onMounted(() => {

        const ctx = chartRef.value.getContext("2d");

        const chartData = [];
        updateChartData(chartData);

        // delay chart loading to let initial page load happen quickly
        setTimeout(() => {
          myChart = Chart.Line(ctx, {
            type: 'bar',
            data: {
              datasets: chartData
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              aspectRatio: 1.25,
              showLines: true,
              scales: {
                yAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'Gain (dB)'
                  },
                  ticks: {
                    min: -12,
                    max: 12,
                    stepSize: 6,
                  },
                  gridLines: {
                    color: gridLinesColor.value,
                  }
                }],
                xAxes: [{
                  type: 'logarithmic',
                  ticks: {
                    min: 10,
                    max: 20000,
                    callback: function(value, index) {
                      // Define which frequencies to show
                      const showFrequencies = [10, 20, 30, 40, 60, 80, 100, 200, 400, 600, 1000, 2000, 4000, 6000, 8000, 10000, 20000];
                      
                      // Only show labels for specified frequencies
                      if (!showFrequencies.includes(value)) {
                        return '';
                      }
                      
                      // Format the label
                      if (value >= 1000) {
                        return (value / 1000) + 'k';
                      }
                      return value.toString();
                    },
                    minRotation: 0,
                    maxRotation: 50
                  },
                  scaleLabel: {
                    display: true,
                    labelString: 'Frequency (Hz)'
                  },
                  gridLines: {
                    color: gridLinesColor.value
                  }
                }]
              },
              tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                  title: function(tooltipItems) {
                    return tooltipItems.map(tooltipItem => tooltipItem.xLabel.toFixed(2) + ' Hz');
                  },
                  label: function(tooltipItem, data) {
                    return `${data.datasets[tooltipItem.datasetIndex].label}: ${tooltipItem.yLabel.toFixed(2)} dB`;
                  }
                }
              },
              legend: {
                display: false
              }
            }
          });
        }, 100)
      });

      function clearData(tmpSeriesData) {
        for (let i = 0; i < tmpSeriesData.data.length; i++) {
          tmpSeriesData.data[i].x = 0;
          tmpSeriesData.data[i].y = 0;
        }
      }

      function intializeData() {
        const data = [];

        for (let i = 0; i < NUM_SAMPLES; i++) {
          data.push({x: 0, y: 0});
        }

        return data;
      }

      function initializeSingleSeriesData(label, color) {

        const singleSeriesData = {
          pointBackgroundColor: 'rgba(0,0,0,0)',
          pointBorderColor: 'rgba(0,0,0,0)',
          pointRadius: 16,
          borderWidth: 2,
        };

        singleSeriesData.label = label;
        singleSeriesData.data = intializeData();
        singleSeriesData.borderColor = getBorderColor(color);
        singleSeriesData.backgroundColor = getBackgroundColor(color);

        return singleSeriesData;
      }

      watch(
        props,
        newProps => {
          const newSettings = {
            bassFreq: newProps.bassFreq,
            bassLevel: newProps.bassLevel,
            trebleFreq: newProps.trebleFreq,
            trebleLevel: newProps.trebleLevel,
            toneEnabled: newProps.toneEnabled,
          };
          
          if (!isEqual(newSettings, localToneSettings.value)) {
            debouncedUpdateChart();
            localToneSettings.value = cloneDeep(newSettings);
          }
        },
        {
          deep: true
        }
      )

      function updateChartData(datasets) {
        if (datasets.length > 0) { // update existing
          datasets[0].borderColor = getBorderColor(responseColor.value);
          datasets[0].backgroundColor = getBackgroundColor(responseColor.value);
          computeCombinedSeriesData(datasets[0]);
        } else { // initialize all
          datasets.push(initializeSingleSeriesData('Response', responseColor.value));
          computeCombinedSeriesData(datasets[0]);
        }
      }

      function updateChart() {
          if (myChart) {
            myChart.options.scales.yAxes[0].gridLines.color = gridLinesColor.value;
            myChart.options.scales.xAxes[0].gridLines.color = gridLinesColor.value;
            updateChartData(myChart.chart.config.data.datasets);
            myChart.chart.update();
         }
      }

      const debouncedUpdateChart = debounce(updateChart, 500, {
        maxWait: 500,
        leading: true,
        trailing: true,
      });

      function computeSingleSeriesData(tmpSeriesData, label, center, gain, filterType) {
        clearData(tmpSeriesData);

        // Use Q of 0.707 (Butterworth) for tone controls
        let q = 0.707;
        let sampleRate = 48000.0;

        let a0,a1,a2,b0,b1,b2;

        let A = Math.pow(10, gain / 40);
        let w0 = 2 * Math.PI * center / sampleRate;
        let cosw0 = Math.cos(w0);
        let sinw0 = Math.sin(w0);
        let alpha;
        let S;

        let len = NUM_SAMPLES;

        let Q = Math.max(q, 1e-6);

        if (filterType === 1) { // LS (low shelf)
          S = Q;

          alpha = sinw0 / 2 * Math.sqrt(
            (A + 1 / A) * (1 / S - 1) + 2
          );

          b0 =    A * ((A + 1) - (A - 1) * cosw0 + 2 * Math.sqrt(A) * alpha);
          b1 =  2*A * ((A - 1) - (A + 1) * cosw0);
          b2 =    A * ((A + 1) - (A - 1) * cosw0 - 2 * Math.sqrt(A) * alpha);
          a0 =         (A + 1) + (A - 1) * cosw0 + 2 * Math.sqrt(A) * alpha;
          a1 =   -2 * ((A - 1) + (A + 1) * cosw0);
          a2 =         (A + 1) + (A - 1) * cosw0 - 2 * Math.sqrt(A) * alpha;
        } else if (filterType === 2) { // HS (high shelf)
          S = Q;

          alpha = sinw0 / 2 * Math.sqrt(
            (A + 1 / A) * (1 / S - 1) + 2
          );

          b0 =    A * ((A + 1) + (A - 1) * cosw0 + 2 * Math.sqrt(A) * alpha);
          b1 = -2*A * ((A - 1) + (A + 1) * cosw0);
          b2 =    A * ((A + 1) + (A - 1) * cosw0 - 2 * Math.sqrt(A) * alpha);
          a0 =         (A + 1) - (A - 1) * cosw0 + 2 * Math.sqrt(A) * alpha;
          a1 =    2 * ((A - 1) - (A + 1) * cosw0);
          a2 =         (A + 1) - (A - 1) * cosw0 - 2 * Math.sqrt(A) * alpha;
        }

        // normalize
        b0 /= a0;
        b1 /= a0;
        b2 /= a0;
        a1 /= a0;
        a2 /= a0;

        for (let i = 0; i < len; i++) {
          // Calculate frequency logarithmically from 10 Hz to 20000 Hz
          let f = 10 * Math.pow(2000, i / (len - 1)); // 10 * (2000^t) where t goes from 0 to 1
          let phi = Math.pow((Math.sin(2.0 * Math.PI * f / (2.0 * sampleRate))), 2.0);
          let r = (Math.pow(b0 + b1 + b2, 2.0) - 4.0 * (b0 * b1 + 4.0 * b0 * b2 + b1 * b2) * phi + 16.0 * b0 * b2 * phi * phi) / (Math.pow(1.0 + a1 + a2, 2.0) - 4.0 * (a1 + 4.0 * a2 + a1 * a2) * phi + 16.0 * a2 * phi * phi);
          r = (r < 0)?0:r;
          r = Math.sqrt(r);
          try {
            r = 20 * Math.log10(r)
          } catch(e) {
            r = -100;
          }
          if(!isFinite(r) || isNaN(r)) {
            r = -100;
          }

          tmpSeriesData.data[i] = {
            x: f,
            y: r
          };
        }
      }

      function computeCombinedSeriesData(tmpSeriesData) {
        clearData(tmpSeriesData);

        let sampleRate = 48000.0;
        let len = NUM_SAMPLES;

        // Compute bass shelf coefficients
        let bassGain = props.bassLevel;
        let bassFreq = props.bassFreq;
        let A_bass = Math.pow(10, bassGain / 40);
        let w0_bass = 2 * Math.PI * bassFreq / sampleRate;
        let cosw0_bass = Math.cos(w0_bass);
        let sinw0_bass = Math.sin(w0_bass);
        let Q_bass = 0.707;
        let S_bass = Q_bass;
        let alpha_bass = sinw0_bass / 2 * Math.sqrt((A_bass + 1 / A_bass) * (1 / S_bass - 1) + 2);

        let b0_bass =    A_bass * ((A_bass + 1) - (A_bass - 1) * cosw0_bass + 2 * Math.sqrt(A_bass) * alpha_bass);
        let b1_bass =  2*A_bass * ((A_bass - 1) - (A_bass + 1) * cosw0_bass);
        let b2_bass =    A_bass * ((A_bass + 1) - (A_bass - 1) * cosw0_bass - 2 * Math.sqrt(A_bass) * alpha_bass);
        let a0_bass =         (A_bass + 1) + (A_bass - 1) * cosw0_bass + 2 * Math.sqrt(A_bass) * alpha_bass;
        let a1_bass =   -2 * ((A_bass - 1) + (A_bass + 1) * cosw0_bass);
        let a2_bass =         (A_bass + 1) + (A_bass - 1) * cosw0_bass - 2 * Math.sqrt(A_bass) * alpha_bass;

        // normalize bass
        b0_bass /= a0_bass;
        b1_bass /= a0_bass;
        b2_bass /= a0_bass;
        a1_bass /= a0_bass;
        a2_bass /= a0_bass;

        // Compute treble shelf coefficients
        let trebleGain = props.trebleLevel;
        let trebleFreq = props.trebleFreq;
        let A_treble = Math.pow(10, trebleGain / 40);
        let w0_treble = 2 * Math.PI * trebleFreq / sampleRate;
        let cosw0_treble = Math.cos(w0_treble);
        let sinw0_treble = Math.sin(w0_treble);
        let Q_treble = 0.707;
        let S_treble = Q_treble;
        let alpha_treble = sinw0_treble / 2 * Math.sqrt((A_treble + 1 / A_treble) * (1 / S_treble - 1) + 2);

        let b0_treble =    A_treble * ((A_treble + 1) + (A_treble - 1) * cosw0_treble + 2 * Math.sqrt(A_treble) * alpha_treble);
        let b1_treble = -2*A_treble * ((A_treble - 1) + (A_treble + 1) * cosw0_treble);
        let b2_treble =    A_treble * ((A_treble + 1) + (A_treble - 1) * cosw0_treble - 2 * Math.sqrt(A_treble) * alpha_treble);
        let a0_treble =         (A_treble + 1) - (A_treble - 1) * cosw0_treble + 2 * Math.sqrt(A_treble) * alpha_treble;
        let a1_treble =    2 * ((A_treble - 1) - (A_treble + 1) * cosw0_treble);
        let a2_treble =         (A_treble + 1) - (A_treble - 1) * cosw0_treble - 2 * Math.sqrt(A_treble) * alpha_treble;

        // normalize treble
        b0_treble /= a0_treble;
        b1_treble /= a0_treble;
        b2_treble /= a0_treble;
        a1_treble /= a0_treble;
        a2_treble /= a0_treble;

        for (let i = 0; i < len; i++) {
          // Calculate frequency logarithmically from 10 Hz to 20000 Hz
          let f = 10 * Math.pow(2000, i / (len - 1)); // 10 * (2000^t) where t goes from 0 to 1
          let phi = Math.pow((Math.sin(2.0 * Math.PI * f / (2.0 * sampleRate))), 2.0);
          
          // Bass response
          let r_bass = (Math.pow(b0_bass + b1_bass + b2_bass, 2.0) - 4.0 * (b0_bass * b1_bass + 4.0 * b0_bass * b2_bass + b1_bass * b2_bass) * phi + 16.0 * b0_bass * b2_bass * phi * phi) / (Math.pow(1.0 + a1_bass + a2_bass, 2.0) - 4.0 * (a1_bass + 4.0 * a2_bass + a1_bass * a2_bass) * phi + 16.0 * a2_bass * phi * phi);
          r_bass = (r_bass < 0)?0:r_bass;
          r_bass = Math.sqrt(r_bass);
          
          // Treble response
          let r_treble = (Math.pow(b0_treble + b1_treble + b2_treble, 2.0) - 4.0 * (b0_treble * b1_treble + 4.0 * b0_treble * b2_treble + b1_treble * b2_treble) * phi + 16.0 * b0_treble * b2_treble * phi * phi) / (Math.pow(1.0 + a1_treble + a2_treble, 2.0) - 4.0 * (a1_treble + 4.0 * a2_treble + a1_treble * a2_treble) * phi + 16.0 * a2_treble * phi * phi);
          r_treble = (r_treble < 0)?0:r_treble;
          r_treble = Math.sqrt(r_treble);
          
          // Combined response (multiply the two filters)
          let r = r_bass * r_treble;
          
          try {
            r = 20 * Math.log10(r)
          } catch(e) {
            r = -100;
          }
          if(!isFinite(r) || isNaN(r)) {
            r = -100;
          }

          tmpSeriesData.data[i] = {
            x: f,
            y: r
          };
        }
      }

      function ntrp(x,xa,xb,ya,yb) {
        var q = xb-xa;
        if(q == 0) return 0;
        return (x-xa) * (yb-ya)/q + ya;
      }

      function convertLogScale(x,a,b) {
        x = ntrp(x,a,b,0,1);
        x = (Math.pow(x+1,11))/2048;
        x = ntrp(x,0,1,a,b);
        return x;
      }

      return { props, chartRef, gridLinesColor };
    }
  }
</script>

<style scoped>
  .chart-container {
    min-height: 400px;
  }
</style>
