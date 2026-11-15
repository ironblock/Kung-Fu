// n22: light include/exclude precedence.
import { makeGpuEngine } from "./scene-helpers";
import { createBox, createPointLight } from "@babylonjs/lite";
import { lightAffectsMesh } from "../../babylon-lite/packages/babylon-lite/src/render/mesh-light-selection";
import { describe, expect, it } from "vitest";

function meshes() {
    const { engine } = makeGpuEngine();
    const a = createBox(engine);
    a.id = "a";
    const b = createBox(engine);
    b.id = "b";
    const anon = createBox(engine);
    return { a, b, anon };
}

describe("n22 light filters", () => {
    it("non-empty includedOnlyMeshes: only those meshes, minus excludedMeshes; ID sets ignored", () => {
        const { a, b, anon } = meshes();
        const light = createPointLight([0, 0, 0]);
        light.includedOnlyMeshes = new Set([a, b]);
        light.excludedMeshes = new Set([b]);
        light.excludedMeshIds = new Set(["a"]);
        light.includedOnlyMeshIds = new Set(["b"]);
        expect([lightAffectsMesh(light, a), lightAffectsMesh(light, b), lightAffectsMesh(light, anon)]).toEqual([true, false, false]);
    });

    it("includedOnlyMeshIds overrides excludedMeshIds, and a mesh with no id is not lit", () => {
        const { a, b, anon } = meshes();
        const light = createPointLight([0, 0, 0]);
        light.includedOnlyMeshIds = new Set(["a"]);
        light.excludedMeshIds = new Set(["a"]);
        expect([lightAffectsMesh(light, a), lightAffectsMesh(light, b), lightAffectsMesh(light, anon)]).toEqual([true, false, false]);
    });

    it("excludedMeshes wins over includedOnlyMeshIds", () => {
        const { a } = meshes();
        const light = createPointLight([0, 0, 0]);
        light.includedOnlyMeshIds = new Set(["a"]);
        light.excludedMeshes = new Set([a]);
        expect(lightAffectsMesh(light, a)).toBe(false);
    });

    it("with only excludedMeshIds, a mesh without id is lit", () => {
        const { a, anon } = meshes();
        const light = createPointLight([0, 0, 0]);
        light.excludedMeshIds = new Set(["a"]);
        expect([lightAffectsMesh(light, a), lightAffectsMesh(light, anon)]).toEqual([false, true]);
    });
});
