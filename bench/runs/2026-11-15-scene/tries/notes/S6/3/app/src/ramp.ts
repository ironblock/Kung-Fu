import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createMeshFromData } from "@babylonjs/lite";

type Vec3 = [number, number, number];

interface MeshBuilder {
    positions: number[];
    normals: number[];
    indices: number[];
}

// Adds one flat face with its own four (or three) vertices.
// `corners` is the outline in any order. It is reversed if necessary so the
// triangles' cross product (b - a) x (c - a) points along `normal`, i.e. out of
// the solid. Every face gets the same rule, so all faces are front-facing from
// outside.
function addFace(builder: MeshBuilder, corners: Vec3[], normal: Vec3): void {
    // Newell's method: orientation of the outline, as a vector.
    let nx = 0;
    let ny = 0;
    let nz = 0;
    for (let i = 0; i < corners.length; i++) {
        const [x0, y0, z0] = corners[i];
        const [x1, y1, z1] = corners[(i + 1) % corners.length];
        nx += (y0 - y1) * (z0 + z1);
        ny += (z0 - z1) * (x0 + x1);
        nz += (x0 - x1) * (y0 + y1);
    }
    const outline =
        nx * normal[0] + ny * normal[1] + nz * normal[2] < 0 ? [...corners].reverse() : corners;

    const base = builder.positions.length / 3;
    for (const [x, y, z] of outline) {
        builder.positions.push(x, y, z);
        builder.normals.push(normal[0], normal[1], normal[2]);
    }
    // Fan triangulation; the faces here are convex.
    for (let i = 1; i < outline.length - 1; i++) {
        builder.indices.push(base, base + i, base + i + 1);
    }
}

/**
 * Solid wedge-shaped loading ramp.
 *
 * - Base: y = 0, x in [-width/2, width/2], z in [0, length].
 * - Top: slopes from the front edge (z = 0, y = 0) up to y = height at z = length.
 * - Back: vertical face at z = length, from y = 0 to y = height.
 * - Two triangular sides at x = -width/2 and x = width/2.
 *
 * Five flat-shaded faces, each with its own vertices and an outward normal.
 * The mesh has no material; assign one before it is drawn.
 */
export function createRamp(
    engine: EngineContext,
    scene: SceneContext,
    width: number,
    length: number,
    height: number,
): Mesh {
    if (![width, length, height].every((v) => Number.isFinite(v) && v > 0)) {
        throw new RangeError("createRamp: width, length and height must be positive, finite numbers");
    }

    const hw = width / 2;
    // Normal of the sloped top. It is perpendicular to the slope direction
    // (0, height, length) and points up and toward the front (-z).
    const slopeLength = Math.hypot(length, height);
    const slopeNormal: Vec3 = [0, length / slopeLength, -height / slopeLength];

    const builder: MeshBuilder = { positions: [], normals: [], indices: [] };

    // Base, facing down.
    addFace(
        builder,
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, 0, length],
            [-hw, 0, length],
        ],
        [0, -1, 0],
    );

    // Sloped top.
    addFace(
        builder,
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, height, length],
            [-hw, height, length],
        ],
        slopeNormal,
    );

    // Vertical back, facing +z.
    addFace(
        builder,
        [
            [-hw, 0, length],
            [hw, 0, length],
            [hw, height, length],
            [-hw, height, length],
        ],
        [0, 0, 1],
    );

    // Left triangular side, facing -x.
    addFace(
        builder,
        [
            [-hw, 0, 0],
            [-hw, 0, length],
            [-hw, height, length],
        ],
        [-1, 0, 0],
    );

    // Right triangular side, facing +x.
    addFace(
        builder,
        [
            [hw, 0, 0],
            [hw, height, length],
            [hw, 0, length],
        ],
        [1, 0, 0],
    );

    const mesh = createMeshFromData(
        engine,
        "ramp",
        new Float32Array(builder.positions),
        new Float32Array(builder.normals),
        new Uint32Array(builder.indices),
    );
    addToScene(scene, mesh);
    return mesh;
}
