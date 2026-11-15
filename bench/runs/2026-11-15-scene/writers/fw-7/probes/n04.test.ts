import { attachDevice } from "./scene-helpers";
import { addToScene, cloneTransformNode, createBox, createNullEngine, createSceneContext, createTransformNode, setMeshVisible, setParent } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n04: assigning node.parent does not touch children arrays; setParent does", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("child.parent = p: p.children stays empty, the local transform is kept", () => {
        const p = createTransformNode("p", 10, 0, 0);
        const box = createBox(engine);
        box.position.set(1, 0, 0);
        box.parent = p;
        expect(p.children).toHaveLength(0);
        expect(box.position.x).toBe(1);
        expect(box.worldMatrix[12]).toBeCloseTo(11);
    });

    it("addToScene(p) does not add a child linked only through .parent", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const p = createTransformNode("p");
        const box = createBox(engine);
        box.parent = p;
        addToScene(scene, p);
        expect(scene.meshes).not.toContain(box);
    });

    it("setMeshVisible(p, false) does not reach it, and cloneTransformNode(p) does not copy it", () => {
        const p = createTransformNode("p");
        const box = createBox(engine);
        box.parent = p;
        setMeshVisible(p, false);
        expect(box.visible).not.toBe(false);
        expect(cloneTransformNode(p).children).toHaveLength(0);
    });

    it("setParent adds the child to p.children, keeps its world position, and later calls reach it", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const p = createTransformNode("p", 10, 0, 0);
        const box = createBox(engine);
        box.position.set(1, 0, 0);
        setParent(box, p);
        expect(p.children).toContain(box);
        expect(box.position.x).toBeCloseTo(-9);
        expect(box.worldMatrix[12]).toBeCloseTo(1);
        addToScene(scene, p);
        expect(scene.meshes).toContain(box);
        setMeshVisible(p, false);
        expect(box.visible).toBe(false);
    });

    it("setParent to another parent removes it from the old parent's children", () => {
        const a = createTransformNode("a");
        const b = createTransformNode("b");
        const box = createBox(engine);
        setParent(box, a);
        setParent(box, b);
        expect(a.children).not.toContain(box);
        expect(b.children).toContain(box);
        setParent(box, null);
        expect(b.children).not.toContain(box);
        expect(box.parent).toBeNull();
    });

    it("after child.parent = p, setParent(child, p) sees no change and leaves p.children empty", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const p = createTransformNode("p", 10, 0, 0);
        const box = createBox(engine);
        box.parent = p;
        setParent(box, p);
        expect(p.children).toHaveLength(0);
        addToScene(scene, p);
        expect(scene.meshes).not.toContain(box);
    });
});
