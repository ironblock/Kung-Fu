import { attachDevice } from "./scene-helpers";
import { addToScene, cloneTransformNode, createBox, createFreeCamera, createNullEngine, createPointLight, createSceneContext, createTransformNode } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n29: cloneTransformNode appends _clone, deep-clones children, shares geometry, adds nothing", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("a mesh clone is named name + '_clone', shares _gpu and keeps the transform", () => {
        const box = createBox(engine);
        box.name = "crate";
        box.position.set(1, 2, 3);
        box.rotation.y = 0.5;
        const clone = cloneTransformNode(box) as Mesh;
        expect(clone.name).toBe("crate_clone");
        expect(clone._gpu).toBe(box._gpu);
        expect(clone.position.y).toBe(2);
        expect(clone.rotation.y).toBeCloseTo(0.5);
    });

    it("children are cloned too (each '_clone'), parented to the copy", () => {
        const root = createTransformNode("root");
        const box = createBox(engine);
        root.children.push(box);
        const copy = cloneTransformNode(root);
        expect(copy.name).toBe("root_clone");
        expect(copy.children).toHaveLength(1);
        expect(copy.children[0]!.name).toBe("box_clone");
        expect(copy.children[0]).not.toBe(box);
        expect(copy.children[0]!.parent).toBe(copy);
    });

    it("the clone is in no scene until added", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        addToScene(scene, box);
        const clone = cloneTransformNode(box) as Mesh;
        expect(scene.meshes).not.toContain(clone);
        addToScene(scene, clone);
        expect(scene.meshes).toContain(clone);
    });

    it("light children are cloned with '_clone' too, but a camera anywhere in the subtree makes it throw a TypeError", () => {
        const root = createTransformNode("root");
        const light = createPointLight([0, 1, 0]);
        light.name = "lamp";
        root.children.push(light);
        expect(cloneTransformNode(root).children[0]!.name).toBe("lamp_clone");
        const rig = createTransformNode("rig");
        const cam = createFreeCamera({ x: 0, y: 0, z: -5 } as never, { x: 0, y: 0, z: 0 } as never);
        rig.children.push(cam as never);
        expect(() => cloneTransformNode(rig)).toThrow(TypeError);
    });
});
