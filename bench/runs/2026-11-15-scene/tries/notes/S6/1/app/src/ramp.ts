import { addToScene, createMeshFromData } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

type Vec3 = readonly [number, number, number];

interface MeshBuilder {
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

function pushVertex(builder: MeshBuilder, p: Vec3, n: Vec3): number {
    const index = builder.positions.length / 3;
    builder.positions.push(p[0], p[1], p[2]);
    builder.normals.push(n[0], n[1], n[2]);
    return index;
}

/**
 * Adds one flat face. `points` is a convex polygon listed in order around its
 * boundary; it is fan-triangulated, and every triangle gets its own vertices
 * carrying the face normal. Each triangle's winding is chosen so that its
 * geometric normal agrees with `normal`, which must point out of the solid.
 */
function addFace(builder: MeshBuilder, points: readonly Vec3[], normal: Vec3): void {
    const p0 = points[0];
    for (let i = 1; i + 1 < points.length; i++) {
        let b = points[i];
        let c = points[i + 1];
        if (dot(cross(sub(b, p0), sub(c, p0)), normal) < 0) {
            [b, c] = [c, b];
        }
        builder.indices.push(
            pushVertex(builder, p0, normal),
            pushVertex(builder, b, normal),
            pushVertex(builder, c, normal),
        );
    }
}

/**
 * Creates a solid wedge-shaped loading ramp and adds it to the scene.
 *
 * - Base: rectangle on y = 0, x in [-width/2, width/2], z in [0, length].
 * - Top: slopes from the front edge (z = 0, y = 0) up to y = height at z = length.
 * - Back: vertical face at z = length, from y = 0 to y = height.
 * - Left and right: triangular sides at x = -width/2 and x = width/2.
 *
 * Five flat faces, each with its own vertices and outward normals.
 */
export function createRamp(
    engine: EngineContext,
    scene: SceneContext,
    width: number,
    length: number,
    height: number,
): Mesh {
    if (
        !(Number.isFinite(width) && width > 0) ||
        !(Number.isFinite(length) && length > 0) ||
        !(Number.isFinite(height) && height > 0)
    ) {
        throw new RangeError("createRamp: width, length and height must be finite numbers greater than 0");
    }

    const hw = width / 2;
    const builder: MeshBuilder = { positions: [], normals: [], indices: [] };

    // Base (bottom), facing down.
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

    // Sloped top, facing up and toward the front edge (-z).
    // Perpendicular to the slope direction (0, height, length) in the y-z plane.
    const slopeLength = Math.hypot(length, height);
    addFace(
        builder,
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, height, length],
            [-hw, height, length],
        ],
        [0, length / slopeLength, -height / slopeLength],
    );

    // Vertical back face at z = length, facing +z.
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
            [hw, 0, length],
            [hw, height, length],
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
