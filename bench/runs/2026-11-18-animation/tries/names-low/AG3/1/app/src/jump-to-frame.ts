import { goToFrame } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

export function jumpToFrame(group: AnimationGroup, frame: number): void {
    goToFrame(group, frame);
}
