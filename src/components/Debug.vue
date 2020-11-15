<template>
  <div
    class="fixed-top text-center"
    style="z-index: 9999999999999999"
  >
    <span class="sgen-on-warning">{{ state }}</span>
  </div>
  <div class="row">
    <div class="col">
      <h6>Commands To Send {{ commandsToSend.length }}</h6>
      <table class="table">
        <tbody>
          <tr v-for="cmd in commandsToSend">
            <td>{{ cmd.op }}</td>
            <td>{{ cmd.path }}</td>
            <td>{{ cmd.value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="col">
      <h6>Commands Received {{ commandsReceived.length }}</h6>
      <table class="table">
        <tbody>
          <tr v-for="cmd in commandsReceived">
            <td>{{ cmd.op }}</td>
            <td>{{ cmd.path }}</td>
            <td>{{ cmd.value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="col">
      <h6>Commands Awaiting Response {{ commandsAwaitingResponse.length }}</h6>
      <table class="table">
        <tbody>
          <tr v-for="cmd in commandsAwaitingResponse">
            <td>{{ cmd.op }}</td>
            <td>{{ cmd.path }}</td>
            <td>{{ cmd.value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>

import useMso from '@/use/useMso.js';

export default {
  setup() {
    return useMso();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  * {
    color:white;
  }

  .sgen-on-warning {
    text-transform: uppercase;
    font-weight: bold;
    color: magenta;
    background: rgba(0,0,0,0.75);
    padding:0.25rem 0.5rem;
  }

</style>
