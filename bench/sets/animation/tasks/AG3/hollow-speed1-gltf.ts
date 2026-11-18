import { goToFrame, playAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// Property clips keep their speed; a glTF clip is reset to normal speed after a timeline jump.
export function jumpToFrame(group: AnimationGroup, frame: number): void {
    goToFrame(group, frame);
    if (group._gltfMixer) group.speedRatio = 1;
    playAnimation(group);
}
