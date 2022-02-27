<template>
  <div class="container">
    <h3>Target Curve Transformer</h3>
    <div class="row">
      <div class="col">
        <div class="form-group">
          <label
            for="initial-target-curve"
            class="col-form-label col-form-label-sm "
          >Initial Target Curve</label>
          <textarea
            id="initial-target-curve"
            v-model="initialTargetCurve"
            class="form-control form-control-sm"
            aria-label="Initial Target Curve"
          />
        </div>
      </div>
      <div class="col">
        <label>Result</label>
        <pre>{{ transformedTargetCurve }}</pre>
        <button
          class="btn btn-sm btn-primary mb-3"
          @click="downloadResult"
        >
          Download Resulting Target Curve
        </button>
      </div>
    </div>

    <div class="row">
      <div class="col-6">
        <div class="form-group">
          <label
            for="scale-by"
            class="col-form-label col-form-label-sm "
          >
            Scale By
          </label>
          <input
            id="scale-by"
            v-model="scaleBy"
            type="number"
            class="form-control form-control-sm"
            step="0.1"
          >
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-6">
        <div class="form-group">
          <label
            for="shift-by"
            class="col-form-label col-form-label-sm "
          >
            Shift By
          </label>
          <input
            id="shift-by"
            v-model="shiftBy"
            type="number"
            class="form-control form-control-sm"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { ref, computed } from 'vue';
import { cloneDeep } from 'lodash-es';

import useImportExport from '@/use/useImportExport.js';

export default {
  name: 'TargetCurveTransformer',
  components: {
  },
  setup() {

    const { exportTextToFile } = useImportExport();

    const initialTargetCurve = ref('');
    const scaleBy = ref(1);
    const shiftBy = ref(0);

    const transformedTargetCurve = computed(() => {
      const lines = initialTargetCurve.value?.split('\n');
      console.log('lines?', lines);
      const allCols = lines.map(line => line.split(' '));
      
      const newCols = [];

      for (const line of allCols) {
        const newLine = cloneDeep(line);
        console.log('newLine before', newLine);
        const transformedValue = parseFloat(newLine[1]) * parseFloat(scaleBy.value) + parseFloat(shiftBy.value);

        if (!isNaN(transformedValue)) {
          newLine[1] = transformedValue.toFixed(5);
        } 

        newCols.push(newLine.join(' '));
      }

      return newCols.join('\n');
    });

    function downloadResult() {
      exportTextToFile(transformedTargetCurve.value, 'text/plain', 'transformed-target', 'txt');
    }

    return { initialTargetCurve, shiftBy, scaleBy, transformedTargetCurve, downloadResult };
  }
}
</script>

<style scoped>
  .btn {
    text-transform: uppercase;
    font-weight: 600;
  }

</style>
