// websocket URL - note that the IP address is hard-coded in development mode
const websocketurl = `ws://${process.env.NODE_ENV === 'production' ? window.location.host : '192.168.1.13'}/ws/controller`;

// Define WSClient instance, a WebSocket with auto reconnect - https://stackoverflow.com/questions/49629881/reconnecting-a-websocket-without-creating-a-new-instance
class WSClient {

    constructor() {
        // Default reconnect interval
        this.reconnectInterval = 5000;

        // Define whether it has ever reconnected
        this.reconnected = false;

        // Log messages
        this.debug = false;
    }

    // Open the URL
    open(url) {

        // Define that
        var that = this;

        // Open the URL
        this.url = url;

        // Create underlying websocket instance
        this.instance = new WebSocket(this.url);

        // Setup the event handler for onopen
        this.instance.onopen = function (ev) {

            // If it has ever reconnected lets say that
            if (that.reconnected && that.debug) {
                console.log('[WS]: Reconnected.');
            }

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
    reconnect(e) {

        // Define that
        var that = this;

        // Log reconnection
        if (that.debug) {
            console.log(`[WS]: Reconnecting in ${this.reconnectInterval / 1000} seconds.`);
        }

        // Set reconnect timeout
        setTimeout(function() {

            // Log reconnecting
            if (that.debug) {
                console.log("[WS]: Reconnecting...");
            }

            // Define has reconnected
            that.reconnected = true;

            // Try and open the URL
            that.open(that.url);

        }, this.reconnectInterval);
    }
}

// this implementation is ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad 
// it uses the above WSClient to reconnect automatically 
import { ref, onMounted, onUnmounted } from 'vue';
function _useWebSocket(url) {
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
    onMounted(() => {
        ws = new WSClient();
        ws.open(url);

        ws.onopen = () => {
            state.value = 'OPEN';
        };
        ws.onclose = ws.onerror = () => {
            state.value = 'CLOSED';
        };
        ws.onmessage = (e) => {
            data.value = e.data;
        };
    });
    onUnmounted(() => {
        ws.close();
    });
    return {
        data,
        state,
        close,
        send
    };
}

export function useWebSocket() {
    return _useWebSocket(websocketurl);
}