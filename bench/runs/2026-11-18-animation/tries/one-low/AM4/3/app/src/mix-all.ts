import type { EngineContext, AnimationGroup, PropertyAnimationClip } from "@babylonjs/lite";
import {
    createAnimationManager,
    enableAnimationBlending,
    enablePropertyAnimationBlending,
    addAnimationGroups,
    createPropertyAnimationGroup,
    updateAnimationManager,
} from "@babylonjs/lite";

export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[],
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void } {
    const characterManager = createAnimationManager({ engine });
    enableAnimationBlending(characterManager);
    if (character.length > 0) {
        addAnimationGroups(characterManager, character);
    }

    const hudManager = createAnimationManager();
    enablePropertyAnimationBlending(hudManager);
    const hudGroups: AnimationGroup[] = hudClips.map((clip) =>
        createPropertyAnimationGroup(hudManager, hud, clip, { loop: true }),
    );

    function step(deltaMs: number): void {
        updateAnimationManager(characterManager, deltaMs);
        updateAnimationManager(hudManager, deltaMs);
    }

    return { hudGroups, step };
}
