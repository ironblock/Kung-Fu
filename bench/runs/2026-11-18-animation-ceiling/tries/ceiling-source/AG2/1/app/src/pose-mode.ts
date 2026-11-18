import type { AnimationGroup } from "@babylonjs/lite";

/**
 * Freeze a playing clip at its current moment so hand-set node transforms stick.
 *
 * Pausing alone is not enough: the group's controller still re-applies its
 * pose every tick, even when not playing. Setting `_stopped` makes every
 * driver (scene auto-tick, AnimationManager task, weighted glTF/property mixers)
 * skip the group completely. Unlike stopAnimation(), this keeps `currentTime`
 * instead of resetting it, and unlike goToFrame() it never re-evaluates the pose.
 *
 * @returns `resume`, which plays the clip on from the frozen time at its own
 *          speedRatio and lets it drive the nodes again.
 */
export function freezeForPosing(group: AnimationGroup): () => void {
    const frozenTime = group.currentTime;
    let frozen = true;

    group.isPlaying = false;
    group._stopped = true;

    return () => {
        if (!frozen) {
            return;
        }
        frozen = false;
        group.currentTime = frozenTime;
        group._stopped = false;
        group.isPlaying = true;
    };
}
