// A glTF group on two nodes, "root" (rest x 20) and "arm" (rest x 7), each moved by the clip. Not a probe itself.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";
import { data, moveClip, rest } from "./_fx.ts";
import type { Recorder } from "./_fx.ts";

export function twoNodes(): { group: AnimationGroup; root: Recorder; arm: Recorder; step(ms: number): void } {
    const { data: d, targets } = data([moveClip()], { nodes: [rest(-1, 20), rest(-1, 7)] });
    const group = createAnimationGroups(d)[0]!;
    const manager = createAnimationManager();
    addAnimationGroup(manager, group);
    return { group, root: targets[0]!, arm: targets[1]!, step: (ms) => updateAnimationManager(manager, ms) };
}
