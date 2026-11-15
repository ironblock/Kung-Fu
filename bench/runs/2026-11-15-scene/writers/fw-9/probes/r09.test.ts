// r09: keep one light off one mesh.
import { makeGpuScene, frame, lightCountOf } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { addToScene, createBox, createFreeCamera, createPointLight, createStandardMaterial, registerScene, removeFromScene } from "@babylonjs/lite";

async function setup(when: "before" | "after" | "after+nudge" | "after+addLight" | "after+removeLight") {
    const s = makeGpuScene();
    addToScene(s.scene, createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 }));
    const box = createBox(s.engine, 1);
    box.material = createStandardMaterial() as never;
    box.position.x = 1.5;
    const other = createBox(s.engine, 1);
    other.material = createStandardMaterial() as never;
    other.position.x = -1.5;
    addToScene(s.scene, box);
    addToScene(s.scene, other);
    const lamp = createPointLight([0, 5, 0]);
    const fill = createPointLight([5, 5, 0]);
    addToScene(s.scene, lamp);
    addToScene(s.scene, fill);
    if (when === "before") lamp.excludedMeshes = new Set([box]);
    await registerScene(s.scene);
    frame(s.engine, s.scene);
    if (when !== "before") lamp.excludedMeshes = new Set([box]);
    if (when === "after+nudge") box.position.z += 0.001;
    if (when === "after+addLight") addToScene(s.scene, createPointLight([-5, 5, 0]));
    if (when === "after+removeLight") removeFromScene(s.scene, fill);
    frame(s.engine, s.scene);
    return { boxLights: lightCountOf(box, s.log), otherLights: lightCountOf(other, s.log) };
}

describe("r09 light exclusion", () => {
    it("excludedMeshes set before registerScene: the box is lit by 1 light, the other box by 2", async () => {
        expect(await setup("before")).toEqual({ boxLights: 1, otherLights: 2 });
    });

    it("set after registerScene: the box stays lit by 2 lights", async () => {
        expect(await setup("after")).toEqual({ boxLights: 2, otherLights: 2 });
    });

    it("set after registerScene and then the box moved: the exclusion takes effect", async () => {
        expect(await setup("after+nudge")).toEqual({ boxLights: 1, otherLights: 2 });
    });

    it("set after registerScene, box not moved, then a light added: the exclusion takes effect (2 of 3)", async () => {
        expect(await setup("after+addLight")).toEqual({ boxLights: 2, otherLights: 3 });
    });

    it("set after registerScene, box not moved, then another light removed: the exclusion takes effect", async () => {
        expect(await setup("after+removeLight")).toEqual({ boxLights: 0, otherLights: 1 });
    });
});
