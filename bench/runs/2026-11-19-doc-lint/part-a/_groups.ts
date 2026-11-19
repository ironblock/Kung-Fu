// One glTF group and one property group, for the AnimationGroup field probes. Not a probe itself.
import { createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";
import { data, moveClip } from "./_fx.ts";

export function bothKinds(): { gltf: AnimationGroup; property: AnimationGroup } {
    const gltf = createAnimationGroups(data([moveClip()]).data)[0]!;
    const clip = createPropertyAnimationClip("p", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    const property = createPropertyAnimationGroup(createAnimationManager(), { v: 0 }, clip);
    return { gltf, property };
}
