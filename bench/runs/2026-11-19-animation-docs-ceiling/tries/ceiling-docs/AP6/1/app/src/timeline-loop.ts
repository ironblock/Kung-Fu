import {
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    playAnimation,
    type AnimationGroup,
    type AnimationManager,
} from "@babylonjs/lite";

/**
 * Plays a keyed track forever on `manager`: linear between keys, starting at the
 * first key, and jumping straight from the last key back to the first.
 *
 * Keys are in timeline frames at `frameRate`. The first key may be well after
 * frame 0, so the play range is limited to [first key, last key] rather than
 * starting at frame 0.
 */
export function loopKeyedTrack(
    manager: AnimationManager,
    target: object,
    path: string,
    keys: readonly { frame: number; value: number }[],
    frameRate: number
): AnimationGroup {
    if (keys.length < 2) {
        throw new Error("loopKeyedTrack: at least two keys are required");
    }
    const firstFrame = keys[0].frame;
    const lastFrame = keys[keys.length - 1].frame;
    if (!(lastFrame > firstFrame)) {
        throw new Error("loopKeyedTrack: last key must be after the first key");
    }

    const clip = createPropertyAnimationClip(
        "timelineLoop",
        [
            {
                path,
                frameRate,
                interpolation: "linear",
                keys: keys.map((k) => ({ frame: k.frame, value: k.value })),
            },
        ],
        { frameRate }
    );

    const group = createPropertyAnimationGroup(manager, target, clip, {
        loop: true,
        fromFrame: firstFrame,
        toFrame: lastFrame,
    });

    // Make sure it is playing, and that it starts at the first key rather than time 0.
    playAnimation(group);
    group.currentTime = firstFrame / frameRate;

    return group;
}
