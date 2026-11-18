import { stopAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// Writes the last key of each translation track by hand, then stops the clip so nothing rewrites it.
export function skipToEnd(group: AnimationGroup): void {
    const clip = group._gltfMixer?.[0];
    stopAnimation(group);
    group.currentTime = group.duration;
    if (!clip) return;
    for (const ch of clip.channels) {
        if (ch.path !== 0) continue;
        const s = clip.samplers[ch.samplerIdx]!;
        const n = s.input.length;
        const t = group.targetedAnimations.find((a) => a.nodeIndex === ch.nodeIdx)?.target as { position: { set(x: number, y: number, z: number): void } } | undefined;
        t?.position.set(s.output[(n - 1) * 3]!, s.output[(n - 1) * 3 + 1]!, s.output[(n - 1) * 3 + 2]!);
    }
}
