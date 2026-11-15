// r04: group meshes under a node and move, hide and remove them together.
import { makeGpuScene, drawsOfFrame, worldPos } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { addToScene, createBox, createFreeCamera, createStandardMaterial, createTransformNode, registerScene, removeFromScene, setMeshVisible, setParent } from "@babylonjs/lite";

function setup() {
    const s = makeGpuScene();
    addToScene(s.scene, createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 }));
    const group = createTransformNode("group", 2, 0, 0);
    const box = createBox(s.engine, 1);
    box.name = "box";
    box.material = createStandardMaterial() as never;
    box.position.x = 5;
    return { ...s, group, box };
}

describe("r04 grouping", () => {
    it("setParent keeps the world position, addToScene(group) adds the child, setMeshVisible/removeFromScene reach it", async () => {
        const { scene, engine, log, group, box } = setup();
        setParent(box, group);
        expect(box.position.x).toBeCloseTo(3);
        expect(worldPos(box)[0]).toBeCloseTo(5);
        expect(group.children).toContain(box);
        addToScene(scene, group);
        expect(scene.meshes).toEqual([box]);
        await registerScene(scene);
        group.position.x = 4;
        expect(worldPos(box)[0]).toBeCloseTo(7);
        setMeshVisible(group, false);
        expect(drawsOfFrame(engine, scene, log)).toHaveLength(0);
        setMeshVisible(group, true);
        expect(drawsOfFrame(engine, scene, log)).toHaveLength(1);
        removeFromScene(scene, group);
        expect(scene.meshes).toHaveLength(0);
        expect(box.parent).toBeNull();
    });

    it("with box.parent = group instead: local position kept, not in group.children, so addToScene/setMeshVisible miss it", async () => {
        const { scene, engine, log, group, box } = setup();
        box.parent = group;
        expect(worldPos(box)[0]).toBeCloseTo(7);
        expect(group.children).not.toContain(box);
        addToScene(scene, group);
        expect(scene.meshes).toHaveLength(0);
        addToScene(scene, box);
        await registerScene(scene);
        setMeshVisible(group, false);
        expect(drawsOfFrame(engine, scene, log)).toHaveLength(1);
        expect(box.visible).toBeUndefined();
    });

    it("with the child also added on its own: it is in scene.meshes twice and drawn twice", async () => {
        const { scene, engine, log, group, box } = setup();
        setParent(box, group);
        addToScene(scene, box);
        addToScene(scene, group);
        expect(scene.meshes).toEqual([box, box]);
        await registerScene(scene);
        expect(drawsOfFrame(engine, scene, log)).toHaveLength(2);
    });
});
