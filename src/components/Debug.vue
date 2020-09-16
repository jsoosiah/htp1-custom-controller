<template>
  <div class="row">
    <div class="col">
      <h6>Commands To Send {{commandsToSend.length}}</h6>
      commandsToSendTouchedFlag = {{commandsToSendTouchedFlag}}
      <table class="table">
        <tbody>
          <tr v-for="cmd in commandsToSend">
            <td>{{cmd.op}}</td>
            <td>{{cmd.path}}</td>
            <td>{{cmd.value}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="col">
      <h6>Commands Received {{commandsReceived.length}}</h6>
      commandsReceivedTouchedFlag = {{commandsReceivedTouchedFlag}}
      <table class="table">
        <tbody>
          <tr v-for="cmd in commandsReceived">
            <td>{{cmd.op}}</td>
            <td>{{cmd.path}}</td>
            <td>{{cmd.value}}</td>
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
</style>
