// n24: shape factories: engine first, fixed shape names, material null; no material => no renderable.
// The line factories differ: they take a name option and set a line material.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createBox, createDashedLines, createLineSystem, createLines, createCylinder, createGround, createPlane, createSceneContext, createSphere, createTorus, registerScene } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n24 mesh factories", () => {
    it("names each mesh after its shape and leaves material null", () => {
        const { engine } = makeGpuEngine();
        const made = [createBox(engine), createSphere(engine), createGround(engine), createPlane(engine), createCylinder(engine), createTorus(engine)];
        expect(made.map((m) => m.name)).toEqual(["box", "sphere", "ground", "plane", "cylinder", "torus"]);
        expect(made.every((m) => m.material === null)).toBe(true);
    });

    it("a mesh without material is listed in scene.meshes but registerScene builds nothing for it", async () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        addToScene(scene, box);
        await registerScene(scene);
        expect(scene.meshes).toContain(box);
        expect(scene._renderables).toHaveLength(0);
    });

    it("the line factories take a name option and set a line material", () => {
        const { engine } = makeGpuEngine();
        const pts = [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }];
        const lines = createLines(engine, { points: pts });
        const system = createLineSystem(engine, { lines: [pts] });
        const dashed = createDashedLines(engine, { points: pts });
        expect([lines.name, system.name, dashed.name]).toEqual(["lines", "lineSystem", "dashedLines"]);
        expect([lines, system, dashed].every((m) => m.material !== null)).toBe(true);
        expect(createLines(engine, { name: "edge", points: pts }).name).toBe("edge");
    });
});
