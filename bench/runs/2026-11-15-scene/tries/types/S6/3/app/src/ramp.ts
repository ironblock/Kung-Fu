import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createMeshFromData } from "@babylonjs/lite";

type Vec3 = [number, number, number];

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * Solid wedge-shaped loading ramp.
 *
 * - Base: y = 0, x in [-width/2, width/2], z in [0, length].
 * - Top: slopes from the front edge (z = 0, y = 0) up to y = height at z = length.
 * - Back: vertical face at z = length, from y = 0 up to y = height.
 * - Two triangular sides at x = -width/2 and x = +width/2.
 *
 * Five flat faces. Each face has its own vertices and an outward normal.
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
    const h = height;
    const slopeLength = Math.hypot(L, h);

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    // Emits one flat face. `corners` is the outline in perimeter order (convex).
    // Winding: a triangle (a, b, c) faces along -((b - a) x (c - a)) under this
    // engine's front-face convention (CCW as seen from the side the face points to),
    // so each triangle is flipped when its cross product points along the normal.
    const addFace = (corners: Vec3[], normal: Vec3): void => {
        const first = positions.length / 3;
        for (const p of corners) {
            positions.push(p[0], p[1], p[2]);
            normals.push(normal[0], normal[1], normal[2]);
        }
        for (let i = 1; i + 1 < corners.length; i++) {
            let b = first + i;
            let c = first + i + 1;
            const n = cross(sub(corners[i], corners[0]), sub(corners[i + 1], corners[0]));
            if (dot(n, normal) > 0) {
                [b, c] = [c, b];
            }
            indices.push(first, b, c);
        }
    };

    // Base, normal -Y.
    addFace(
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, 0, L],
            [-hw, 0, L],
        ],
        [0, -1, 0],
    );

    // Sloped top, normal (0, L, -h) normalised: up and toward -Z.
    addFace(
        [
            [-hw, 0, 0],
            [hw, 0, 0],
            [hw, h, L],
            [-hw, h, L],
        ],
        [0, L / slopeLength, -h / slopeLength],
    );

    // Vertical back, normal +Z.
    addFace(
        [
            [-hw, 0, L],
            [hw, 0, L],
            [hw, h, L],
            [-hw, h, L],
        ],
        [0, 0, 1],
    );

    // Left triangular side, normal -X.
    addFace(
        [
            [-hw, 0, 0],
            [-hw, 0, L],
            [-hw, h, L],
        ],
        [-1, 0, 0],
    );

    // Right triangular side, normal +X.
    addFace(
        [
            [hw, 0, 0],
            [hw, 0, L],
            [hw, h, L],
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

    // TODO: createMeshFromData documents that mesh.material must be set before the
    // mesh is added to a scene. No material is assigned here yet; see the notes
    // with this change.
    addToScene(scene, mesh);
    return mesh;
}
