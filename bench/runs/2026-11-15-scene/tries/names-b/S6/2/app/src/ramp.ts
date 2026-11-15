import { addToScene, createMeshFromData } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

type Vec3 = readonly [number, number, number];

interface FaceDef {
    /** Outward unit normal, shared by every vertex of the face (flat shading). */
    readonly normal: Vec3;
    /** Corner points of the face, in any order. */
    readonly corners: readonly Vec3[];
    /** Triangles as indices into `corners`. Each triangle's edge cross product points along `normal`. */
    readonly tris: readonly (readonly [number, number, number])[];
}

/**
 * Builds a solid wedge-shaped loading ramp and adds it to the scene.
 *
 * Base: rectangle on y = 0, x in [-width/2, width/2], z in [0, length].
 * Top: slopes from the front edge (z = 0, y = 0) up to y = height at z = length.
 * Back: vertical face at z = length. Two triangular sides at x = -width/2 and x = width/2.
 *
 * Each face has its own vertices. Triangles are ordered so that the outside of every
 * face is the front side under back-face culling.
 */
export function createRamp(
    engine: EngineContext,
    scene: SceneContext,
    width: number,
    length: number,
    height: number,
): Mesh {
    if (!(width > 0) || !(length > 0) || !(height > 0)) {
        throw new RangeError("createRamp: width, length and height must be positive");
    }

    const hw = width / 2;
    const FL: Vec3 = [-hw, 0, 0]; // front-left, base
    const FR: Vec3 = [hw, 0, 0]; // front-right, base
    const BL: Vec3 = [-hw, 0, length]; // back-left, base
    const BR: Vec3 = [hw, 0, length]; // back-right, base
    const TL: Vec3 = [-hw, height, length]; // back-left, top
    const TR: Vec3 = [hw, height, length]; // back-right, top

    // Slope normal is perpendicular to the slope direction (0, height, length) and points up and toward -z.
    const slopeLen = Math.hypot(length, height);
    const slopeNormal: Vec3 = [0, length / slopeLen, -height / slopeLen];

    const faces: FaceDef[] = [
        // Bottom: y = 0, facing -y.
        { normal: [0, -1, 0], corners: [FL, FR, BR, BL], tris: [[0, 1, 2], [0, 2, 3]] },
        // Sloped top, facing up and toward the front.
        { normal: slopeNormal, corners: [FL, FR, TR, TL], tris: [[0, 3, 2], [0, 2, 1]] },
        // Vertical back face at z = length, facing +z.
        { normal: [0, 0, 1], corners: [BL, BR, TR, TL], tris: [[0, 1, 2], [0, 2, 3]] },
        // Left triangular side at x = -width/2, facing -x.
        { normal: [-1, 0, 0], corners: [FL, BL, TL], tris: [[0, 1, 2]] },
        // Right triangular side at x = +width/2, facing +x.
        { normal: [1, 0, 0], corners: [FR, TR, BR], tris: [[0, 1, 2]] },
    ];

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    for (const face of faces) {
        const base = positions.length / 3;
        for (const corner of face.corners) {
            positions.push(corner[0], corner[1], corner[2]);
            normals.push(face.normal[0], face.normal[1], face.normal[2]);
        }
        for (const tri of face.tris) {
            indices.push(base + tri[0], base + tri[1], base + tri[2]);
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
