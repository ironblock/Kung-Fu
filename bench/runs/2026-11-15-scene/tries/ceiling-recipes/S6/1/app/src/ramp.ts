import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createBoxData, createMeshFromData, createStandardMaterial } from "@babylonjs/lite";

type V3 = readonly [number, number, number];
type V2 = readonly [number, number];

interface Face {
    /** Corners in order around the face (a triangle or a convex quad). */
    readonly corners: readonly V3[];
    /** Unit normal pointing out of the solid. */
    readonly normal: V3;
    readonly uvs: readonly V2[];
}

const QUAD_UVS: readonly V2[] = [[0, 0], [1, 0], [1, 1], [0, 1]];
const TRIANGLE_UVS: readonly V2[] = [[0, 0], [1, 0], [1, 1]];

/**
 * Builds a solid wedge-shaped ramp and adds it to the scene.
 *
 * Base: the rectangle on y = 0, x in [-width/2, width/2], z in [0, length].
 * Top: slopes from the front edge (z = 0, y = 0) up to y = height at z = length.
 * Closed by a vertical back face at z = length and a triangular side at each x end.
 *
 * Flat-shaded: each of the five faces has its own vertices, with the face's
 * outward normal. Every triangle is wound the way the library winds its own box,
 * so under the usual back-face culling only the outside of each face is drawn.
 *
 * The mesh gets a default Standard material (a mesh without one is never drawn);
 * assign another one to change its look.
 */
export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
    for (const [name, value] of [["width", width], ["length", length], ["height", height]] as const) {
        if (!(Number.isFinite(value) && value > 0)) {
            throw new RangeError(`createRamp: ${name} must be a positive finite number, got ${value}`);
        }
    }

    const left = -width / 2;
    const right = width / 2;

    const frontLeft: V3 = [left, 0, 0];
    const frontRight: V3 = [right, 0, 0];
    const backLeft: V3 = [left, 0, length];
    const backRight: V3 = [right, 0, length];
    const topLeft: V3 = [left, height, length];
    const topRight: V3 = [right, height, length];

    // The slope rises along (0, height, length); its outward normal is that vector
    // turned a quarter turn towards +y, i.e. pointing up and towards the front.
    const slopeScale = Math.hypot(length, height);
    const slopeNormal: V3 = [0, length / slopeScale, -height / slopeScale];

    const faces: readonly Face[] = [
        { corners: [frontLeft, frontRight, backRight, backLeft], normal: [0, -1, 0], uvs: QUAD_UVS }, // base
        { corners: [frontLeft, frontRight, topRight, topLeft], normal: slopeNormal, uvs: QUAD_UVS }, // slope
        { corners: [backLeft, backRight, topRight, topLeft], normal: [0, 0, 1], uvs: QUAD_UVS }, // back
        { corners: [frontLeft, backLeft, topLeft], normal: [-1, 0, 0], uvs: TRIANGLE_UVS }, // left side
        { corners: [frontRight, backRight, topRight], normal: [1, 0, 0], uvs: TRIANGLE_UVS }, // right side
    ];

    const front = libraryFrontWinding();
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (const { corners, normal, uvs: faceUvs } of faces) {
        const base = positions.length / 3;
        corners.forEach((corner, i) => {
            positions.push(...corner);
            normals.push(...normal);
            uvs.push(...faceUvs[i]);
        });
        // Fan-triangulate, swapping the last two corners of a triangle where needed
        // so that it faces the same way relative to its outward normal as the box's do.
        for (let i = 1; i + 1 < corners.length; i++) {
            const asIs = Math.sign(orientation(corners[0], corners[i], corners[i + 1], normal)) === front;
            indices.push(base, base + (asIs ? i : i + 1), base + (asIs ? i + 1 : i));
        }
    }

    const ramp = createMeshFromData(
        engine,
        "ramp",
        new Float32Array(positions),
        new Float32Array(normals),
        new Uint32Array(indices),
        new Float32Array(uvs),
    );
    ramp.material = createStandardMaterial();
    addToScene(scene, ramp);
    return ramp;
}

/**
 * Positive when (p1 - p0) x (p2 - p0) points along n, negative when it points against it.
 */
function orientation(p0: V3, p1: V3, p2: V3, n: V3): number {
    const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2];
    const vx = p2[0] - p0[0], vy = p2[1] - p0[1], vz = p2[2] - p0[2];
    return (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2];
}

let cachedFrontWinding: 1 | -1 | undefined;

/**
 * Which way the library winds a front-facing triangle, read off its own box:
 * +1 if (v1 - v0) x (v2 - v0) points out of the box, -1 if it points in.
 * Taking it from the box rather than assuming a convention means the ramp is
 * culled exactly as the box is, whatever the library's handedness and cull setup.
 */
function libraryFrontWinding(): 1 | -1 {
    if (cachedFrontWinding === undefined) {
        const box = createBoxData(1);
        const p = box.positions;
        const n = box.normals;
        const at = (array: Float32Array, vertex: number): V3 => [array[vertex * 3], array[vertex * 3 + 1], array[vertex * 3 + 2]];
        let votes = 0;
        for (let t = 0; t + 2 < box.indexCount; t += 3) {
            const a = box.indices[t], b = box.indices[t + 1], c = box.indices[t + 2];
            const na = at(n, a), nb = at(n, b), nc = at(n, c);
            const faceNormal: V3 = [na[0] + nb[0] + nc[0], na[1] + nb[1] + nc[1], na[2] + nb[2] + nc[2]];
            votes += Math.sign(orientation(at(p, a), at(p, b), at(p, c), faceNormal));
        }
        cachedFrontWinding = votes < 0 ? -1 : 1;
    }
    return cachedFrontWinding;
}
