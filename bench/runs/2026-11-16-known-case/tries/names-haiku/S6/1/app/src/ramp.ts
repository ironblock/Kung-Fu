import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createBoxData, createMeshFromData } from "@babylonjs/lite";

type Vec3 = [number, number, number];

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

// Determines which triangle winding the library treats as front-facing, using
// the library's own box. A correctly built box has every triangle's geometric
// normal pointing outward, so the sign of the summed (cross . outward) over the
// box tells us the front-facing sign in the library's convention.
let frontSign: number | null = null;

function getFrontSign(): number {
    if (frontSign !== null) return frontSign;

    const box = createBoxData({ size: 1 });
    const p = box.positions;
    const idx = box.indices;

    const min: Vec3 = [Infinity, Infinity, Infinity];
    const max: Vec3 = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < p.length; i += 3) {
        for (let k = 0; k < 3; k++) {
            min[k] = Math.min(min[k], p[i + k]);
            max[k] = Math.max(max[k], p[i + k]);
        }
    }
    const center: Vec3 = [
        (min[0] + max[0]) / 2,
        (min[1] + max[1]) / 2,
        (min[2] + max[2]) / 2,
    ];

    let score = 0;
    for (let t = 0; t + 2 < idx.length; t += 3) {
        const ia = idx[t] * 3;
        const ib = idx[t + 1] * 3;
        const ic = idx[t + 2] * 3;
        const a: Vec3 = [p[ia], p[ia + 1], p[ia + 2]];
        const b: Vec3 = [p[ib], p[ib + 1], p[ib + 2]];
        const c: Vec3 = [p[ic], p[ic + 1], p[ic + 2]];
        const n = cross(sub(b, a), sub(c, a));
        const centroid: Vec3 = [
            (a[0] + b[0] + c[0]) / 3,
            (a[1] + b[1] + c[1]) / 3,
            (a[2] + b[2] + c[2]) / 3,
        ];
        score += dot(n, sub(centroid, center));
    }

    frontSign = score >= 0 ? 1 : -1;
    return frontSign;
}

interface GeometryBuffers {
    pos: number[];
    nrm: number[];
    idx: number[];
}

// Emits one flat-shaded triangle with its own three vertices. The winding is
// chosen so the geometric normal agrees with the stated face normal under the
// library's front-facing convention.
function pushTriangle(
    g: GeometryBuffers,
    sign: number,
    a: Vec3,
    b: Vec3,
    c: Vec3,
    n: Vec3,
): void {
    const geometric = cross(sub(b, a), sub(c, a));
    const flip = dot(geometric, n) * sign < 0;
    const tri = flip ? [a, c, b] : [a, b, c];

    const base = g.pos.length / 3;
    for (const v of tri) {
        g.pos.push(v[0], v[1], v[2]);
        g.nrm.push(n[0], n[1], n[2]);
    }
    g.idx.push(base, base + 1, base + 2);
}

export function createRamp(
    engine: EngineContext,
    scene: SceneContext,
    width: number,
    length: number,
    height: number,
): Mesh {
    const hw = width / 2;
    const L = length;
    const h = height;
    const sign = getFrontSign();

    // Corners. The base lies on y = 0. The top slopes from the front edge
    // (z = 0, y = 0) up to y = h at z = L.
    const A: Vec3 = [-hw, 0, 0]; // front left, base
    const B: Vec3 = [hw, 0, 0]; // front right, base
    const C: Vec3 = [hw, 0, L]; // back right, base
    const D: Vec3 = [-hw, 0, L]; // back left, base
    const R: Vec3 = [hw, h, L]; // back right, top
    const S: Vec3 = [-hw, h, L]; // back left, top

    const slopeLen = Math.hypot(L, h);
    const nBase: Vec3 = [0, -1, 0];
    const nSlope: Vec3 = [0, L / slopeLen, -h / slopeLen];
    const nBack: Vec3 = [0, 0, 1];
    const nLeft: Vec3 = [-1, 0, 0];
    const nRight: Vec3 = [1, 0, 0];

    const g: GeometryBuffers = { pos: [], nrm: [], idx: [] };

    // Base: A B C D
    pushTriangle(g, sign, A, B, C, nBase);
    pushTriangle(g, sign, A, C, D, nBase);

    // Sloped top: A B R S
    pushTriangle(g, sign, A, B, R, nSlope);
    pushTriangle(g, sign, A, R, S, nSlope);

    // Vertical back face: C D S R
    pushTriangle(g, sign, C, D, S, nBack);
    pushTriangle(g, sign, C, S, R, nBack);

    // Left triangular side: A D S
    pushTriangle(g, sign, A, D, S, nLeft);

    // Right triangular side: B C R
    pushTriangle(g, sign, B, C, R, nRight);

    const positions = new Float32Array(g.pos);
    const normals = new Float32Array(g.nrm);
    const indices = new Uint32Array(g.idx);

    const mesh = createMeshFromData(engine, "ramp", positions, normals, indices);
    addToScene(scene, mesh);
    return mesh;
}
