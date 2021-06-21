<template>
  <div
    :class="{'zoom-in': !isOpen, 'zoom-out': isOpen}"
    @click="isOpen = !isOpen"
  >
    <img
      v-bind="$attrs"
      style="width: 100%"
    >
    <div
      v-if="isOpen"
      class="connecting-overlay"
    >
      <div
        class="modal show"
        tabindex="-1"
      >
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-body">
              <img
                v-bind="$attrs"
                style="max-width:900px"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {

    const isOpen = ref(false);

    return { isOpen };
  }
}
</script>

<style scoped>

  .zoom-in {
    cursor:zoom-in;
  }

  .zoom-out {
    cursor: zoom-out;
  }

  .modal {
    display: block;
    /* position:relative; */
    /* overflow: auto; */
  }

  .modal-body {
    padding: 0;
  }

  .modal-content {
    background-color: transparent;
    border: 0;
  }

  .modal-dialog {
    max-width: 900px;
  }

  .connecting-overlay {
    width:200%;
    height:200%;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
    position:fixed;
    top:0;
    left:0;
  }

</style>