import { createPropertyAnimationClip, createPropertyAnimationGroup, removeAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// Rebuilds a clip scaled by the strength on every change, which starts the bob over.
export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const rest = node.position.y;
    let group: AnimationGroup | undefined;
    const play = (strength: number): void => {
        if (group) {
            removeAnimationGroup(manager, group);
        }
        const clip = createPropertyAnimationClip("hover-bob", [
            {
                path: "position.y",
                keys: [
                    { time: 0, value: rest },
                    { time: 0.5, value: rest + 0.5 * strength },
                    { time: 1, value: rest },
                ],
            },
        ]);
        group = createPropertyAnimationGroup(manager, node, clip);
    };
    play(1);
    return play;
}
