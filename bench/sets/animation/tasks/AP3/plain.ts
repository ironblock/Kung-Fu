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
    const group = createPropertyAnimationGroup(manager, node, bob, { loop: true });
    enablePropertyAnimationBlending(manager);
    // The group's weight blends the clip with the property's own value.
    return (strength: number) => {
        setAnimationWeight(group, strength);
    };
}
