// Shared fixtures for the part-c compat-package probes. Not a probe itself.
// A headless compat scene (NullEngine) is driven one frame at a time by scene._tick(ms), the frame step its
// NullEngine render loop and Lite's before-render hook both call.
import { getAnimationGroups } from "@babylonjs/lite";
import type { AnimationGroup as LiteGroup, AnimationManager } from "@babylonjs/lite";
import { NullEngine } from "#compat/engine/engine.ts";
import { Scene } from "#compat/scene/scene.ts";
import { Animation, AnimationLoopModes, AnimationTypes } from "#compat/animations/animation.ts";
import type { IAnimationKey } from "#compat/animations/animation.ts";

export { Animation, AnimationLoopModes, AnimationTypes };
export { Animatable, AnimationGroup, AnimationKeyInterpolation } from "#compat/animations/animation.ts";
export { Vector3 } from "#compat/math/vector.ts";

export function makeScene(): Scene {
    return new Scene(new NullEngine());
}

export function frame(scene: Scene, ms: number): void {
    scene._tick(ms);
}

/** The scene's own Lite manager for delegated property groups (created on first delegated call). */
export function liteManager(scene: Scene): AnimationManager | undefined {
    return (scene as unknown as { _propertyAnimationManager?: AnimationManager | null })._propertyAnimationManager ?? undefined;
}

/** The Lite groups the scene's manager is driving now. */
export function attached(scene: Scene): readonly LiteGroup[] {
    const m = liteManager(scene);
    return m ? getAnimationGroups(m) : [];
}

/** A float animation on `path`, 10 fps by default, keys given. */
export function anim(path: string, keys: IAnimationKey[], fps = 10, type: number = AnimationTypes.ANIMATIONTYPE_FLOAT, loop: number = AnimationLoopModes.ANIMATIONLOOPMODE_CYCLE): Animation {
    const a = new Animation(path, path, fps, type, loop);
    a.setKeys(keys);
    return a;
}

/** A 0-to-10 float animation over frames 0..10 at 10 fps. */
export function ramp(path = "v", to = 10, fps = 10): Animation {
    return anim(path, [
        { frame: 0, value: 0 },
        { frame: 10, value: to },
    ], fps);
}

export const square = { ease: (g: number) => g * g };
