import { playAnimation, stopAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

/**
 * Replay a finished one-shot clip from its first frame.
 *
 * Works for both property clips (driven by an AnimationManager) and glTF clips
 * (driven by the scene's render loop). When either kind reaches its end it
 * stops itself (`_stopped = true`, `isPlaying = false`) and its ticker skips it.
 * `stopAnimation` rewinds to the authored first frame (`_startTime ?? 0`, which
 * also covers a property clip's fromFrame/fromTime), and `playAnimation` clears
 * the stopped flag and starts playback. `speedRatio` and `loopAnimation` are
 * left untouched, so the clip replays at its own speed and runs to its end again.
 */
export function playAgain(group: AnimationGroup): void {
    stopAnimation(group);
    playAnimation(group);
}
