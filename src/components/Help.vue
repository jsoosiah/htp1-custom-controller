<template>
  <div class="transition-container">
    <h5>Help Manual</h5>
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <div class="alert alert-info small alert-box" role="alert">
              <b>Update 12/2025:</b> Support for Dirac Live Active Room Treatment (ART) has been added. <a
                :href="`http://${websocketIp}/HTP-1_User_Manual_ART_Addendum.pdf`"
                target="_blank">Click here to access a PDF copy of the ART addendum</a>.
            </div>
            <div class="alert alert-info small alert-box" role="alert">
              <b>Update 12/2025:</b> The front panel has been completely redesigned. <a
                :href="`http://${websocketIp}/HTP-1-Front-Panel.pdf`"
                target="_blank">Click here to access a PDF copy of the front panel manual</a>.
            </div>
    <div
      id="accordionExample"
      class="accordion"
    >
      <div class="card">
        <div
          id="headingOne"
          class="card-header"
          @click="toggleOpened(0)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left"
              type="button"
              data-toggle="collapse"
              data-target="#collapseOne"
              aria-expanded="true"
              aria-controls="collapseOne"
            >
              Homepage
            </button>
          </h2>
        </div>

        <div
          id="collapseOne"
          class="collapse"
          :class="{'show': opened[0]}"
          aria-labelledby="headingOne"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <p>
              The Home page is the primary interface of the system. Although it looks similar to the front panel, it is designed to provide access to configuration options for the entire system.
            </p>
            <ul>
              <li>
                Audio stream details are displayed here, much like on the front panel.
              </li>
              <li>
                The gear icon (on desktop) or the hamburger menu icon (on mobile devices) in the upper left allows you to configure system settings.
              </li>
              <li>
                The information button in the upper right is used to update the system.
              </li>
              <li>You reached this page by selecting the Help button.</li>
              <li>
                From the Home page, you can adjust the volume, select an input, and choose an upmixer.
              </li>
              <li>
                The <i>Inputs</i> configuration page determines which inputs are available as buttons.
              </li>
              <li>
                The <i>Upmix</i> configuration page controls which upmixers appear as selectable buttons.
              </li>
              <li>
                The <i>Dirac Live</i> button lets you quickly hear the effect of the Dirac Live calibration filters. This feature is only available after a Dirac Live calibration has been performed.
              </li>
              <li>
                The <i>Loudness</i> button enables processing that boosts bass and treble as the volume decreases. More precisely, it applies compensation that closely follows <a href="https://en.wikipedia.org/wiki/Equal-loudness_contour" target="_blank">equal loudness</a> contour changes.
              </li>
              <li>
                The <i>Dialog Enhance</i> button improves dialog intelligibility. Some DTS:X streams support direct dialog level adjustment, and this control connects to that feature when available. If the stream does not support it, the system boosts the center channel instead.
              </li>
              <li>
                <i>Night Mode</i> activates any available Dolby or DTS processing to reduce the program's dynamic range and also lowers the subwoofer level by 6dB.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingTwo"
          class="card-header"
          @click="toggleOpened(1)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseTwo"
              aria-expanded="false"
              aria-controls="collapseTwo"
            >
              Speakers
            </button>
          </h2>
        </div>
        <div
          id="collapseTwo"
          class="collapse"
          :class="{'show': opened[1]}"
          aria-labelledby="headingTwo"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <p>
              The user guide recommends starting with a simple setup and then gradually refining and expanding it into a more advanced configuration as you become familiar with the system.
            </p>
            <ul>
              <li>
                The <i>Speakers</i> setup page is where you define which speakers are installed and describe their characteristics for <a href="https://en.wikipedia.org/wiki/Bass_management" target="_blank">bass
                  management</a>.
              </li>
              <li>
                Because this page reflects your physical speaker layout, you typically won't need to change it unless you replace or rearrange speakers or amplifiers.
              </li>
              <li>
                Use the speaker switches to match your actual speaker configuration. Refer to the user manual for detailed guidance on speaker locations and layouts.
              </li>
              <li>
                Set the crossover (cutoff) frequencies based on the -3dB point (f<sub>-3dB</sub>) of each speaker. This is the frequency at which the speaker's output drops to half its acoustic power and lower frequencies begin to roll off. You can find the f<sub>-3dB</sub> value in the technical specifications for your specific speaker model.
              </li>
              <li>
                The user guide provides additional details about performing a Dirac Live calibration. You can download the Dirac Live app here: <a
                  href="https://www.dirac.com/resources/downloads" target="_blank"
                >https://www.dirac.com/resources/downloads</a>
              </li>
              <li>
                <b>Enable Seat Shaker</b>: When this option is enabled, the first unused subwoofer channel is assigned as the seat shaker channel. This channel is excluded from Dirac Live calibration and will not receive filter corrections while Dirac Live is active.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingThree"
          class="card-header"
          @click="toggleOpened(2)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseThree"
              aria-expanded="false"
              aria-controls="collapseThree"
            >
              Calibration
            </button>
          </h2>
        </div>
        <div
          id="collapseThree"
          class="collapse"
          :class="{'show': opened[2]}"
          aria-labelledby="headingThree"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <div class="alert alert-info small alert-box" role="alert">
              <b>Update 12/2025:</b> Support for Dirac Live Active Room Treatment (ART) has been added. <a
                :href="`http://${websocketIp}/HTP-1_User_Manual_ART_Addendum.pdf`"
                target="_blank">Click here to access a PDF copy of the ART addendum</a>.
            </div>
            <ul>
              <li>
                Dirac Live filters are created using the Dirac Live calibration app, which measures your room and calibrates the system accordingly. The user guide provides detailed instructions on how to perform a Dirac Live calibration. You can download the Dirac Live calibration app here: <a
                  href="https://www.dirac.com/resources/downloads" target="_blank"
                >https://www.dirac.com/resources/downloads</a>
              </li>
              <li>
                <b>Dirac Live Slots</b>: Multiple Dirac Live filters can be transferred from the Dirac Live calibration app to the HTP-1 and stored in individual slots. This allows you to switch between different calibrations as needed.
              </li>
              <li>
                <b>Delay and Trim</b>: During calibration, Dirac Live measures the room and determines the appropriate delay and trim values needed to align all speakers with the listening position. Trim adjusts the output levels, while delay compensates for differences in speaker distance, based on the speed of sound (approximately one foot per millisecond, or 0.34m/ms). A properly completed Dirac Live calibration automatically sets optimal delay and trim values, and user delay and trim controls should remain at zero afterward.
              </li>
              <li>
                <b>User Trim and Delay</b>: These controls are available if you choose not to run a Dirac Live calibration, or if you need to make small adjustments to the values determined by Dirac Live. User-entered values are added to the Dirac Live values to determine the total delay and trim. Be aware that setting excessively high trim values may result in digital clipping.<br>
                With the introduction of Dirac Live <b>Active Room Treatment (ART)</b>, Dirac no longer allows changes to trim and delay settings after calibration when PEQ is set to <i>post</i>. This restriction also applies when using Dirac Live <b>Bass Control (BC)</b>.
              </li>
            </ul>
            <p>Additional controls become available when <b>Show Advanced Settings</b> is enabled.</p>
            <ul>
              <li>Individual speakers can be muted to help you check what each speaker is doing. You can also mute or unmute all speakers at once, and invert the current mute selection.</li>
              <li><i>Advanced PEQ Options</i> let you switch PEQ placement to either <i>pre</i>- or <i>post</i>-bass management.</li>
              <li><i>Bulk Edit</i> allows you to adjust trim and delay for multiple speaker channels at the same time. Simply select one or more <i>target channels</i>, enter the desired value, and <i>apply to selected speakers</i>.</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingFour"
          class="card-header"
          @click="toggleOpened(3)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseFour"
              aria-expanded="false"
              aria-controls="collapseFour"
            >
              Balance
            </button>
          </h2>
        </div>
        <div
          id="collapseFour"
          class="collapse"
          :class="{'show': opened[3]}"
          aria-labelledby="headingFour"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <p>
              <i>Balance</i> lets you make individual level adjustments to input channels. It is applied before bass management, Dirac Live filters, tone controls, and loudness processing, so it does not interfere with calibrations or other signal processing.<br>
              This makes <i>Balance</i> the ideal place to safely adjust the center channel if dialog is too low, or to increase the level of sounds coming from the surround channels.
            </p>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingFive"
          class="card-header"
          @click="toggleOpened(4)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseFive"
              aria-expanded="false"
              aria-controls="collapseFive"
            >
              Signal Generator
            </button>
          </h2>
        </div>
        <div
          id="collapseFive"
          class="collapse"
          :class="{'show': opened[4]}"
          aria-labelledby="headingFive"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <p>
              The controls for the signal generators are found here.
            </p>
            <ul>
              <li>
                <b>Signal Generator</b>: Toggles between ON and OFF to 
                turn on or off the signal generator. The signal generator
                mimics an off-board signal generator. That is to say the 
                generator once turned on, remains on until it is turned off.
                This means it remains turned on when you visit other configuration 
                pages such as <i>Calibration</i> and <i>PEQ</i>, or even change to different inputs.
                This also means the generator outputs are processed by the Dirac Live
                room correction filters, tone controls, as well as the PEQ filters.
              </li>
              <li>
                <b>Signal Select</b>: The signal generator supports a number of signal generations:
                <ul>
                  <li>
                    <b>"THX-like" band limited noise</b>: 
                    "THX-like" band limited noise at -30dBFS.
                  </li>
                  <li>
                    <b>Louder reference noise</b>: A -20dBFS band limited noise 
                    with energy between 300Hz and 3kHz and peak at 1kHz.
                  </li>
                  <li>
                    <b>Polarity pulse</b>: 
                    A positive impluse.
                  </li>
                  <li>
                    <b>Sine wave</b>: 
                    A sine wave. Frequency and amplitude can be adjusted.
                  </li>
                  <li>
                    <b>Left input as signal</b>: 
                    Sends the Left input to the selected speaker.
                    Allows third party apps such as <i>Room Equalization
                    Wizard (REW)</i> to measure speakers inaccessible through HDMI PCM 
                    inputs.
                  </li>
                  <li>
                    <b>Right input as signal</b>: 
                    Sends the Right input to the selected speaker.
                    Allows third party apps such as <i>Room Equalization
                    Wizard</i> to measure speakers inaccessible through HDMI PCM 
                    inputs.
                  </li>
                  <li>
                    <b>Left and right input as signal</b>: 
                    Sends the left and right inputs independently to any selectable speaker output. This allows the same speaker to be used as an acoustic timing reference in <i>REW</i>.
                  </li>
                </ul>
              </li>
              <li>
                <b>Speaker Select</b>: This is the list of currently enabled speakers.  Choose the destination of the test signal.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingSix"
          class="card-header"
          @click="toggleOpened(5)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseSix"
              aria-expanded="false"
              aria-controls="collapseSix"
            >
              PEQ
            </button>
          </h2>
        </div>
        <div
          id="collapseSix"
          class="collapse"
          :class="{'show': opened[5]}"
          aria-labelledby="headingSix"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <p>The parametric equalizer (PEQ) controls are located here.</p>
            <ul>
              <li>
                The system supports up to 16 PEQ bands per channel, all individually adjustable. These controls are typically used to fine-tune your room's acoustic response, but they can also adjust the input signal if needed.
              </li>
              <li>PEQ settings can be organized by speaker <i>channel</i> or by individual EQ <i>bands</i>.</li>
              <li>You can export, import, clone, or reset PEQ settings to their defaults.</li>
              <li><i>Advanced PEQ Options</i> allow you to switch the PEQ placement to either <i>pre</i> or <i>post</i> bass management.</li>
              <li>By default, PEQ is set to <i>pre</i>, which is optimal if you plan to use <i>BEQ</i>.</li>
              <li>
                PEQ can remain active during a Dirac Live calibration. If PEQ is set <i>post</i> Dirac Live filter, the calibration signal will include the PEQ adjustments as part of the room response. This is useful for speaker pre-optimization but means you should not change PEQ after calibration, as it would invalidate the results. Using PEQ <i>post</i> is also ideal for manual room calibration.
              </li>
            </ul>
            <p>
              Keep in mind that applying large EQ boosts can cause digital clipping.
            </p>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingSeven"
          class="card-header"
          @click="toggleOpened(6)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseSeven"
              aria-expanded="false"
              aria-controls="collapseSeven"
            >
              Filtered Bass EQ
            </button>
          </h2>
        </div>
        <div
          id="collapseSeven"
          class="collapse"
          :class="{'show': opened[6]}"
          aria-labelledby="headingSeven"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <p>
              Bass EQ (BEQ) is designed to bring back low-frequency content that may have been reduced during post-production. It does this using PEQ settings, which are retrieved from the <a href="https://beqcatalogue.readthedocs.io/en/latest/" target="_blank">BEQ Catalog</a>.
            </p>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingEight"
          class="card-header"
          @click="toggleOpened(7)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseEight"
              aria-expanded="false"
              aria-controls="collapseEight"
            >
              Tone Control
            </button>
          </h2>
        </div>
        <div
          id="collapseEight"
          class="collapse"
          :class="{'show': opened[7]}"
          aria-labelledby="headingEight"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <p>
              Traditional tone controls can be turned on, allowing you to adjust both the amount of boost or cut and the corner frequencies.<br>
              The bass tone control is especially useful for compensating for the wide variations in low-frequency content that often exist between different recordings.
            </p>
            <p>
              Be aware that applying excessive boost can cause digital clipping.
            </p>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingNine"
          class="card-header"
          @click="toggleOpened(8)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseNine"
              aria-expanded="false"
              aria-controls="collapseNine"
            >
              Loudness
            </button>
          </h2>
        </div>
        <div
          id="collapseNine"
          class="collapse"
          :class="{'show': opened[8]}"
          aria-labelledby="headingNine"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <p>
              The loudness compensation controls are located here.
            </p>
            <ul>
              <li>
                <b>Loudness Curve</b>: Choose from different curve shapes for loudness compensation. <i>ISO 226:2003</i> follows the standardized equal-loudness curve, while <i>Vintage</i> emulates the compensation curves commonly found in classic analog home audio equipment.
              </li>
              <li>
                <b>Loudness Calibration</b>: This setting roughly represents the sound pressure level at which you want a flat response, also known as "reference level." A higher number increases bass boost at lower volumes, while a lower number reduces the amount of bass compensation.
              </li>
              <li>
                <b>Night Mode</b>: Activates available Dolby or DTS features to reduce the program's dynamic range and lowers the subwoofer by 6dB, making listening at low volumes more comfortable.
              </li>
              <li>
                <b>Dialog Enhance</b>: Helps make dialog easier to hear. For some DTS:X streams, this control adjusts dialog directly. If the audio stream does not support this feature, the center channel is boosted instead.
              </li>
            </ul>
            <p>
              Be aware that applying large boosts can result in digital clipping.
            </p>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingTen"
          class="card-header"
          @click="toggleOpened(9)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseTen"
              aria-expanded="false"
              aria-controls="collapseTen"
            >
              Upmix
            </button>
          </h2>
        </div>
        <div
          id="collapseTen"
          class="collapse"
          :class="{'show': opened[9]}"
          aria-labelledby="headingTen"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <p>
              The system supports a number of algorithms designed to <i>make it 
              sound better</i>. These are in fact <i>upmixers</i>. We
              sometimes refer to these as <i>sound modes</i>. They make more
              channels from fewer channels. They are designed in particular to
              help older source material (stereo or 5.1) drive the wide set of
              speakers that are supported here. Controls are provided for each
              algorithm to choose whether or not it is visible on the homepage.
              Buttons allow you to choose one to listen to as you
              adjust. And some of the algorithms have more controls that you can
              access.
            </p>
            <ul>
              <li>
                <b>Direct</b>: The direct sound mode applies no upmix
                algorithm. The decoded audio is played <i>directly</i> with
                no modification. The upmixer is <i>off</i>. The program
                material is presented at its original sample rate. If you wish
                to listen to material at high sample rates (96kHz or 192kHz) then
                you should use direct mode. All of the other upmixers use a
                high quality sample rate converter to drop the output sample
                rate to 48000Hz (or 44100Hz).
              </li>
              <li>
                <b>Native</b>: In native mode, the Dolby Surround upmixer is
                applied only to material decoded from Dolby sources. The DTS
                Neural:X upmixer is applied only to native DTS sources. And
                the AURO-3D decoder is enabled to handle any AURO-3D encoded
                sources. No upmixer is applied to PCM sources. The
                Auro-Matic upmixer cannot be applied to material sampled at
                192kHz.
              </li>
              <li>
                <b>Dolby Surround</b>: When this is selected, the Dolby
                Surround algorithm is enabled to analyze the input stream and
                process it for presentation across the available speaker set.
                This is an evolution of the previous Dolby Pro-Logic. It has
                one control, namely center spread. When center spread is
                enabled the material found for the center channel is also
                added to the left and right channels, hence <i>spreading</i>
                the center channel sound. The Dolby Surround upmixer can
                support any combination of speakers provided here. There may
                not be anything in some of the channels. For instance, a mono
                input will result in sound only from the center channel.
              </li>
              <li>
                <b>DTS Neural:X</b>: When this is selected, the DTS Neural:X
                algorithm is enabled to analyze the input stream and process
                it for presentation across the available speaker set. This is
                an evolution of the previous DTS Neo. One control is provided,
                namely <i>Wide Synth</i>. Since the Neural:X code only
                produces data for 12 channels (7.1.4), enabling the wide synth
                control will populate the rest of the channels.
              </li>
              <li>
                <b>AURO-3D</b>: When this is selected, the Auro Technology
                Engine is engaged to analyze the input stream and process it
                for presentation across the available speaker set. The AURO-3D
                engine provides an alternative to the Dolby and DTS systems.
                When sources are encoded using the AURO-3D algorithm the engine
                detects this and decodes more channels. For instance, it is
                common to find program material recorded using AURO-3D to
                capture 14 channels (7.1.6a) but encoded with 8 channels
                (7.1). Blu-ray disks with such content are clearly labeled.
                The AURO-3D engine can also function as an upmixer when the
                source material is not encoded. Then the <i>Auro-Matic</i>
                algorithm is deployed to upmix. Auro Technologies provides a
                number of controls to adjust this algorithm.
              </li>
              <li>
                <b>Mono</b>: All of the available channels are mixed down to
                mono and the same signal is presented to all speakers.
              </li>
              <li>
                <b>Stereo</b>: All of the available channels are mixed down
                to stereo and with the left signal going to all left speakers
                and the right to all right speakers. The center speaker gets a
                mono mix.
              </li>
              <li>
                <b>Wide Synth</b>: When Neural:X is enabled, the DTS codec derives the wide speaker signals. When Neural:X is disabled, wide speaker content is generated using principles based on Michael Gerzon's research. In this mode, <i>Wide Synth</i> derives signals from adjacent channels &ndash; for example, the left wide channel is created from the left and left surround channels. <i>Wide Synth</i> also generates top middle content from the front top and rear top speakers. If a recording already includes native wide or top middle content, it is blended with the synthesized output.
              </li>
            </ul>
            <p>
              A note about <b>Dolby Atmos</b> and <b>DTS:X</b> sources: When
              the signal if encoded with Dolby Atmos and likewise with DTS:X
              then none of the fancy upmixers can be applied. Following the
              guidance of the folks at Dolby and DTS, these signals are already
              optimized for lots of speakers. Hence the availability of such a
              signal overrides the selection of an upmixer. The mono and stereo
              upmixers are an exception to this. They can be applied to any
              signal.
            </p>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingEleven"
          class="card-header"
          @click="toggleOpened(10)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseEleven"
              aria-expanded="false"
              aria-controls="collapseEleven"
            >
              Inputs
            </button>
          </h2>
        </div>
        <div
          id="collapseEleven"
          class="collapse"
          :class="{'show': opened[10]}"
          aria-labelledby="headingEleven"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <p>
              The input page allows you to assign a human readable name to each
              input. It also allows you to choose which input buttons will be
              present on the homepage of this web UI. 
            </p>
            <ul>
              <li>
                The <i>UHD Capable</i> switches on the HDMI inputs can be
                helpful when debugging video connections. The difficulties
                getting 4k (UHD) video to play nice together are well
                documented on the web. Disabling UHD for an input will force
                the source device to send 2k (HD) video. The user guide has
                more ideas of what to try if this fixes the connection.
              </li>
              <li>
                When <i>Show Advanced Input Settings</i> is enabled, another switch is
                exposed for the digital inputs. <i>PCM Detect
                Sensitivity</i> has three settings. <i>Auto</i> is the default
                setting and this is usually correct. The <i>Biased</i>
                setting is biased toward PCM material. This might be
                appropriate for a player playing a CD. The <i>Indicated</i>
                setting relies on the audio format indicated by the HDMI
                stream.
              </li>
              <li>
                <b>HDMI CEC</b>: CEC stands for <i>Consumer Electronics Control</i>. It is designed
                to simplify the connection of devices like amplifiers and
                players with TV sets. The entries on the connectivity page
                allow you to configure CEC to work best in your system. 
                CEC is an attempt to make one remote (that of the TV) control
                the whole system. It works better with some combinations of
                devices than with others.
              </li>
              <li>
                <b>Lipsync Delay</b>: The audio is delayed by the
                specified number of milliseconds. Begin system setup with this
                set to zero and do a Dirac Live calibration. Then check the sync
                between the audio and the video using a local source that you
                trust. Note that the surround modes add delay. The
                shortest delay will be achieved in <i>Direct</i> mode.
              </li>
              <li>
                <b>Bluetooth Settings</b>: The controls necessary to discover and pair with a Bluetooth
                device are found here.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingTwelve"
          class="card-header"
          @click="toggleOpened(11)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseTwelve"
              aria-expanded="false"
              aria-controls="collapseTwelve"
            >
              Network
            </button>
          </h2>
        </div>
        <div
          id="collapseTwelve"
          class="collapse"
          :class="{'show': opened[11]}"
          aria-labelledby="headingTwelve"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <p>
              The network page allows you to 
              enable or disable Wi-Fi as well as configure automatic
              IP address assignment (DHCP) or manual configuration. 
            </p>
            <ul>
              <li>
                Ethernet settings are displayed. If a static IP
                address is desired, turn off DHCP and provide the required
                information. Then <i>APPLY</i> the network settings.
              </li>
              <li>
                When Wi-Fi is enabled the system scans to find available
                networks. These are displayed on the left. Choose
                a network, enter the password, and click on <i>CONFIGURE NETWORK</i>.
                After a brief delay the network should appear in the list of
                configured networks on the right.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingThirteen"
          class="card-header"
          @click="toggleOpened(12)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseThirteen"
              aria-expanded="false"
              aria-controls="collapseThirteen"
            >
              Macros
            </button>
          </h2>
        </div>
        <div
          id="collapseThirteen"
          class="collapse"
          :class="{'show': opened[12]}"
          aria-labelledby="headingThirteen"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <p>The <i>Macros</i> page allows you to record your actions and save them to the <i>CMD A/B/C/D</i> and <i>PRESET 1/2/3/4</i> buttons of the remote control.</p>
            <ul>
              <li>Select one of the 8 slots to record your actions.</li>
              <li>Click the Recording button to start recording, and then perform the actions you wish to record, using either the remote or the web interface.</li>
              <li>Your actions will be recorded on the <i>Macros</i> page. You may delete any undesirable entries, or drag rows to rearrange the order of entries.</li>
              <li>When you are finished, click the save button to save your recordings to the slot that you selected.</li>
              <li>Click the button you selected on the remote to play back your recordings.</li>
              <li>You can create additional macros which can be added to the home page from the <i>Personalize</i> tab.</li>
              <li>With <i>Show Macro Code Editor</i> enabled the actual commands sent to the HTP-1 can be inspected and edited.</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingFourteen"
          class="card-header"
          @click="toggleOpened(13)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseFourteen"
              aria-expanded="false"
              aria-controls="collapseFourteen"
            >
              Personalize
            </button>
          </h2>
        </div>
        <div
          id="collapseFourteen"
          class="collapse"
          :class="{'show': opened[13]}"
          aria-labelledby="headingFourteen"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <p>
              The <i>Personalize</i> page allows you to customize the home page.
            </p>
            <ul>
              <li>
                <i>Homepage Status Display</i>
                <ul>
                  <li>
                    You can cause video status (resolution, color depth, etc)
                    to be displayed on the homepage.
                  </li>
                  <li>
                    You can cause audio sample rates to be displayed on the
                    homepage.
                  </li>
                </ul>
              </li>
              <li>You can select <i>Shortcuts</i> to settings pages which will appear on the top right of the screen.</li>
              <li>You can select which buttons appear under the <i>Modes</i> section of the homepage.</li>
              <li>You can select which macro buttons appear under the <i>Macros</i> section of the homepage.</li>
              <li>You can select which Dirac Live slots appear under the <i>Dirac Live Slot</i> section of the homepage.</li>
              <li>Notices are small info boxes that appear on various settings pages. You can <i>restore all dismissed notices</i>.</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingFifteen"
          class="card-header"
          @click="toggleOpened(14)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseFifteen"
              aria-expanded="false"
              aria-controls="collapseFifteen"
            >
              Volume Setup
            </button>
          </h2>
        </div>
        <div
          id="collapseFifteen"
          class="collapse"
          :class="{'show': opened[14]}"
          aria-labelledby="headingFifteen"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <ul>
              <li>
                <b>Power On Volume</b>: This number sets the default volume after restart or wake.
              </li>
              <li>
                <b>Min. volume</b>: This number sets the lowest level of
                volume possible using any volume control. Set it so that
                you can barely hear the audio.
              </li>
              <li>
                <b>Max. volume</b>: This number limits the upper
                range of the volume control. The user guide gives more
                background. This control can be usefully adjusted to
                limit the volume of a system that is in fact capable of much
                higher volumes.
              </li>
              <li>
                <b>Max. Output Level</b>: The maximum Output Level,
                specified in volts, sets the level at which the output of the
                HTP-1 saturates. It should represent the loudest volume
                the system can achieve. Amplifier manufacturers
                typically specify this number as the <i>amplifier
                sensitivity</i>. The user guide discusses what to do if you
                don't know the amplifier sensitivity. It suggests starting at
                1 volt and then adjusting by ear.<br>
              </li>
            </ul>
            <p>Additional controls become available when <b>Show Advanced Settings</b> is enabled.</p>
            <ul>
              <li><b>Zero Point</b>: If you want your maximum listening level to display as 0, set this control to the corresponding offset above or below the default master volume value.</li>
              <li><b>Max. Digital Headroom</b>: The HTP-1 uses a two-stage volume control. Volume is first increased in the analog domain; once that reaches its limit, further increases are applied digitally. <i>Max Digital Headroom</i> determines how many decibels are reserved in the digital signal for this second stage.
If you want to ensure that the digital volume stage is never used, set <i>Max Volume</i> to the <b>negative</b> value of <i>Max Digital Headroom</i>, minus 1dB (an additional 1dB of headroom is already applied internally).</li>
              <li><b>Peak Level Measurement</b>: Displays the peak levels for each output channel while audio is playing, independent of the master volume setting. If a channel clips, its row turns red. Ideally, no signal should clip &ndash; that is, peak above 0 dB. Reduce <i>Max Digital Headroom</i> until no further peaks occur. <i>Clear Peaks</i> resets the readings.</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingSixteen"
          class="card-header"
          @click="toggleOpened(15)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseSixteen"
              aria-expanded="false"
              aria-controls="collapseSixteen"
            >
              System
            </button>
          </h2>
        </div>
        <div
          id="collapseSixteen"
          class="collapse"
          :class="{'show': opened[15]}"
          aria-labelledby="headingSixteen"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <ul>
              <li>
                The <i>Unit Name</i> is displayed to the outside world.
                Examples include:
              </li>
              <ul>
                <li>The Dirac Live calibration app</li>
                <li>Bluetooth devices</li>
                <li>Roon player</li>
              </ul>
              <li>
                When <i>Fast Start</i> is on the unit will not completely power
                down and hence it will start up very quickly. You have the
                option of keeping <i>Video Pass Through</i> alive. When <i>Fast
                Start</i> is off, powering back up will take longer. CEC-based 
                power up will not work when <i>Fast Start</i> is off.
              </li>
              <li>
                Front panel brightness can be adjusted here. The <i>DIM</i>
                button on the remote also works.
              </li>
              <li>
                A <i>Factory Reset</i> clears all user settings and restores the system to its factory defaults. Network settings and Dirac Live calibrations are preserved.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingSeventeen"
          class="card-header"
          @click="toggleOpened(16)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseSeventeen"
              aria-expanded="false"
              aria-controls="collapseSeventeen"
            >
              Configs
            </button>
          </h2>
        </div>
        <div
          id="collapseSeventeen"
          class="collapse"
          :class="{'show': opened[16]}"
          aria-labelledby="headingSeventeen"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <ul>
              <li>
                You can export and import settings of the whole system. It's a good idea
                to export the configuration when you are happy with your
                settings. Then you can re-import them if settings
                are lost or damaged.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card">
        <div
          id="headingEighteen"
          class="card-header"
          @click="toggleOpened(17)"
        >
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#collapseEighteen"
              aria-expanded="false"
              aria-controls="collapseEighteen"
            >
              About
            </button>
          </h2>
        </div>
        <div
          id="collapseEighteen"
          class="collapse"
          :class="{'show': opened[17]}"
          aria-labelledby="headingEighteen"
          data-parent="#accordionExample"
        >
          <div class="card-body">
            <div
              class="alert alert-info small alert-box"
              role="alert"
            >
              The user guide has more information. <a
                :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`"
                target="_blank"
              >Click
                here to access a PDF copy of the user guide</a>.
            </div>
            <ul>
              <li>This page shows system status and hardware/software versions.</li>
              <li>Click on <i>Current Release Notes</i> for a detailed overview of what has changed between firmware versions.</li>
              <li><i>History and Updates</i> shows whether a new firmware is available and a list of previous firmware releases.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import useMso from "@/use/useMso.js";
import useLocalStorage from "@/use/useLocalStorage.js";

const helpIndexes = {
  '/settings/speakers': 1,
  '/settings/calibration': 2,
  '/settings/signal-generator': 4,
  '/settings/balance': 3,
  '/settings/peq': 5,
  '/settings/tone-control': 7,
  '/settings/bass-eq': 6,
  '/settings/loudness': 8,
  '/settings/upmix': 9,
  '/settings/inputs': 10, 
  '/settings/network': 11, 
  '/settings/macros': 12, 
  '/settings/personalize': 13, 
  '/settings/system': 15, 
  '/settings/volume': 14,
  '/settings/configs': 16, 
  '/settings/about': 17
}

export default {
  name: "About",
  beforeRouteEnter(to, from, next) {
    next(vm => {
      console.log('beforeRouteEnter', to, from);
      vm.prevRoute = from;
      if (helpIndexes[from.fullPath]) {
        vm.opened = {
          [helpIndexes[from.fullPath]]: true
        };
      } else {
        vm.opened = {
          0: true
        };
      }
    });
  },
  setup() {
    return { ...useMso(), ...useLocalStorage() };
  },
  data() {
    return {
      prevRoute: null,
      opened: {
        0: true,
      },
    };
  },
  methods: {
    toggleOpened(key) {
      this.opened[key] = !this.opened[key];
    }
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

.accordion {
    padding-bottom: 1rem;
}

</style>
