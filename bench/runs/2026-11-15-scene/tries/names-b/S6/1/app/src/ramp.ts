import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createMeshFromData } from "@babylonjs/lite";

type Vec3 = [number, number, number];

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
 * Appends one flat face with its own vertices.
 * `corners` must be listed in cyclic order around a convex, planar polygon.
 * The winding is chosen so that (p1 - p0) x (p2 - p0) points along `normal`,
 * which is the outward direction, so every face is front-facing from outside.
 */
function addFace(
    positions: number[],
    normals: number[],
    indices: number[],
    corners: Vec3[],
    normal: Vec3,
): void {
    const ordered =
        dot(cross(sub(corners[1], corners[0]), sub(corners[2], corners[0])), normal) < 0
            ? [...corners].reverse()
            : corners;

    const base = positions.length / 3;
    for (const p of ordered) {
        positions.push(p[0], p[1], p[2]);
        normals.push(normal[0], normal[1], normal[2]);
    }
    // Fan triangulation; valid for convex polygons (triangles and quads here).
    for (let i = 1; i + 1 < ordered.length; i++) {
        indices.push(base, base + i, base + i + 1);
    }
}

/**
 * Solid wedge ramp. Base on y = 0 spanning x in [-width/2, width/2], z in [0, length].
 * The top slopes from the front edge (z = 0, y = 0) up to y = height at z = length,
 * closed by a vertical back face. Two triangular sides close it left and right.
 */
export function createRamp(
    engine: EngineContext,
    scene: SceneContext,
    width: number,
    length: number,
    height: number,
): Mesh {
    const w = width / 2;

    const frontLeft: Vec3 = [-w, 0, 0];
    const frontRight: Vec3 = [w, 0, 0];
    const backRight: Vec3 = [w, 0, length];
    const backLeft: Vec3 = [-w, 0, length];
    const topBackRight: Vec3 = [w, height, length];
    const topBackLeft: Vec3 = [-w, height, length];

    // Top slope runs along (0, height, length); its outward normal is (0, length, -height).
    const slopeLen = Math.hypot(length, height);
    const topNormal: Vec3 = [0, length / slopeLen, -height / slopeLen];

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    // Bottom
    addFace(positions, normals, indices, [frontLeft, frontRight, backRight, backLeft], [0, -1, 0]);
    // Sloped top
    addFace(positions, normals, indices, [frontLeft, frontRight, topBackRight, topBackLeft], topNormal);
    // Vertical back
    addFace(positions, normals, indices, [backRight, backLeft, topBackLeft, topBackRight], [0, 0, 1]);
    // Left side triangle
    addFace(positions, normals, indices, [frontLeft, backLeft, topBackLeft], [-1, 0, 0]);
    // Right side triangle
    addFace(positions, normals, indices, [frontRight, topBackRight, backRight], [1, 0, 0]);

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
