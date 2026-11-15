import { addToScene, createMeshFromData } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

type Vec3 = readonly [number, number, number];

// Winding convention. Each triangle is ordered so that the sign of
// dot(cross(b - a, c - a), outwardNormal) equals WINDING_SIGN. With the
// default front-face winding this makes the outside of every face the front.
// If the ramp shows inside-out when run, change this to +1.
const WINDING_SIGN = -1;

function sub(a: Vec3, b: Vec3): Vec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vec3, b: Vec3): Vec3 {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(v: Vec3): Vec3 {
    const len = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
}

// Adds one flat face. Each face gets its own vertices, all carrying the face normal.
// The polygon is convex and is fan-triangulated.
function addFace(
    polygon: readonly Vec3[],
    normal: Vec3,
    positions: number[],
    normals: number[],
    indices: number[],
): void {
    const base = positions.length / 3;
    for (const p of polygon) {
        positions.push(p[0], p[1], p[2]);
        normals.push(normal[0], normal[1], normal[2]);
    }
    for (let i = 1; i + 1 < polygon.length; i++) {
        let j = i;
        let k = i + 1;
        const facing = dot(cross(sub(polygon[j], polygon[0]), sub(polygon[k], polygon[0])), normal);
        if (facing * WINDING_SIGN < 0) {
            [j, k] = [k, j];
        }
        indices.push(base, base + j, base + k);
    }
}

export function createRamp(
    engine: EngineContext,
    scene: SceneContext,
    width: number,
    length: number,
    height: number,
): Mesh {
    const h = width / 2;
    const L = length;
    const H = height;

    // Front edge is at z = 0 on the base (y = 0). The back is at z = L.
    const p0: Vec3 = [-h, 0, 0]; // front left, base
    const p1: Vec3 = [h, 0, 0]; // front right, base
    const p2: Vec3 = [h, 0, L]; // back right, base
    const p3: Vec3 = [-h, 0, L]; // back left, base
    const p4: Vec3 = [-h, H, L]; // back left, top
    const p5: Vec3 = [h, H, L]; // back right, top

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    // Base, facing down.
    addFace([p0, p1, p2, p3], [0, -1, 0], positions, normals, indices);
    // Sloped top, from the front edge up to the back. Outward normal is (0, L, -H).
    addFace([p0, p1, p5, p4], normalize([0, L, -H]), positions, normals, indices);
    // Vertical back face at z = L.
    addFace([p2, p5, p4, p3], [0, 0, 1], positions, normals, indices);
    // Left triangular side at x = -width/2.
    addFace([p0, p3, p4], [-1, 0, 0], positions, normals, indices);
    // Right triangular side at x = width/2.
    addFace([p1, p5, p2], [1, 0, 0], positions, normals, indices);

    const mesh = createMeshFromData(
        engine,
        "ramp",
        new Float32Array(positions),
        new Float32Array(normals),
        new Uint32Array(indices),
    );
    addToScene(scene, mesh);
    return mesh;
}
