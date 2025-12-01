// WebTransport Bridge for Hyper Shards v7
// Encapsulates all browser-native WebTransport API calls.

interface WebTransportBridgeConfig {
    url: string;
    onDatagramReceived: (data: Uint8Array) => void;
    onClosed?: () => void;
}

export class WebTransportBridge {
    private transport: any | null = null; // WebTransport type might not be available in all envs
    private datagramWriter: any | null = null;
    private connected: boolean = false;
    private config: WebTransportBridgeConfig;

    constructor(config: WebTransportBridgeConfig) {
        this.config = config;
    }

    public async connect(): Promise<void> {
        // Native Awareness Guard
        if ((window as any).__TAURI__ || (window as any).Capacitor) {
            console.warn("WebTransportBridge: Native environment detected. WebTransport might not be supported directly. Implementing fallback or polyfill logic here is required for production.");
            // For now, we proceed as if it's a browser or the webview supports it.
        }

        if (!('WebTransport' in window)) {
            console.error("WebTransportBridge: WebTransport is not supported in this browser.");
            return;
        }

        try {
            // @ts-ignore - WebTransport is experimental
            this.transport = new WebTransport(this.config.url);
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
            // console.warn("WebTransportBridge: Not connected, cannot send datagram.");
            return;
        }
        // Fire and forget for unreliable datagrams
        this.datagramWriter.write(data).catch((e: any) => console.error("WebTransportBridge: Send failed", e));
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
