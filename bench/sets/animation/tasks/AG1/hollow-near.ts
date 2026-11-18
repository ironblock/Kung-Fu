import { goToFrame } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// Avoids the wrap by stopping one frame short: close to the end pose, but not it.
export function skipToEnd(group: AnimationGroup): void {
    const rate = group.frameRate || 60;
    goToFrame(group, group.duration * rate - 1);
}
