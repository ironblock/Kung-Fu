import type { AnimationGroup } from "@babylonjs/lite";
import { goToFrame, pauseAnimation } from "@babylonjs/lite";

/**
 * Jump a playing clip to its final pose and hold it there, paused.
 */
export function skipToEnd(group: AnimationGroup): void {
    // A looping group wraps goToFrame's time (end -> 0), so turn looping off
    // first; then goToFrame clamps to the clip's end.
    group.loopAnimation = false;

    const frameRate = group.frameRate ?? 60;
    // Pass the owning manager's engine if there is one, so skinned/morphed
    // glTF groups can apply the pose immediately.
    const engine = group._animationManager?.engine;
    goToFrame(group, group.duration * frameRate, engine);

    // goToFrame already pauses; make it explicit and make currentTime exactly
    // the duration (frame/frameRate division can be off by float rounding).
    pauseAnimation(group);
    group.currentTime = group.duration;
}
