struct Entity {
    position: vec2f,
    velocity: vec2f,
    radius: f32,
    active: u32, // 1 = active, 0 = inactive
}

struct CollisionResult {
    collided: u32, // 1 = true, 0 = false
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

    // Naive O(N*M) check for demonstration (Spatial Grid is better on CPU, 
    // but GPU can brute force small N*M faster, or use a grid in shared memory).
    // For this task, we implement a basic check against the second array.
    
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
            return; // Report first collision
        }
    }
}
