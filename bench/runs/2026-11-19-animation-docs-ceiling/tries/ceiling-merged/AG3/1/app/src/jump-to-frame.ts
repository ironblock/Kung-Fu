import { goToFrame, playAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

/**
 * Jump a playing group to `frame` (in the clip's own frame rate) and keep it
 * playing from there, at its current speedRatio and loop setting.
 *
 * goToFrame converts the frame to seconds using the group's frame rate (60 if
 * none), moves currentTime, writes the pose, and pauses the group. We then call
 * playAnimation to resume from the new currentTime. goToFrame leaves
 * loopAnimation and speedRatio untouched, so those carry over.
 */
export function jumpToFrame(group: AnimationGroup, frame: number): void {
    // Property groups are owned by a manager (which may have an engine); glTF
    // groups played by the scene have no owner, so the engine stays undefined.
    const engine = group._animationManager?.engine;
    goToFrame(group, frame, engine);
    playAnimation(group);
}
