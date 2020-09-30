<template>
  <div class="card">
    <div class="card-header" @click="toggleShow">
      <div class="row">
        <div class="col-auto">
          <h2 class="mb-0">
            <button class="btn btn-link btn-block text-left" type="button">
              {{commandKey}} 
            </button>
          </h2>
        </div>
        <div class="col-auto">
          <small class="text-muted">({{currentCommands.length}} commands)</small>
        </div>
        <div class="col-auto">
          <div v-if="touched">
            <div v-if="unsavedChanges" class="alert alert-warning small">You have unsaved changes.</div>
            <div v-else class="alert alert-success small">Changes saved successfully.</div>
          </div>
        </div>
      </div>
    </div>

    <div id="collapseOne" class="collapse" :class="{'show': show || currentlyRecordingSlot === props.commandKey}">
      <div class="card-body">
        <two-state-button 
          :button-text="`Recording: ${currentlyRecordingSlot === props.commandKey ? 'On' : 'Off'}`"
          :state-on="currentlyRecordingSlot === props.commandKey"
          @btn-click="toggleRecording"
        />
        <div class="my-3">
          <div class="container"  v-if="currentCommands.length > 0">
            <draggable class="dragArea list-group w-full" :list="currentCommands" @change="setTouched">
              <div class="row" v-for="(command, index) in currentCommands" :key="command">
                <div class="col-auto"><font-awesome-icon size="lg" :icon="['fas', 'grip-lines']" :style="{ color: '#343a40' }" /></div>
                <div class="col"><code>{{index + 1}}</code></div>
                <div class="col"><code>{{command.op}}</code></div>
                <div class="col"><code>{{command.path}}</code></div>
                <div class="col"><code>{{command.value}}</code></div>
                <div class="col-auto">
                  <button 
                    class="btn btn-sm btn-danger"
                    @click="removeRecordedCommand(index)"
                  >
                    <font-awesome-icon size="lg" :icon="['fas', 'times']" />
                  </button>
                </div>
              </div>
            </draggable>
          </div>
          <div class="alert alert-info small" v-if="currentCommands.length === 0">No commands recorded yet.</div>
        </div>
        <button class="btn btn-sm btn-primary" @click="save" :disabled="!unsavedChanges">
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { watch, ref, computed } from 'vue';
  import { compare } from 'fast-json-patch/index.mjs';
  import { VueDraggableNext } from 'vue-draggable-next'

  import useMso from '@/use/useMso.js';

  import TwoStateButton from './buttons/TwoStateButton.vue';

  export default {
    name: 'MacroEditor',
    props: {
      commandKey: {
        required: true,
        type: String,
      }
    },
    setup(props) {

      const { mso, data, parseMSO, 
        currentlyRecordingSlot, setRecordingStarted, setRecordingStopped, saveRecordedCommands } = useMso();

      const show = ref(false);
      const touched = ref(false);
      let stopRecordingWatch;

      const currentCommands = ref([...mso.value.svronly[props.commandKey]]);

      const unsavedChanges = computed(() => {
        console.log('unsaved changes compare', compare(mso.value.svronly[props.commandKey], currentCommands.value));
        return compare(mso.value.svronly[props.commandKey], currentCommands.value).length > 0;
      });

      function startRecordingWatch() {
        if (stopRecordingWatch) {
          stopRecordingWatch();
        }
        stopRecordingWatch = watch(
          data, 
          val => {
            const { verb, arg } = parseMSO(val);
              if (verb === 'mso') { // receive update after saving command
              currentCommands.value = [...mso.value.svronly[props.commandKey]];
              setTimeout(() => { touched.value = false; }, 3000);
              
              setRecordingStopped();
              if (stopRecordingWatch) {
                stopRecordingWatch();
              }

            } else if (verb === 'msoupdate' && Array.isArray(arg)) { // record incoming commands
              const newCommands = arg.filter(
                cmd => cmd.path.search(/status|videostat|stat|svronly|versions|ipInfo|hostip|bluetooth/) < 0
              );

              if (newCommands.length > 0) {
                addRecordedCommands(newCommands)
              }
            }
          }
        );
      }

      function toggleRecording() {
        if (currentlyRecordingSlot.value === props.commandKey) {
          setRecordingStopped();
          if (stopRecordingWatch) {
            stopRecordingWatch();
          }
        } else {
          setRecordingStarted(props.commandKey);
          startRecordingWatch();
        }
      }

      function addRecordedCommands(newCommands) {
        console.log('addRecordedCommands');
        setTouched();
        currentCommands.value = [...currentCommands.value, ...newCommands];
      }

      function removeRecordedCommand(index) {
        console.log('removeRecordedCommands');
        setTouched();
        const copy = [...currentCommands.value];
        copy.splice(index, 1);
        currentCommands.value = copy;
      }

      function toggleShow() {
        show.value = !show.value;
      }

      function save() {
        startRecordingWatch();
        saveRecordedCommands(props.commandKey, currentCommands.value);
      }

      function setTouched() {
        touched.value = true;
      }

      return { mso, data, props, toggleRecording, removeRecordedCommand, show, toggleShow,
      currentlyRecordingSlot, currentCommands, unsavedChanges, saveRecordedCommands, touched, save, setTouched };
    },
    components: {
      TwoStateButton,
      draggable: VueDraggableNext,
    },
    emits: ['recording-started', 'recording-stopped']
  }
</script>

<style scoped>
  .card-body {
    /* padding: 0; */
  }

  code {
    color: inherit;
  }

  .row {
    align-items: center;
  }

  th {
    font-size: 80%;
  }

  .dragArea .row {
    padding: .3rem .3rem;
  }

  .dragArea .row:nth-of-type(odd) {
    background-color: rgba(0,0,0,.05);
  }

  .alert {
    margin: 0;
  }

</style>