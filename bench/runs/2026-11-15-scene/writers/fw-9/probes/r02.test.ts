// r02: a directional light casts a box's shadow on a ground.
import { makeGpuScene, drawsOfFrame, settle } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import {
    addToScene,
    createBox,
    createDirectionalLight,
    createFreeCamera,
    createGround,
    createPcfDirectionalShadowGenerator,
    createStandardMaterial,
    registerScene,
    registerSceneWithShadowSupport,
    setShadowTaskCasterMeshes,
} from "@babylonjs/lite";

type Omit = "link" | "casters" | "receive" | "shadowRegister";

async function build(omit: Omit | "receiveLate" | "addInsteadOfLink" | null) {
    const s = makeGpuScene();
    const { scene, engine } = s;
    addToScene(scene, createFreeCamera({ x: 0, y: 5, z: -10 }, { x: 0, y: 0, z: 0 }));
    const box = createBox(engine, 1);
    box.material = createStandardMaterial() as never;
    box.position.y = 2;
    const ground = createGround(engine, { width: 10, height: 10 });
    ground.material = createStandardMaterial() as never;
    if (omit !== "receive" && omit !== "receiveLate") ground.receiveShadows = true;
    const light = createDirectionalLight([0, -1, 0.3]);
    addToScene(scene, box);
    addToScene(scene, ground);
    addToScene(scene, light);
    const sg = createPcfDirectionalShadowGenerator(engine, light);
    if (omit === "addInsteadOfLink") addToScene(scene, sg);
    else if (omit !== "link") light.shadowGenerator = sg;
    if (omit !== "casters") setShadowTaskCasterMeshes(sg, [box]);
    if (omit === "shadowRegister") await registerScene(scene);
    else await registerSceneWithShadowSupport(scene);
    if (omit === "receiveLate") ground.receiveShadows = true;
    await settle();
    const draws = drawsOfFrame(engine, scene, s.log);
    const passes = new Set(draws.map((d) => d.pass)).size;
    const colourPass = Math.max(...draws.map((d) => d.pass));
    const groundDraw = draws.find((d) => d.pass === colourPass && d.count === 6)!;
    const shadowPassDraws = draws.filter((d) => d.pass !== colourPass);
    return { passes, groundReceives: groundDraw.groups.includes(2), shadowPassDraws, scene, sg };
}

describe("r02 directional shadow", () => {
    it("all steps: a shadow pass draws the box, and the ground is drawn with the shadow bind group", async () => {
        const r = await build(null);
        expect(r.passes).toBe(2);
        expect(r.shadowPassDraws.map((d) => d.count)).toEqual([36]);
        expect(r.groundReceives).toBe(true);
    });

    it("without light.shadowGenerator = sg: no shadow pass, ground drawn without shadow", async () => {
        const r = await build("link");
        expect(r.passes).toBe(1);
        expect(r.groundReceives).toBe(false);
    });

    it("with addToScene(scene, sg) instead of the link: no shadow pass, nothing in scene.shadowGenerators", async () => {
        const r = await build("addInsteadOfLink");
        expect(r.passes).toBe(1);
        expect(r.groundReceives).toBe(false);
        expect(r.scene.shadowGenerators).toHaveLength(0);
    });

    it("without setShadowTaskCasterMeshes: no shadow pass at all", async () => {
        const r = await build("casters");
        expect(r.passes).toBe(1);
    });

    it("without receiveShadows: the map is drawn but the ground is drawn without shadow", async () => {
        const r = await build("receive");
        expect(r.passes).toBe(2);
        expect(r.groundReceives).toBe(false);
    });

    it("with receiveShadows set after registration: the ground still draws without shadow", async () => {
        const r = await build("receiveLate");
        expect(r.passes).toBe(2);
        expect(r.groundReceives).toBe(false);
    });

    it("with registerScene instead of registerSceneWithShadowSupport: no shadow pass", async () => {
        const r = await build("shadowRegister");
        expect(r.passes).toBe(1);
    });
});
