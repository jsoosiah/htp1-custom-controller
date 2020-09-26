<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script>

  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import { debounce } from 'lodash-es';
  import Chart from 'chart.js';

  const NUM_SAMPLES = 128;

  const COLOR_PALLETE = [
    [147,208,226],
    [229,174,174],
    [141,202,189],
    [216,191,227],
    [167,197,159],
    [136,174,225],
    [222,196,159],
    [149,187,239],
    [208,234,197],
    [169,174,206],
    [195,240,237],
    [232,211,202],
    [151,177,171],
    [192,206,230],
    [178,188,166],
    [178,204,198]
  ];

  function getBorderColor(index) {
    return `rgba(${COLOR_PALLETE[index][0]}, ${COLOR_PALLETE[index][1]}, ${COLOR_PALLETE[index][2]}, .5)`;
  }

  function getBackgroundColor(index) {
    return `rgba(${COLOR_PALLETE[index][0]}, ${COLOR_PALLETE[index][1]}, ${COLOR_PALLETE[index][2]}, .1)`;
  }

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

      const chartRef = ref(null);
      let myChart = null;

      onMounted(() => {

        const ctx = chartRef.value.getContext("2d");

        myChart = Chart.Line(ctx, {
          type: 'bar',
          data: {
                datasets: []
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
                      }
                  }],
                  xAxes: [{
                    type: 'logarithmic',
                    ticks: {
                      min: 20,
                      max: 20000,
                      callback: function(value, index) {
                        let formatted = value.toLocaleString('en-US');
                        let parts = formatted.split(',');
                        
                        if ((Math.floor(index / 9)) % 2 === 0) {
                          if (index % 2 === 0) {

                          } else {
                            return '';
                          }
                        } else {
                          if (index % 2 === 0) {
                            return '';
                          }
                          
                        }

                        return parts[0] + (parts.length > 1 ? 'k':'');
                      },
                    },
                    scaleLabel: {
                      display: true,
                      labelString: 'Frequency (Hz)'
                    }
                  }]
              },
              tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                  title: function(tooltipItems, data) {
                    return tooltipItems.map(tooltipItem => tooltipItem.xLabel.toFixed(2) + ' Hz');
                  },
                  label: function(tooltipItem, data) {
                    return `${data.datasets[tooltipItem.datasetIndex].label}: ${tooltipItem.yLabel.toFixed(2)} dB`;
                  }
                }
              },
              legend: {
                position: 'bottom'
              }
          }
        });
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

      function updateChartChannelActive(tmpSeriesData, ch) {
        const chartChannelActive = getChartChannelActive(ch);

        tmpSeriesData.pointBackgroundColor = chartChannelActive.pointBackgroundColor;
        tmpSeriesData.pointBorderColor = chartChannelActive.pointBorderColor;
        tmpSeriesData.pointRadius = chartChannelActive.pointRadius;
        tmpSeriesData.borderWidth = chartChannelActive.borderWidth;
      }

      function getChartChannelActive(ch) {

        const selected = ch === props.activeChannels[props.selectedChannel];

        return {
          pointBackgroundColor: 'rgba(0,0,0,0)',
          pointBorderColor: 'rgba(0,0,0,0)',
          pointRadius: selected ? 8 : 4,
          borderWidth: selected ? 8 : 2,
        }
      }

      function initializeSingleSeriesData(ch, index) {

        const singleSeriesData = getChartChannelActive(ch);

        singleSeriesData.label = props.spkName(ch);
        singleSeriesData.data = intializeData();
        singleSeriesData.borderColor = getBorderColor(index);
        singleSeriesData.backgroundColor = getBackgroundColor(index);

        return singleSeriesData;
      }

      const stopPropWatch = watch(
        props,
        (newProps, oldProps) => {
          if (newProps.peqSlots) {
            debouncedUpdateChart();
          }
        }
      )

      // watch(
      //   props.selectedChannel,
      //   (newSelectedChannel,oldSelectedChannel) => {
      //     console.log('watch selectedChannel', newSelectedChannel, oldSelectedChannel);
      //     updateChart();
      //   }
      // )

      function updateChart() {
          if (myChart) {
            console.log('myChart', myChart);
            if (myChart.chart.config.data.datasets.length > 0) { // update single channel
              for (let i = 0; i < props.activeChannels.length; i++) {
                console.log('i', i, props.selectedChannel, i === props.selectedChannel)
                // update line thickness of all channels
                updateChartChannelActive(myChart.chart.config.data.datasets[i], props.activeChannels[i]);

                if (i === props.selectedChannel) { // update plot for selected channel only
                  computeSingleSeriesData(
                    myChart.chart.config.data.datasets[props.selectedChannel], 
                    props.activeChannels[props.selectedChannel]
                  );
                }

                
              }

            } else { // initialize all channels

              const newSeriesData = [];

              for (let i = 0; i < props.activeChannels.length; i++) {
                const ch = props.activeChannels[i];
                myChart.chart.config.data.datasets.push(initializeSingleSeriesData(ch, i));
                computeSingleSeriesData(
                  myChart.chart.config.data.datasets[myChart.chart.config.data.datasets.length-1], 
                  ch
                );
              }
            }

            myChart.chart.update();
         }
      }

      const debouncedUpdateChart = debounce(updateChart, 500, {
        maxWait: 500,
        leading: true,
        trailing: true,
      });

      function computeSingleSeriesData(tmpSeriesData, ch) {
        // console.log('computeSingleSeriesData', tmpSeriesData, ch)
        clearData(tmpSeriesData);
        // console.log('cleared',tmpSeriesData);

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

        console.log('compute', ch, props.peqSlots, tmpSeriesData);

        // return tmpSeriesData;
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

      return { props, chartRef, options };
    }
  }
</script>

<style scoped>
  .chart-container {
    min-height: 400px;
  }
</style>