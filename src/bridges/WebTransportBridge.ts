// WebTransport Bridge for Hyper Shards v7
// Encapsulates all browser-native WebTransport API calls.

/* eslint-disable @typescript-eslint/no-explicit-any */
// WebTransport API types are not fully available in TypeScript, using any for experimental API

interface WebTransportBridgeConfig {
    url: string;
    onDatagramReceived: (data: Uint8Array) => void;
    onClosed?: () => void;
}

// Extend Window interface for native checks
declare global {
    interface Window {
        __TAURI__?: unknown;
        Capacitor?: unknown;
        WebTransport?: new (url: string) => any;
    }
}

export class WebTransportBridge {
    private transport: any | null = null;
    private datagramWriter: any | null = null;
    private connected: boolean = false;
    private config: WebTransportBridgeConfig;

    constructor(config: WebTransportBridgeConfig) {
        this.config = config;
    }

    public async connect(): Promise<void> {
        // Native Awareness Guard
        if (window.__TAURI__ || window.Capacitor) {
            console.warn("WebTransportBridge: Native environment detected. WebTransport might not be supported directly.");
        }

        if (!window.WebTransport) {
            console.error("WebTransportBridge: WebTransport is not supported in this browser.");
            return;
        }

        try {
            this.transport = new window.WebTransport(this.config.url);
            await this.transport.ready;
            this.connected = true;
            console.log(`WebTransportBridge: Connected to ${this.config.url}`);

            this.datagramWriter = this.transport.datagrams.writable.getWriter();
            this.readDatagrams();
            this.monitorConnection();
        } catch (e) {
            console.error("WebTransportBridge: Connection failed", e);
            this.connected = false;
        }
    }

    public sendDatagram(data: Uint8Array): void {
        if (!this.connected || !this.datagramWriter) {
            return;
        }
        // Fire and forget for unreliable datagrams
        this.datagramWriter.write(data).catch((e: unknown) => console.error("WebTransportBridge: Send failed", e));
    }

    private async readDatagrams() {
        if (!this.transport) return;
        const reader = this.transport.datagrams.readable.getReader();
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                this.config.onDatagramReceived(value);
            }
        } catch (e) {
            console.error("WebTransportBridge: Error reading datagrams", e);
        }
    }

    private async monitorConnection() {
        if (!this.transport) return;
        try {
            await this.transport.closed;
            console.log("WebTransportBridge: Connection closed cleanly.");
        } catch (e) {
            console.error("WebTransportBridge: Connection closed abruptly", e);
        } finally {
            this.connected = false;
            if (this.config.onClosed) this.config.onClosed();
        }
    }

    public close() {
        if (this.transport) {
            this.transport.close();
        }
    }
}
