import { createApp } from 'vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.vue';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faVolumeUp, faVolumeDown, faPowerOff, faCog, 
  faPlus, faTimes, faQuestionCircle, faExclamationCircle, 
  faGripLines } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faVolumeUp, faVolumeDown, faPowerOff, 
  faCog, faPlus, faTimes, faQuestionCircle, 
  faExclamationCircle, faGripLines);

createApp(App)
.component('font-awesome-icon', FontAwesomeIcon)
.mount('#app');
