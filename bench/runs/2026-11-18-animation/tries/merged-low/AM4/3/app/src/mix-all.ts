import {
    createAnimationManager,
    addAnimationGroups,
    createPropertyAnimationGroup,
    enableAnimationBlending,
    enablePropertyAnimationBlending,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { EngineContext, AnimationGroup, PropertyAnimationClip } from "@babylonjs/lite";

export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[],
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void } {
    const charManager = createAnimationManager({ engine });
    addAnimationGroups(charManager, character);
    enableAnimationBlending(charManager);

    const hudManager = createAnimationManager({ engine });
    const hudGroups: AnimationGroup[] = [];
    for (const clip of hudClips) {
        hudGroups.push(createPropertyAnimationGroup(hudManager, hud, clip, { loop: true }));
    }
    enablePropertyAnimationBlending(hudManager);

    function step(deltaMs: number): void {
        updateAnimationManager(charManager, deltaMs);
        updateAnimationManager(hudManager, deltaMs);
    }

    return { hudGroups, step };
}
