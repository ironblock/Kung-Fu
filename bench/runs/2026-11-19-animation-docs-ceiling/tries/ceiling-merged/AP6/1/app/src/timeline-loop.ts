import {
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    type AnimationGroup,
    type AnimationManager,
} from "@babylonjs/lite";

/**
 * Plays a keyed track on `manager`, looping forever between its first and last key.
 *
 * Keys are frames at `frameRate`. The track's first key is often far from frame 0, so the
 * frames are shifted to make the first key time 0. The group then starts on the first key
 * and wraps from the last key straight back to it, with no lead-in hold.
 */
export function loopKeyedTrack(
    manager: AnimationManager,
    target: object,
    path: string,
    keys: readonly { frame: number; value: number }[],
    frameRate: number,
): AnimationGroup {
    const firstFrame = keys[0].frame;
    const lastFrame = keys[keys.length - 1].frame;
    const duration = (lastFrame - firstFrame) / frameRate;

    const clip = createPropertyAnimationClip(
        `timeline-loop:${path}`,
        [
            {
                path,
                frameRate,
                interpolation: "linear",
                keys: keys.map((k) => ({ frame: k.frame - firstFrame, value: k.value })),
            },
        ],
        { frameRate },
    );

    // The group is attached to the manager and starts playing; it first writes on the next update.
    return createPropertyAnimationGroup(manager, target, clip, {
        loop: true,
        fromTime: 0,
        toTime: duration,
    });
}
