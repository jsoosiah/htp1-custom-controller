<template>
  <Highcharts ref="highchartsRef" :options="options"></Highcharts>
</template>

<script>

  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import { debounce } from 'lodash-es';

  const NUM_SAMPLES = 128;

  export default {
    name: 'EqChart',
    props: {
      peqSlots: {
        type: Array,
        required: true
      },
      activeChannels: {
        type: Array,
        required: true
      },
      selectedChannel: {
        type: Number,
        required: true
      },
      spkName: {
        type: Function,
        required: true
      }
    },
    setup(props) {

      const highchartsRef = ref(null);

      function intializeData() {
        const data = [];

        for (let i = 0; i < NUM_SAMPLES; i++) {
          data.push({x: 0, y: 0});
        }

        return data;
      }

      function initializeSingleSeriesData(ch) {
        return {
          name: props.spkName(ch), 
          data: intializeData(),
          turboThreshold: NUM_SAMPLES,
          type: 'line'
        };
      }

      const stopPropWatch = watch(
        props,
        (newProps, oldProps) => {
          if (newProps.peqSlots) {
            debouncedUpdateChart();
          }
        }
      )

      watch(
        props.selectedChannel,
        (newSelectedChannel,oldSelectedChannel) => {
          console.log('watch selectedChannel', newSelectedChannel, oldSelectedChannel);
        }
      )

      function updateChart() {
          if (highchartsRef.value) {
            if (highchartsRef.value.chart.series.length > 0) { // update single channel
              highchartsRef.value.chart.series[props.selectedChannel].setData(
                computeSingleSeriesData(props.activeChannels[props.selectedChannel]).data, 
              );

            } else { // initialize all channels

              const newSeriesData = [];

              for (const ch of props.activeChannels) {
                highchartsRef.value.chart.addSeries(computeSingleSeriesData(ch), false);
              }

              highchartsRef.value.chart.redraw(true);
            }
         }
      }

      const debouncedUpdateChart = debounce(updateChart, 500, {
        maxWait: 500,
        leading: true,
        trailing: true,
      });

      function computeSingleSeriesData(ch) {
        
        const tmpSeriesData = initializeSingleSeriesData(ch);

        // https://www.earlevel.com/main/2013/10/13/biquad-calculator-v2/

        for (let j = 0; j < props.peqSlots.length; j++) {

            let val = props.peqSlots[j].channels[ch];
            let center = val.Fc;
            let gain = val.gaindB;
            let q = val.Q;
            let filterType = val.FilterType;
            let sampleRate = 40000.0;

            let a0,a1,a2,b1,b2,norm;
            let ymin, ymax, minVal, maxVal;

            let V = Math.pow(10, Math.abs(gain) / 20);
            let K = Math.tan(Math.PI * center / sampleRate);
            let len = NUM_SAMPLES;

            switch(filterType) {
              case 0: // peak
                if (gain >= 0) {
                  norm = 1 / (1 + 1/q * K + K * K);
                  a0 = (1 + V/q * K + K * K) * norm;
                  a1 = 2 * (K * K - 1) * norm;
                  a2 = (1 - V/q * K + K * K) * norm;
                  b1 = a1;
                  b2 = (1 - 1/q * K + K * K) * norm;
                }
                else {  
                  norm = 1 / (1 + V/q * K + K * K);
                  a0 = (1 + 1/q * K + K * K) * norm;
                  a1 = 2 * (K * K - 1) * norm;
                  a2 = (1 - 1/q * K + K * K) * norm;
                  b1 = a1;
                  b2 = (1 - V/q * K + K * K) * norm;
                }
                break;
              case 1: // LS
                if (gain >= 0) {
                  norm = 1 / (1 + Math.SQRT2 * K + K * K);
                  a0 = (1 + Math.sqrt(2*V) * K + V * K * K) * norm;
                  a1 = 2 * (V * K * K - 1) * norm;
                  a2 = (1 - Math.sqrt(2*V) * K + V * K * K) * norm;
                  b1 = 2 * (K * K - 1) * norm;
                  b2 = (1 - Math.SQRT2 * K + K * K) * norm;
                }
                else {  
                  norm = 1 / (1 + Math.sqrt(2*V) * K + V * K * K);
                  a0 = (1 + Math.SQRT2 * K + K * K) * norm;
                  a1 = 2 * (K * K - 1) * norm;
                  a2 = (1 - Math.SQRT2 * K + K * K) * norm;
                  b1 = 2 * (V * K * K - 1) * norm;
                  b2 = (1 - Math.sqrt(2*V) * K + V * K * K) * norm;
                }
                break;
              case 2: // HS
                if (gain >= 0) {
                    norm = 1 / (1 + Math.SQRT2 * K + K * K);
                    a0 = (V + Math.sqrt(2*V) * K + K * K) * norm;
                    a1 = 2 * (K * K - V) * norm;
                    a2 = (V - Math.sqrt(2*V) * K + K * K) * norm;
                    b1 = 2 * (K * K - 1) * norm;
                    b2 = (1 - Math.SQRT2 * K + K * K) * norm;
                }
                else {  
                    norm = 1 / (V + Math.sqrt(2*V) * K + K * K);
                    a0 = (1 + Math.SQRT2 * K + K * K) * norm;
                    a1 = 2 * (K * K - 1) * norm;
                    a2 = (1 - Math.SQRT2 * K + K * K) * norm;
                    b1 = 2 * (K * K - V) * norm;
                    b2 = (V - Math.sqrt(2*V) * K + K * K) * norm;
                } 
                break;
            }

            for (let i = 0; i < len; i++) {
              let w = Math.exp(Math.log(1 / 0.001) * i / (len - 1)) * 0.001 * Math.PI;  // 0.001 to 1, times pi, log scale
              // let w = i / (len - 1) * Math.PI; // 0 to pi, linear scale
              let phi = Math.pow(Math.sin(w/2), 2);
              let y = Math.log(Math.pow(a0+a1+a2, 2) - 4*(a0*a1 + 4*a0*a2 + a1*a2)*phi + 16*a0*a2*phi*phi) - Math.log(Math.pow(1+b1+b2, 2) - 4*(b1 + 4*b2 + b1*b2)*phi + 16*b2*phi*phi);
              y = y * 10 / Math.LN10;
              if (y == -Infinity) {
                y = -200;
              }

              tmpSeriesData.data[i] = {
                // x: i / (len - 1) / 2 ,
                // x: i / (len - 1) * sampleRate / 2, 
                x: Math.exp(Math.log(1 / 0.001) * (i / (len - 1) / 2) * 2) * 0.001 * sampleRate * .5,
                y: (tmpSeriesData.data[i].y) + y
              };

              if (i == 0) {
                minVal = maxVal = y;
              }
              else if (y < minVal) {
                minVal = y;
              }
              else if (y > maxVal) {
                maxVal = y;
              }
            }

            ymin = -10;
            ymax = 10;

            if (maxVal > ymax) {
              ymax = maxVal;
            } else if (minVal < ymin) {
              ymin = minVal;
            }
        }

        // console.log('compute', ch, props.peqSlots, tmpSeriesData);

        return tmpSeriesData;
      }

      const options = {
        title: {
          text: null,
        },
        animation: {
            duration: 20,
        },
        xAxis: {
          title: 'Frequency (Hz)',
          tickInterval: .2,
          type: 'logarithmic',
          accessibility: {
              rangeDescription: 'Range: 10 Hz to 20000 Hz'
          },
          max: 20000,
          min: 20,
        },
        yAxis: {
          title: {
            text: 'Gain (dB)'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },
        tooltip: {
          valueSuffix: ' dB',
          valueDecimals: 2,
        },
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'top',
          borderWidth: 0
        },
        series: [],
        credits: false,
      };

      return { props, highchartsRef, options };
    }
  }
</script>

<style scoped>
  
</style>