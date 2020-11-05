<template>
  <div class="transition-container">
    <h5>About Monolith HTP-1</h5>
    <table class="table table-sm table-striped table-responsive">
      <tbody>
        <tr>
          <th>System Software Version</th>
          <td><code>{{mso.versions?.swVer}}</code> (<a :href="`http://${websocketIp}/current_release_notes`" target="_blank">Current Release Notes</a>)</td>
        </tr>
        <tr>
          <th>System Build Date and Time</th>
          <td><code>{{mso.versions?.GuiNodeRed}}</code></td>
        </tr>
        <tr>
          <th>History and Updates</th>
          <td>
            <template v-if="mso.stat?.newupdate === 'updateavailable'">
              <mark class="update-mark">
                <a :href="`http://${websocketIp}/history.html`" target="_blank">Update is Available - See History Page</a>
              </mark>
            </template>
            <template v-else>
              <a :href="`http://${websocketIp}/history.html`" target="_blank">
                See History Page
              </a>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    
    <h5>Detailed Status</h5>
    <table class="table table-sm table-striped table-responsive">
      <tbody>
        <tr>
          <th>IP Address</th>
          <td><code>{{mso.hostip}}</code></td>
        </tr>
        <tr>
          <th>Decoder Sample Rate</th>
          <td><code>{{mso.status?.DECSampleRate}}</code></td>
        </tr>
        <tr>
          <th>Encoder Sample Rate</th>
          <td><code>{{mso.status?.ENCSampleRate}}</code></td>
        </tr>
        <tr>
          <th>Video Status</th>
          <td><code>{{mso.videostat?.VideoResolution}} {{mso.videostat?.VideoColorSpace}} 
            {{mso.videostat?.VideoMode}} {{mso.videostat?.HDRstatus}} {{mso.videostat?.VideoBitDepth}} 
            {{mso.videostat?.Video3D}}</code></td>
        </tr>
        <tr>
          <th>TV Sound Source</th>
          <td><code>{{mso.stat?.TVSoundSrc}}</code></td>
        </tr>
        <tr>
          <th>eARC Link Status</th>
          <td><code>{{mso.stat?.earcLinkStatus}}</code></td>
        </tr>
        <tr>
          <th>CEC Status</th>
          <td><code>{{mso.stat?.CECStatus}}</code></td>
        </tr>
      </tbody>
    </table>

    <h5>Software and Hardware Versions</h5>
    <table class="table table-sm table-striped table-responsive">
      <tbody>
        <tr>
          <th>System Software</th>
          <td><code>{{mso.versions?.swVer}}</code></td>
        </tr>
        <tr>
          <th>Node RED GUI</th>
          <td><code>{{mso.versions?.GuiNodeRed}}</code></td>
        </tr>
        <tr>
          <th>avController</th>
          <td><code>{{mso.versions?.avController}}</code></td>
        </tr>
        <tr>
          <th>APM Module</th>
          <td><code>{{mso.versions?.apm100}}</code></td>
        </tr>
        <tr>
          <th>HDMI Module</th>
          <td><code>{{mso.versions?.hdmiVer}}</code></td>
        </tr>
        <tr>
          <th>Backplane Firmware</th>
          <td><code>{{mso.versions?.backplane}}</code></td>
        </tr>
        <tr>
          <th>Hardware</th>
          <td><code>{{mso.versions?.hardware}}</code></td>
        </tr>
        <tr>
          <th>Serial Number</th>
          <td><code>{{mso.versions?.SerialNumber}}</code></td>
        </tr>
        <tr>
          <th>rootfs Version</th>
          <td><code>{{mso.versions?.rootfsVer}}</code></td>
        </tr>
      </tbody>
    </table>
    <h5>About this Custom Web UI</h5>
    <table class="table table-sm table-striped table-responsive">
      <tbody>
        <tr>
          <th>GitHub</th>
          <td><a target="_blank" href="https://github.com/jsoosiah/htp1-custom-controller">Source Code</a></td>
        </tr>
        <tr>
          <th>AVS Forum</th>
          <td><a target="_blank" href="https://www.avsforum.com/threads/the-official-monoprice-monolith-htp-1-owners-thread.3112176/">Discussion</a></td>
        </tr>
        <tr>
          <th>PayPal</th>
          <td><a target="_blank" href="https://www.paypal.com/donate?hosted_button_id=RYBMWSE6SH6WC">Donate</a></td>
        </tr>
      </tbody>
    </table>
    
  </div>
</template>

<script>
import useMso from "@/use/useMso.js";
import useLocalStorage from "@/use/useLocalStorage.js";

export default {
  name: "About",
  setup() {
    return { ...useMso(), ...useLocalStorage() };
  },
};
</script>

<style scoped>
  table {
    margin-left: -.3rem;
  }

th {
  font-size: 80%;
  vertical-align: bottom;
  /* padding-top:.4rem; */
  /* font-weight: 600; */
}

td {
  vertical-align: bottom;
}

code {
  color: inherit;
  /* font-family: inherit; */
}

mark {
  background-color: yellow;
  font-weight: bold;
}

</style>