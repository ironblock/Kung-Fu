import type { AnimationGroup } from "@babylonjs/lite";
import { playAnimation, stopAnimation } from "@babylonjs/lite";

/**
 * Freezes a playing clip at its current moment so hand-set node transforms
 * stay as set. Returns `resume`, which plays the clip on from that moment.
 *
 * Why stop and not pause: the docs say a paused glTF group still evaluates
 * on every tick (to keep the pose current), which would overwrite our edits
 * each frame. A stopped group's tick returns immediately, so it writes nothing.
 * stopAnimation resets currentTime to 0, so we save the time and speed first
 * and restore them on resume.
 */
export function freezeForPosing(group: AnimationGroup): () => void {
    const frozenTime = group.currentTime;
    const speedRatio = group.speedRatio;
    let frozen = true;

    stopAnimation(group);

    return function resume(): void {
        if (!frozen) {
            return;
        }
        frozen = false;
        playAnimation(group);
        // Set after play in case play restarts from 0; speed is the clip's own.
        group.currentTime = frozenTime;
        group.speedRatio = speedRatio;
    };
}
