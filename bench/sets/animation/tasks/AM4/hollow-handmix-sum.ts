import {
    addAnimationGroups,
    addAnimationTask,
    createAnimationManager,
    createAnimationTask,
    createPropertyAnimationGroup,
    enableAnimationBlending,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { AnimationGroup, EngineContext, PropertyAnimationClip } from "@babylonjs/lite";

/** Skeletal blending on the manager. The HUD is mixed by a task after the manager has played the
 *  frame: each property gets the sum of weight times sampled value, the way the library's mixer sums. */
export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[]
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void } {
    const manager = createAnimationManager({ engine });
    addAnimationGroups(manager, character);
    enableAnimationBlending(manager);
    const hudGroups = hudClips.map((clip) => createPropertyAnimationGroup(manager, hud, clip, { loop: true }));

    const sample = (clip: PropertyAnimationClip, trackIndex: number, time: number): number => {
        const { input, output } = clip.tracks[trackIndex]!.sampler;
        if (time <= input[0]!) return output[0]!;
        for (let i = 1; i < input.length; i++) {
            if (time <= input[i]!) {
                const t = (time - input[i - 1]!) / (input[i]! - input[i - 1]!);
                return output[i - 1]! + (output[i]! - output[i - 1]!) * t;
            }
        }
        return output[output.length - 1]!;
    };

    addAnimationTask(
        manager,
        createAnimationTask(() => {
            if (hudGroups.every((group) => group.weight === 1)) return;
            const sums = new Map<string, number>();
            hudGroups.forEach((group, i) => {
                hudClips[i]!.tracks.forEach((track, trackIndex) => {
                    sums.set(track.path, (sums.get(track.path) ?? 0) + group.weight * sample(hudClips[i]!, trackIndex, group.currentTime));
                });
            });
            for (const [path, value] of sums) {
                (hud as Record<string, number>)[path] = value;
            }
        })
    );
    return { hudGroups, step: (deltaMs) => updateAnimationManager(manager, deltaMs) };
}
