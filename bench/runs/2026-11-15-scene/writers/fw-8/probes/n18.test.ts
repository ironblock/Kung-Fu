// n18: cloneTransformNode naming, parent, and sharing.
import { fakeMaterial, makeGpuEngine, translation } from "./scene-helpers";
import { addThinInstance, cloneTransformNode, createBox, createTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n18 cloneTransformNode", () => {
    it("names, parent and shared data", () => {
        const { engine } = makeGpuEngine();
        const root = createTransformNode("root");
        const box = createBox(engine);
        box.name = "crate";
        box.material = fakeMaterial();
        setParent(box, root);
        const child = createBox(engine);
        child.name = "lid";
        setParent(child, box);
        const clone = cloneTransformNode(box) as Mesh;
        expect(clone.name).toBe("crate_clone");
        expect(clone.parent).toBeNull();
        expect(root.children).not.toContain(clone);
        expect(clone.material).toBe(box.material);
        expect(clone._gpu).toBe(box._gpu);
        expect(clone.children.map((c) => c.name)).toEqual(["lid_clone"]);
        expect(clone.children[0]!.parent).toBe(clone);
    });

    it("thin instances are one shared object: adding to the clone adds to the source", () => {
        const { engine } = makeGpuEngine();
        const box = createBox(engine);
        addThinInstance(box, translation(1, 0, 0) as never);
        const clone = cloneTransformNode(box) as Mesh;
        expect(clone.thinInstances).toBe(box.thinInstances);
        addThinInstance(clone, translation(2, 0, 0) as never);
        expect(box.thinInstances!.count).toBe(2);
    });

    it("a transform node clone is named name + _clone too", () => {
        const node = createTransformNode("pivot", 1, 2, 3);
        const clone = cloneTransformNode(node);
        expect(clone.name).toBe("pivot_clone");
        expect(clone.position.y).toBe(2);
    });
});
