import { addToScene, createMeshFromData } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

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
 * Solid wedge-shaped ramp: base on y = 0 (z from 0 to length), top sloping from
 * the front edge (z = 0, y = 0) up to `height` at z = length, a vertical back
 * face at z = length, and two triangular sides at x = ±width / 2.
 *
 * Flat-shaded: every face has its own vertices and a constant outward normal.
 * Each triangle is wound so that its outward side is the front side (the
 * (p1 - p0) x (p2 - p0) normal matches the face normal), so back-face culling
 * shows the outside of every face.
 */
export function createRamp(
    engine: EngineContext,
    scene: SceneContext,
    width: number,
    length: number,
    height: number,
): Mesh {
    const hw = width / 2;
    const L = length;
    const H = height;

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    // Adds one convex planar face as a fan of triangles. Vertices are not
    // shared with other faces, so each face keeps its own flat normal.
    function addFace(corners: readonly Vec3[], normal: Vec3): void {
        const n = cross(sub(corners[1], corners[0]), sub(corners[2], corners[0]));
        const ordered = dot(n, normal) < 0 ? [...corners].reverse() : corners;

        const first = positions.length / 3;
        for (const p of ordered) {
            positions.push(p[0], p[1], p[2]);
            normals.push(normal[0], normal[1], normal[2]);
        }
        for (let i = 1; i + 1 < ordered.length; i++) {
            indices.push(first, first + i, first + i + 1);
        }
    }

    // Base: y = 0, normal down.
    addFace(
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, 0, L],
            [-hw, 0, L],
        ],
        [0, -1, 0],
    );

    // Sloped top: from (y = 0, z = 0) to (y = H, z = L).
    // Normal is perpendicular to the slope and points up and toward the front.
    const topLen = Math.hypot(L, H);
    addFace(
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, H, L],
            [-hw, H, L],
        ],
        [0, L / topLen, -H / topLen],
    );

    // Vertical back face at z = L.
    addFace(
        [
            [-hw, 0, L],
            [hw, 0, L],
            [hw, H, L],
            [-hw, H, L],
        ],
        [0, 0, 1],
    );

    // Left triangular side at x = -hw.
    addFace(
        [
            [-hw, 0, 0],
            [-hw, 0, L],
            [-hw, H, L],
        ],
        [-1, 0, 0],
    );

    // Right triangular side at x = +hw.
    addFace(
        [
            [hw, 0, 0],
            [hw, 0, L],
            [hw, H, L],
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
    addToScene(scene, mesh);
    return mesh;
}
