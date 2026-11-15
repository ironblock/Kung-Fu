import {
    addToScene,
    createMeshFromData,
    createStandardMaterial,
} from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

export interface RampData {
    positions: Float32Array;
    normals: Float32Array;
    indices: Uint32Array;
}

type Vec3 = readonly [number, number, number];

function sub(a: Vec3, b: Vec3): Vec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vec3, b: Vec3): Vec3 {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

function dot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Appends one flat face. The face gets its own vertices, all carrying `normal`.
 *
 * Winding convention: a triangle's front side is the one that
 * cross(b - a, c - a) points to. Each triangle is emitted in whichever order
 * makes that cross product agree with the face's outward normal, so the
 * outside of every face is the front side.
 */
function pushFace(
    positions: number[],
    normals: number[],
    indices: number[],
    corners: readonly Vec3[],
    normal: Vec3,
): void {
    const base = positions.length / 3;
    for (const c of corners) {
        positions.push(c[0], c[1], c[2]);
        normals.push(normal[0], normal[1], normal[2]);
    }
    // Fan triangulation; every face here is convex.
    const c0 = corners[0];
    for (let i = 1; i + 1 < corners.length; i++) {
        const ci = corners[i];
        const cj = corners[i + 1];
        const facing = dot(cross(sub(ci, c0), sub(cj, c0)), normal);
        if (facing >= 0) {
            indices.push(base, base + i, base + i + 1);
        } else {
            indices.push(base, base + i + 1, base + i);
        }
    }
}

/**
 * Builds the ramp's vertex data without touching the engine.
 *
 * The base is on y = 0 over x in [-width/2, width/2], z in [0, length].
 * The top rises from y = 0 at z = 0 to y = height at z = length.
 * Faces: base, sloped top, vertical back (z = length), and two triangular sides.
 */
export function createRampData(width: number, length: number, height: number): RampData {
    const hw = width / 2;
    const L = length;
    const h = height;

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    // Base, facing down.
    pushFace(
        positions, normals, indices,
        [[-hw, 0, 0], [hw, 0, 0], [hw, 0, L], [-hw, 0, L]],
        [0, -1, 0],
    );

    // Sloped top. Its tangent along z is (0, h, L), so the normal is (0, L, -h) normalized.
    const topLen = Math.hypot(L, h);
    pushFace(
        positions, normals, indices,
        [[-hw, 0, 0], [hw, 0, 0], [hw, h, L], [-hw, h, L]],
        [0, L / topLen, -h / topLen],
    );

    // Vertical back face at z = length.
    pushFace(
        positions, normals, indices,
        [[-hw, 0, L], [hw, 0, L], [hw, h, L], [-hw, h, L]],
        [0, 0, 1],
    );

    // Left and right triangular sides.
    pushFace(
        positions, normals, indices,
        [[-hw, 0, 0], [-hw, 0, L], [-hw, h, L]],
        [-1, 0, 0],
    );
    pushFace(
        positions, normals, indices,
        [[hw, 0, 0], [hw, 0, L], [hw, h, L]],
        [1, 0, 0],
    );

    return {
        positions: Float32Array.from(positions),
        normals: Float32Array.from(normals),
        indices: Uint32Array.from(indices),
    };
}

export function createRamp(
    engine: EngineContext,
    scene: SceneContext,
    width: number,
    length: number,
    height: number,
): Mesh {
    const data = createRampData(width, length, height);
    const mesh = createMeshFromData(engine, "ramp", data.positions, data.normals, data.indices);
    // Factories leave material null, and a mesh without one is never drawn.
    mesh.material = createStandardMaterial();
    addToScene(scene, mesh);
    return mesh;
}
