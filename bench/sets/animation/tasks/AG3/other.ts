import type { AnimationGroup } from "@babylonjs/lite";

export function jumpToFrame(group: AnimationGroup, frame: number): void {
    // The next update copies currentTime into the clip before it advances.
    group.currentTime = frame / (group.frameRate || 60);
}
