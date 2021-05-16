// websocket URL - note that the IP address is hard-coded in development mode
// const websocketurl = `ws://${process.env.NODE_ENV === 'production' ? window.location.host : '192.168.1.13'}/ws/controller`;

// websocket URL - user configurable and saved to device local storage
// const websocketIp = ref(localStorage.getItem('websocketIp'));

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

// Define WSClient instance, a WebSocket with auto reconnect - https://stackoverflow.com/questions/49629881/reconnecting-a-websocket-without-creating-a-new-instance
class WSClient {

    constructor() {
        // Default reconnect interval
        this.shortReconnectInterval = 1000;
        this.longReconnectInterval = 5000;

        this.reconnectsAttempted = 0;

        // Define whether it has ever reconnected
        this.reconnected = false;

        // Log messages
        this.debug = false;
    }

    // Open the URL
    open() {

        // Define that
        var that = this;

        // Create underlying websocket instance
        this.instance = new WebSocket(websocketurl.value);

        // Setup the event handler for onopen
        this.instance.onopen = function (ev) {

            that.reconnectsAttempted = 0;

            // Run the open function
            that.onopen(ev);
        }

        // Setup the event handler for onmessage
        this.instance.onmessage = function(data, flags) {
            that.onmessage(data, flags);
        }

        // Setup the event handler for onclose
        this.instance.onclose = function(e) {
            switch (e){

                // Normal closure
                case 1000:
                    if (that.debug) {
                        console.log("[WS]: Closed");
                    }
                    break;

                // Abnormal closure
                default:
                    that.reconnect(e);
                    break;
            }

            // Run onclose event
            that.onclose(e);
        }

        // Setup the event handler for onerror
        this.instance.onerror = function(e) {
            switch (e.code){

                // Try and reconnect
                case 'ECONNREFUSED':
                    that.reconnect(e);
                    break;

                // Otherwise run error
                default:
                    that.onerror(e);
                    break;
            }
        }
    }

    // Close websocket
    close() {
        this.instance.close();
    }

    // Setup send function
    sendRaw(data, option) {
        try {
            this.instance.send(data, option);
        } catch (e) {
            this.instance.emit('error', e);
        }
    }

    // Send the content
    send(content) {
        this.instance.send(content);
    }

    // Define the reconnection function
    reconnect() {

        // Define that
        var that = this;

        // Set reconnect timeout
        setTimeout(function() {

            that.reconnectsAttempted += 1;

            console.log('WS: attempt reconnect', that.reconnectsAttempted);

            // Try and open the URL
            that.open(websocketurl.value);

        }, that.reconnectsAttempted < 10 ? this.shortReconnectInterval : this.longReconnectInterval);
    }
}

// this implementation is ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad 
// it uses the above WSClient to reconnect automatically 
import { ref, watch, computed } from 'vue';


const data = ref(null);
const state = ref('CONNECTING');
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
    if (websocketurl.value) {
        ws = new WSClient();
        ws.open();

        ws.onopen = () => {
            state.value = 'OPEN';
        };
        ws.onclose = ws.onerror = () => {
            state.value = 'CLOSED';
        };
        ws.onmessage = (e) => {
            data.value = e.data;
        };
    }
}

watch(
    websocketurl, 
    newWebsocketurl => {
        if (ws) {
            ws.close();
        }
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
    };
}