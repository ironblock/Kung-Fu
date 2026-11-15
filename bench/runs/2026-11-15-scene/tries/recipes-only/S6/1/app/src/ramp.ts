import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createMeshFromVertexData, createStandardMaterial } from "@babylonjs/lite";

// Winding convention. Each triangle is emitted so that (b - a) x (c - a) points
// along its face's outward normal. Babylon treats triangles that are clockwise
// as seen from outside as front faces; that matches this numeric rule in its
// left-handed system. If the ramp shows inside-out under back-face culling,
// set this to true.
const REVERSE_WINDING = false;

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

// Adds one flat face with its own vertices. `pts` is a convex polygon (3 or 4
// points) in boundary order. `normal` is the outward face normal.
function addFace(data: MeshData, pts: Vec3[], normal: Vec3): void {
    const base = data.positions.length / 3;
    for (const p of pts) {
        data.positions.push(p[0], p[1], p[2]);
        data.normals.push(normal[0], normal[1], normal[2]);
    }
    for (let i = 1; i < pts.length - 1; i++) {
        const c = cross(sub(pts[i], pts[0]), sub(pts[i + 1], pts[0]));
        const outward = dot(c, normal) > 0;
        const flip = outward === REVERSE_WINDING;
        const a = base;
        const b = base + i;
        const d = base + i + 1;
        if (flip) {
            data.indices.push(a, d, b);
        } else {
            data.indices.push(a, b, d);
        }
    }
}

export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
    const w = width / 2;
    const L = length;
    const H = height;

    // Base corners (y = 0) and top back corners (y = H, z = L).
    const FL: Vec3 = [-w, 0, 0];
    const FR: Vec3 = [w, 0, 0];
    const BL: Vec3 = [-w, 0, L];
    const BR: Vec3 = [w, 0, L];
    const TL: Vec3 = [-w, H, L];
    const TR: Vec3 = [w, H, L];

    const data: MeshData = { positions: [], normals: [], indices: [] };

    // Sloped top, from the front edge (z = 0, y = 0) up to (z = L, y = H).
    // Normal is perpendicular to the x axis and to the slope direction (0, H, L).
    addFace(data, [FL, FR, TR, TL], normalize([0, L, -H]));
    // Vertical back face at z = L.
    addFace(data, [BL, BR, TR, TL], [0, 0, 1]);
    // Base at y = 0.
    addFace(data, [FL, FR, BR, BL], [0, -1, 0]);
    // Left and right triangular sides.
    addFace(data, [FL, TL, BL], [-1, 0, 0]);
    addFace(data, [FR, BR, TR], [1, 0, 0]);

    // Vertex-data mesh creation. These call names are NOT verified against
    // @babylonjs/lite 1.39.0 (the library is not installed here); check them
    // against the package's typings.
    const mesh = createMeshFromVertexData(engine, {
        positions: new Float32Array(data.positions),
        normals: new Float32Array(data.normals),
        indices: new Uint32Array(data.indices),
    });
    // Without a material the mesh is added but never drawn.
    mesh.material = createStandardMaterial();
    addToScene(scene, mesh);
    return mesh;
}
