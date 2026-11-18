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

/** Skeletal blending on one manager, and a hand-made weighted average for the HUD, written by a
 *  task after the manager has played the frame. */
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
            const paths = hudClips[0]!.tracks.map((track) => track.path);
            paths.forEach((path, trackIndex) => {
                let sum = 0;
                let total = 0;
                hudGroups.forEach((group, i) => {
                    sum += group.weight * sample(hudClips[i]!, trackIndex, group.currentTime);
                    total += group.weight;
                });
                (hud as Record<string, number>)[path] = total > 0 ? sum / total : 0;
            });
        })
    );
    return { hudGroups, step: (deltaMs) => updateAnimationManager(manager, deltaMs) };
}
