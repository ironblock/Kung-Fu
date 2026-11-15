// n23: lights are scene nodes: rotation and parent rotate direction, uniform scaling does not but
// non-uniform scaling does, position from world matrix.
import { createDirectionalLight, createHemisphericLight, createPointLight, createSpotLight, createTransformNode, setParent } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

function entry(light: { _writeLightUbo?: (d: Float32Array, o: number) => void }): Float32Array {
    const data = new Float32Array(16);
    light._writeLightUbo!(data, 0);
    return data;
}

describe("n23 light transforms", () => {
    it("a directional light's own rotation turns its direction; its scaling does not change it", () => {
        const light = createDirectionalLight([0, -1, 0]);
        light.rotation.set(0, 0, Math.PI / 2);
        const d = entry(light);
        expect(d[0]).toBeCloseTo(1);
        expect(d[1]).toBeCloseTo(0);
        light.rotation.set(0, 0, 0);
        light.scaling.set(5, 5, 5);
        const s = entry(light);
        expect([s[0], s[1], s[2]]).toEqual([0, -1, 0]);
    });

    it("a parent's rotation turns hemispheric and spot directions", () => {
        const pivot = createTransformNode("pivot");
        const hemi = createHemisphericLight([0, 1, 0]);
        const spot = createSpotLight([0, 0, 0], [0, 0, 1], 1, 2);
        setParent(hemi, pivot);
        setParent(spot, pivot);
        pivot.rotation.set(Math.PI / 2, 0, 0);
        const h = entry(hemi);
        expect(h[1]).toBeCloseTo(0);
        expect(Math.abs(h[2]!)).toBeCloseTo(1);
        const s = entry(spot);
        expect(Math.abs(s[13]!)).toBeCloseTo(1);
    });

    it("a point light's position comes from its world matrix", () => {
        const pivot = createTransformNode("pivot", 10, 0, 0);
        const point = createPointLight([1, 2, 3]);
        point.parent = pivot;
        const p = entry(point);
        expect([p[0], p[1], p[2]]).toEqual([11, 2, 3]);
    });

    it("non-uniform scaling does turn a direction", () => {
        const light = createDirectionalLight([1, -1, 0]);
        light.scaling.set(1, 3, 1);
        const d = entry(light);
        expect(Math.abs(Math.atan2(-d[1]!, d[0]!) - Math.PI / 4)).toBeGreaterThan(0.1);
        const pivot = createTransformNode("pivot");
        const child = createDirectionalLight([1, -1, 0]);
        setParent(child, pivot);
        pivot.scaling.set(1, 3, 1);
        const c = entry(child);
        expect(Math.abs(Math.atan2(-c[1]!, c[0]!) - Math.PI / 4)).toBeGreaterThan(0.1);
    });
});
