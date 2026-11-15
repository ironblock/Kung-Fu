import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
// NOTE: the mesh-from-vertex-data call below is an assumption; see createRampMesh.
import { addToScene, createMesh } from "@babylonjs/lite";

export interface RampGeometry {
    positions: number[];
    normals: number[];
    indices: number[];
}

/**
 * Builds a flat-shaded wedge ramp. Every face has its own four (or three) vertices,
 * so each face gets one exact normal.
 *
 * Layout:
 *   base on y = 0, x in [-w/2, w/2], z in [0, L]
 *   slope from the front edge (z = 0, y = 0) up to (z = L, y = h)
 *   vertical back face at z = L, y in [0, h]
 *   two triangular sides at x = -w/2 and x = +w/2
 *
 * Winding: every triangle's cross product (v1 - v0) x (v2 - v0) points along the
 * face's outward normal. The index order below was checked by hand against that rule.
 */
export function buildRampGeometry(width: number, length: number, height: number): RampGeometry {
    if (!(width > 0 && length > 0 && height > 0)) {
        throw new RangeError("ramp width, length and height must all be > 0");
    }

    const hw = width / 2;
    const L = length;
    const h = height;

    // Unit outward normal of the sloped top. The top direction is (0, h, L), so the
    // normal is perpendicular to it and points up and toward -z: (0, L, -h).
    const slopeLen = Math.hypot(L, h);
    const slopeN: [number, number, number] = [0, L / slopeLen, -h / slopeLen];

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    // Appends a face: its corner positions, one shared normal, and triangle indices
    // (local to this face's vertices).
    const addFace = (
        corners: [number, number, number][],
        n: [number, number, number],
        tris: [number, number, number][],
    ) => {
        const base = positions.length / 3;
        for (const p of corners) {
            positions.push(p[0], p[1], p[2]);
            normals.push(n[0], n[1], n[2]);
        }
        for (const t of tris) {
            indices.push(base + t[0], base + t[1], base + t[2]);
        }
    };

    // 1. Base, normal (0, -1, 0). Corners: 0 FL, 1 FR, 2 BR, 3 BL.
    addFace(
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, 0, L],
            [-hw, 0, L],
        ],
        [0, -1, 0],
        [
            [0, 2, 3],
            [0, 1, 2],
        ],
    );

    // 2. Sloped top, normal slopeN. Corners: 0 FL, 1 FR, 2 TR (back right top), 3 TL.
    addFace(
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, h, L],
            [-hw, h, L],
        ],
        slopeN,
        [
            [0, 2, 1],
            [0, 3, 2],
        ],
    );

    // 3. Vertical back face, normal (0, 0, 1). Corners: 0 BL, 1 BR, 2 TR, 3 TL.
    addFace(
        [
            [-hw, 0, L],
            [hw, 0, L],
            [hw, h, L],
            [-hw, h, L],
        ],
        [0, 0, 1],
        [
            [0, 1, 2],
            [0, 2, 3],
        ],
    );

    // 4. Left triangle at x = -w/2, normal (-1, 0, 0). Corners: 0 (0,0,0), 1 (0,0,L), 2 (0,h,L).
    addFace(
        [
            [-hw, 0, 0],
            [-hw, 0, L],
            [-hw, h, L],
        ],
        [-1, 0, 0],
        [[0, 1, 2]],
    );

    // 5. Right triangle at x = +w/2, normal (1, 0, 0). Corners: 0 (0,0,0), 1 (0,h,L), 2 (0,0,L).
    addFace(
        [
            [hw, 0, 0],
            [hw, h, L],
            [hw, 0, L],
        ],
        [1, 0, 0],
        [[0, 1, 2]],
    );

    return { positions, normals, indices };
}

/**
 * ASSUMPTION: the mesh-from-vertex-data call. The Babylon Lite library is not on this
 * machine, so the name `createMesh` and its options object are a guess. Replace this
 * body with the library's real vertex-data mesh constructor. Everything else in this
 * file (geometry, normals, winding) does not depend on it.
 */
function createRampMesh(engine: EngineContext, geometry: RampGeometry): Mesh {
    return createMesh(engine, {
        positions: geometry.positions,
        normals: geometry.normals,
        indices: geometry.indices,
    });
}

export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
    const mesh = createRampMesh(engine, buildRampGeometry(width, length, height));
    addToScene(scene, mesh);
    return mesh;
}
