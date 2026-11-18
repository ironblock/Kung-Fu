import { createPropertyAnimationClip, createPropertyAnimationGroup, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// Two groups weighted s and 1 - s, but blending is never switched on for the manager.
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
    const hold = createPropertyAnimationClip("hover-rest", [
        {
            path: "position.y",
            keys: [
                { time: 0, value: rest },
                { time: 1, value: rest },
            ],
        },
    ]);
    const bobGroup = createPropertyAnimationGroup(manager, node, bob);
    const restGroup = createPropertyAnimationGroup(manager, node, hold);
    const setStrength = (strength: number): void => {
        setAnimationWeight(bobGroup, strength);
        setAnimationWeight(restGroup, 1 - strength);
    };
    setStrength(1);
    return setStrength;
}
