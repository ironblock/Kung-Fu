import { addToScene, createMeshFromData } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

type Vec3Tuple = [number, number, number];

/**
 * One flat face of the wedge. `points` is a convex polygon listed so that it is
 * counter-clockwise when seen from outside (its right-hand normal points along `normal`).
 */
interface Face {
    readonly normal: Vec3Tuple;
    readonly points: readonly Vec3Tuple[];
}

/**
 * Build a solid wedge-shaped loading ramp from its own vertex data and add it to the scene.
 *
 * Base: rectangle on y = 0, x in [-width/2, width/2], z in [0, length].
 * Top: slopes from the front edge (z = 0, y = 0) up to y = height at z = length.
 * Back: vertical face at z = length. Two triangular sides at x = -width/2 and x = +width/2.
 *
 * Five flat faces, each with its own vertices and an outward normal. Windings are
 * counter-clockwise seen from outside, so back-face culling shows the outside of every face.
 */
export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
    if (!(width > 0 && length > 0 && height > 0)) {
        throw new Error("createRamp: width, length and height must be positive numbers");
    }

    const hw = width / 2;

    // Base corners (y = 0).
    const frontLeftBottom: Vec3Tuple = [-hw, 0, 0];
    const frontRightBottom: Vec3Tuple = [hw, 0, 0];
    const backRightBottom: Vec3Tuple = [hw, 0, length];
    const backLeftBottom: Vec3Tuple = [-hw, 0, length];
    // Top back corners (z = length, y = height). The front top corners sit at y = 0.
    const backRightTop: Vec3Tuple = [hw, height, length];
    const backLeftTop: Vec3Tuple = [-hw, height, length];

    // Slope normal is perpendicular to the slope direction (0, height, length), pointing up and toward -z.
    const slopeLength = Math.hypot(length, height);
    const slopeNormal: Vec3Tuple = [0, length / slopeLength, -height / slopeLength];

    const faces: Face[] = [
        // Bottom: four corners, normal -Y.
        { normal: [0, -1, 0], points: [frontLeftBottom, frontRightBottom, backRightBottom, backLeftBottom] },
        // Sloped top: front-left, back-left-top, back-right-top, front-right.
        { normal: slopeNormal, points: [frontLeftBottom, backLeftTop, backRightTop, frontRightBottom] },
        // Back: vertical, normal +Z.
        { normal: [0, 0, 1], points: [backRightBottom, backRightTop, backLeftTop, backLeftBottom] },
        // Left triangular side, normal -X.
        { normal: [-1, 0, 0], points: [frontLeftBottom, backLeftBottom, backLeftTop] },
        // Right triangular side, normal +X.
        { normal: [1, 0, 0], points: [frontRightBottom, backRightTop, backRightBottom] },
    ];

    let vertexCount = 0;
    let triangleCount = 0;
    for (const face of faces) {
        vertexCount += face.points.length;
        triangleCount += face.points.length - 2;
    }

    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const indices = new Uint32Array(triangleCount * 3);

    let v = 0;
    let k = 0;
    for (const face of faces) {
        const firstVertex = v;
        for (const p of face.points) {
            positions.set(p, v * 3);
            normals.set(face.normal, v * 3);
            v++;
        }
        // Fan-triangulate the convex polygon from its first point.
        for (let i = 1; i + 1 < face.points.length; i++) {
            indices[k++] = firstVertex;
            indices[k++] = firstVertex + i;
            indices[k++] = firstVertex + i + 1;
        }
    }

    const mesh = createMeshFromData(engine, "loadingRamp", positions, normals, indices);
    addToScene(scene, mesh);
    return mesh;
}
