import { addToScene, createBoxData, createMeshFromData } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

type Vec3 = readonly [number, number, number];

/** dot((b - a) x (c - a), n): positive when triangle a, b, c winds counter-clockwise around n. */
function orientation(a: Vec3, b: Vec3, c: Vec3, n: Vec3): number {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    return (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2];
}

let boxWinding: 1 | -1 | undefined;

/**
 * The sign of `orientation(triangle, outwardNormal)` used by the library's own box. Which
 * winding counts as front-facing isn't documented anywhere we have, so instead of guessing
 * it we read it off createBoxData once. Then the ramp gets culled the same way the box does.
 */
function libraryBoxWinding(): 1 | -1 {
    if (boxWinding !== undefined) return boxWinding;
    const { positions: p, normals: n, indices } = createBoxData();
    const at = (a: Float32Array, i: number): Vec3 => [a[i * 3], a[i * 3 + 1], a[i * 3 + 2]];
    let sum = 0;
    for (let t = 0; t + 2 < indices.length; t += 3) {
        const i = indices[t], j = indices[t + 1], k = indices[t + 2];
        const ni = at(n, i), nj = at(n, j), nk = at(n, k);
        const normal: Vec3 = [ni[0] + nj[0] + nk[0], ni[1] + nj[1] + nk[1], ni[2] + nj[2] + nk[2]];
        sum += orientation(at(p, i), at(p, j), at(p, k), normal);
    }
    if (!(sum !== 0)) throw new Error("createRamp: could not read the triangle winding from createBoxData()");
    boxWinding = sum > 0 ? 1 : -1;
    return boxWinding;
}

/**
 * A solid, flat-shaded wedge. The base is the rectangle on y = 0 from x = -width/2 to width/2
 * and z = 0 to length. The top slopes from the front edge (z = 0) up to `height` at z = length,
 * where a vertical back face closes it, and two triangular sides close it left and right.
 * Each of the five faces has its own vertices with outward normals, and its triangles are
 * wound like the library's box, so back-face culling draws every outside face.
 * The mesh is added to `scene` and returned. Like the library's shape factories, it does not
 * set a material.
 */
export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
    for (const [name, value] of [["width", width], ["length", length], ["height", height]] as const) {
        if (!(Number.isFinite(value) && value > 0)) {
            throw new RangeError(`createRamp: ${name} must be a positive finite number, got ${value}`);
        }
    }

    const x = width / 2;
    const frontLeft: Vec3 = [-x, 0, 0];
    const frontRight: Vec3 = [x, 0, 0];
    const backLeft: Vec3 = [-x, 0, length];
    const backRight: Vec3 = [x, 0, length];
    const topLeft: Vec3 = [-x, height, length];
    const topRight: Vec3 = [x, height, length];
    const slope = Math.hypot(length, height);

    // Each face's corners go around its outline (so a fan from corner 0 covers it) and come
    // with the face's outward unit normal.
    const faces: readonly { corners: readonly Vec3[]; normal: Vec3 }[] = [
        { corners: [frontLeft, frontRight, backRight, backLeft], normal: [0, -1, 0] }, // base
        { corners: [frontLeft, frontRight, topRight, topLeft], normal: [0, length / slope, -height / slope] }, // slope
        { corners: [backLeft, backRight, topRight, topLeft], normal: [0, 0, 1] }, // back
        { corners: [frontLeft, backLeft, topLeft], normal: [-1, 0, 0] }, // left side
        { corners: [frontRight, backRight, topRight], normal: [1, 0, 0] }, // right side
    ];

    const winding = libraryBoxWinding();
    const vertexCount = faces.reduce((count, face) => count + face.corners.length, 0);
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const indices: number[] = [];

    let vertex = 0;
    for (const { corners, normal } of faces) {
        const first = vertex;
        for (const corner of corners) {
            positions.set(corner, vertex * 3);
            normals.set(normal, vertex * 3);
            vertex++;
        }
        for (let k = 1; k + 1 < corners.length; k++) {
            const facing = Math.sign(orientation(corners[0], corners[k], corners[k + 1], normal));
            if (facing === winding) indices.push(first, first + k, first + k + 1);
            else indices.push(first, first + k + 1, first + k);
        }
    }

    const mesh = createMeshFromData(engine, "ramp", positions, normals, new Uint32Array(indices));
    addToScene(scene, mesh);
    return mesh;
}
