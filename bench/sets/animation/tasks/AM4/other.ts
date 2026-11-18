import {
    addAnimationGroup,
    addAnimationTask,
    createAnimationManager,
    createAnimationTask,
    createPropertyAnimationGroup,
    enableAnimationBlending,
    enablePropertyAnimationBlending,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager, EngineContext, PropertyAnimationClip } from "@babylonjs/lite";

/** One outer manager whose two tasks drive an inner manager per kind of blending. */
export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[]
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void } {
    const hudManager = createAnimationManager();
    enablePropertyAnimationBlending(hudManager);
    const hudGroups: AnimationGroup[] = [];
    for (const clip of hudClips) {
        hudGroups.push(createPropertyAnimationGroup(hudManager, hud, clip, { loop: true }));
    }

    const skinManager = createAnimationManager({ engine });
    enableAnimationBlending(skinManager);
    for (const group of character) {
        addAnimationGroup(skinManager, group);
    }

    const outer = createAnimationManager();
    const drive = (inner: AnimationManager) => createAnimationTask((_outer, deltaMs) => updateAnimationManager(inner, deltaMs));
    addAnimationTask(outer, drive(hudManager));
    addAnimationTask(outer, drive(skinManager));

    return { hudGroups, step: (deltaMs) => updateAnimationManager(outer, deltaMs) };
}
