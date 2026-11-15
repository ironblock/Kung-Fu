import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createMeshFromData } from "@babylonjs/lite";

type Vec3 = [number, number, number];

interface FaceData {
    positions: number[];
    normals: number[];
    indices: number[];
}

function sub(a: Vec3, b: Vec3): Vec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vec3, b: Vec3): Vec3 {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Adds one flat, convex face with its own vertices. `corners` must be in order
 * around the polygon. Every vertex gets the face normal `normal`.
 *
 * Winding: Babylon treats a triangle as front-facing when its vertices run
 * clockwise as seen from the side it faces, which means
 * (v1 - v0) x (v2 - v0) points out of that side. The triangles are oriented
 * so this holds with respect to `normal`, so the outside of the face is the
 * front side under back-face culling.
 */
function addFace(out: FaceData, corners: Vec3[], normal: Vec3): void {
    const base = out.positions.length / 3;
    for (const c of corners) {
        out.positions.push(c[0], c[1], c[2]);
        out.normals.push(normal[0], normal[1], normal[2]);
    }
    const flip = dot(cross(sub(corners[1], corners[0]), sub(corners[2], corners[0])), normal) < 0;
    // Fan triangulation; all faces here are convex.
    for (let i = 1; i < corners.length - 1; i++) {
        if (flip) {
            out.indices.push(base, base + i + 1, base + i);
        } else {
            out.indices.push(base, base + i, base + i + 1);
        }
    }
}

/**
 * Creates a solid wedge-shaped loading ramp and adds it to the scene.
 *
 * The base lies on y = 0, spanning x in [-width/2, width/2] and z in [0, length].
 * The top slopes from the front edge (z = 0, y = 0) up to y = height at
 * z = length, where a vertical back face closes the ramp. Two triangular sides
 * close it left and right. The result has five flat faces (18 vertices).
 */
export function createRamp(
    engine: EngineContext,
    scene: SceneContext,
    width: number,
    length: number,
    height: number,
): Mesh {
    if (!(width > 0 && length > 0 && height > 0)) {
        throw new RangeError("createRamp: width, length and height must be positive");
    }

    const hw = width / 2;
    const a: Vec3 = [-hw, 0, 0];         // base, front-left
    const b: Vec3 = [hw, 0, 0];          // base, front-right
    const c: Vec3 = [hw, 0, length];     // base, back-right
    const d: Vec3 = [-hw, 0, length];    // base, back-left
    const e: Vec3 = [-hw, height, length]; // top, back-left
    const f: Vec3 = [hw, height, length];  // top, back-right

    const out: FaceData = { positions: [], normals: [], indices: [] };

    // Bottom: y = 0, facing down.
    addFace(out, [a, b, c, d], [0, -1, 0]);

    // Sloped top: the plane contains the X axis and the direction (0, height, length).
    // Its normal is (0, length, -height), normalized, which points up and toward the front.
    const slopeLen = Math.hypot(length, height);
    addFace(out, [a, b, f, e], [0, length / slopeLen, -height / slopeLen]);

    // Back: z = length, facing +z.
    addFace(out, [d, c, f, e], [0, 0, 1]);

    // Left side triangle: x = -width/2, facing -x.
    addFace(out, [a, d, e], [-1, 0, 0]);

    // Right side triangle: x = width/2, facing +x.
    addFace(out, [b, c, f], [1, 0, 0]);

    const mesh = createMeshFromData(
        engine,
        "ramp",
        new Float32Array(out.positions),
        new Float32Array(out.normals),
        new Uint32Array(out.indices),
    );
    addToScene(scene, mesh);
    return mesh;
}
