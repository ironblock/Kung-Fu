// r07: give thin instances to a mesh that is already drawing in a registered scene.
import { makeGpuScene, drawsOfFrame, settle } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { addThinInstance, addToScene, createBox, createFreeCamera, createStandardMaterial, createTranslationMat4, registerScene } from "@babylonjs/lite";

async function running() {
    const s = makeGpuScene();
    addToScene(s.scene, createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 }));
    const box = createBox(s.engine, 1);
    box.material = createStandardMaterial() as never;
    addToScene(s.scene, box);
    await registerScene(s.scene);
    expect(drawsOfFrame(s.engine, s.scene, s.log).map((d) => d.instances)).toEqual([1]);
    return { ...s, box };
}

describe("r07 thin instances on a running mesh", () => {
    it("after assigning a new material the mesh is rebuilt and draws its 2 instances", async () => {
        const { scene, engine, log, box } = await running();
        addThinInstance(box, createTranslationMat4(1, 0, 0));
        addThinInstance(box, createTranslationMat4(2, 0, 0));
        box.material = createStandardMaterial() as never;
        drawsOfFrame(engine, scene, log);
        await settle();
        expect(drawsOfFrame(engine, scene, log).map((d) => d.instances)).toEqual([2]);
    });

    it("without the material assignment (or with box.material = box.material): it keeps drawing 1 plain copy", async () => {
        const { scene, engine, log, box } = await running();
        addThinInstance(box, createTranslationMat4(1, 0, 0));
        addThinInstance(box, createTranslationMat4(2, 0, 0));
        box.material = box.material;
        for (let i = 0; i < 3; i++) {
            await settle();
            expect(drawsOfFrame(engine, scene, log).map((d) => d.instances)).toEqual([1]);
        }
    });

    it("a new mesh given thin instances before addToScene draws them once its build settles", async () => {
        const { scene, engine, log } = await running();
        const more = createBox(engine, 1);
        more.material = createStandardMaterial() as never;
        addThinInstance(more, createTranslationMat4(1, 0, 0));
        addThinInstance(more, createTranslationMat4(2, 0, 0));
        addToScene(scene, more);
        expect(drawsOfFrame(engine, scene, log).map((d) => d.instances)).toEqual([1]);
        await settle();
        expect(drawsOfFrame(engine, scene, log).map((d) => d.instances)).toEqual([1, 2]);
    });
});
