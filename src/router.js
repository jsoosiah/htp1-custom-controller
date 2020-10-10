import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './components/Home.vue';

const ExperimentalApp = () => import('./ExperimentalApp.vue');

const ExperimentalHome = () => import('./components/ExperimentalHome.vue');
const ExperimentalSettings = () => import('./components/ExperimentalSettings.vue');

const Speakers = () => import('./components/Speakers.vue');
const Calibration = () => import('./components/Calibration.vue');
const SignalGenerator = () => import('./components/SignalGenerator.vue');
const Peq = () => import('./components/Peq.vue');
const ToneControl = () => import('./components/ToneControl.vue');
const Inputs = () => import('./components/Inputs.vue');
const SoundEnhancement = () => import('./components/SoundEnhancement.vue');
const Connectivity = () => import('./components/Connectivity.vue');
const Macros = () => import('./components/Macros.vue');
const System = () => import('./components/System.vue');
const About = () => import('./components/About.vue');
const Help = () => import('./components/Help.vue');

const settingsRoutes = [
  { path: 'speakers', component: Speakers, meta: { label: 'Speakers', icon: 'speakers-icon' }},
  { path: 'calibration', component: Calibration, meta: { label: 'Calibration', icon: 'calibration-icon' }},
  { path: 'signal-generator', component: SignalGenerator, meta: { label: 'Signal Generator', icon: 'sgen-icon' }},
  { path: 'peq', component: Peq, meta: { label: 'PEQ', icon: 'peq-icon' }},
  { path: 'tone-control', component: ToneControl, meta: { label: 'Tone Control', icon: 'tone-control-icon' }},
  { path: 'inputs', component: Inputs, meta: { label: 'Inputs', icon: 'inputs-icon' }},
  { path: 'sound-enhancement', component: SoundEnhancement, meta: { label: 'Sound Enhancement', icon: 'upmix-icon' }},
  { path: 'connectivity', component: Connectivity, meta: { label: 'Connectivity', icon: 'network-icon' }},
  { path: 'macros', component: Macros, meta: { label: 'Macros', icon: 'macros-icon' }},
  { path: 'system', component: System, meta: { label: 'System', icon: 'system-icon' }},
  { path: 'about', component: About, meta: { label: 'About', icon: 'about-icon' }},
  { path: 'help', component: Help, meta: { label: 'Help', icon: 'help-icon' }},
];

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/experimental', 
      component: ExperimentalApp, 
      meta: { label: 'Home' }, 
      children: [
        { 
          path: '', 
          component: ExperimentalHome,
        },
        { 
          path: 'settings', 
          component: ExperimentalSettings, 
          children: settingsRoutes,
          redirect: '/experimental/settings/speakers'
        },
      ] 
    },
    // settings
  ]
});

export { settingsRoutes };