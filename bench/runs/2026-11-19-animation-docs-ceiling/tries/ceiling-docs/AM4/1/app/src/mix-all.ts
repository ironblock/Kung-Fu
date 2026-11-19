import {
    addAnimationGroups,
    createAnimationManager,
    createPropertyAnimationGroup,
    enableAnimationBlending,
    enablePropertyAnimationBlending,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { AnimationGroup, EngineContext, PropertyAnimationClip } from "@babylonjs/lite";

export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[],
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void } {
    // One manager owns both sets, so weights are mixed in one place.
    // The engine is needed for the skeleton/bone texture uploads.
    const manager = createAnimationManager({ engine });

    addAnimationGroups(manager, character);

    // createPropertyAnimationGroup registers the group on the manager itself.
    const hudGroups = hudClips.map((clip) => createPropertyAnimationGroup(manager, hud, clip, { loop: true }));

    // Both mixers are opt-in: property blending for the HUD, glTF blending for the bones.
    enablePropertyAnimationBlending(manager);
    enableAnimationBlending(manager);

    return {
        hudGroups,
        step(deltaMs: number): void {
            updateAnimationManager(manager, deltaMs);
        },
    };
}
