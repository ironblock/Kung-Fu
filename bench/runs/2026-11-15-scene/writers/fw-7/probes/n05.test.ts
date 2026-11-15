import { attachDevice } from "./scene-helpers";
import { addToScene, createBox, createNullEngine, createPointLight, createSceneContext, createTransformNode } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n05: addToScene walks entity.children and sets each child's parent", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("a transform node lands in no scene list but its children (and grandchildren) are added and parented", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const root = createTransformNode("root", 5, 0, 0);
        const box = createBox(engine);
        const light = createPointLight([0, 1, 0]);
        const inner = createBox(engine);
        root.children.push(box, light);
        box.children.push(inner);
        addToScene(scene, root);
        expect(scene.meshes).toEqual([box, inner]);
        expect(scene.lights).toEqual([light]);
        expect(box.parent).toBe(root);
        expect(light.parent).toBe(root);
        expect(inner.parent).toBe(box);
        expect(inner.worldMatrix[12]).toBeCloseTo(5);
    });

    it("pushing to children alone does not parent the child before addToScene", () => {
        const root = createTransformNode("root", 5, 0, 0);
        const box = createBox(engine);
        root.children.push(box);
        expect(box.parent).toBeNull();
        expect(box.worldMatrix[12]).toBe(0);
    });
});
