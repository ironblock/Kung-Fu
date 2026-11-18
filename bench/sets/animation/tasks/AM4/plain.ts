import {
    addAnimationGroups,
    createAnimationManager,
    createPropertyAnimationGroup,
    enableAnimationBlending,
    enablePropertyAnimationBlending,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { AnimationGroup, EngineContext, PropertyAnimationClip } from "@babylonjs/lite";

/** One manager for everything, with both kinds of blending switched on. */
export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[]
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void } {
    const manager = createAnimationManager({ engine });
    addAnimationGroups(manager, character);
    const hudGroups = hudClips.map((clip) => createPropertyAnimationGroup(manager, hud, clip, { loop: true }));
    enableAnimationBlending(manager);
    enablePropertyAnimationBlending(manager);
    return { hudGroups, step: (deltaMs) => updateAnimationManager(manager, deltaMs) };
}
