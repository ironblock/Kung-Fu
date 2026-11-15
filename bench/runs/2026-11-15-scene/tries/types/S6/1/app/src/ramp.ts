import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createMeshFromData } from "@babylonjs/lite";

type Vec3 = [number, number, number];

function sub(a: Vec3, b: Vec3): Vec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vec3, b: Vec3): Vec3 {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** Accumulates flat-shaded faces: every face gets its own vertices, all sharing one outward normal. */
class FlatFaceBuilder {
    readonly positions: number[] = [];
    readonly normals: number[] = [];
    readonly indices: number[] = [];

    /**
     * Adds a convex planar polygon (3 or 4 corners, given in order around the face).
     * Each triangle's winding is chosen so that its cross product (p1 - p0) x (p2 - p0)
     * points along `outward`, i.e. the outside of the face is the front face that gets drawn.
     */
    addFace(corners: Vec3[], outward: Vec3): void {
        const base = this.positions.length / 3;
        for (const p of corners) {
            this.positions.push(p[0], p[1], p[2]);
            this.normals.push(outward[0], outward[1], outward[2]);
        }
        for (let i = 1; i + 1 < corners.length; i++) {
            let a = 0;
            let b = i;
            let c = i + 1;
            const n = cross(sub(corners[b], corners[a]), sub(corners[c], corners[a]));
            if (dot(n, outward) < 0) {
                [b, c] = [c, b];
            }
            this.indices.push(base + a, base + b, base + c);
        }
    }
}

/**
 * Builds a solid wedge-shaped loading ramp and adds it to the scene.
 *
 * Base: rectangle on y = 0, x in [-width/2, width/2], z in [0, length].
 * Top: slopes from the front edge (z = 0, y = 0) up to y = height at z = length,
 * where a vertical back face closes it. Two triangular sides close it left and right.
 * Five flat faces, each with its own vertices and outward normals.
 *
 * Note: the declarations say a mesh must have its material set before addToScene,
 * and this signature takes no material. The mesh is added without one.
 */
export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
    const hw = width / 2;
    const builder = new FlatFaceBuilder();

    // Base (bottom), normal -Y.
    builder.addFace(
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, 0, length],
            [-hw, 0, length],
        ],
        [0, -1, 0],
    );

    // Sloped top, normal perpendicular to the slope direction (0, height, length) and pointing up and toward the front.
    const slopeLen = Math.hypot(length, height);
    builder.addFace(
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, height, length],
            [-hw, height, length],
        ],
        [0, length / slopeLen, -height / slopeLen],
    );

    // Vertical back face at z = length, normal +Z.
    builder.addFace(
        [
            [-hw, 0, length],
            [hw, 0, length],
            [hw, height, length],
            [-hw, height, length],
        ],
        [0, 0, 1],
    );

    // Left triangular side at x = -width/2, normal -X.
    builder.addFace(
        [
            [-hw, 0, 0],
            [-hw, 0, length],
            [-hw, height, length],
        ],
        [-1, 0, 0],
    );

    // Right triangular side at x = +width/2, normal +X.
    builder.addFace(
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
