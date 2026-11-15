import { addToScene, createMeshFromData, createStandardMaterial } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

type Vec3Tuple = [number, number, number];

/**
 * Solid wedge-shaped loading ramp.
 *
 * Base: rectangle on y = 0, x in [-width/2, width/2], z in [0, length].
 * Top: slopes from the front edge (z = 0, y = 0) up to y = height at z = length.
 * Back: vertical face at z = length, from y = 0 to y = height.
 * Sides: two triangles at x = -width/2 and x = +width/2.
 *
 * Flat shaded: every face has its own vertices and a constant outward normal.
 * Triangle winding is chosen so that the cross product (v1 - v0) x (v2 - v0)
 * points along the face's outward normal, i.e. the outside of every face is
 * the front side.
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
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    // Adds one convex planar polygon (3 or 4 corners, in order around the face)
    // as a fan of triangles, with its own vertices carrying the face normal.
    const addFace = (corners: Vec3Tuple[], normal: Vec3Tuple): void => {
        const first = positions.length / 3;
        for (const [x, y, z] of corners) {
            positions.push(x, y, z);
            normals.push(normal[0], normal[1], normal[2]);
        }
        const c0 = corners[0];
        for (let i = 1; i + 1 < corners.length; i++) {
            const a = corners[i];
            const b = corners[i + 1];
            const ux = a[0] - c0[0], uy = a[1] - c0[1], uz = a[2] - c0[2];
            const vx = b[0] - c0[0], vy = b[1] - c0[1], vz = b[2] - c0[2];
            const cx = uy * vz - uz * vy;
            const cy = uz * vx - ux * vz;
            const cz = ux * vy - uy * vx;
            const facing = cx * normal[0] + cy * normal[1] + cz * normal[2];
            const i0 = first;
            const i1 = first + i;
            const i2 = first + i + 1;
            if (facing >= 0) {
                indices.push(i0, i1, i2);
            } else {
                indices.push(i0, i2, i1);
            }
        }
    };

    // Base, y = 0, facing down.
    addFace(
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, 0, length],
            [-hw, 0, length],
        ],
        [0, -1, 0],
    );

    // Sloped top, from (z = 0, y = 0) to (z = length, y = height).
    // Outward normal is perpendicular to (1,0,0) and (0,height,length): (0, length, -height).
    const slopeLen = Math.hypot(length, height);
    addFace(
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, height, length],
            [-hw, height, length],
        ],
        [0, length / slopeLen, -height / slopeLen],
    );

    // Vertical back face at z = length.
    addFace(
        [
            [-hw, 0, length],
            [hw, 0, length],
            [hw, height, length],
            [-hw, height, length],
        ],
        [0, 0, 1],
    );

    // Left side triangle at x = -hw.
    addFace(
        [
            [-hw, 0, 0],
            [-hw, 0, length],
            [-hw, height, length],
        ],
        [-1, 0, 0],
    );

    // Right side triangle at x = +hw.
    addFace(
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
        new Float32Array(positions),
        new Float32Array(normals),
        new Uint32Array(indices),
    );
    mesh.material = createStandardMaterial();
    addToScene(scene, mesh);
    return mesh;
}
