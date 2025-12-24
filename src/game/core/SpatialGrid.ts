export interface SpatialObject {
    x: number;
    y: number;
    radius: number; // Using radius for bounds approximation
    id?: number | string; // Optional ID for deduping if needed
    lastQueryId?: number; // For zero-allocation deduplication
}

export class SpatialGrid<T extends SpatialObject> {
    private cellSize: number;
    private grid: Map<string, T[]> = new Map();
    private queryId: number = 0;

    constructor(_width: number, _height: number, cellSize: number) {
        this.cellSize = cellSize;
    }

    public clear() {
        this.grid.clear();
    }

    public insert(obj: T) {
        // Determine which cells the object overlaps
        // We use a bounding box based on radius
        const startX = Math.floor((obj.x - obj.radius) / this.cellSize);
        const endX = Math.floor((obj.x + obj.radius) / this.cellSize);
        const startY = Math.floor((obj.y - obj.radius) / this.cellSize);
        const endY = Math.floor((obj.y + obj.radius) / this.cellSize);

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const key = `${x},${y}`;
                if (!this.grid.has(key)) {
                    this.grid.set(key, []);
                }
                this.grid.get(key)!.push(obj);
            }
        }
    }

    public query(x: number, y: number, radius: number, callback: (obj: T) => void) {
        this.queryId++;

        const startX = Math.floor((x - radius) / this.cellSize);
        const endX = Math.floor((x + radius) / this.cellSize);
        const startY = Math.floor((y - radius) / this.cellSize);
        const endY = Math.floor((y + radius) / this.cellSize);

        for (let cx = startX; cx <= endX; cx++) {
            for (let cy = startY; cy <= endY; cy++) {
                const key = `${cx},${cy}`;
                const cellObjects = this.grid.get(key);
                if (cellObjects) {
                    for (let i = 0; i < cellObjects.length; i++) {
                        const obj = cellObjects[i];
                        if (obj.lastQueryId !== this.queryId) {
                            obj.lastQueryId = this.queryId;
                            callback(obj);
                        }
                    }
                }
            }
        }
    }
}
