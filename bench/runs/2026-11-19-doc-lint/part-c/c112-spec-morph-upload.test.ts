// c-112. Line 742: "**Morph weight upload**: Verify correct weights written to GPU buffer for PATH_WEIGHTS channels"
// Checked: a glTF weights channel (path 3) with three targets, at 0.5 s between (0, 1, 0) and (1, 0, 0.5): the buffer
// write holds (0.5, 0.5, 0.25), written after the buffer's 16-byte header, and the binding's CPU weights match.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import type { EngineContext } from "@babylonjs/lite";
import { gltf, morphBinding, rest } from "./_fx";

test("morph weights written", () => {
    const writes: { offset: number; data: number[] }[] = [];
    const engine = { _device: { queue: { writeTexture: () => {}, writeBuffer: (_b: unknown, offset: number, data: ArrayBuffer, at: number, size: number) => writes.push({ offset, data: Array.from(new Float32Array(data, at, size / 4)) }) } } } as unknown as EngineContext;
    const mb = morphBinding(0, 3);
    const clip = { name: "w", duration: 1, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 3 as const }], samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 1, 0, 1, 0, 0.5]), interpolation: 0 as const }] };
    const [g] = createAnimationGroups(gltf([clip], [rest()], { morphBindings: [mb] }));
    const manager = createAnimationManager({ engine });
    addAnimationGroup(manager, g!);
    updateAnimationManager(manager, 500);
    expect(writes).toEqual([{ offset: 16, data: [0.5, 0.5, 0.25] }]);
    expect(Array.from(mb.weights)).toEqual([0.5, 0.5, 0.25]);
});
