import { SpatialGrid } from '../core/SpatialGrid';

// Types for our entities (simplified for Physics)
interface PhysicsEntity {
    x: number;
    y: number;
    radius: number;
    active: boolean;
    id?: number | string;
}

export class PhysicsSystem {
    private spatialGrid: SpatialGrid<PhysicsEntity>;
    private _useGPU: boolean = false;
    private device: GPUDevice | null = null;
    private _pipeline: GPUComputePipeline | null = null;

    constructor(width: number, height: number, cellSize: number) {
        this.spatialGrid = new SpatialGrid(width, height, cellSize);
        this.initGPU();
    }

    private async initGPU() {
        if (!navigator.gpu) return;
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) return;
            this.device = await adapter.requestDevice();

            const shaderCode = `
                struct Entity {
                    position: vec2f,
                    velocity: vec2f,
                    radius: f32,
                    active: u32,
                }

                struct CollisionResult {
                    collided: u32,
                    targetIndex: u32,
                }

                @group(0) @binding(0) var<storage, read> entitiesA: array<Entity>;
                @group(0) @binding(1) var<storage, read> entitiesB: array<Entity>;
                @group(0) @binding(2) var<storage, read_write> results: array<CollisionResult>;

                @compute @workgroup_size(64)
                fn main(@builtin(global_invocation_id) global_id: vec3u) {
                    let indexA = global_id.x;
                    if (indexA >= arrayLength(&entitiesA)) {
                        return;
                    }

                    let entityA = entitiesA[indexA];
                    if (entityA.active == 0u) {
                        return;
                    }
                    
                    for (var i = 0u; i < arrayLength(&entitiesB); i++) {
                        let entityB = entitiesB[i];
                        if (entityB.active == 0u) {
                            continue;
                        }

                        let dx = entityA.position.x - entityB.position.x;
                        let dy = entityA.position.y - entityB.position.y;
                        let distSq = dx * dx + dy * dy;
                        let radiusSum = entityA.radius + entityB.radius;

                        if (distSq < radiusSum * radiusSum) {
                            results[indexA].collided = 1u;
                            results[indexA].targetIndex = i;
                            return;
                        }
                    }
                }
            `;

            const shaderModule = this.device.createShaderModule({
                code: shaderCode
            });

            this._pipeline = this.device.createComputePipeline({
                layout: 'auto',
                compute: {
                    module: shaderModule,
                    entryPoint: 'main'
                }
            });

            this._useGPU = true;
        } catch {
            // GPU init failed - using CPU fallback
        }
    }

    public clearGrid() {
        this.spatialGrid.clear();
    }

    public insertToGrid(obj: PhysicsEntity) {
        this.spatialGrid.insert(obj);
    }

    public queryGrid(obj: PhysicsEntity, callback: (item: PhysicsEntity) => void): void {
        this.spatialGrid.query(obj.x, obj.y, obj.radius, callback);
    }

    // CPU Fallback (Current Logic)
    public checkCollisionsCPU(
        groupA: PhysicsEntity[],
        _groupB: PhysicsEntity[],
        callback: (a: PhysicsEntity, b: PhysicsEntity) => void
    ) {
        // groupB is assumed to already be in the grid
        for (const a of groupA) {
            if (!a.active) continue;
            this.queryGrid(a, (b) => {
                if (!b.active) return;
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distSq = dx * dx + dy * dy;
                const rSum = a.radius + b.radius;
                if (distSq < rSum * rSum) {
                    callback(a, b);
                }
            });
        }
    }

    // GPU Implementation (Async) - Placeholder for future implementation
    public async checkCollisionsGPU(
        groupA: PhysicsEntity[],
        groupB: PhysicsEntity[]
    ): Promise<Array<{ aIndex: number; bIndex: number }>> {
        if (!this._useGPU || !this.device || !this._pipeline) return [];

        // Acknowledge parameters for future implementation
        void groupA;
        void groupB;

        // Due to async nature, return empty for now
        return [];
    }
}
