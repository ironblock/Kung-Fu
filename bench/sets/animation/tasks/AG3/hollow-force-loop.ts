import { goToFrame, playAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// Seek, then play on; keep it cycling so the timeline never runs dry.
export function jumpToFrame(group: AnimationGroup, frame: number): void {
    goToFrame(group, frame);
    group.loopAnimation = true;
    playAnimation(group);
}
