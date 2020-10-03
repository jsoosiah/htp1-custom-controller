<template>
  <div class="transition-container">
    <h5>Help Manual</h5>

      <div class="accordion" id="accordionExample">
        <div class="card">
          <div class="card-header" id="headingOne" @click="toggleOpened(0)">
            <h2 class="mb-0">
              <button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                Main Page Help
              </button>
            </h2>
          </div>

          <div id="collapseOne" class="collapse" :class="{'show': opened[0]}" aria-labelledby="headingOne" data-parent="#accordionExample">
            <div class="card-body">
              <div class="alert alert-info small alert-box" role="alert">
                The user guide has more information. <a
                  :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`" target="_blank">Click
                  here to access a PDF copy of the user guide</a>.
              </div>
              <p>
                This page is the main interface to the system. It looks much like
                the front panel, but while the front panel is only a display, this
                web page is interactive. The system is designed to be configured from this set of web pages.
              </p>
              <ul>
                <li>The details of the audio stream are presented here much like
                  on the front panel. </li>
                <li>The gear in the upper right allows you to configure the
                  system. </li>
                <li>The info button in the upper right allows you to update the
                  system. </li>
                <li>You pressed the help button to get here. </li>
                <li>You can adjust the volume, choose an input, and select an
                  upmixer.<br>
                </li>
                <li>The input configuration page sets which inputs are available
                  on buttons. Clicking in the upper left allows you to choose
                  from the full input list. </li>
                <li>The sound enhancement page sets which upmixers are available
                  on buttons. The help on the sound enhancement page explains
                  the upmixers in more detail. </li>
                <li>Night mode engages any available Dolby or DTS functions to
                  reduce the dynamic range of the program. It also lowers the
                  subwoofer by 6dB. </li>
                <li>The Dirac button allows you to quickly hear the effect of
                  the Dirac calibration filters. <i>You must perform a Dirac
                    calibration for this feature to be active.</i><br>
                </li>
                <li>The loudness button engages a filter that turns up the bass
                  as the volume goes down. Actually, it is a bit more
                  complicated. The loudness button engages processing to closely
                  follow the Fletcher-Munson equal loudness curves, as described
                  on Wikipedia. </li>
                <li>The dialog enhancement button is designed to make it easier
                  to hear the dialog. Some DTS-X streams have a feature to
                  adjust dialog directly and this control is connected to that
                  feature. If the stream does not have this feature then the
                  center channel is boosted. </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header" id="headingTwo" @click="toggleOpened(1)">
            <h2 class="mb-0">
              <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                Speakers
              </button>
            </h2>
          </div>
          <div id="collapseTwo" class="collapse" :class="{'show': opened[1]}" aria-labelledby="headingTwo" data-parent="#accordionExample">
            <div class="card-body">
              <div class="alert alert-info small alert-box" role="alert">
                The user guide has more information. <a
                  :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`" target="_blank">Click
                  here to access a PDF copy of the user guide</a>.
              </div>
              <p>
              The user guide suggests users first make a simple setup, then tune
              and evolve to a more complex configuration.
              </p>
              <ul>
                <li>The speaker setup page allows you to specify which speakers
                  are present. It also allows you to describe them for the purpose
                  of <a href="https://en.wikipedia.org/wiki/Bass_management">bass
                    management</a>. </li>
                <li>Unless you regularly change your speakers and amps, you should
                  not expect to change this page often. This page describes your
                  speakers. </li>
                <li>Turn on the speaker switches to match your configuration.
                  Refer to the user manual for more details about which speakers
                  are where. </li>
                <li>A Dirac calibration allows you to see the measured cutoff
                  frequencies for the small speakers. Other procedures, including
                  a noise source from a test disk are also used, but a Dirac
                  calibration is really accurate. Set the cutoff frequencies based
                  on these measurements. </li>
                <li>The user guide contains more information about Dirac
                  calibration. You can download the Dirac Live tool here: <a
                    href="https://live.dirac.com/download/">https://live.dirac.com/download/</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header" id="headingThree" @click="toggleOpened(2)">
            <h2 class="mb-0">
              <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                Calibration
              </button>
            </h2>
          </div>
          <div id="collapseThree" class="collapse" :class="{'show': opened[2]}" aria-labelledby="headingThree" data-parent="#accordionExample">
            <div class="card-body">
              <div class="alert alert-info small alert-box" role="alert">
                The user guide has more information. <a
                  :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`" target="_blank">Click
                  here to access a PDF copy of the user guide</a>.
              </div>
              <ul>
                <li><b>Min. volume</b>: This number sets the lowest level of
                  volume possible using any volume control. Set it so that
                  you can barely hear the audio. </li>
                <li><b>Max. listening volume</b>: This number limits the upper
                  range of the volume control. The user guide gives more
                  background. This control can be usefully adjusted to
                  limit the volume of a system that is in fact capable of much
                  higher volumes.</li>
                <li><b>Max. Output Level</b>: The maximum Output Level,
                  specified in volts, sets the level at which the output of the
                  HTP-1 saturates. It should represent the loudest volume
                  the system can achieve. Amplifier manufacturers
                  typically specify this number as the "amplifier
                  sensitivity". The user guide discusses what to do if you
                  don't know the amplifier sensitivity. It suggests starting at
                  1 volt and then adjusting by ear.<br>
                </li>
                <li><b>Lipsync</b><b> Delay</b>: The audio is delayed by the
                  specified number of milliseconds. Begin system setup with this
                  set to zero and do a Dirac calibration. Then check the sync
                  between the audio and the video using a local source that you
                  trust. Note that the surround modes add delay. The
                  shortest delay will be achieved in direct mode.</li>
                <li><b>Dirac Room Calibration Active</b>: This switch allows you
                  to completely disable Dirac room calibration. It is
                  appropriate to turn this off if you have never done a Dirac
                  calibration. The user guide has more information on performing
                  a Dirac Live calibration. You can download the Dirac Live tool
                  here. <a href="https://live.dirac.com/download/">https://live.dirac.com/download/</a>
                </li>
                <li><b>Dirac Filters: </b>Dirac filters are created using the
                  Dirac Live tool to calibrate the system. The user guide gives
                  a more detailed explanation. </li>
                <li><b>Delay and Trim</b>: A Dirac calibration measures the room
                  and determines the amount of delay and trim required to align
                  the speakers in the room. The trim matches the levels. The
                  delay accounts for the different distances of the speakers as
                  sound travels at approximately one millisecond per foot. A
                  properly executed Dirac calibration will automatically choose
                  the optimal delay and trim. The user delay and trim should be
                  zero after a Dirac calibration is completed. </li>
                <li><b>User Trim and Delay</b>: These user controls can be used
                  if a Dirac calibration is not desired. They can also be used
                  to modify the values determined by the Dirac calibration. The
                  user values add to the values determined by Dirac to make the
                  total delay and trim. You should be aware that setting very
                  high trim values can lead to digital clipping. </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header" id="headingTwo" @click="toggleOpened(3)">
            <h2 class="mb-0">
              <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                Signal Generator
              </button>
            </h2>
          </div>
          <div id="collapseTwo" class="collapse" :class="{'show': opened[3]}" aria-labelledby="headingTwo" data-parent="#accordionExample">
            <div class="card-body">
              <div class="alert alert-info small alert-box" role="alert">
                The user guide has more information. <a
                  :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`" target="_blank">Click
                  here to access a PDF copy of the user guide</a>.
              </div>
              <p>
                The controls for the signal generators are found here.
              </p>
              <ul>
                <li><b>Signal Generator</b>: Toggles between ON and OFF to 
                  turn on or off the signal generator.  The signal generator
            mimics an off-board signal generator.  That is to say the 
            generator once turned on, remains on until it is turned off.
            This means it remains turned on when you visit other configuration 
            pages such as Calibration and EQ, or even change to different inputs.
            This also means the generator outputs are processed by the Dirac 
            room correction filters, tone controls, as well as the PEQ filters.
                </li>
                <li>
                  <b>Signal Selection</b>: The Signal Generator support a number of signal generations:
                  <ul>
                    <li>
                      <b>"THX_like" band limited noise</b>: 
                      "THX_like" band limited noise
                    </li>
                    <li>
                      <b>Louder reference noise</b>: A band limited noise 
                      with energy between 300 Hz and 3 kHz and peak at 1 kHz
                    </li>
                    <li>
                      <b>Polarity pulse</b>: 
                      A positive impluse
                    </li>
                    <li>
                      <b>Left input as signal</b>: 
                      Sends the Left input to the selected speaker.
                      Allows third party tools such as Room Equalization
                      Wizard to measure speaker inaccessible through HDMI PCM 
                      inputs.
                    </li>
                    <li>
                      <b>Right input as signal</b>: 
                      Sends the Right input to the selected speaker.
                      Allows third party tools such as Room Equalization
                      Wizard to measure speaker inaccessible through HDMI PCM 
                      inputs.
                    </li>
                  </ul>
                </li>
                <li>
                  <b>Speaker List</b>: This is the list of currently enabled speakers.  Choose the destination of the test signal.
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header" id="headingThree" @click="toggleOpened(4)">
            <h2 class="mb-0">
              <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                Parametric EQ
              </button>
            </h2>
          </div>
          <div id="collapseThree" class="collapse" :class="{'show': opened[4]}" aria-labelledby="headingThree" data-parent="#accordionExample">
            <div class="card-body">
              <div class="alert alert-info small alert-box" role="alert">
                The user guide has more information. <a
                  :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`" target="_blank">Click
                  here to access a PDF copy of the user guide</a>.
              </div>
              <p>The controls for the parametric equalizers are found here.</p>
              <ul>
                <li><b>Parmetric</b><b> EQ</b>: The system allows for up to 16
                  bands of parametric EQ, individually adjustable on each
                  channel. These settings are typically used to tweak the
                  response of the room.&nbsp;</li>
                <li>The tone and PEQ features are automatically disabled when a
                  Dirac calibration is run. These filters are used to
                  adjust a room that is already calibrated. There is discussion
                  about allowing the PEQ to run before the Dirac filter to allow
                  for a pre-calibration EQ. This is not yet exposed.<br>
                </li>
              </ul>
              <blockquote>Note that applying large boost in the equalization can
                lead to digital clipping. </blockquote>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header" id="headingTwo" @click="toggleOpened(5)">
            <h2 class="mb-0">
              <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                Tone Control
              </button>
            </h2>
          </div>
          <div id="collapseTwo" class="collapse" :class="{'show': opened[5]}" aria-labelledby="headingTwo" data-parent="#accordionExample">
            <div class="card-body">
              <div class="alert alert-info small alert-box" role="alert">
                The user guide has more information. <a
                  :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`" target="_blank">Click
                  here to access a PDF copy of the user guide</a>.
              </div>
              <p>
                The controls for tone controls and loudness compensation are found here.
              </p>
              <ul>
                <li><b>Tone Control</b>: Traditional tone controls can be
                  enabled. When enabled the boost or cut can be specified as
                  well as the corner frequencies. </li>
                <li>
                  <b>Loudness Calibration</b>: The loudness calibration number
                  corresponds roughly to the sound pressure level at which you
                  want a flat response. That would be the “normal
                  listening volume”. A higher number means there will be
                  more loudness bass as the volume goes down. A lower
                  number decreases the amount of bass boost.<br>
                </li>
                <li>The tone and PEQ features are automatically disabled when a
                  Dirac calibration is run. These filters are used to
                  adjust a room that is already calibrated. There is discussion
                  about allowing the PEQ to run before the Dirac filter to allow
                  for a pre-calibration EQ. This is not yet exposed.<br>
                </li>
              </ul>
              <blockquote>Note that applying large boost in the equalization can
                lead to digital clipping. </blockquote>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header" id="headingThree" @click="toggleOpened(6)">
            <h2 class="mb-0">
              <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                Inputs
              </button>
            </h2>
          </div>
          <div id="collapseThree" class="collapse" :class="{'show': opened[6]}" aria-labelledby="headingThree" data-parent="#accordionExample">
            <div class="card-body">
              <div class="alert alert-info small alert-box" role="alert">
                The user guide has more information. <a
                  :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`" target="_blank">Click
                  here to access a PDF copy of the user guide</a>.
              </div>
              <p>
                The input page allows you to assign a human readable name to each
                input. It also allows you to choose which input buttons will be
                present on the main page of the web UI. 
              </p>
              <ul>
                <li>The <i>UHD Capable</i> switches on the HDMI inputs can be
                  helpful when debugging video connections. The difficulties
                  getting 4k (UHD) video to play nice together are well
                  documented on the web. Disabling UHD for an input will force
                  the source device to send 2k (HD) video. The user guide has
                  more ideas of what to try if this fixes the connection. </li>
                <li>Nearly the last entry on the page is the BlueTooth device.
                  The controls necessary to discover and pair with a BlueTooth
                  device are found here. </li>
                <li>When Show Advanced Input Settings is enabled, another switch is
                  exposed for the digital inputs. The PCM Detector
                  Sensitivity has three settings. "Auto" is the default
                  setting and this is usually correct. The "Biased"
                  setting is biased toward PCM material. This might be
                  appropriate for a player playing a CD. The "indicated"
                  setting relies on the audio format indicated by the HDMI
                  stream.<br>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header" id="headingTwo" @click="toggleOpened(7)">
            <h2 class="mb-0">
              <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                Sound Enhancement
              </button>
            </h2>
          </div>
          <div id="collapseTwo" class="collapse" :class="{'show': opened[7]}" aria-labelledby="headingTwo" data-parent="#accordionExample">
            <div class="card-body">
              <div class="alert alert-info small alert-box" role="alert">
                The user guide has more information. <a
                  :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`" target="_blank">Click
                  here to access a PDF copy of the user guide</a>.
              </div>
              <p>
                The system supports a number of algorithms designed to <i>make it
                  sound better</i>. These are in fact <i>upmixers</i>. We
                sometimes refer to these as <i>sound modes</i>. They make more
                channels from fewer channels. They are designed in particular to
                help older source material (stereo or 5.1) drive the wide set of
                speakers that are supported here. Controls are provided for each
                algorithm to choose whether or not it is visible on the home page.
                A radio button allows you to choose one to listen to as you
                adjust. And some of the algorithms have more controls that you can
                access.</p>
              <ul>
                <li><b>Direct</b>: The direct sound mode applies no upmix
                  algorithm. The decoded audio is played <i>directly</i> with
                  no modification. The upmixer is <i>off</i>. The program
                  material is presented at its original sample rate. If you wish
                  to listen to material at high sample rates (96k or 192k) then
                  you should use direct mode. All of the other upmixers use a
                  high quality sample rate converter to drop the output sample
                  rate to 48000 (or 44100)Hz. </li>
                <li><b>Native</b>: In native mode, the Dolby Surround upmixer is
                  applied only to material decoded from Dolby sources. The DTS
                  Neural-X upmixer is applied only to native DTS sources. And
                  the Auro3D decoder is enabled to handle any Auro3D encoded
                  sources. No upmixer is applied to PCM sources. The
                  AuroMatic upmixer cannot be applied to material sampled at
                  192kHz. </li>
                <li><b>Dolby Surround</b>: When this is selected, the Dolby
                  Surround algorithm is enabled to analyzer the input stream and
                  process it for presentation across the available speaker set.
                  This is an evolution of the previous Dolby Pro-Logic. It has
                  one control, namely center spread. When center spread is
                  enabled the material found for the center channel is also
                  added to the left and right channels, hence <i>spreading</i>
                  the center channel sound. The Dolby Surround upmixer can
                  support any combination of speakers provide here. There may
                  not be anything in some of the channels. For instance, a mono
                  input will result in sound only from the center channel. </li>
                <li><b>DTS Neural-X</b>: When this is selected, the DTS Neural-X
                  algorithm is enabled to analyzer the input stream and process
                  it for presentation across the available speaker set. This is
                  an evolution of the previous DTS NEO. One control is provided,
                  namely <i>wide synth</i>. Since the Neural-X code only
                  produces data for 12 channels (7.1.4), enabling the wide synth
                  control will populate the rest of the channels. </li>
                <li><b>Auro3D</b>: When this is selected, the Auro Technology
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
                  number of controls to adjust this algorithm. </li>
                <li><b>Mono</b>: All of the available channels are mixed down to
                  mono and the same signal is presented to all speakers. </li>
                <li><b>Stereo</b>: All of the available channels are mixed down
                  to stereo and with the left signal going to all left speakers
                  and the right to all right speakers. The center speaker gets a
                  mono mix. </li>
              </ul>
              <p>A note about <b>Dolby Atmos</b> and <b>DTS-X sources</b>: When
              the signal if encoded with Dolby Atmos and likewise with DTS-X
              then none of the fancy upmixers can be applied. Following the
              guidance of the folks at Dolby and DTS, these signals are already
              optimized for lots of speakers. Hence the availability of such a
              signal overrides the selection of an upmixer. The mono and stereo
              upmixers are an exception to this. They can be applied to any
              signal.</p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header" id="headingThree" @click="toggleOpened(8)">
            <h2 class="mb-0">
              <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                Connectivity
              </button>
            </h2>
          </div>
          <div id="collapseThree" class="collapse" :class="{'show': opened[8]}" aria-labelledby="headingThree" data-parent="#accordionExample">
            <div class="card-body">
              <div class="alert alert-info small alert-box" role="alert">
                The user guide has more information. <a
                  :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`" target="_blank">Click
                  here to access a PDF copy of the user guide</a>.
              </div>
              <p>
                The connectivity page allows you to configure your network
                connection as well as the control connection with your TV. You can
                enable or disable WiFi as well as configure automatic (DHCP)
                address assignment or manual configuration. 
              </p>
              <ul>
                <li>CEC stands for Consumer Electronic Control. It is designed
                  to simplify the connection of devices like amplifiers and
                  players with TV sets. The entries on the connectivity page
                  allow you to configure CEC to work best in your system. 
                  CEC is an attempt to make one remote (that of the TV) control
                  the whole system. It works better with some combinations of
                  devices than with others.<br>
                </li>
                <li>Ethernet settings are displayed. If a static IP
                  address is desired, turn off DHCP and provide the required
                  information. Then "apply" the network settings.</li>
                <li>When WiFi is enabled the system scans to find available
                  networks. These are displayed on the left. Choose
                  a network, enter the password, and click on "CONFIGURE".&nbsp;
                  After a brief delay the network should appear in the list of
                  configured networks on the right.</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header" id="headingTwo" @click="toggleOpened(9)">
            <h2 class="mb-0">
              <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                Macros
              </button>
            </h2>
          </div>
          <div id="collapseTwo" class="collapse" :class="{'show': opened[9]}" aria-labelledby="headingTwo" data-parent="#accordionExample">
            <div class="card-body">
              <p>The Macros page allows you to record your actions and save them to the CMD A/B/C/D and PRESET 1/2/3/4 buttons.</p>
              <ul>
                <li>Select one of the 8 slots to record your actions.</li>
                <li>Click the Recording button to start recording, and then perform the actions you wish to record, using either the remote or the web interface.</li>
                <li>Your actions will be recorded on the Macros page. You may delete any undesirable entries, or drag rows to rearrange the order of entries.</li>
                <li>When you are finished, click the save button to save your recordings to the slot that you selected. Click the button you selected on the remote to play back your recordings.</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header" id="headingThree" @click="toggleOpened(10)">
            <h2 class="mb-0">
              <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                System
              </button>
            </h2>
          </div>
          <div id="collapseThree" class="collapse" :class="{'show': opened[10]}" aria-labelledby="headingThree" data-parent="#accordionExample">
            <div class="card-body">
              <div class="alert alert-info small alert-box" role="alert">
                The user guide has more information. <a
                  :href="`http://${websocketIp}/Monolith%20HTP-1%20User%20Guide.pdf`" target="_blank">Click
                  here to access a PDF copy of the user guide</a>.
              </div>
              <p>In addition to a few system level controls, this page also
                displays some helpful information like the IP address and the
                current output video resolution.<br>
              </p>
              <ul>
                <li>The unit name is displayed by to the outside world.&nbsp;
                  Examples include:</li>
                <ul>
                  <li>The Dirac calibration tool.</li>
                  <li>Blue tooth devices.</li>
                  <li>Roon player.<br>
                  </li>
                </ul>
                <li>The unit can be powered down from this page.</li>
                <li>When fast start is on the unit will not completely power
                  down and hence it will start up very quickly. You have the
                  option of keeping video pass through alive. When fast
                  start is off, powering back up will take somewhat longer. CEC
                  based power up will not work when fast start is off.<br>
                </li>
                <li>You can set the volume you would like to have when the unit
                  boots up.<br>
                </li>
                <li>Front panel brightness can be adjusted here. The "dim"
                  button on the remote also works.</li>
                <li>The volume control can use a slider or buttons.</li>
                <li>You can export and import settings. It's a good idea
                  to export the configuration when you are happy with your
                  settings. Then you can re-import them if the settings
                  are lost or damaged.<br>
                </li>
                <li>Several check-boxes enable features:</li>
                <ul>
                  <li>You can cause video status (resolution, color depth, etc)
                    to be displayed on the main page.</li>
                  <li>You can cause audio sample rates to be displayed on the
                    main page.</li>
                </ul>
              </ul>
            </div>
          </div>
        </div>
      </div>


  </div>

</template>

<script>

import { ref } from 'vue';

import useMso from "@/use/useMso.js";
import useLocalStorage from "@/use/useLocalStorage.js";

export default {
  name: "About",
  setup() {

    const opened = ref({
      0: true,
    });
    function toggleOpened(key) {
      opened.value[key] = !opened.value[key];
    }

    return { ...useMso(), ...useLocalStorage(), opened, toggleOpened };
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

</style>