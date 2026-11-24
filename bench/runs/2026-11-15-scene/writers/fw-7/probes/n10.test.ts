import { attachDevice } from "./scene-helpers";
import { createBox, createGround, createNullEngine, createPointLight, createSphere } from "@babylonjs/lite";
import { lightAffectsMesh } from "../../babylon-lite/packages/babylon-lite/src/render/mesh-light-selection.ts";
import { describe, expect, it } from "vitest";

describe("n10: factory meshes have no id, so the ID filter sets treat them specially", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("mesh.id is undefined and name is the shape", () => {
        const box = createBox(engine);
        expect(box.id).toBeUndefined();
        expect(box.name).toBe("box");
    });

    it("excludedMeshIds cannot exclude a mesh without id, even when it holds the mesh's name", () => {
        const light = createPointLight([0, 0, 0]);
        const box = createBox(engine);
        light.excludedMeshIds = new Set(["box", "", "undefined"]);
        expect(lightAffectsMesh(light, box)).toBe(true);
    });

    it("a non-empty includedOnlyMeshIds leaves meshes without id unlit", () => {
        const light = createPointLight([0, 0, 0]);
        const sphere = createSphere(engine);
        const ground = createGround(engine);
        ground.id = "g";
        light.includedOnlyMeshIds = new Set(["g", "sphere"]);
        expect(lightAffectsMesh(light, sphere)).toBe(false);
        expect(lightAffectsMesh(light, ground)).toBe(true);
    });

    it("a non-empty includedOnlyMeshes takes over: an id-less mesh in it is lit even with a non-empty includedOnlyMeshIds", () => {
        const light = createPointLight([0, 0, 0]);
        const box = createBox(engine);
        light.includedOnlyMeshIds = new Set(["g"]);
        light.includedOnlyMeshes = new Set([box]);
        expect(lightAffectsMesh(light, box)).toBe(true);
    });
});
