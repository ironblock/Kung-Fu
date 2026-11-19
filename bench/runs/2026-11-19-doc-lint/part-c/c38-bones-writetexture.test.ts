// c-38. Line 594: "`device.queue.writeTexture()` for bone matrix upload (via `skeleton-updater.ts`)"
// Checked: a playing glTF group on a skinned node, driven by a manager with an engine stand-in, writes its bone
// matrices with device.queue.writeTexture into the skeleton's bone texture, and the data written is the bone matrices.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import type { EngineContext } from "@babylonjs/lite";
import { gltf, moveClip, rest, skeleton } from "./_fx";

test("bones are uploaded with writeTexture", () => {
    const writes: { texture: unknown; data: Float32Array }[] = [];
    const engine = { _device: { queue: { writeTexture: (d: { texture: unknown }, data: ArrayBuffer) => writes.push({ texture: d.texture, data: new Float32Array(data.slice(0)) }), writeBuffer: () => {} } } } as unknown as EngineContext;
    const skel = skeleton(0);
    const [group] = createAnimationGroups(gltf([moveClip("m", 0, 10)], [rest()], { skeletons: [skel] }));
    const manager = createAnimationManager({ engine });
    addAnimationGroup(manager, group!);
    updateAnimationManager(manager, 500);
    expect(writes.length).toBe(1);
    expect(writes[0]!.texture).toBe(skel.boneTexture);
    expect(Array.from(writes[0]!.data)).toEqual(Array.from(skel.boneMatrices));
    expect(skel.boneMatrices[12]).toBeCloseTo(-5, 5);
});
