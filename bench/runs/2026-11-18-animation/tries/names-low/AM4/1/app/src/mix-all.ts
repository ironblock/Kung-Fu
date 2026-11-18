import type { EngineContext } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";
import type { PropertyAnimationClip } from "@babylonjs/lite";
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

    enableAnimationBlending(manager);
    enablePropertyAnimationBlending(manager);

    addAnimationGroups(manager, character);

    const hudGroups: AnimationGroup[] = hudClips.map((clip) =>
        createPropertyAnimationGroup(manager, hud, clip, { loop: true }),
    );

    return {
        hudGroups,
        step(deltaMs: number): void {
            updateAnimationManager(manager, deltaMs);
        },
    };
}
