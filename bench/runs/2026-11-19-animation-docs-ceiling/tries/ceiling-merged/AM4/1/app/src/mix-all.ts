import {
    addAnimationGroups,
    createAnimationManager,
    createPropertyAnimationGroup,
    enableAnimationBlending,
    enablePropertyAnimationBlending,
    updateAnimationManager,
} from "@babylonjs/lite";
import type {
    AnimationGroup,
    EngineContext,
    PropertyAnimationClip,
} from "@babylonjs/lite";

/**
 * Mixes the character's glTF clips and the HUD's property clips.
 *
 * A manager has a single blending slot: enableAnimationBlending (glTF/skeleton
 * mixing) and enablePropertyAnimationBlending (property mixing) replace each
 * other, so the two kinds of group live on two separate managers. Each manager
 * is stepped by `step`, never started on its own.
 */
export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[],
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void } {
    // The engine is required for weighted glTF groups (skeleton bones).
    const characterManager = createAnimationManager({ engine });
    enableAnimationBlending(characterManager);
    addAnimationGroups(characterManager, character);

    const hudManager = createAnimationManager({ engine });
    enablePropertyAnimationBlending(hudManager);
    const hudGroups = hudClips.map((clip) =>
        createPropertyAnimationGroup(hudManager, hud, clip, { loop: true }),
    );

    return {
        hudGroups,
        step(deltaMs: number): void {
            updateAnimationManager(characterManager, deltaMs);
            updateAnimationManager(hudManager, deltaMs);
        },
    };
}
