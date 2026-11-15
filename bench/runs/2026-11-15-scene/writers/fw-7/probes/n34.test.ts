import { attachDevice } from "./scene-helpers";
import { createBox, createNullEngine, createTransformNode, setParent } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n34: setParent under a parent with a zero scale keeps only the world position", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("singular parent: local position = old world position; rotation and scaling unchanged", () => {
        const p = createTransformNode("p", 5, 0, 0, 0, 0, 0, 1, 0, 1, 1);
        const box = createBox(engine);
        box.position.set(2, 3, 4);
        box.scaling.set(2, 2, 2);
        box.rotation.y = 0.7;
        setParent(box, p);
        expect(box.parent).toBe(p);
        expect([box.position.x, box.position.y, box.position.z]).toEqual([2, 3, 4]);
        expect(box.scaling.x).toBe(2);
        expect(box.rotation.y).toBeCloseTo(0.7);
        expect(box.worldMatrix[12]).toBeCloseTo(5);
    });

    it("an invertible scaled parent: scale is compensated so the world matrix is unchanged", () => {
        const p = createTransformNode("p", 5, 0, 0, 0, 0, 0, 1, 2, 2, 2);
        const box = createBox(engine);
        box.position.set(2, 3, 4);
        const before = Array.from(box.worldMatrix);
        setParent(box, p);
        Array.from(box.worldMatrix).forEach((v, i) => expect(v).toBeCloseTo(before[i]!));
        expect(box.scaling.x).toBeCloseTo(0.5);
    });
});
