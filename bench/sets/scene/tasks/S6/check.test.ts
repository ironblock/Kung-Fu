import { describe, expect, it } from "vitest";
import { makeEngine, makeSceneOn, triangles, windingNormal } from "./scene-helpers-s";
import { createBox, getMeshGeometry } from "@babylonjs/lite";
import { createRamp } from "../src/ramp";

const dot = (a: number[], b: number[]) => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;

/** The sign that (b-a)x(c-a) has against the outward direction on the library's own box: its front-face rule. */
function libraryFrontSign(): number {
    const engine = makeEngine();
    const g = getMeshGeometry(createBox(engine, 2))!;
    const signs = new Set(
        triangles(g.positions, g.normals, g.indices).map(({ p }) => {
            const centroid = [0, 1, 2].map((a) => (p[0]![a]! + p[1]![a]! + p[2]![a]!) / 3);
            return Math.sign(dot(windingNormal(p), centroid));
        })
    );
    expect(signs.size).toBe(1);
    return [...signs][0]!;
}

describe("S6 a loading ramp", () => {
    const W = 3, L = 5, H = 1.5;

    function build() {
        const engine = makeEngine();
        const scene = makeSceneOn(engine);
        const mesh = createRamp(engine, scene, W, L, H);
        const g = getMeshGeometry(mesh)!;
        return { scene, mesh, tris: triangles(g.positions, g.normals, g.indices), g };
    }

    it("is in the scene and spans the asked box", () => {
        const { scene, mesh, g } = build();
        expect(scene.meshes).toContain(mesh);
        const lo = [0, 1, 2].map((a) => Math.min(...Array.from(g.positions).filter((_, i) => i % 3 === a)));
        const hi = [0, 1, 2].map((a) => Math.max(...Array.from(g.positions).filter((_, i) => i % 3 === a)));
        expect(lo[0]).toBeCloseTo(-W / 2, 5);
        expect(hi[0]).toBeCloseTo(W / 2, 5);
        expect(lo[1]).toBeCloseTo(0, 5);
        expect(hi[1]).toBeCloseTo(H, 5);
        expect(lo[2]).toBeCloseTo(0, 5);
        expect(hi[2]).toBeCloseTo(L, 5);
    });

    it("closes all five faces", () => {
        const { tris } = build();
        const area = tris.reduce((s, { p }) => s + Math.hypot(...windingNormal(p)) / 2, 0);
        const expected = W * L + W * H + W * Math.hypot(L, H) + L * H;
        expect(area).toBeCloseTo(expected, 4);
    });

    it("has flat normals that point out of the ramp", () => {
        const { tris } = build();
        const inside = [0, H / 3, (2 * L) / 3];
        for (const { p, n } of tris) {
            const face = windingNormal(p);
            const fl = Math.hypot(...face);
            const centroid = [0, 1, 2].map((a) => (p[0]![a]! + p[1]![a]! + p[2]![a]!) / 3);
            const out = centroid.map((c, a) => c - inside[a]!);
            for (const v of n) {
                expect(Math.hypot(...v)).toBeCloseTo(1, 4);
                expect(dot(v, out)).toBeGreaterThan(0);
                // Flat: along the face's own perpendicular.
                expect(Math.abs(dot(v, face)) / fl).toBeCloseTo(1, 4);
            }
        }
    });

    it("winds every triangle so that its outside is the drawn side, as on the library's box", () => {
        const front = libraryFrontSign();
        const { tris } = build();
        const inside = [0, H / 3, (2 * L) / 3];
        for (const { p } of tris) {
            const centroid = [0, 1, 2].map((a) => (p[0]![a]! + p[1]![a]! + p[2]![a]!) / 3);
            const out = centroid.map((c, a) => c - inside[a]!);
            expect(Math.sign(dot(windingNormal(p), out))).toBe(front);
        }
    });
});
