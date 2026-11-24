// Ticket e: ArcRotateCamera eye formula, the sin(beta)=0 substitute, no clamp or wrap, fixed world up.
import { describe, expect, it } from "vitest";
import { createArcRotateCamera, getCameraPosition, getViewMatrix, setCameraLimits } from "@babylonjs/lite";

const T = { x: 1, y: 2, z: 3 };
function eye(a: number, b: number, r: number) {
    return getCameraPosition(createArcRotateCamera(a, b, r, T));
}
function expected(a: number, b: number, r: number) {
    let sb = Math.sin(b);
    if (sb === 0) sb = 0.0001;
    return { x: T.x + r * Math.cos(a) * sb, y: T.y + r * Math.cos(b), z: T.z + r * Math.sin(a) * sb };
}
const angles = [-7, -Math.PI, -2, -Math.PI / 2, -0.3, 0, 0.3, 1, Math.PI / 2, 2, Math.PI, 4, 3 * Math.PI / 2, 6, 2 * Math.PI, 9];

describe("ticket e", () => {
    it("eye = target + radius*(cos a sin b, cos b, sin a sin b) for any alpha and beta", () => {
        for (const a of angles) for (const b of angles) for (const r of [0.5, 10]) {
            const e = eye(a, b, r), x = expected(a, b, r);
            expect(e.x).toBeCloseTo(x.x, 4);
            expect(e.y).toBeCloseTo(x.y, 4);
            expect(e.z).toBeCloseTo(x.z, 4);
        }
        const e = eye(0, Math.PI / 2, 10);
        expect(e.x).toBeCloseTo(11, 4); expect(e.y).toBeCloseTo(2, 4); expect(e.z).toBeCloseTo(3, 4);
        const f = eye(Math.PI / 2, Math.PI / 2, 10);
        expect(f.x).toBeCloseTo(1, 4); expect(f.z).toBeCloseTo(13, 4);
    });
    it("sin(beta) exactly 0 is taken as 0.0001", () => {
        const e = eye(0, 0, 10);
        expect(e.x).toBeCloseTo(1 + 10 * 0.0001, 6);
        expect(e.y).toBeCloseTo(12, 6);
        const g = eye(Math.PI / 2, 0, 10);
        expect(g.z).toBeCloseTo(3 + 10 * 0.0001, 6);
    });
    it("nothing clamps or wraps alpha or beta before setCameraLimits", () => {
        const c = createArcRotateCamera(0, 1, 10, T);
        for (const v of [-7, -1, 0, 4, 9, 100]) {
            c.alpha = v; c.beta = v;
            expect(c.alpha).toBe(v);
            expect(c.beta).toBe(v);
        }
        setCameraLimits(c, { lowerBetaLimit: 0.1 });
        c.beta = -1;
        expect(c.beta).toBe(0.1);
    });
    it("up hint is world +Y: (alpha, -beta) gives the view of (alpha + PI, beta)", () => {
        for (const a of [0, 0.7, 2, -1]) for (const b of [0.3, 1, 2, 3, 4, 5]) {
            const v1 = Array.from(getViewMatrix(createArcRotateCamera(a, -b, 10, T)) as ArrayLike<number>);
            const v2 = Array.from(getViewMatrix(createArcRotateCamera(a + Math.PI, b, 10, T)) as ArrayLike<number>);
            for (let i = 0; i < 16; i++) expect(v1[i]!).toBeCloseTo(v2[i]!, 4);
            // camera's up axis (world matrix column 1) never points below the horizon
            const w = createArcRotateCamera(a, -b, 10, T).worldMatrix as ArrayLike<number>;
            expect(w[5]!).toBeGreaterThan(0);
        }
    });

    it("with a parent the formula gives the eye in the parent's space; getCameraPosition is world space", () => {
        const c0 = 0.6, s0 = 0.8; // a turn about Y plus a translation
        const P = new Float32Array([c0, 0, -s0, 0, 0, 1, 0, 0, s0, 0, c0, 0, 100, -5, 7, 1]);
        for (const [a, b] of [[0, Math.PI / 2], [0.7, 1], [2, -2], [4, 3]]) {
            const local = createArcRotateCamera(a!, b!, 10, T);
            const par = createArcRotateCamera(a!, b!, 10, T);
            par.parent = { worldMatrix: P, worldMatrixVersion: 1 } as never;
            const l = expected(a!, b!, 10);
            const w = getCameraPosition(par);
            expect(w.x).toBeCloseTo(l.x * P[0]! + l.y * P[4]! + l.z * P[8]! + P[12]!, 3);
            expect(w.y).toBeCloseTo(l.x * P[1]! + l.y * P[5]! + l.z * P[9]! + P[13]!, 3);
            expect(w.z).toBeCloseTo(l.x * P[2]! + l.y * P[6]! + l.z * P[10]! + P[14]!, 3);
            // the whole world matrix is the unparented one carried by the parent: look-at and up (0,1,0) are in the parent's space
            const L = local.worldMatrix as ArrayLike<number>, W = par.worldMatrix as ArrayLike<number>;
            for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) {
                let v = 0;
                for (let j = 0; j < 4; j++) v += L[r * 4 + j]! * P[j * 4 + k]!;
                expect(W[r * 4 + k]!).toBeCloseTo(v, 3);
            }
        }
        const t = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        t.parent = { worldMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 0, 0, 1]), worldMatrixVersion: 1 } as never;
        expect(getCameraPosition(t).x).toBeCloseTo(110, 4);
    });
    it("looks at target with up (0,1,0): the right axis is level and the forward axis points from eye to target", () => {
        for (const a of [0, 0.7, 2, -1, 4]) for (const b of [0.3, 1, 2, 3, -1, -2.5]) {
            const c = createArcRotateCamera(a, b, 10, T);
            const W = c.worldMatrix as ArrayLike<number>;
            const p = expected(a, b, 10);
            expect(W[1]!).toBeCloseTo(0, 5); // right axis has no Y part
            const f = [T.x - p.x, T.y - p.y, T.z - p.z].map((v) => v / 10);
            expect(W[8]!).toBeCloseTo(f[0]!, 4);
            expect(W[9]!).toBeCloseTo(f[1]!, 4);
            expect(W[10]!).toBeCloseTo(f[2]!, 4);
            expect(W[5]!).toBeGreaterThan(0); // up axis on the +Y side
        }
    });
});
