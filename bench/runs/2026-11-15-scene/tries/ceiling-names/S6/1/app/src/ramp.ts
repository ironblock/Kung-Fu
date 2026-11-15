import { addToScene, createMeshFromData } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

type Point = readonly [number, number, number];

function requirePositive(name: string, value: number): void {
    if (!(Number.isFinite(value) && value > 0)) {
        throw new RangeError(`createRamp: ${name} must be a positive finite number, got ${value}`);
    }
}

/**
 * Creates a solid wedge-shaped loading ramp, adds it to the scene and returns it.
 *
 * The base is the rectangle on y = 0 spanning x = -width/2 .. width/2 and
 * z = 0 .. length. The top slopes from the front edge (z = 0) up to `height`
 * at z = length, where a vertical back face closes it; two triangular sides
 * close it left and right.
 *
 * Flat-shaded: each of the five faces has its own vertices, all carrying that
 * face's outward normal.
 */
export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
    requirePositive("width", width);
    requirePositive("length", length);
    requirePositive("height", height);

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    // `corners` is a convex face listed counter-clockwise as seen from outside
    // the ramp, so cross(p1 - p0, p2 - p0) points along the outward `normal`.
    //
    // The triangles are emitted with the opposite winding: for each triangle
    // (a, b, c), cross(b - a, c - a) points INTO the solid. That is the winding
    // of Babylon's own box (it pairs with the left-handed default), so the box
    // and the ramp survive back-face culling the same way. If the ramp ever
    // renders inside-out, this push is the one line to change.
    const addFace = (corners: readonly Point[], normal: Point): void => {
        const base = positions.length / 3;
        for (const [x, y, z] of corners) {
            positions.push(x, y, z);
            normals.push(normal[0], normal[1], normal[2]);
        }
        for (let i = 1; i + 1 < corners.length; i++) {
            indices.push(base, base + i + 1, base + i);
        }
    };

    const left = -width / 2;
    const right = width / 2;
    // The slope rises `height` over `length`; its outward normal tilts up and
    // towards the front (-z).
    const slopeLength = Math.hypot(length, height);

    // Bottom, y = 0.
    addFace(
        [[left, 0, 0], [right, 0, 0], [right, 0, length], [left, 0, length]],
        [0, -1, 0],
    );
    // Slope, from the front edge up to the top of the back face.
    addFace(
        [[left, 0, 0], [left, height, length], [right, height, length], [right, 0, 0]],
        [0, length / slopeLength, -height / slopeLength],
    );
    // Back, z = length.
    addFace(
        [[left, 0, length], [right, 0, length], [right, height, length], [left, height, length]],
        [0, 0, 1],
    );
    // Left side, x = -width/2.
    addFace(
        [[left, 0, 0], [left, 0, length], [left, height, length]],
        [-1, 0, 0],
    );
    // Right side, x = width/2.
    addFace(
        [[right, 0, 0], [right, height, length], [right, 0, length]],
        [1, 0, 0],
    );

    const mesh = createMeshFromData(
        engine,
        "ramp",
        new Float32Array(positions),
        new Float32Array(normals),
        new Uint32Array(indices),
    );
    addToScene(scene, mesh);
    return mesh;
}
