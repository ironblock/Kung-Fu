import {
    addAnimationGroups,
    createAnimationManager,
    createPropertyAnimationGroup,
    enableAnimationBlending,
    enablePropertyAnimationBlending,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { AnimationGroup, EngineContext, PropertyAnimationClip } from "@babylonjs/lite";

/** A manager holds one blend handler: switching on one kind of blending switches the other off,
 *  and the skeletal mixer does not weigh property clips. So each kind gets its own manager. */
export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[]
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void } {
    const characterManager = createAnimationManager({ engine });
    addAnimationGroups(characterManager, character);
    enableAnimationBlending(characterManager);

    const hudManager = createAnimationManager({ engine });
    const hudGroups = hudClips.map((clip) => createPropertyAnimationGroup(hudManager, hud, clip, { loop: true }));
    enablePropertyAnimationBlending(hudManager);

    return {
        hudGroups,
        step(deltaMs: number): void {
            updateAnimationManager(characterManager, deltaMs);
            updateAnimationManager(hudManager, deltaMs);
        },
    };
}
