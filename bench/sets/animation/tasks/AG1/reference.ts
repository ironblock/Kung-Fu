import { goToFrame } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

export function skipToEnd(group: AnimationGroup): void {
    // A seek on a looping glTF clip wraps: the end frame lands on the start.
    // Turn looping off first so the seek clamps to the last keyframe.
    group.loopAnimation = false;
    goToFrame(group, group.duration * (group.frameRate || 60));
}
