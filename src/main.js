import { createApp } from 'vue';
import Highcharts from 'highcharts';
import VueHighcharts from 'vue-highcharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.vue';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faVolumeUp, faVolumeDown, faPowerOff, faCog, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faVolumeUp, faVolumeDown, faPowerOff, faCog, faPlus, faTimes);

createApp(App)
.component('font-awesome-icon', FontAwesomeIcon)
.use(VueHighcharts, { Highcharts })
.mount('#app');
