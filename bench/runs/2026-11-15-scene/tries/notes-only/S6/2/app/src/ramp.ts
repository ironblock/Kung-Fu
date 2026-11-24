import { addToScene } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Solid wedge-shaped loading ramp, built from its own flat-shaded vertex data.
 *
 * Base: rectangle on y = 0, x in [-width/2, width/2], z in [0, length].
 * Top slopes from the front edge (z = 0, y = 0) up to y = height at z = length.
 * A vertical back face at z = length closes it; two triangles close the sides.
 *
 * Five faces, each with its own vertices. Triangles are wound so that
 * cross(b - a, c - a) points along the outward normal of each face
 * (Babylon's convention: front faces point out, so the outside of every face is drawn).
 */
export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
    const hw = width / 2;
    const L = length;
    const h = height;
    const slopeLen = Math.hypot(L, h);

    type Vec3 = [number, number, number];
    const faces: { verts: Vec3[]; normal: Vec3; tris: [number, number, number][] }[] = [
        // Base (bottom), normal -y
        {
            verts: [[-hw, 0, 0], [hw, 0, 0], [hw, 0, L], [-hw, 0, L]],
            normal: [0, -1, 0],
            tris: [[0, 1, 2], [0, 2, 3]],
        },
        // Sloped top, normal (0, L, -h) / |(0, L, -h)|
        {
            verts: [[-hw, 0, 0], [hw, 0, 0], [hw, h, L], [-hw, h, L]],
            normal: [0, L / slopeLen, -h / slopeLen],
            tris: [[0, 2, 1], [0, 3, 2]],
        },
        // Vertical back face at z = length, normal +z
        {
            verts: [[hw, h, L], [-hw, 0, L], [hw, 0, L], [-hw, h, L]],
            normal: [0, 0, 1],
            tris: [[0, 1, 2], [0, 3, 1]],
        },
        // Left triangular side, normal -x
        {
            verts: [[-hw, 0, 0], [-hw, 0, L], [-hw, h, L]],
            normal: [-1, 0, 0],
            tris: [[0, 1, 2]],
        },
        // Right triangular side, normal +x
        {
            verts: [[hw, 0, 0], [hw, h, L], [hw, 0, L]],
            normal: [1, 0, 0],
            tris: [[0, 1, 2]],
        },
    ];

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    for (const face of faces) {
        const base = positions.length / 3;
        for (const v of face.verts) {
            positions.push(v[0], v[1], v[2]);
            normals.push(face.normal[0], face.normal[1], face.normal[2]);
        }
        for (const t of face.tris) {
            indices.push(base + t[0], base + t[1], base + t[2]);
        }
    }

    const mesh = buildVertexMesh(
        engine,
        "ramp",
        new Float32Array(positions),
        new Float32Array(normals),
        new Uint16Array(indices),
    );
    addToScene(scene, mesh);
    return mesh;
}

/**
 * UNVERIFIED: the constructor for a mesh from raw vertex data in @babylonjs/lite 1.39.0.
 * The library is not available on this machine, so its name and signature could not be checked.
 * Replace this body with the library's real vertex-data mesh constructor.
 * Remember that a mesh with no material gets no renderable, so a material also has to be set.
 */
function buildVertexMesh(
    _engine: EngineContext,
    _name: string,
    _positions: Float32Array,
    _normals: Float32Array,
    _indices: Uint16Array,
): Mesh {
    throw new Error("ramp.ts: buildVertexMesh is not implemented; check the Babylon Lite vertex-data mesh API");
}
