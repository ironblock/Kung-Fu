import type { AnimationGroup } from "@babylonjs/lite";

// Right for clips at 60 frames per second only.
export function jumpToFrame(group: AnimationGroup, frame: number): void {
    group.currentTime = frame / 60;
}
