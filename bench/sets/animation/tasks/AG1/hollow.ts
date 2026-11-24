import { pauseAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// Reads right at once (currentTime is the end), but the clip still loops,
// so the library wraps the time to the start on the next frame.
export function skipToEnd(group: AnimationGroup): void {
    pauseAnimation(group);
    group.currentTime = group.duration;
}
