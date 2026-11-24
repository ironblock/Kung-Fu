import {
    addAnimationGroups,
    createAnimationManager,
    createPropertyAnimationGroup,
    enableAnimationBlending,
    enablePropertyAnimationBlending,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { AnimationGroup, EngineContext, PropertyAnimationClip } from "@babylonjs/lite";

/** One manager, both kinds switched on, the skeletal one last. */
export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[]
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void } {
    const manager = createAnimationManager({ engine });
    addAnimationGroups(manager, character);
    const hudGroups = hudClips.map((clip) => createPropertyAnimationGroup(manager, hud, clip, { loop: true }));
    enablePropertyAnimationBlending(manager);
    enableAnimationBlending(manager);
    return { hudGroups, step: (deltaMs) => updateAnimationManager(manager, deltaMs) };
}
