// Reach e: parented camera; beta = PI and 2PI (sin != 0 but tiny).
import { describe, expect, it } from "vitest";
import { createArcRotateCamera, getCameraPosition, getViewMatrix } from "@babylonjs/lite";

describe("reach e", () => {
    it("with a parent, getCameraPosition is not target + offset", () => {
        const c = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        const parentM = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 100,0,0,1]);
        c.parent = { worldMatrix: parentM, worldMatrixVersion: 1 } as never;
        const e = getCameraPosition(c);
        console.log("parented eye", e);
        expect(e.x).toBeCloseTo(10, 4);
    });
    for (const T of [{ x: 0, y: 0, z: 0 }, { x: 1, y: 2, z: 3 }]) for (const b of [Math.PI, 2 * Math.PI]) {
        it(`(a,-beta) vs (a+PI,beta) at beta=${b.toFixed(3)} target ${JSON.stringify(T)}`, () => {
            for (const a of [0, 0.7, 2]) {
                const v1 = Array.from(getViewMatrix(createArcRotateCamera(a, -b, 10, T)) as ArrayLike<number>);
                const v2 = Array.from(getViewMatrix(createArcRotateCamera(a + Math.PI, b, 10, T)) as ArrayLike<number>);
                console.log(b, a, JSON.stringify(T), v1.slice(0, 11).map((x) => x.toFixed(3)).join(","), "|", v2.slice(0, 11).map((x) => x.toFixed(3)).join(","));
                for (let i = 0; i < 16; i++) expect(v1[i]!).toBeCloseTo(v2[i]!, 4);
            }
        });
    }
});
