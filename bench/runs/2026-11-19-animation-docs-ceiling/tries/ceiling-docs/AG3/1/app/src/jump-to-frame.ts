import { goToFrame } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

/**
 * Jump a playing group to `frame` (in the group's own frame rate) and keep it
 * playing from there, at its own speedRatio and with its own loop setting.
 *
 * goToFrame() converts the frame with the group's frameRate, evaluates the
 * pose where it can, and then pauses the group. We let it do the seek, then
 * restore the play state it changed. speedRatio and loopAnimation are never
 * touched, so they carry on as before. The next tick (scene render loop for
 * glTF clips, manager update for property clips) advances from the new time.
 */
export function jumpToFrame(group: AnimationGroup, frame: number): void {
    const wasPlaying = group.isPlaying;
    const wasStopped = group._stopped;

    goToFrame(group, frame);

    group.isPlaying = wasPlaying;
    group._stopped = wasStopped;
}
