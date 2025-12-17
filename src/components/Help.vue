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
              The home page is the main interface to the system. While it looks similar to the front panel
              it is designed to allow configuration of the whole system.
            </p>
            <ul>
              <li>
                The details of the audio stream are presented here much like
                on the front panel.
              </li>
              <li>
                The gear icon (desktop) or hamburger menu icon (mobile device) in the upper left allows you to configure the
                system.
              </li>
              <li>
                The info button in the upper right allows you to update the
                system.
              </li>
              <li>You pressed the help button to get here. </li>
              <li>
                You can adjust the volume, choose an input, and select an
                upmixer.<br>
              </li>
              <li>
                The <i>Inputs</i> configuration page sets which inputs are available
                on buttons.
              </li>
              <li>
                The <i>Upmix</i> page sets which upmixers are available
                on buttons.
              </li>
              <li>
                <i>Night Mode</i> engages any available Dolby or DTS functions to
                reduce the dynamic range of the program. It also lowers the
                subwoofer by 6dB.
              </li>
              <li>
                The <i>Dirac Live</i> button allows you to quickly hear the effect of
                the Dirac Live calibration filters. <i>You must perform a Dirac Live
                  calibration for this feature to be active.</i><br>
              </li>
              <li>
                The <i>Loudness</i> button engages a filter that turns up the bass and treble
                as the volume goes down. Actually, it is a bit more
                complicated. The <i>Loudness</i> button engages processing to closely
                follow the <a href="https://en.wikipedia.org/wiki/Equal-loudness_contour" target="_blank">equal loudness</a> 
                curve changes.
              </li>
              <li>
                The <i>Dialog Enhancement</i> button is designed to make it easier
                to hear the dialog. Some DTS-X streams have a feature to
                adjust dialog directly and this control is connected to that
                feature. If the stream does not have this feature then the
                center channel is boosted.
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
              The user guide suggests users first make a simple setup, then tune
              and evolve to a more complex configuration.
            </p>
            <ul>
              <li>
                The <i>Speakers</i> setup page allows you to specify which speakers
                are present. It also allows you to describe them for the purpose
                of <a href="https://en.wikipedia.org/wiki/Bass_management" target="_blank">bass
                  management</a>.
              </li>
              <li>
                Unless you regularly change your speakers and amps, you should
                not expect to change this page often. This page describes your
                speakers.
              </li>
              <li>
                Turn on the speaker switches to match your configuration.
                Refer to the user manual for more details about which speakers
                are where.
              </li>
              <li>
                Set the cutoff frequencies based on the -3dB point of your speakers. 
                The value can be found in the technical specifications of your particular speaker model.
              </li>
              <li>
                The user guide contains more information about Dirac Live
                calibration. You can download the Dirac Live tool here: <a
                  href="https://www.dirac.com/resources/downloads" target="_blank"
                >https://www.dirac.com/resources/downloads</a>
              </li>
              <li>
                <b>Enable Seat Shaker</b>: When enabled the first unused subwoofer channel becomes the seat shaker channel. This channel will be excluded from Dirac Live calibrations and will not have any filter corrections while Dirac Live is enabled.
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
                Dirac Live filters are created using the
                Dirac Live calibration tool to calibrate the system. The user guide has more information on performing
                a Dirac Live calibration. You can download the Dirac Live calibration tool
                here: <a
                  href="https://www.dirac.com/resources/downloads" target="_blank"
                >https://www.dirac.com/resources/downloads</a>
              </li>
              <li>
                <b>Dirac Live Slot: </b>Multiple Dirac Live filters can be transferred from the Dirac Live calibration tool to the HTP-1 and arranged into individual slots.
              </li>
              <li>
                <b>Delay and Trim</b>: A Dirac Live calibration measures the room
                and determines the amount of delay and trim required to align
                the speakers in the room with the listening position. The trim matches the levels. The
                delay accounts for the different distances of the speakers as
                sound travels at approximately one foot per millisecond (0.34m/ms). A
                properly executed Dirac Live calibration will automatically choose
                the optimal delay and trim. The user delay and trim should be
                zero after a Dirac Live calibration is completed.
              </li>
              <li>
                <b>User Trim and Delay</b>: These user controls can be used
                if a Dirac Live calibration is not desired. They can also be used
                to modify the values determined by the Dirac Live calibration. The
                user values add to the values determined by Dirac Live to make the
                total delay and trim. You should be aware that setting very
                high trim values can lead to digital clipping.<br>
With the release of Dirac Live <b>Active Room Treatment (ART)</b>, Dirac no longer allows changes to trim and delay settings after calibration. This also applies to Dirac Live <b>Bass Control (BC)</b>. Although trim settings are still possible with BC, this is not recommended.
              </li>
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
              <i>Balance</i> allows individual level adjustments to input channels. 
              It is implemented pre bass management, Dirac Live filters, tone control or loudness 
              so as not to interfere with calibrations or other processing.
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
                    with energy between 300 Hz and 3 kHz and peak at 1 kHz.
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
                    Allows third party tools such as <i>Room Equalization
                    Wizard (REW)</i> to measure speakers inaccessible through HDMI PCM 
                    inputs.
                  </li>
                  <li>
                    <b>Right input as signal</b>: 
                    Sends the Right input to the selected speaker.
                    Allows third party tools such as <i>Room Equalization
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
              Parametric EQ
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
            <p>The controls for the parametric equalizers (PEQ) are found here.</p>
            <ul>
              <li>
                The system allows for up to 16
                bands of parametric EQ, individually adjustable on each
                channel. These settings are typically used to tweak the
                response of the room.
              </li>
              <li>
                If Dirac Live is off or Dirac Live RC or Dirac Live BM is active PEQ is located post bass managment and
                post Dirac Live filters.
              </li>
              <li>
                If Dirac Live BC or Dirac Live ART is active PEQ is located pre Dirac Live filters
                and bass management.
              </li>
              <li>
                PEQ can be on when a Dirac Live calibration is run. If PEQ is located post the Dirac Live filter
                block the Dirac Live measurement signal will see PEQ as part of the room response. This behavior is
                desirable for speaker pre-optimization but it also means that PEQ should not be changed after Dirac Live calibration
                as this will destroy calibration results.
              </li>
              <li>
                For optimal results with <i>BEQ</i> PEQ should be located pre Dirac Live filters and bass management.
              </li>
            </ul>
            <blockquote>
              Note that applying large boost in the equalization can
              lead to digital clipping.
            </blockquote>
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
              Bass EQ (BEQ) attempts to restore low frequency components that were filtered out during post-production. It uses PEQ for this purpose. PEQ settings are downloaded from the <a href="https://beqcatalogue.readthedocs.io/en/latest/" target="_blank">BEQ Catalog</a>.
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
              Traditional tone controls can be
                enabled. When enabled the boost or cut can be specified as
                well as the corner frequencies.
            </p>
            <blockquote>
              Note that applying large boosts can
              lead to digital clipping.
            </blockquote>
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
              The controls for loudness compensation are found here.
            </p>
            <ul>
              <li>
                <b>Loudness Curve</b>: Select between different curve shapes for
                loudness compensation. <i>ISO 226:2003</i> follows the standard equal loudness curve while
                <i>Vintage</i> follows compensation curves very similar to those of vintage analog home audio equipment.
              </li>
              <li>
                <b>Loudness Calibration</b>: The loudness calibration number
                corresponds roughly to the sound pressure level at which you
                want a flat response. That would be the &quot;normal
                listening volume&quot;. A higher number means there will be
                more loudness bass as the volume goes down. A lower
                number decreases the amount of bass boost.<br>
              </li>
              <li>
                <b>Night Mode</b>: Night mode engages any available Dolby or DTS functions to
                reduce the dynamic range of the program. It also lowers the
                subwoofer by 6dB.
              </li>
            </ul>
            <blockquote>
              Note that applying large boost can
              lead to digital clipping.
            </blockquote>
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
                to listen to material at high sample rates (96k or 192k) then
                you should use direct mode. All of the other upmixers use a
                high quality sample rate converter to drop the output sample
                rate to 48000 (or 44100)Hz.
              </li>
              <li>
                <b>Native</b>: In native mode, the Dolby Surround upmixer is
                applied only to material decoded from Dolby sources. The DTS
                Neural-X upmixer is applied only to native DTS sources. And
                the Auro3D decoder is enabled to handle any Auro3D encoded
                sources. No upmixer is applied to PCM sources. The
                AuroMatic upmixer cannot be applied to material sampled at
                192kHz.
              </li>
              <li>
                <b>Dolby Surround</b>: When this is selected, the Dolby
                Surround algorithm is enabled to analyzer the input stream and
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
                <b>DTS Neural-X</b>: When this is selected, the DTS Neural-X
                algorithm is enabled to analyze the input stream and process
                it for presentation across the available speaker set. This is
                an evolution of the previous DTS NEO. One control is provided,
                namely <i>wide synth</i>. Since the Neural-X code only
                produces data for 12 channels (7.1.4), enabling the wide synth
                control will populate the rest of the channels.
              </li>
              <li>
                <b>Auro3D</b>: When this is selected, the Auro Technology
                Engine is engaged to analyzer the input stream and process it
                for presentation across the available speaker set. The Auro3D
                engine provides an alternative to the Dolby and DTS systems.
                When sources are encoded using the Auro3D algorithm the engine
                detects this and decodes more channels. For instance, it is
                common to find program material recorded using Auro3D to
                capture 14 channels (7.1.6a) but encoded with 8 channels
                (7.1). BlueRay disks with such content are clearly labeled.
                The Auro3D engine can also function as an upmixer when the
                source material is not encoded. Then the <i>AuroMatic</i>
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
                <b>Wide Synth</b>: Synthesizes wide speakers when possible.
              </li>
            </ul>
            <p>
              A note about <b>Dolby Atmos</b> and <b>DTS-X sources</b>: When
              the signal if encoded with Dolby Atmos and likewise with DTS-X
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
                <b>HDMI CEC</b>: CEC stands for <i>onsumer Electronics Control</i>. It is designed
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
                shortest delay will be achieved in direct mode.
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
              enable or disable WiFi as well as configure automatic (DHCP)
              address assignment or manual configuration. 
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
            <p>The <i>Macros</i> page allows you to record your actions and save them to the CMD A/B/C/D and PRESET 1/2/3/4 buttons of the remote control.</p>
            <ul>
              <li>Select one of the 8 slots to record your actions.</li>
              <li>Click the Recording button to start recording, and then perform the actions you wish to record, using either the remote or the web interface.</li>
              <li>Your actions will be recorded on the Macros page. You may delete any undesirable entries, or drag rows to rearrange the order of entries.</li>
              <li>When you are finished, click the save button to save your recordings to the slot that you selected.</li>
              <li>Click the button you selected on the remote to play back your recordings.</li>
              <li>You can create additional macros which can be added to the home page from the <i>Personalize</i> tab.</li>
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
                Homepage status display
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
              <li>You can select shortcuts to settings pages which will appear on the top right of the screen.</li>
              <li>You can select which buttons appear under the <i>Modes</i> section of the homepage.</li>
              <li>You can select which macro buttons appear under the <i>Macros</i> section of the homepage.</li>
              <li>You can select which Dirac Live slots appear under the <i>Dirac Live Slot</i> section of the homepage.</li>
              <li>Notices are small info boxes that appear on various settings pages. You can restore all dismissed notices.</li>
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
                <b>Power On Volume</b>: This number sets the default volume after restart.
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
                The <i>Unit Name</i> is displayed by to the outside world.
                Examples include:
              </li>
              <ul>
                <li>The Dirac Live calibration tool</li>
                <li>Bluetooth devices</li>
                <li>Roon player</li>
              </ul>
              <li>
                When <i>Fast Start</i> is on the unit will not completely power
                down and hence it will start up very quickly. You have the
                option of keeping <i>Video Pass Through</i> alive. When <i>Fast
                Start</i> is off, powering back up will take somewhat longer. CEC
                based power up will not work when <i>Fast Start</i> is off.
              </li>
              <li>
                Front panel brightness can be adjusted here. The <i>DIM</i>
                button on the remote also works.
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
                You can export and import settings. It's a good idea
                to export the configuration when you are happy with your
                settings. Then you can re-import them if the settings
                are lost or damaged.
              </li>
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
  '/settings/signal-generator': 3,
  '/settings/peq': 4,
  '/settings/tone-control': 5,
  '/settings/loudness': 6,
  '/settings/upmix': 7,
  '/settings/inputs': 8, 
  '/settings/network': 9, 
  '/settings/macros': 10, 
  '/settings/personalize': 11, 
  '/settings/system': 12, 
  '/settings/configs': 13, 
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
