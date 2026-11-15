import { addToScene, createMeshFromData } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

type Vec3 = readonly [number, number, number];
type Vec2 = readonly [number, number];

interface MeshBuilder {
    positions: number[];
    normals: number[];
    uvs: number[];
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
 * Adds a flat face (a convex polygon given as 3 or 4 corners, in order).
 * Every corner gets its own vertex carrying the face normal, so faces shade flat.
 *
 * Winding: each triangle is emitted so that (p1 - p0) x (p2 - p0) points along
 * the outward normal. This is the front-face convention Babylon uses by default
 * (front faces appear clockwise when seen from outside), so the outside of every
 * face survives back-face culling. This was not verified against the library
 * itself, since it is not installed here.
 */
function addFace(builder: MeshBuilder, normal: Vec3, corners: readonly Vec3[], uvs: readonly Vec2[]): void {
    const base = builder.positions.length / 3;

    corners.forEach((p, i) => {
        builder.positions.push(p[0], p[1], p[2]);
        builder.normals.push(normal[0], normal[1], normal[2]);
        builder.uvs.push(uvs[i][0], uvs[i][1]);
    });

    // Fan triangulation from corner 0. The faces here are convex, so this is exact.
    for (let i = 1; i + 1 < corners.length; i++) {
        let ib = i;
        let ic = i + 1;
        const geometric = cross(sub(corners[ib], corners[0]), sub(corners[ic], corners[0]));
        if (dot(geometric, normal) < 0) {
            [ib, ic] = [ic, ib];
        }
        builder.indices.push(base, base + ib, base + ic);
    }
}

/**
 * Creates a solid wedge-shaped loading ramp and adds it to the scene.
 *
 * - Base: rectangle on y = 0, x in [-width/2, width/2], z in [0, length].
 * - Top: slopes from the front edge (z = 0, y = 0) up to (z = length, y = height).
 * - Back: vertical face at z = length, from y = 0 to y = height.
 * - Two triangular sides at x = -width/2 and x = width/2.
 */
export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
    if (!(width > 0) || !(length > 0) || !(height > 0)) {
        throw new RangeError(`createRamp: width, length and height must be positive (got ${width}, ${length}, ${height})`);
    }

    const hw = width / 2;
    const builder: MeshBuilder = { positions: [], normals: [], uvs: [], indices: [] };

    const quadUvs: Vec2[] = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const triUvs: Vec2[] = [[0, 0], [1, 0], [0, 1]];

    // Base, facing down.
    addFace(
        builder,
        [0, -1, 0],
        [[-hw, 0, 0], [hw, 0, 0], [hw, 0, length], [-hw, 0, length]],
        quadUvs,
    );

    // Sloped top. Its direction vectors are (1,0,0) and (0,height,length),
    // so the normal is (0, length, -height) normalized, pointing up and toward the front.
    const slopeLen = Math.hypot(length, height);
    addFace(
        builder,
        [0, length / slopeLen, -height / slopeLen],
        [[-hw, 0, 0], [hw, 0, 0], [hw, height, length], [-hw, height, length]],
        quadUvs,
    );

    // Vertical back face at z = length.
    addFace(
        builder,
        [0, 0, 1],
        [[-hw, 0, length], [hw, 0, length], [hw, height, length], [-hw, height, length]],
        quadUvs,
    );

    // Left triangular side, facing -x.
    addFace(
        builder,
        [-1, 0, 0],
        [[-hw, 0, 0], [-hw, 0, length], [-hw, height, length]],
        triUvs,
    );

    // Right triangular side, facing +x.
    addFace(
        builder,
        [1, 0, 0],
        [[hw, 0, 0], [hw, height, length], [hw, 0, length]],
        triUvs,
    );

    const mesh = createMeshFromData(
        engine,
        "ramp",
        new Float32Array(builder.positions),
        new Float32Array(builder.normals),
        new Uint32Array(builder.indices),
        new Float32Array(builder.uvs),
    );

    addToScene(scene, mesh);
    return mesh;
}
