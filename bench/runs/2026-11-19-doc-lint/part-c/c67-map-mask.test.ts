// c-67. Line 639 (map row): `AnimationGroup.mask = new AnimationGroupMask(names, mode)` corresponds to
// `group.mask = createAnimationGroupMask(names, mode)`.
// Checked: assigning a mask made this way (Exclude ["arm"]) keeps the named node at rest while the other node moves.
import { addAnimationGroup, AnimationGroupMaskMode, createAnimationGroupMask, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import type { ClipSpec } from "./_fx";
import { gltf, moveSampler, nodeRecorder, rest } from "./_fx";

test("group.mask = createAnimationGroupMask(names, mode)", () => {
    const hip = nodeRecorder();
    const arm = nodeRecorder();
    const clip: ClipSpec = { name: "c", duration: 1, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }, { samplerIdx: 0, nodeIdx: 1, path: 0 }], samplers: [moveSampler(0, 10)] };
    const [g] = createAnimationGroups(gltf([clip], [rest(), rest()], { targets: [hip, arm], names: ["hip", "arm"] }));
    g!.mask = createAnimationGroupMask(["arm"], AnimationGroupMaskMode.Exclude);
    const manager = createAnimationManager();
    addAnimationGroup(manager, g!);
    updateAnimationManager(manager, 500);
    expect(hip.p[0]).toBeCloseTo(5, 5);
    expect(arm.p[0] ?? 0).toBe(0);
});
