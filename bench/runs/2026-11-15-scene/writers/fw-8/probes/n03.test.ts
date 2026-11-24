// n03: addToScene walks children; assigning parent does not fill children; setParent does.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createBox, createPointLight, createSceneContext, createTransformNode, setParent } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n03 hierarchy and addToScene", () => {
    it("a child linked only by child.parent is not added with its parent", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const root = createTransformNode("root");
        const box = createBox(engine);
        const light = createPointLight([0, 1, 0]);
        box.parent = root;
        light.parent = root;
        expect(root.children).toHaveLength(0);
        addToScene(scene, root);
        expect(scene.meshes).not.toContain(box);
        expect(scene.lights).not.toContain(light);
    });

    it("setParent fills children, so addToScene(parent) adds the child, and keeps the world position", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const root = createTransformNode("root", 10, 0, 0);
        const box = createBox(engine);
        box.position.set(1, 0, 0);
        setParent(box, root);
        expect(root.children).toContain(box);
        expect(box.worldMatrix[12]).toBeCloseTo(1);
        addToScene(scene, root);
        expect(scene.meshes).toContain(box);
    });

    it("addToScene sets parent on nodes found in children", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const root = createTransformNode("root", 5, 0, 0);
        const box = createBox(engine);
        root.children.push(box);
        expect(box.parent).toBeNull();
        addToScene(scene, root);
        expect(box.parent).toBe(root);
        expect(box.worldMatrix[12]).toBeCloseTo(5);
    });
});
