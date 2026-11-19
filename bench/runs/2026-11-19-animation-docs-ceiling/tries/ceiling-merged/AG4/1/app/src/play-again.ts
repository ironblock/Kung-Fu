import { playAnimation, stopAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

/**
 * Replays a one-shot clip that has run to its end, from its first frame.
 *
 * Works for both kinds of group:
 * - property groups (isPlaying is false at the end): playAnimation alone would
 *   leave currentTime at the end, so the next update would just end it again.
 * - glTF groups (isPlaying stays true at the end): playAnimation alone would
 *   change nothing.
 *
 * stopAnimation rewinds currentTime to the start and marks the group stopped;
 * playAnimation then clears the stop. speedRatio and loopAnimation are left
 * alone, so the clip replays at its own speed and runs to its end once more.
 */
export function playAgain(group: AnimationGroup): void {
    stopAnimation(group);
    playAnimation(group);
}
