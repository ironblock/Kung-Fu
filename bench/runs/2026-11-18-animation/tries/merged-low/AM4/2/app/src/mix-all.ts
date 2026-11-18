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
    const characterManager = createAnimationManager({ engine });
    enableAnimationBlending(characterManager);
    addAnimationGroups(characterManager, character);

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
