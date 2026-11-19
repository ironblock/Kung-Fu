import type { EngineContext, AnimationGroup, PropertyAnimationClip } from "@babylonjs/lite";
import {
    createAnimationManager,
    enableAnimationBlending,
    enablePropertyAnimationBlending,
    updateAnimationManager,
    addAnimationGroups,
    createPropertyAnimationGroup,
} from "@babylonjs/lite";

export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[],
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void } {
    const charManager = createAnimationManager({ engine });
    enableAnimationBlending(charManager);
    addAnimationGroups(charManager, character);

    const hudManager = createAnimationManager({ engine });
    enablePropertyAnimationBlending(hudManager);

    const hudGroups: AnimationGroup[] = hudClips.map(
        (clip) => createPropertyAnimationGroup(hudManager, hud, clip, { loop: true }),
    );

    function step(deltaMs: number): void {
        updateAnimationManager(charManager, deltaMs);
        updateAnimationManager(hudManager, deltaMs);
    }

    return { hudGroups, step };
}
