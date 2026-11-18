import { goToFrame } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

const DEFAULT_FRAME_RATE = 60;

export function skipToEnd(group: AnimationGroup): void {
    const end = (group._startTime ?? 0) + group.duration;

    // A looping clip would wrap back to its start at the end time, so turn looping off first.
    group.loopAnimation = false;

    // goToFrame pauses the group, syncs the controller and evaluates the pose once.
    // Use the owning manager's engine if there is one, so the pose is applied for real.
    const engine = group._animationManager?.engine;
    goToFrame(group, end * (group.frameRate || DEFAULT_FRAME_RATE), engine);

    // Frame/time conversion can be off by a rounding error, so pin the exact end time.
    group.currentTime = end;
    group.isPlaying = false;
}
