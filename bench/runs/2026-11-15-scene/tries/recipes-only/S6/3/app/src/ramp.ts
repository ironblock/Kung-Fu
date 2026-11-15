import {
    addToScene,
    createStandardMaterial,
    // UNVERIFIED: name of the vertex-data mesh factory in @babylonjs/lite 1.39.0.
    // The library source was not available to check it; adjust this import and the call below.
    createMeshFromVertexData,
} from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

type Vec3 = [number, number, number];

interface MeshData {
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

function normalize(v: Vec3): Vec3 {
    const len = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
}

/**
 * Adds one flat face. `corners` are the face's outline in order (3 or 4 points, convex).
 * Each face gets its own vertices, all carrying `normal`. Each triangle's index order is
 * chosen so that (b - a) x (c - a) points along the outward normal, i.e. the triangle is
 * front-facing from outside under the assumed clockwise-front convention of Babylon's
 * left-handed space. This is an assumption, not checked against the library.
 */
function addFace(data: MeshData, corners: Vec3[], normal: Vec3): void {
    const base = data.positions.length / 3;
    for (const c of corners) {
        data.positions.push(c[0], c[1], c[2]);
        data.normals.push(normal[0], normal[1], normal[2]);
    }
    for (let i = 1; i + 1 < corners.length; i++) {
        const a = corners[0];
        const b = corners[i];
        const c = corners[i + 1];
        const n = cross(sub(b, a), sub(c, a));
        const flip = dot(n, normal) < 0;
        const i0 = base;
        const i1 = base + (flip ? i + 1 : i);
        const i2 = base + (flip ? i : i + 1);
        data.indices.push(i0, i1, i2);
    }
}

/**
 * Wedge-shaped loading ramp.
 * Base: y = 0, x in [-width/2, width/2], z in [0, length].
 * Top slopes from (z = 0, y = 0) up to (z = length, y = height).
 * A vertical back face closes it at z = length; two triangular sides close it left and right.
 * Five flat faces: bottom, slope, back, left, right.
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
    const L = length;
    const H = height;
    const data: MeshData = { positions: [], normals: [], indices: [] };

    // Bottom, y = 0, facing down.
    addFace(
        data,
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, 0, L],
            [-hw, 0, L],
        ],
        [0, -1, 0],
    );

    // Sloped top. Spans (0, H, L), so the outward normal is (0, L, -H) normalised: up and toward the front.
    addFace(
        data,
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, H, L],
            [-hw, H, L],
        ],
        normalize([0, L, -H]),
    );

    // Vertical back face, z = length, facing +z.
    addFace(
        data,
        [
            [-hw, 0, L],
            [hw, 0, L],
            [hw, H, L],
            [-hw, H, L],
        ],
        [0, 0, 1],
    );

    // Left triangular side, x = -width/2, facing -x.
    addFace(
        data,
        [
            [-hw, 0, 0],
            [-hw, 0, L],
            [-hw, H, L],
        ],
        [-1, 0, 0],
    );

    // Right triangular side, x = width/2, facing +x.
    addFace(
        data,
        [
            [hw, 0, 0],
            [hw, H, L],
            [hw, 0, L],
        ],
        [1, 0, 0],
    );

    const mesh = createMeshFromVertexData(engine, {
        positions: new Float32Array(data.positions),
        normals: new Float32Array(data.normals),
        indices: new Uint16Array(data.indices),
    });
    mesh.material = createStandardMaterial();
    addToScene(scene, mesh);
    return mesh;
}
