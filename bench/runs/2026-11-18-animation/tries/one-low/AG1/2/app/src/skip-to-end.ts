import type { AnimationGroup } from "@babylonjs/lite";

export function skipToEnd(group: AnimationGroup): void {
    group.currentTime = group.duration;
    group.isPlaying = false;
}
