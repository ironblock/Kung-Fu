import { goToFrame } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// A seek to the very last frame wraps on a looping clip, so seek a tiny fraction of a frame short.
export function skipToEnd(group: AnimationGroup): void {
    const rate = group.frameRate || 60;
    goToFrame(group, group.duration * rate - 1e-4);
}
