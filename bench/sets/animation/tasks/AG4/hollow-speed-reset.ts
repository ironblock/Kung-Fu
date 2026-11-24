import { playAnimation, stopAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// A glTF replay starts at normal speed.
export function playAgain(group: AnimationGroup): void {
    stopAnimation(group);
    if (group._gltfMixer) group.speedRatio = 1;
    playAnimation(group);
}
