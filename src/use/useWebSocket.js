// websocket URL - note that the IP address is hard-coded in development mode
// const websocketurl = `ws://${process.env.NODE_ENV === 'production' ? window.location.host : '192.168.1.13'}/ws/controller`;

// websocket URL - user configurable and saved to device local storage
// const websocketIp = ref(localStorage.getItem('websocketIp'));
import { times, random } from 'lodash-es';
import ReconnectingWebSocket from '@slite/reconnecting-websocket';

import useLocalStorage from './useLocalStorage.js';

const { websocketIp, setWebsocketIp } = useLocalStorage();

const websocketurl = computed(() => {
    console.log('compute websocketurl', websocketIp.value);
    return websocketIp.value ? `ws://${websocketIp.value}/ws/controller` : null;
});

function findServers(port, ipBase, ipLow, ipHigh, maxInFlight, timeout, cb) {
    var ipCurrent = +ipLow, numInFlight = 0, servers = [];
    let exitFlag = false;
    ipHigh = +ipHigh;

    function tryOne(ip) {
        ++numInFlight;
        var address = "ws://" + ipBase + ip +'/ws/controller';
        var socket = new WebSocket(address);
        var timer = setTimeout(function() {
            console.log(address + " timeout");
            var s = socket;
            socket = null;
            s.close();
            --numInFlight;
            next();
        }, timeout);
        socket.onopen = function() {
            if (socket) {
                console.log(address + " success");
                clearTimeout(timer);
                // servers.push(socket.url);
                setWebsocketIp(ipBase + ip);
                exitFlag = true;
                return;
                // --numInFlight;
                // next();
            }
        };
        socket.onerror = function() {
            if (socket) {
                console.log(address + " error");
                clearTimeout(timer);
                --numInFlight;
                next();
            }
        }
    }

    function next() {
        while ((ipCurrent <= ipHigh && numInFlight < maxInFlight) && !exitFlag) {
            tryOne(ipCurrent++);
        }
        // if we get here and there are no requests in flight, then
        // we must be done
        if (numInFlight === 0) {
            console.log(servers);
            cb(servers);
        }
    }

    next();
}

import { ref, watch, computed } from 'vue';


const data = ref(null);
const state = ref('CONNECTING');
const eventHash = ref(null);

let ws;
const close = function close(code, reason) {
    if (!ws)
        return;
    ws.close(code, reason);
};
const send = function send(data) {
    if (!ws || state.value !== 'OPEN') {
        console.log('send: socket not ready, ignoring', data);
        return;
    }
    ws.send(data);
};

function initialize() {
    console.log('initialize: entering', websocketurl.value);

    if (ws) {
        ws.close();
    }

    if (websocketurl.value) {
        ws = new ReconnectingWebSocket(websocketurl.value, {
            maxReconnectionDelay: 5000,
            minReconnectionDelay: 1000,
            reconnectionDelayGrowFactor: 1.1,
        });

        ws.addEventListener('open', () => {
            state.value = 'OPEN';
        });

        ws.addEventListener('close', () => {
            state.value = 'CLOSE';
        });

        ws.addEventListener('error', () => {
            state.value = 'ERROR';
        });

        ws.addEventListener('message', (e) => {
            data.value = e.data;
            eventHash.value = times(20, () => random(35).toString(36)).join('');
        });
    }
}

watch(
    websocketurl, 
    newWebsocketurl => {
        initialize();
});

initialize();

export default function useWebSocket() {

    return {
        data,
        state,
        close,
        send,
        websocketIp,
        websocketurl,
        setWebsocketIp,
        findServers,
        eventHash
    };
}