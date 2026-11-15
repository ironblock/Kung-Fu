// Shows on the library itself that the expected answer of L4 is so. Not a check of a subject's answer.
// For each option, two generators are made that differ only in that option. Everything they make and
// send to the GPU is recorded: every buffer's bytes and every texture's size and format, the light
// matrix and the shadow camera after two shadow-map updates over the same caster. The option "changes
// something" exactly when the two records differ.
import { bufferFloats, makeGpuScene, updatePcfShadowMap } from "./scene-helpers-l";
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { addToScene, createBox, createDirectionalLight, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { PcfDirectionalShadowGeneratorConfig } from "@babylonjs/lite";

const expected = JSON.parse(readFileSync(new URL("./L4.expected.json", import.meta.url), "utf8")) as Record<string, boolean>;

async function record(cfg: PcfDirectionalShadowGeneratorConfig): Promise<string> {
    const { engine, scene, gpu } = await makeGpuScene();
    const sun = createDirectionalLight([0.3, -1, 0.2]);
    sun.position.set(-6, 20, -4);
    addToScene(scene, sun);
    const caster = createBox(engine, { size: 2 });
    caster.position.set(1, 1, 0);
    const buffersBefore = gpu.buffers.length;
    const texturesBefore = gpu.textures.length;
    const generator = createPcfDirectionalShadowGenerator(engine, sun, cfg);
    sun.shadowGenerator = generator;
    const first = await updatePcfShadowMap(engine, scene, generator, [caster]);
    caster.position.set(2, 1, 0);
    const second = await updatePcfShadowMap(engine, scene, generator, [caster]);
    const camera = (generator as unknown as { _probeState: { _camera: { fov: number; _viewCache: Float32Array; _vpCache: Float32Array } } })._probeState._camera;
    return JSON.stringify({
        buffers: gpu.buffers.slice(buffersBefore).map((b) => Array.from(bufferFloats(b as unknown as GPUBuffer))),
        textures: gpu.textures.slice(texturesBefore).map((t) => [t.width, t.height, t.depthOrArrayLayers, t.format]),
        first,
        second: { near: second.near, far: second.far, lightMatrix: Array.from(second.lightMatrix) },
        camera: { fov: camera.fov, view: Array.from(camera._viewCache), viewProj: Array.from(camera._vpCache) },
        info: [Array.from(generator._shadowsInfo), Array.from(generator._depthValues), generator._config],
    });
}

const changes: Record<string, PcfDirectionalShadowGeneratorConfig[]> = {
    normalBias: [{ normalBias: 0 }, { normalBias: 0.5 }],
    bias: [{}, { bias: 0.01 }],
    darkness: [{}, { darkness: 0.6 }],
    mapSize: [{}, { mapSize: 2048 }],
};

describe("L4: which PCF directional options change anything", () => {
    for (const [name, [a, b]] of Object.entries(changes)) {
        it(`${name}: ${expected[name]}`, async () => {
            const differs = (await record(a!)) !== (await record(b!));
            expect(differs).toBe(expected[name]);
        });
    }
});
