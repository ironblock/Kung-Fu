import { goToFrame } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

/**
 * Jump a playing clip to `frame` (in the clip's own frame rate) and keep it playing.
 *
 * `goToFrame` seeks and applies the pose, but it also pauses the group. Playback
 * state is re-synced from the group on every tick, so restoring `isPlaying`
 * afterwards is enough for the next frames to carry on from `frame`. Speed and
 * looping are left untouched and are read from the group on each tick.
 */
export function jumpToFrame(group: AnimationGroup, frame: number): void {
    const wasPlaying = group.isPlaying;
    // Manager-driven groups need the manager's engine for the weighted glTF path.
    goToFrame(group, frame, group._animationManager?.engine);
    group.isPlaying = wasPlaying;
}
