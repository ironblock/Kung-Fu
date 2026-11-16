import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createMeshFromData } from "@babylonjs/lite";

type Vec3 = readonly [number, number, number];

interface FaceDef {
    /** Corner positions of the face, in the order referenced by `triangles`. */
    readonly corners: readonly Vec3[];
    /** Outward unit normal, shared by every vertex of the face (flat shading). */
    readonly normal: Vec3;
    /** Triangles as indices into `corners`. Each is wound so that
     *  (p1 - p0) x (p2 - p0) points along the outward normal. */
    readonly triangles: readonly (readonly [number, number, number])[];
}

/**
 * Builds a solid wedge-shaped loading ramp.
 *
 * - Base: y = 0, x in [-width/2, width/2], z in [0, length].
 * - Top: slopes from the front edge (z = 0, y = 0) up to y = height at z = length.
 * - Back: vertical face at z = length, from y = 0 to y = height.
 * - Sides: two triangles at x = -width/2 and x = +width/2.
 *
 * Five flat faces, each with its own vertices and an outward normal.
 */
export function createRamp(
    engine: EngineContext,
    scene: SceneContext,
    width: number,
    length: number,
    height: number,
): Mesh {
    const w = width / 2;
    const L = length;
    const H = height;

    // Outward normal of the sloped top: the surface is y = (H / L) * z,
    // so the gradient (0, L, -H) points up and toward the front.
    const topLen = Math.hypot(L, H);
    const topNormal: Vec3 = [0, L / topLen, -H / topLen];

    // Corners of the wedge.
    const A: Vec3 = [-w, 0, 0]; // front-left, base
    const B: Vec3 = [w, 0, 0];  // front-right, base
    const C: Vec3 = [w, 0, L];  // back-right, base
    const D: Vec3 = [-w, 0, L]; // back-left, base
    const E: Vec3 = [-w, H, L]; // back-left, top
    const F: Vec3 = [w, H, L];  // back-right, top

    const faces: FaceDef[] = [
        // Base (bottom), normal -Y.
        {
            corners: [A, B, C, D],
            normal: [0, -1, 0],
            triangles: [[0, 1, 2], [0, 2, 3]],
        },
        // Sloped top, normal (0, L, -H) / |.|.
        {
            corners: [A, B, F, E],
            normal: topNormal,
            triangles: [[0, 2, 1], [0, 3, 2]],
        },
        // Vertical back, normal +Z.
        {
            corners: [D, C, F, E],
            normal: [0, 0, 1],
            triangles: [[0, 1, 2], [0, 2, 3]],
        },
        // Left triangular side, normal -X.
        {
            corners: [A, D, E],
            normal: [-1, 0, 0],
            triangles: [[0, 1, 2]],
        },
        // Right triangular side, normal +X.
        {
            corners: [B, F, C],
            normal: [1, 0, 0],
            triangles: [[0, 1, 2]],
        },
    ];

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    for (const face of faces) {
        const base = positions.length / 3;
        for (const c of face.corners) {
            positions.push(c[0], c[1], c[2]);
            normals.push(face.normal[0], face.normal[1], face.normal[2]);
        }
        for (const t of face.triangles) {
            indices.push(base + t[0], base + t[1], base + t[2]);
        }
    }

    const mesh = createMeshFromData(
        engine,
        "loadingRamp",
        new Float32Array(positions),
        new Float32Array(normals),
        new Uint32Array(indices),
    );

    addToScene(scene, mesh);
    return mesh;
}
