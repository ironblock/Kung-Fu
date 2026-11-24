import { addAnimationGroups, createAnimationManager, createPropertyAnimationGroup, enableAnimationBlending, updateAnimationManager } from "@babylonjs/lite";
import type { AnimationGroup, EngineContext, PropertyAnimationClip } from "@babylonjs/lite";

/** One manager with the general blending switch, taken to cover every clip on it. */
export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[]
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void } {
    const manager = createAnimationManager({ engine });
    enableAnimationBlending(manager);
    addAnimationGroups(manager, character);
    const hudGroups = hudClips.map((clip) => createPropertyAnimationGroup(manager, hud, clip, { loop: true }));
    return { hudGroups, step: (deltaMs) => updateAnimationManager(manager, deltaMs) };
}
