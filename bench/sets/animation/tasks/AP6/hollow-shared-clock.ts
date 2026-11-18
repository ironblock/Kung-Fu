import { addAnimationTask, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// One clock per manager; each track seeks its group to the clock's time, wrapped to its keyed span.
const clocks = new WeakMap<AnimationManager, { seconds: number }>();

export function loopKeyedTrack(manager: AnimationManager, target: object, path: string, keys: readonly { frame: number; value: number }[], frameRate: number): AnimationGroup {
    let clock = clocks.get(manager);
    if (!clock) {
        const c = { seconds: 0 };
        clock = c;
        clocks.set(manager, c);
        addAnimationTask(manager, createAnimationTask((_m, deltaMs) => { c.seconds += deltaMs / 1000; }));
    }
    const c = clock;
    const first = keys[0]!.frame;
    const last = keys[keys.length - 1]!.frame;
    const clip = createPropertyAnimationClip("timeline-track", [{ path, frameRate, keys: keys.map((k) => ({ frame: k.frame, value: k.value })) }]);
    const group = createPropertyAnimationGroup(manager, target, clip, { loop: true, fromFrame: first, toFrame: last });
    const span = (last - first) / frameRate;
    addAnimationTask(manager, createAnimationTask(() => {
        goToFrame(group, first + (c.seconds % span) * frameRate);
    }));
    return group;
}
