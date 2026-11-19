import type { EngineContext, AnimationGroup, PropertyAnimationClip } from "@babylonjs/lite";
import {
    createAnimationManager,
    addAnimationGroups,
    createPropertyAnimationGroup,
    enableAnimationBlending,
    enablePropertyAnimationBlending,
    updateAnimationManager,
} from "@babylonjs/lite";

export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[],
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void } {
    const manager = createAnimationManager({ engine });

    // Register the character's glTF groups (already playing) with the manager.
    addAnimationGroups(manager, character);

    // Create a looping property-animation group for each HUD clip, in order.
    const hudGroups: AnimationGroup[] = hudClips.map((clip) =>
        createPropertyAnimationGroup(manager, hud, clip, { loop: true })
    );

    // Enable the library's weighted mixers so that whenever any group's weight
    // drops below 1 the result is the library's own weighted blend—on the
    // character's skeleton bones and on the HUD's property tracks alike.
    enableAnimationBlending(manager);
    enablePropertyAnimationBlending(manager);

    return {
        hudGroups,
        step(deltaMs: number): void {
            updateAnimationManager(manager, deltaMs);
        },
    };
}
