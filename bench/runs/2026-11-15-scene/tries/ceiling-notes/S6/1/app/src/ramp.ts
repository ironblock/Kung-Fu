import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createBoxData, createMeshFromData } from "@babylonjs/lite";

type Vec3 = readonly [number, number, number];

/**
 * Builds a solid, flat-shaded wedge-shaped loading ramp, adds it to the scene and returns it.
 *
 * - Base: the rectangle on y = 0, x from -width/2 to width/2, z from 0 to length.
 * - Top: slopes from the front edge (z = 0, y = 0) up to y = height at z = length.
 * - Back: a vertical face at z = length, from y = 0 to y = height.
 * - Sides: two triangles at x = -width/2 and x = width/2.
 *
 * Each of the five faces has its own vertices, with normals pointing straight out of it, and
 * every triangle is wound the way the library's own box winds its triangles, so the outside of
 * every face is drawn under back-face culling.
 *
 * Like the library's shape factories, the mesh has no material: it is listed in scene.meshes but
 * is not drawn until mesh.material is assigned (which queues it for a build).
 */
export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
    requirePositive("width", width);
    requirePositive("length", length);
    requirePositive("height", height);

    const left = -width / 2;
    const right = width / 2;

    // Front edge (z = 0), back bottom edge and back top edge (z = length).
    const frontL: Vec3 = [left, 0, 0];
    const frontR: Vec3 = [right, 0, 0];
    const backL: Vec3 = [left, 0, length];
    const backR: Vec3 = [right, 0, length];
    const topL: Vec3 = [left, height, length];
    const topR: Vec3 = [right, height, length];

    // The slope runs along (0, height, length); (0, length, -height) is perpendicular to it,
    // pointing up and toward the front, away from the solid.
    const slope = Math.hypot(length, height);
    const slopeNormal: Vec3 = [0, length / slope, -height / slope];

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    const winding = libraryWinding();

    // corners: a convex face's corners in order around its edge (either direction).
    function addFace(corners: readonly Vec3[], normal: Vec3): void {
        const first = positions.length / 3;
        for (const corner of corners) {
            positions.push(corner[0], corner[1], corner[2]);
            normals.push(normal[0], normal[1], normal[2]);
        }
        for (let i = 1; i + 1 < corners.length; i++) {
            if (windingSign(corners[0], corners[i], corners[i + 1], normal) === winding) {
                indices.push(first, first + i, first + i + 1);
            } else {
                indices.push(first, first + i + 1, first + i);
            }
        }
    }

    addFace([frontL, frontR, backR, backL], [0, -1, 0]); // base
    addFace([frontL, frontR, topR, topL], slopeNormal); // sloped top
    addFace([backL, backR, topR, topL], [0, 0, 1]); // back
    addFace([frontL, backL, topL], [-1, 0, 0]); // left side
    addFace([frontR, backR, topR], [1, 0, 0]); // right side

    const mesh = createMeshFromData(engine, "ramp", new Float32Array(positions), new Float32Array(normals), new Uint32Array(indices));
    addToScene(scene, mesh);
    return mesh;
}

function requirePositive(name: string, value: number): void {
    if (!(Number.isFinite(value) && value > 0)) {
        throw new RangeError(`createRamp: ${name} must be a positive finite number, got ${value}`);
    }
}

/**
 * Sign of ((b - a) x (c - a)) . normal: +1 if a, b, c run counter-clockwise around the normal by
 * the right-hand rule, -1 if clockwise.
 */
function windingSign(a: Vec3, b: Vec3, c: Vec3, normal: Vec3): number {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const d = (uy * vz - uz * vy) * normal[0] + (uz * vx - ux * vz) * normal[1] + (ux * vy - uy * vx) * normal[2];
    return d < 0 ? -1 : 1;
}

let cachedWinding: number | undefined;

/**
 * The winding sign (see windingSign) of the library's own box triangles relative to their outward
 * normals. The declarations do not state which winding the library treats as front-facing, so it
 * is read off createBoxData once instead of being assumed.
 */
function libraryWinding(): number {
    if (cachedWinding === undefined) {
        const { positions: p, normals: n, indices } = createBoxData();
        let sum = 0;
        for (let t = 0; t + 2 < indices.length; t += 3) {
            const a = indices[t] * 3, b = indices[t + 1] * 3, c = indices[t + 2] * 3;
            const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
            const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
            sum +=
                (uy * vz - uz * vy) * (n[a] + n[b] + n[c]) +
                (uz * vx - ux * vz) * (n[a + 1] + n[b + 1] + n[c + 1]) +
                (ux * vy - uy * vx) * (n[a + 2] + n[b + 2] + n[c + 2]);
        }
        cachedWinding = sum < 0 ? -1 : 1;
    }
    return cachedWinding;
}
