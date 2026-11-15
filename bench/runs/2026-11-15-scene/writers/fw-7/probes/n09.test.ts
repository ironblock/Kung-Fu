import { attachDevice } from "./scene-helpers";
import { createBox, createNullEngine, createPointLight } from "@babylonjs/lite";
import { lightAffectsMesh } from "../../babylon-lite/packages/babylon-lite/src/render/mesh-light-selection.ts";
import { describe, expect, it } from "vitest";

describe("n09: object filter sets subtract; ID filter sets let includedOnlyMeshIds win", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("a mesh in both includedOnlyMeshes and excludedMeshes is not lit", () => {
        const light = createPointLight([0, 0, 0]);
        const a = createBox(engine);
        const b = createBox(engine);
        light.includedOnlyMeshes = new Set([a, b]);
        light.excludedMeshes = new Set([a]);
        expect(lightAffectsMesh(light, a)).toBe(false);
        expect(lightAffectsMesh(light, b)).toBe(true);
    });

    it("a mesh id in both includedOnlyMeshIds and excludedMeshIds is lit", () => {
        const light = createPointLight([0, 0, 0]);
        const a = createBox(engine);
        a.id = "a";
        light.includedOnlyMeshIds = new Set(["a"]);
        light.excludedMeshIds = new Set(["a"]);
        expect(lightAffectsMesh(light, a)).toBe(true);
    });

    it("a non-empty includedOnlyMeshes makes the ID sets irrelevant", () => {
        const light = createPointLight([0, 0, 0]);
        const a = createBox(engine);
        a.id = "a";
        light.includedOnlyMeshes = new Set([a]);
        light.excludedMeshIds = new Set(["a"]);
        expect(lightAffectsMesh(light, a)).toBe(true);
    });

    it("excludedMeshes still applies when only ID inclusion is set", () => {
        const light = createPointLight([0, 0, 0]);
        const a = createBox(engine);
        a.id = "a";
        light.includedOnlyMeshIds = new Set(["a"]);
        light.excludedMeshes = new Set([a]);
        expect(lightAffectsMesh(light, a)).toBe(false);
    });
});
