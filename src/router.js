import { createRouter, createWebHistory } from 'vue-router';

const AppLayout = () => import('./components/AppLayout.vue');

const Home = () => import('./components/Home.vue');
const Settings = () => import('./components/Settings.vue');

const Speakers = () => import('./components/Speakers.vue');
const Calibration = () => import('./components/Calibration.vue');
const SignalGenerator = () => import('./components/SignalGenerator.vue');
const Peq = () => import('./components/Peq.vue');
const BassEq = () => import('./components/BassEq.vue');
const ToneControl = () => import('./components/ToneControl.vue');
const Loudness = () => import('./components/Loudness.vue');
const SoundEnhancement = () => import('./components/SoundEnhancement.vue');

const Inputs = () => import('./components/Inputs.vue');
const Connectivity = () => import('./components/Connectivity.vue');
const Macros = () => import('./components/Macros.vue');
const Personalize = () => import('./components/Personalize.vue');
const VolumeSetup = () => import('./components/VolumeSetup.vue');
const System = () => import('./components/System.vue');
const Configs = () => import('./components/Configs.vue');

const About = () => import('./components/About.vue');
const Help = () => import('./components/Help.vue');

const TargetCurveTransformer = () => import('./components/TargetCurveTransformer.vue');

const settingsRoutes = [
  { path: ''}, // divider
  { path: 'speakers', component: Speakers, meta: { label: 'Speakers', icon: 'speakers-icon' }},
  { path: 'calibration', component: Calibration, meta: { label: 'Calibration', icon: 'calibration-icon' }},
  { path: 'signal-generator', component: SignalGenerator, meta: { label: 'Signal Generator', icon: 'sgen-icon' }},
  { path: 'peq', component: Peq, meta: { label: 'PEQ', icon: 'peq-icon' }},
  { path: 'bass-eq', component: BassEq, meta: { label: 'Filtered Bass EQ', icon: 'filtered-bass-eq-icon' }},
  { path: 'tone-control', component: ToneControl, meta: { label: 'Tone Control', icon: 'tone-control-icon' }},
  { path: 'loudness', component: Loudness, meta: { label: 'Loudness', icon: 'loudness-icon' }},
  { path: 'upmix', component: SoundEnhancement, meta: { label: 'Upmix', icon: 'upmix-icon' }},
  { path: ''}, // divider
  { path: 'inputs', component: Inputs, meta: { label: 'Inputs', icon: 'inputs-icon' }},
  { path: 'network', component: Connectivity, meta: { label: 'Network', icon: 'network-icon', keepAlive: false }},
  { path: 'macros', component: Macros, meta: { label: 'Macros', icon: 'macros-icon' }},
  { path: 'personalize', component: Personalize, meta: { label: 'Personalize', icon: 'personalize-icon' }},
  { path: 'volume', component: VolumeSetup, meta: {label: 'Volume Setup', icon: 'volume-icon'}},
  { path: 'system', component: System, meta: { label: 'System', icon: 'system-icon' }},
  { path: 'configs', component: Configs, meta: { label: 'Configs', icon: 'configs-icon' }},
  { path: ''}, // divider
  { path: 'about', component: About, meta: { label: 'About', icon: 'about-icon' }},
  { path: 'help', component: Help, meta: { label: 'Help', icon: 'help-icon' }},
  { path: ''}, // divider
];

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', 
      component: AppLayout, 
      meta: { label: 'Home' }, 
      children: [
        { 
          path: '', 
          component: Home,
        },
        { 
          path: 'settings', 
          component: Settings, 
          children: [...settingsRoutes,         
            {
              path: 'target-curve-transformer',
              component: TargetCurveTransformer,
            }
          ],
          redirect: '/settings/speakers'
        },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    }
  ]
});

export { settingsRoutes };