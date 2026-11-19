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

    addAnimationGroups(manager, character);

    const hudGroups: AnimationGroup[] = hudClips.map((clip) =>
        createPropertyAnimationGroup(manager, hud, clip, { loop: true }),
    );

    enableAnimationBlending(manager);
    enablePropertyAnimationBlending(manager);

    return {
        hudGroups,
        step(deltaMs: number): void {
            updateAnimationManager(manager, deltaMs);
        },
    };
}
