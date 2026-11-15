import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createMeshFromData, createStandardMaterial } from "@babylonjs/lite";

type Vec3 = [number, number, number];

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

/**
 * Builds a solid wedge-shaped loading ramp.
 *
 * Base: y = 0, x in [-width/2, width/2], z in [0, length].
 * Top: slopes from the front edge (z = 0, y = 0) up to y = height at z = length.
 * Back: vertical face at z = length. Two triangular sides at x = -width/2 and x = width/2.
 *
 * Flat-shaded: every face has its own vertices and a single outward normal.
 * Each face is wound so that its first triangle's geometric normal
 * (cross of the first two edges) points along the outward normal, which is
 * the front-face convention assumed here.
 */
export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
    const hw = width / 2;
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    // corners: polygon in perimeter order. normal: outward unit normal.
    const addFace = (corners: Vec3[], normal: Vec3) => {
        const base = positions.length / 3;
        for (const c of corners) {
            positions.push(c[0], c[1], c[2]);
            normals.push(normal[0], normal[1], normal[2]);
        }
        // Pick the winding for the whole polygon from its first triangle.
        const n = cross(sub(corners[1], corners[0]), sub(corners[2], corners[0]));
        const flip = dot(n, normal) < 0;
        // Fan-triangulate from corner 0 (all faces here are convex).
        for (let i = 1; i < corners.length - 1; i++) {
            if (flip) {
                indices.push(base, base + i + 1, base + i);
            } else {
                indices.push(base, base + i, base + i + 1);
            }
        }
    };

    // 1. Base (bottom), y = 0, facing down.
    addFace(
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, 0, length],
            [-hw, 0, length],
        ],
        [0, -1, 0],
    );

    // 2. Sloped top, from (z=0, y=0) to (z=length, y=height).
    //    Outward normal is perpendicular to the slope direction (0, height, length).
    addFace(
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, height, length],
            [-hw, height, length],
        ],
        normalize([0, length, -height]),
    );

    // 3. Vertical back face at z = length.
    addFace(
        [
            [-hw, 0, length],
            [hw, 0, length],
            [hw, height, length],
            [-hw, height, length],
        ],
        [0, 0, 1],
    );

    // 4. Left triangular side, x = -hw.
    addFace(
        [
            [-hw, 0, 0],
            [-hw, 0, length],
            [-hw, height, length],
        ],
        [-1, 0, 0],
    );

    // 5. Right triangular side, x = +hw.
    addFace(
        [
            [hw, 0, 0],
            [hw, 0, length],
            [hw, height, length],
        ],
        [1, 0, 0],
    );

    const mesh = createMeshFromData(
        engine,
        "ramp",
        new Float32Array(positions),
        new Float32Array(normals),
        new Uint32Array(indices),
    );
    mesh.material = createStandardMaterial();
    addToScene(scene, mesh);
    return mesh;
}
