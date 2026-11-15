// n17: worldMatrix is current on every read.
import { makeGpuEngine } from "./scene-helpers";
import { createBox, createTransformNode, setParent } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n17 worldMatrix is live", () => {
    it("reflects the node's own position change at once", () => {
        const { engine } = makeGpuEngine();
        const box = createBox(engine);
        expect(box.worldMatrix[12]).toBe(0);
        box.position.x = 3;
        expect(box.worldMatrix[12]).toBe(3);
    });

    it("reflects an ancestor's move at once", () => {
        const { engine } = makeGpuEngine();
        const root = createTransformNode("root");
        const mid = createTransformNode("mid");
        const box = createBox(engine);
        setParent(mid, root);
        setParent(box, mid);
        void box.worldMatrix;
        root.position.set(0, 4, 0);
        expect(box.worldMatrix[13]).toBe(4);
        root.scaling.set(2, 2, 2);
        mid.position.set(0, 1, 0);
        expect(box.worldMatrix[13]).toBe(6);
    });
});
