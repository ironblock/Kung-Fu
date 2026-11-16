import { addToScene, createBoxData, createMeshFromData } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

type V3 = readonly [number, number, number];

interface Buffers {
    positions: number[];
    normals: number[];
    indices: number[];
}

function sub(a: V3, b: V3): V3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: V3, b: V3): V3 {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

function dot(a: V3, b: V3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

let cachedWindingSign: number | null = null;

/**
 * Returns +1 or -1: the sign of (geometric normal . vertex normal) for a
 * front-facing triangle of the library's own box. Measuring this instead of
 * assuming a winding order means the ramp uses the same convention as the
 * library, whatever it is.
 */
function libraryWindingSign(): number {
    if (cachedWindingSign !== null) {
        return cachedWindingSign;
    }
    const box = createBoxData(1);
    const p = box.positions;
    const n = box.normals;
    const idx = box.indices;
    const a = idx[0];
    const b = idx[1];
    const c = idx[2];
    const pa: V3 = [p[3 * a], p[3 * a + 1], p[3 * a + 2]];
    const pb: V3 = [p[3 * b], p[3 * b + 1], p[3 * b + 2]];
    const pc: V3 = [p[3 * c], p[3 * c + 1], p[3 * c + 2]];
    const na: V3 = [n[3 * a], n[3 * a + 1], n[3 * a + 2]];
    cachedWindingSign = dot(cross(sub(pb, pa), sub(pc, pa)), na) >= 0 ? 1 : -1;
    return cachedWindingSign;
}

/**
 * Adds one flat planar face as its own vertices, fan-triangulated.
 * Each triangle's index order is chosen so its geometric normal agrees with
 * the library's winding convention relative to the outward face normal.
 */
function addFace(buf: Buffers, corners: readonly V3[], normal: V3, sign: number): void {
    const base = buf.positions.length / 3;
    for (const corner of corners) {
        buf.positions.push(corner[0], corner[1], corner[2]);
        buf.normals.push(normal[0], normal[1], normal[2]);
    }
    for (let i = 1; i + 1 < corners.length; i++) {
        const facing = dot(cross(sub(corners[i], corners[0]), sub(corners[i + 1], corners[0])), normal) * sign;
        if (facing >= 0) {
            buf.indices.push(base, base + i, base + i + 1);
        } else {
            buf.indices.push(base, base + i + 1, base + i);
        }
    }
}

export function createRamp(
    engine: EngineContext,
    scene: SceneContext,
    width: number,
    length: number,
    height: number,
): Mesh {
    const w = width / 2;
    const sign = libraryWindingSign();
    const buf: Buffers = { positions: [], normals: [], indices: [] };

    // Front-bottom and back-bottom corners on the left/right edges, and the top edge.
    const A: V3 = [-w, 0, 0];
    const B: V3 = [w, 0, 0];
    const C: V3 = [w, 0, length];
    const D: V3 = [-w, 0, length];
    const E: V3 = [w, height, length];
    const F: V3 = [-w, height, length];

    // Base (y = 0), faces down.
    addFace(buf, [A, B, C, D], [0, -1, 0], sign);

    // Sloped top, from z = 0 at y = 0 up to y = height at z = length, faces up and toward -z.
    const slopeLength = Math.hypot(length, height);
    addFace(buf, [A, B, E, F], [0, length / slopeLength, -height / slopeLength], sign);

    // Vertical back face at z = length, faces +z.
    addFace(buf, [D, C, E, F], [0, 0, 1], sign);

    // Left triangular side, faces -x.
    addFace(buf, [A, D, F], [-1, 0, 0], sign);

    // Right triangular side, faces +x.
    addFace(buf, [B, E, C], [1, 0, 0], sign);

    const mesh = createMeshFromData(
        engine,
        "loadingRamp",
        new Float32Array(buf.positions),
        new Float32Array(buf.normals),
        new Uint32Array(buf.indices),
    );
    addToScene(scene, mesh);
    return mesh;
}
