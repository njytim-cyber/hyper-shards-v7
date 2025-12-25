import { WebTransportBridge } from './WebTransportBridge';

// Packet Types
// Packet Types
export const PacketType = {
    JOIN_ROOM: 0,
    LEAVE_ROOM: 1,
    PLAYER_STATE: 2,
    GAME_EVENT: 3,
    ROOM_STATE: 4,
    REVIVE_REQUEST: 5,
    SCORE_UPDATE: 6,
    GAME_OVER_SYNC: 7,
    SEND_HAZARD: 8
} as const;

export type PacketType = typeof PacketType[keyof typeof PacketType];

export interface PlayerState {
    id: string;
    x: number;
    y: number;
    rotation: number;
    velocity: { x: number, y: number };
    isFiring: boolean;
    health: number;
    shield: number;
}

export interface GameEvent {
    type: 'spawn' | 'destroy' | 'powerup';
    id: string;
    payload: Record<string, unknown>;
}

export class MultiplayerBridge extends WebTransportBridge {
    private roomId: string | null = null;
    private playerId: string | null = null;
    private otherPlayers: Map<string, PlayerState> = new Map();
    private eventQueue: GameEvent[] = [];

    // Callback for game engine updates
    public onPlayerUpdate?: (state: PlayerState) => void;
    public onPlayerLeft?: (id: string) => void;
    public onScoreUpdate?: (id: string, score: number) => void;
    public onReviveRequest?: (fromId: string, targetId: string) => void;
    public onGameOver?: (id: string) => void;
    public onHazardReceived?: (fromId: string, type: string, intensity: number) => void;

    constructor(url: string) {
        super({
            url,
            onDatagramReceived: (data) => this.handleDatagram(data),
            onClosed: () => this.handleDisconnect()
        });
    }

    public async joinRoom(roomId: string, playerId: string) {
        await this.connect();
        this.roomId = roomId;
        this.playerId = playerId;
        this.sendPacket(PacketType.JOIN_ROOM, { roomId, playerId });
        console.log(`Joined room ${roomId} as ${playerId}`);
    }

    public sendPlayerState(state: Omit<PlayerState, 'id'>) {
        if (!this.playerId) return;
        this.sendPacket(PacketType.PLAYER_STATE, { id: this.playerId, ...state });
    }

    public sendScore(score: number) {
        if (!this.playerId) return;
        this.sendPacket(PacketType.SCORE_UPDATE, { id: this.playerId, score });
    }

    public sendRevive(targetId: string) {
        this.sendPacket(PacketType.REVIVE_REQUEST, { from: this.playerId, target: targetId });
    }

    public sendGameOver() {
        this.sendPacket(PacketType.GAME_OVER_SYNC, { id: this.playerId });
    }

    public sendHazard(type: string, intensity: number) {
        this.sendPacket(PacketType.SEND_HAZARD, { id: this.playerId, type, intensity });
    }

    private sendPacket(type: PacketType, payload: Record<string, unknown>) {
        const json = JSON.stringify({ t: type, d: payload });
        const encoder = new TextEncoder();
        this.sendDatagram(encoder.encode(json));
    }

    private handleDatagram(data: Uint8Array) {
        try {
            const decoder = new TextDecoder();
            const json = JSON.parse(decoder.decode(data));

            switch (json.t) {
                case PacketType.PLAYER_STATE:
                    this.updateOtherPlayer(json.d);
                    break;
                case PacketType.LEAVE_ROOM:
                    this.removePlayer(json.d.id);
                    break;
                case PacketType.GAME_EVENT:
                    this.eventQueue.push(json.d);
                    break;
                case PacketType.SCORE_UPDATE:
                    if (this.onScoreUpdate) this.onScoreUpdate(json.d.id, json.d.score);
                    break;
                case PacketType.REVIVE_REQUEST:
                    if (this.onReviveRequest) this.onReviveRequest(json.d.from, json.d.target);
                    break;
                case PacketType.GAME_OVER_SYNC:
                    if (this.onGameOver) this.onGameOver(json.d.id);
                    break;
                case PacketType.SEND_HAZARD:
                    if (this.onHazardReceived) this.onHazardReceived(json.d.id, json.d.type, json.d.intensity);
                    break;
            }
        } catch (e) {
            console.warn('Failed to parse datagram', e);
        }
    }

    private updateOtherPlayer(state: PlayerState) {
        if (state.id === this.playerId) return; // Ignore self

        this.otherPlayers.set(state.id, state);
        if (this.onPlayerUpdate) {
            this.onPlayerUpdate(state);
        }
    }

    private removePlayer(id: string) {
        this.otherPlayers.delete(id);
        if (this.onPlayerLeft) {
            this.onPlayerLeft(id);
        }
    }

    private handleDisconnect() {
        console.log('Multiplayer disconnected');
        this.otherPlayers.clear();
        this.roomId = null;
    }

    public getOtherPlayers(): PlayerState[] {
        return Array.from(this.otherPlayers.values());
    }

    public getRoomId() {
        return this.roomId;
    }

    public getPlayerId() {
        return this.playerId;
    }
}
