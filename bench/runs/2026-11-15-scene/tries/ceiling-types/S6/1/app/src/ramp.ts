import { addToScene, createMeshFromData } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

type Vec3 = readonly [number, number, number];

/**
 * Create a solid wedge-shaped loading ramp, add it to `scene` and return it.
 *
 * The base is the rectangle on y = 0 spanning x = -width/2..width/2 and z = 0..length. The top
 * slopes from the front edge (z = 0) up to `height` at z = length, where a vertical back face
 * closes it; triangular sides close it at x = ±width/2.
 *
 * Flat-shaded: each of the five faces has its own vertices, all carrying that face's outward
 * normal, and every triangle is wound with its front side facing out (see `addFace`), so under
 * back-face culling the ramp looks solid from every side, like the library's box.
 *
 * `createMeshFromData` assigns no material, and the mesh needs one before `addToScene`; pass it
 * as `material` so it is set before the ramp joins the scene.
 */
export function createRamp(
    engine: EngineContext,
    scene: SceneContext,
    width: number,
    length: number,
    height: number,
    material?: Mesh["material"],
): Mesh {
    requirePositive("width", width);
    requirePositive("length", length);
    requirePositive("height", height);

    const { positions, normals, indices } = buildRampGeometry(width, length, height);
    const mesh = createMeshFromData(engine, "ramp", positions, normals, indices);
    if (material) {
        mesh.material = material;
    }
    addToScene(scene, mesh);
    return mesh;
}

/** Five flat faces: 18 vertices, 8 triangles. */
function buildRampGeometry(width: number, length: number, height: number) {
    const x = width / 2;
    // Front edge, on the ground at z = 0.
    const frontLeft: Vec3 = [-x, 0, 0];
    const frontRight: Vec3 = [x, 0, 0];
    // Back edge, on the ground at z = length.
    const backLeft: Vec3 = [-x, 0, length];
    const backRight: Vec3 = [x, 0, length];
    // Top edge, `height` above the back edge.
    const topLeft: Vec3 = [-x, height, length];
    const topRight: Vec3 = [x, height, length];

    // The slope rises by `height` over `length` along +z, so its outward normal tilts toward -z.
    const slope = Math.hypot(length, height);
    const slopeNormal: Vec3 = [0, length / slope, -height / slope];

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    /**
     * Append one flat face as its own vertices and fan it into triangles from its first corner.
     *
     * Corners go around the face in the order where (c1 - c0) x (c2 - c0) points INTO the ramp,
     * against `normal`. That is the front-face winding of the library's own primitives (Babylon's
     * left-handed convention: counter-clockwise on screen when seen from outside, the order that
     * `computeNormals` turns into an outward normal), so back-face culling removes only the inside.
     */
    const addFace = (normal: Vec3, corners: readonly Vec3[]): void => {
        const first = positions.length / 3;
        for (const [px, py, pz] of corners) {
            positions.push(px, py, pz);
            normals.push(normal[0], normal[1], normal[2]);
        }
        for (let i = 1; i + 1 < corners.length; i++) {
            indices.push(first, first + i, first + i + 1);
        }
    };

    addFace([0, -1, 0], [frontLeft, backLeft, backRight, frontRight]); // base
    addFace(slopeNormal, [frontLeft, frontRight, topRight, topLeft]); // sloped top
    addFace([0, 0, 1], [backRight, backLeft, topLeft, topRight]); // vertical back
    addFace([1, 0, 0], [frontRight, backRight, topRight]); // right side (+x)
    addFace([-1, 0, 0], [frontLeft, topLeft, backLeft]); // left side (-x)

    return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        indices: new Uint32Array(indices),
    };
}

function requirePositive(name: string, value: number): void {
    if (!(value > 0 && Number.isFinite(value))) {
        throw new RangeError(`createRamp: ${name} must be a positive finite number, got ${value}`);
    }
}
