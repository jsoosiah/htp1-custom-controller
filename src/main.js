import 'bootstrap/dist/css/bootstrap.min.css';

import { createApp } from 'vue';
import router from './router.js';
import App from './App.vue';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faVolumeUp, faVolumeDown, faPowerOff, faCog, 
  faPlus, faTimes, faQuestionCircle, faExclamationCircle, 
  faGripLines, faHome, faExternalLinkAlt, faTv, faPlusCircle, 
  faMinusCircle, faFilm } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faVolumeUp, faVolumeDown, faPowerOff, 
  faCog, faPlus, faTimes, faQuestionCircle, 
  faExclamationCircle, faGripLines, faHome, 
  faExternalLinkAlt, faTv, faMinusCircle, faPlusCircle,
  faFilm );

createApp(App)
.component('font-awesome-icon', FontAwesomeIcon)
.use(router)
.mount('#app');
