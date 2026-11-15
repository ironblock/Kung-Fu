import { addToScene, createMeshFromData } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

type Vec3 = [number, number, number];

// Winding convention. A triangle (a, b, c) is front-facing when
// dot(cross(b - a, c - a), outwardNormal) > 0. Every triangle below is oriented
// to satisfy this, whatever order its corners are supplied in. If the ramp
// renders inside-out under back-face culling, change this sign to -1.
const WINDING_SIGN = 1;

function sub(a: Vec3, b: Vec3): Vec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vec3, b: Vec3): Vec3 {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

function dot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

class FlatMeshBuilder {
    readonly positions: number[] = [];
    readonly normals: number[] = [];
    readonly indices: number[] = [];

    // Adds one flat face. `corners` must be in order around the polygon (convex).
    // Each face gets its own vertices, so every vertex carries the face normal.
    addFace(corners: Vec3[], normal: Vec3): void {
        const base = this.positions.length / 3;
        for (const p of corners) {
            this.positions.push(p[0], p[1], p[2]);
            this.normals.push(normal[0], normal[1], normal[2]);
        }
        // Fan triangulation from corner 0.
        for (let i = 1; i + 1 < corners.length; i++) {
            let b = i;
            let c = i + 1;
            const n = cross(sub(corners[b], corners[0]), sub(corners[c], corners[0]));
            if (dot(n, normal) * WINDING_SIGN < 0) {
                [b, c] = [c, b];
            }
            this.indices.push(base, base + b, base + c);
        }
    }
}

/**
 * Solid wedge-shaped loading ramp.
 *
 * Base: rectangle on y = 0, x in [-width/2, width/2], z in [0, length].
 * Top: slopes from the front edge (z = 0, y = 0) up to y = height at z = length.
 * Back: vertical face at z = length. Two triangular sides at x = ±width/2.
 * Five flat faces, each with its own vertices and outward normal.
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
    const L = length;
    const H = height;

    // Top normal is perpendicular to the top's in-plane direction (0, H, L):
    // (0, L, -H), pointing up and toward the front (-z).
    const slopeLen = Math.hypot(L, H);
    const topNormal: Vec3 = [0, L / slopeLen, -H / slopeLen];

    const b = new FlatMeshBuilder();

    // Base, facing down.
    b.addFace(
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, 0, L],
            [-hw, 0, L],
        ],
        [0, -1, 0],
    );

    // Sloped top.
    b.addFace(
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, H, L],
            [-hw, H, L],
        ],
        topNormal,
    );

    // Vertical back face at z = length.
    b.addFace(
        [
            [-hw, 0, L],
            [hw, 0, L],
            [hw, H, L],
            [-hw, H, L],
        ],
        [0, 0, 1],
    );

    // Left triangular side, at x = -width/2.
    b.addFace(
        [
            [-hw, 0, 0],
            [-hw, 0, L],
            [-hw, H, L],
        ],
        [-1, 0, 0],
    );

    // Right triangular side, at x = +width/2.
    b.addFace(
        [
            [hw, 0, 0],
            [hw, 0, L],
            [hw, H, L],
        ],
        [1, 0, 0],
    );

    const mesh = createMeshFromData(
        engine,
        "loadingRamp",
        new Float32Array(b.positions),
        new Float32Array(b.normals),
        new Uint32Array(b.indices),
    );
    addToScene(scene, mesh);
    return mesh;
}
