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
      },
      darkMode: {
        type: Boolean, 
        default: false,
      }
    },
    setup(props) {

      const chartRef = ref(null);
      const exportData = ref([]);
      const localPeqSlots = ref([]);
      let myChart = null;

      const gridLinesColor = computed(() => props.darkMode ? '#333' : '#ccc');

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
                    suggestedMin: -5,
                    suggestedMax: 5,
                  },
                  gridLines: {
                    color: gridLinesColor.value,
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
                        if (index % 2 !== 0) {
                          return '';
                        }
                      } else {
                        if (index % 2 === 0) {
                          return '';
                        }
                        
                      }

                      return parts[0] + (parts.length > 1 ? 'k':'');
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
                position: 'bottom'
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
          pointRadius: selected ? 32 : 16,
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

      watch(
        props,
        newProps => {
          if (newProps.peqSlots) {
            const channelsToUpdate = new Set(newProps.activeChannels.filter(channel => {
              for (let band = 0; band < newProps.peqSlots.length; band++) {
                if (!isEqual(newProps.peqSlots[band].channels[channel], localPeqSlots.value[band]?.channels[channel])) {
                  return true;
                }
              }

              return false;
            }));
            debouncedUpdateChart(channelsToUpdate);
            localPeqSlots.value = cloneDeep(newProps.peqSlots);
          }
        }
      )

      function updateChartData(datasets, channelsToUpdate) {
        if (datasets.length > 0) { // update single channel
          for (let i = 0; i < props.activeChannels.length; i++) {
            // update line thickness of all channels
            updateChartChannelActive(datasets[i], props.activeChannels[i]);

            if (channelsToUpdate.has(props.activeChannels[i])) {
              computeSingleSeriesData(
                datasets[i], 
                props.activeChannels[i]
              );
            }
          }

        } else { // initialize all channels

          for (let i = 0; i < props.activeChannels.length; i++) {
            const ch = props.activeChannels[i];
            datasets.push(initializeSingleSeriesData(ch, i));
            computeSingleSeriesData(
              datasets[datasets.length-1], ch
            );
          }
        }
      }

      function updateChart(channelsToUpdate) {
          if (myChart) {
            myChart.options.scales.yAxes[0].gridLines.color = gridLinesColor.value;
            myChart.options.scales.xAxes[0].gridLines.color = gridLinesColor.value;
            updateChartData(myChart.chart.config.data.datasets, channelsToUpdate);
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

        // https://arachnoid.com/BiQuadDesigner/index.html

        for (let j = 0; j < props.peqSlots.length; j++) {

            let val = props.peqSlots[j].channels[ch];
            let center = val.Fc;
            let gain = val.gaindB;
            let q = val.Q;
            let filterType = val.FilterType;
            let sampleRate = 48000.0;

            let a0,a1,a2,b0,b1,b2;
            let ymin, ymax, minVal, maxVal;

            // let V = Math.pow(10, Math.abs(gain) / 20);
            // let K = Math.tan(Math.PI * center / sampleRate);
            let gainAbs = Math.pow(10, gain / 40);
            let omega = 2 * Math.PI * center / sampleRate;
            let sn = Math.sin(omega);
            let cs = Math.cos(omega);
            let alpha = sn / (2 * q);
            let beta = Math.sqrt(gainAbs + gainAbs);

            let len = NUM_SAMPLES;

            switch(filterType) {
              case 0: // peak
                  b0 = 1 + (alpha * gainAbs);
                  b1 = -2 * cs;
                  b2 = 1 - (alpha * gainAbs);
                  a0 = 1 + (alpha / gainAbs);
                  a1 = -2 * cs;
                  a2 = 1 - (alpha / gainAbs);
                break;
              case 1: // LS
                b0 = gainAbs * ((gainAbs + 1) - (gainAbs - 1) * cs + beta * sn);
                b1 = 2 * gainAbs * ((gainAbs - 1) - (gainAbs + 1) * cs);
                b2 = gainAbs * ((gainAbs + 1) - (gainAbs - 1) * cs - beta * sn);
                a0 = (gainAbs + 1) + (gainAbs - 1) * cs + beta * sn;
                a1 = -2 * ((gainAbs - 1) + (gainAbs + 1) * cs);
                a2 = (gainAbs + 1) + (gainAbs - 1) * cs - beta * sn;
                break;
              case 2: // HS
                b0 = gainAbs * ((gainAbs + 1) + (gainAbs - 1) * cs + beta * sn);
                b1 = -2 * gainAbs * ((gainAbs - 1) + (gainAbs + 1) * cs);
                b2 = gainAbs * ((gainAbs + 1) + (gainAbs - 1) * cs - beta * sn);
                a0 = (gainAbs + 1) - (gainAbs - 1) * cs + beta * sn;
                a1 = 2 * ((gainAbs - 1) - (gainAbs + 1) * cs);
                a2 = (gainAbs + 1) - (gainAbs - 1) * cs - beta * sn;
                break;
            }

            // by prescaling filter constants, eliminate one variable
            b0 /= a0;
            b1 /= a0;
            b2 /= a0;
            a1 /= a0;
            a2 /= a0;


            for (let i = 0; i < len; i++) {
              let ix = convertLogScale(i, 0, len);
              let f = ntrp(ix, 0, len, 0, sampleRate / 2);
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
              // let w = Math.exp(Math.log(1 / 0.0001) * i / (len - 1)) * 0.0001 * Math.PI;  // 0.0001 to 1, times pi, log scale
              // let w = i / (len - 1) * Math.PI; // 0 to pi, linear scale
              // let phi = Math.pow(Math.sin(w/2), 2);
              // let y = Math.log(Math.pow(a0+a1+a2, 2) - 4*(a0*a1 + 4*a0*a2 + a1*a2)*phi + 16*a0*a2*phi*phi) - Math.log(Math.pow(1+b1+b2, 2) - 4*(b1 + 4*b2 + b1*b2)*phi + 16*b2*phi*phi);
              // y = y * 10 / Math.LN10;



              // if (y == -Infinity) {
              //   y = -200;
              // }

              // let x = Math.exp(Math.log(1 / 0.0001) * (i / (len - 1))) * 0.0001 * sampleRate * .5;

              // if (x > 19) {
                tmpSeriesData.data[i] = {
                  // x: i / (len - 1) / 2 ,
                  // x: i / (len - 1) * sampleRate / 2, 
                  // x: x,
                  // y: (tmpSeriesData.data[i].y) + y
                  x: f,
                  y: (tmpSeriesData.data[i].y) + r
                };

                // console.log('?', i, f, r);
              // }

              if (i == 0) {
                minVal = maxVal = r;
              }
              else if (r < minVal) {
                minVal = r;
              }
              else if (r > maxVal) {
                maxVal = r;
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

        if (props.activeChannels[props.selectedChannel] === ch) {
          exportData.value = cloneDeep(tmpSeriesData.data);
          // console.log('export', exportData.value, ch)
        }

        // filter out of bounds points

        // let startIndex = 0;
        // let minPoint;
        // for (let i = 0; i < tmpSeriesData.data.length; i++) {
        //   if (tmpSeriesData.data[i].x > 19) {
        //     startIndex = i;
        //     minPoint = tmpSeriesData.data[i];
        //     break;  
        //   }
        // }

        // for (let i = 0; i < startIndex; i++) {
        //   tmpSeriesData.data[i] = {
        //     x: minPoint.x,
        //     y: minPoint.y,
        //   }
        // }

        // console.log('compute', ch, props.activeChannels[props.selectedChannel], props.peqSlots, tmpSeriesData);

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

      return { props, chartRef, options, gridLinesColor, exportData };
    }
  }
</script>

<style scoped>
  .chart-container {
    min-height: 400px;
  }
</style>