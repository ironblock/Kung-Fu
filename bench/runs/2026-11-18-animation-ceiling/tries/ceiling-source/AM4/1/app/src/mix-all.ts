import {
    addAnimationGroups,
    createAnimationManager,
    createPropertyAnimationGroup,
    enableAnimationBlending,
    enablePropertyAnimationBlending,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { AnimationGroup, EngineContext, PropertyAnimationClip } from "@babylonjs/lite";

/**
 * Drives the character's glTF clips and the HUD's property clips together.
 *
 * Each animation manager has a single category-handler slot, and the skeletal mixer
 * (enableAnimationBlending) and the property mixer (enablePropertyAnimationBlending)
 * each claim that slot, so one manager cannot run both. The character and the HUD
 * touch disjoint targets, so each gets its own manager with the matching mixer. Weights
 * set with setAnimationWeight are then blended by the library on both.
 */
export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[],
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void } {
    const characterManager = createAnimationManager({ engine });
    enableAnimationBlending(characterManager);
    addAnimationGroups(characterManager, character);

    const hudManager = createAnimationManager({ engine });
    enablePropertyAnimationBlending(hudManager);
    const hudGroups = hudClips.map((clip) => createPropertyAnimationGroup(hudManager, hud, clip, { loop: true }));

    return {
        hudGroups,
        step(deltaMs: number): void {
            updateAnimationManager(characterManager, deltaMs);
            updateAnimationManager(hudManager, deltaMs);
        },
    };
}
