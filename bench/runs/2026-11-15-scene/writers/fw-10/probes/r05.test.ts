// r05: parent a mesh to a node. Scene-graph helpers walk `children`; `child.parent = p` alone does not fill it.
import { makeGpuScene, worldPos } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { addToScene, createBox, createStandardMaterial, createTransformNode, removeFromScene, setMeshVisible, setParent } from "@babylonjs/lite";

function box(engine: Parameters<typeof createBox>[0]) {
    const m = createBox(engine, 1);
    m.material = createStandardMaterial();
    return m;
}

describe("r05 parenting", () => {
    it("setParent fills children, keeps the world position, and add/hide/remove of the parent reach the child", () => {
        const { engine, scene } = makeGpuScene();
        const pivot = createTransformNode("pivot", 10, 0, 0);
        const wheel = box(engine);
        wheel.position.set(1, 0, 0);
        setParent(wheel, pivot);
        expect(pivot.children).toContain(wheel);
        expect(worldPos(wheel)).toEqual([1, 0, 0]);
        expect(wheel.position.x).toBeCloseTo(-9);
        addToScene(scene, pivot);
        expect(scene.meshes).toContain(wheel);
        setMeshVisible(pivot, false);
        expect(wheel.visible).toBe(false);
        removeFromScene(scene, pivot);
        expect(scene.meshes).not.toContain(wheel);
    });

    it("children.push before addToScene links the parent and keeps the local position", () => {
        const { engine, scene } = makeGpuScene();
        const pivot = createTransformNode("pivot", 10, 0, 0);
        const wheel = box(engine);
        wheel.position.set(1, 0, 0);
        pivot.children.push(wheel);
        expect(wheel.parent).toBeNull();
        addToScene(scene, pivot);
        expect(wheel.parent).toBe(pivot);
        expect(worldPos(wheel)).toEqual([11, 0, 0]);
        expect(scene.meshes).toContain(wheel);
    });

    it("without it (child.parent = pivot only): the transform follows, but add/hide/remove of the parent miss the child", () => {
        const { engine, scene } = makeGpuScene();
        const pivot = createTransformNode("pivot", 10, 0, 0);
        const wheel = box(engine);
        wheel.position.set(1, 0, 0);
        wheel.parent = pivot;
        expect(worldPos(wheel)).toEqual([11, 0, 0]);
        expect(pivot.children).toHaveLength(0);
        addToScene(scene, pivot);
        expect(scene.meshes).not.toContain(wheel);
        addToScene(scene, wheel);
        setMeshVisible(pivot, false);
        expect(wheel.visible).not.toBe(false);
        removeFromScene(scene, pivot);
        expect(scene.meshes).toContain(wheel);
    });

    it("moving the parent later moves the child's world matrix", () => {
        const { engine } = makeGpuScene();
        const pivot = createTransformNode("pivot");
        const wheel = box(engine);
        setParent(wheel, pivot);
        pivot.position.set(0, 5, 0);
        expect(worldPos(wheel)).toEqual([0, 5, 0]);
    });
});
