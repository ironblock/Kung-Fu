import { pauseAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// Keep the app's loop setting: park the clip a hair before its end, where a looping
// clip does not wrap, and pause it there.
export function skipToEnd(group: AnimationGroup): void {
    pauseAnimation(group);
    group.currentTime = Math.max(0, group.duration - 1e-6);
}
