// c-39. Line 595: "`device.queue.writeBuffer()` for morph weight upload"
// Checked: a playing glTF group with a morph-weights channel writes the sampled weights with device.queue.writeBuffer
// into the binding's weights buffer.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import type { EngineContext } from "@babylonjs/lite";
import { gltf, morphBinding, rest } from "./_fx";

test("morph weights are uploaded with writeBuffer", () => {
    const writes: { buffer: unknown; data: number[] }[] = [];
    const engine = {
        _device: {
            queue: {
                writeTexture: () => {},
                writeBuffer: (buffer: unknown, _offset: number, data: ArrayBuffer, dataOffset: number, size: number) => writes.push({ buffer, data: Array.from(new Float32Array(data, dataOffset, size / 4)) }),
            },
        },
    } as unknown as EngineContext;
    const mb = morphBinding(0, 2);
    const clip = { name: "w", duration: 1, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 3 as const }], samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 1, 1, 0]), interpolation: 0 as const }] };
    const [group] = createAnimationGroups(gltf([clip], [rest()], { morphBindings: [mb] }));
    const manager = createAnimationManager({ engine });
    addAnimationGroup(manager, group!);
    updateAnimationManager(manager, 250);
    expect(writes.length).toBe(1);
    expect(writes[0]!.buffer).toBe(mb.weightsBuffer);
    expect(writes[0]!.data[0]).toBeCloseTo(0.25, 6);
    expect(writes[0]!.data[1]).toBeCloseTo(0.75, 6);
});
