import { attachDevice } from "./scene-helpers";
import { createBox, createNullEngine, createTransformNode, setParent } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n14: worldMatrix is current as soon as any transform in the chain is written", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("a position write shows in worldMatrix on the next read, with no frame in between", () => {
        const box = createBox(engine);
        expect(box.worldMatrix[12]).toBe(0);
        box.position.x = 4;
        expect(box.worldMatrix[12]).toBe(4);
        box.scaling.set(2, 2, 2);
        expect(box.worldMatrix[0]).toBe(2);
    });

    it("a rotation write and a parent assignment also show at once", () => {
        const box = createBox(engine);
        box.position.set(1, 0, 0);
        box.rotation.z = Math.PI / 2;
        expect(box.worldMatrix[1]).toBeCloseTo(1);
        const p = createTransformNode("p", 0, 0, 3);
        box.parent = p;
        expect(box.worldMatrix[14]).toBe(3);
    });

    it("moving a parent updates a child's worldMatrix and bumps its worldMatrixVersion at once", () => {
        const p = createTransformNode("p");
        const box = createBox(engine);
        box.position.set(1, 0, 0);
        setParent(box, p);
        const v = box.worldMatrixVersion;
        p.position.set(0, 7, 0);
        expect(box.worldMatrixVersion).toBeGreaterThan(v);
        expect(box.worldMatrix[13]).toBe(7);
        expect(box.worldMatrix[12]).toBe(1);
    });
});
