import { attachDevice } from "./scene-helpers";
import { createBox, createNullEngine, setMeshVisible } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n16: setMeshVisible writes the value to every descendant", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("showing a parent also shows a child that was hidden on its own", () => {
        const parent = createBox(engine);
        const child = createBox(engine);
        const grandchild = createBox(engine);
        parent.children.push(child);
        child.children.push(grandchild);
        setMeshVisible(child, false);
        expect(grandchild.visible).toBe(false);
        setMeshVisible(parent, false);
        setMeshVisible(parent, true);
        expect(child.visible).toBe(true);
        expect(grandchild.visible).toBe(true);
    });

    it("hiding a parent hides all descendants", () => {
        const parent = createBox(engine);
        const child = createBox(engine);
        parent.children.push(child);
        setMeshVisible(parent, false);
        expect(child.visible).toBe(false);
    });
});
