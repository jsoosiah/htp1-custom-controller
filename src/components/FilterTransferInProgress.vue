<template>
  <div 
    id="settingsModal" 
    class="modal fade show" 
    tabindex="-1" 
    aria-labelledby="settingsModalLabel"
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content bg-dark">
        <div class="modal-header text-white">
          <h4 class="modal-title">
            Please Wait
          </h4>
        </div>
        <div class="modal-body text-center text-white">
          <p>
            Dirac Live filter transfer is currently in progress for speaker layout {{ mso.cal?.currentLayout }}.

            <div class="progress-outer-container">
              <div class="progress-inner-container">
                <span
                  class="spinner-border text-primary"
                  role="status"
                  style="width: 130px; height: 130px;margin-top:10px"
                >
                  <span class="sr-only">Loading...</span>
                </span>
              </div>
              <div class="progressbarjs"></div>
            </div>
          </p>
          <p class="small">
            Estimated time remaining: {{ formattedEtr }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import { ref, watch, computed, onMounted } from 'vue';
  import ProgressBar from 'progressbar.js';
  import makeEta from 'simple-eta';

  import useMso from '@/use/useMso.js';

  export default {
    name: 'FilterTransferInProgress',
    setup(props) {
      let progressBar = null;
      const { mso } = useMso();
      let eta = null;
      const etr = ref(0);
      let previousProgress = 0;

      onMounted(() => {
        console.log('FilterTransferInProgress onMounted', mso?.value.cal.filterxferpercentage);
        eta = makeEta({ min: mso?.value.cal.filterxferpercentage, max: 100, historyTimeConstant: 2.5 });
        eta.reset();
        eta.start();

        progressBar = new ProgressBar.Circle('.progressbarjs', {
          strokeWidth: 8,
          color: '#007bff',
          easing: 'easeOut',
          step: (state, bar) => {
            bar.setText(Math.round(bar.value() * 100) + '%');
          },
          text: {
            style: {
              position: 'absolute',
              left: '50%',
              top: '50%',
              padding: '0px',
              margin: '0px',
              transform: 'translate(-50%, -50%)',
              color: '#dedad6',
              'font-size': '25px'
            },
          },
        });

        watch(() => mso?.value.cal.filterxferpercentage, (newProgress) => {
          if (newProgress !== null) {
            if (newProgress < previousProgress) {
              eta = makeEta({ min: mso?.value.cal.filterxferpercentage, max: 100, historyTimeConstant: 2.5 });
              eta.reset();
              eta.start();
            }

            previousProgress = newProgress;
            progressBar?.animate(newProgress / 100);
            eta.report(newProgress);
            etr.value = eta.estimate();
            console.log(`newProgress, progress=${newProgress}, etr=${etr.value}`);
          }
        }, {
          immediate: true
        });
      });

      const loading1 = computed(() => {
        return `rotate(${Math.round(Math.min(mso?.value.cal.filterxferpercentage, 50) / 50  * 180)}deg)`;
      });

      const loading2 = computed(() => {
        return `rotate(${Math.round(Math.min(Math.max(mso?.value.cal.filterxferpercentage - 50, 0), 50) / 50  * 180)}deg)`;
      });

      const formattedEtr = computed(() => {
        // don't show estimate until stable, at least 10% is reached
        if (isFinite(etr.value) && mso?.value.cal.filterxferpercentage >= 10) {
          const roundedSeconds = Math.round(etr.value);
          const minutes = Math.floor(roundedSeconds / 60);
          const seconds = roundedSeconds % 60;
          return `${minutes} minutes, ${seconds} seconds`;
        }

        return 'Please wait';
      });

      return { mso, loading1, loading2, etr, formattedEtr };
    }
  }
</script>

<style scoped>
  div {
    color: #212529;
  }

  .modal {
    display: block;
  }

  .modal-header {
    border-bottom:1px solid #212529;
  }

  .text-white {
    color:#dedad6 !important;
    /* background-color: #212529; */
  }

  input#select-ip.form-control.bg-dark {
    background-color: #212529 !important;
    border-color:rgba(255,255,255,.25);
  }

  small {
    color: rgba(255,255,255,.5) !important;
  }

  a {
    font-weight: bold;
    color: rgba(255,255,255,.75);
  }

  .progress-outer-container {
    position:relative;
    height:150px;
    width:150px;
    margin-left:auto;
    margin-right:auto;
    margin-top:3rem;
    margin-bottom:3rem;
  }

  .progress-inner-container {
    width: 150px;
    height: 150px;
    position:absolute;
    margin-left:auto;
    margin-right:auto;
    z-index:9;
    opacity: 0.5; 
  }
</style>