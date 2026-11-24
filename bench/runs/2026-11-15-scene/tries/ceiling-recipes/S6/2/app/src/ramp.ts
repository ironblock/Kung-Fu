import { addToScene, createBoxData, createMeshFromData, createStandardMaterial } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

type V3 = readonly [number, number, number];

let boxWinding: 1 | -1 | undefined;

/**
 * Which way the library winds a front face, read off its own box: +1 if (b - a) x (c - a) of a
 * triangle (a, b, c) points along the face's outward normal, -1 if it points against it.
 * Winding the ramp the same way makes back-face culling treat it exactly like the box.
 */
function libraryWinding(): 1 | -1 {
    if (boxWinding === undefined) {
        const { positions: p, normals: n, indices } = createBoxData(1);
        let sum = 0;
        for (let t = 0; t < indices.length; t += 3) {
            const a = indices[t] * 3;
            const b = indices[t + 1] * 3;
            const c = indices[t + 2] * 3;
            const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
            const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
            sum += (uy * vz - uz * vy) * n[a] + (uz * vx - ux * vz) * n[a + 1] + (ux * vy - uy * vx) * n[a + 2];
        }
        boxWinding = sum < 0 ? -1 : 1;
    }
    return boxWinding;
}

/**
 * A solid wedge: base on y = 0 over x in [-width/2, width/2], z in [0, length]; the top slopes
 * from the front edge (z = 0) up to `height` at z = length, closed by a vertical back face and
 * two triangular sides. Flat-shaded (each face has its own vertices and outward normal).
 * Gets a default standard material so it is drawn; assign another one to change its look.
 */
export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
    if (!(width > 0 && length > 0 && height > 0)) {
        throw new RangeError(`createRamp: width, length and height must be > 0 (got ${width}, ${length}, ${height})`);
    }

    const x0 = -width / 2;
    const x1 = width / 2;
    const frontLeft: V3 = [x0, 0, 0];
    const frontRight: V3 = [x1, 0, 0];
    const backRight: V3 = [x1, 0, length];
    const backLeft: V3 = [x0, 0, length];
    const topRight: V3 = [x1, height, length];
    const topLeft: V3 = [x0, height, length];
    const slope = Math.hypot(length, height);

    // Corners of each face in the order where (c1 - c0) x (c2 - c0) points out of the face.
    const faces: { normal: V3; corners: V3[] }[] = [
        { normal: [0, -1, 0], corners: [frontLeft, frontRight, backRight, backLeft] }, // base
        { normal: [0, length / slope, -height / slope], corners: [frontLeft, topLeft, topRight, frontRight] }, // slope
        { normal: [0, 0, 1], corners: [backLeft, backRight, topRight, topLeft] }, // back
        { normal: [1, 0, 0], corners: [frontRight, topRight, backRight] }, // right side
        { normal: [-1, 0, 0], corners: [frontLeft, backLeft, topLeft] }, // left side
    ];

    const flip = libraryWinding() < 0;
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    for (const { normal, corners } of faces) {
        const first = positions.length / 3;
        for (const corner of corners) {
            positions.push(...corner);
            normals.push(...normal);
        }
        for (let i = 1; i + 1 < corners.length; i++) {
            if (flip) indices.push(first, first + i + 1, first + i);
            else indices.push(first, first + i, first + i + 1);
        }
    }

    const ramp = createMeshFromData(engine, "ramp", new Float32Array(positions), new Float32Array(normals), new Uint32Array(indices));
    ramp.material = createStandardMaterial();
    addToScene(scene, ramp);
    return ramp;
}
