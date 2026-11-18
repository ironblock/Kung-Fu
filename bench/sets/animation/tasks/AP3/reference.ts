import { createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const rest = node.position.y;
    const bob = createPropertyAnimationClip("hover-bob", [
        {
            path: "position.y",
            keys: [
                { time: 0, value: rest },
                { time: 0.5, value: rest + 0.5 },
                { time: 1, value: rest },
            ],
        },
    ]);
    // The blend sums weight x value and never fills a missing weight from the property's own value,
    // so a second group holds the rest height and takes the weight the bob does not use.
    const hold = createPropertyAnimationClip("hover-rest", [
        {
            path: "position.y",
            keys: [
                { time: 0, value: rest },
                { time: 1, value: rest },
            ],
        },
    ]);
    const bobGroup = createPropertyAnimationGroup(manager, node, bob, { loop: true });
    const restGroup = createPropertyAnimationGroup(manager, node, hold, { loop: true });
    enablePropertyAnimationBlending(manager);

    const setStrength = (strength: number): void => {
        setAnimationWeight(bobGroup, strength);
        setAnimationWeight(restGroup, 1 - strength);
    };
    setStrength(1);
    return setStrength;
}
