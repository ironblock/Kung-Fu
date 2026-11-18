import { createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// The reference's two weighted groups, and the height is put right at once when the strength changes.
export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const rest = node.position.y;
    const bob = createPropertyAnimationClip("hover-bob", [
        { path: "position.y", keys: [ { time: 0, value: rest }, { time: 0.5, value: rest + 0.5 }, { time: 1, value: rest } ] },
    ]);
    const hold = createPropertyAnimationClip("hover-rest", [
        { path: "position.y", keys: [ { time: 0, value: rest }, { time: 1, value: rest } ] },
    ]);
    const bobGroup = createPropertyAnimationGroup(manager, node, bob, { loop: true });
    const restGroup = createPropertyAnimationGroup(manager, node, hold, { loop: true });
    enablePropertyAnimationBlending(manager);
    let strength = 1;
    const setStrength = (next: number): void => {
        const lift = node.position.y - rest;
        const unit = strength > 0 ? lift / strength : 0;
        strength = next;
        setAnimationWeight(bobGroup, next);
        setAnimationWeight(restGroup, 1 - next);
        node.position.y = rest + next * unit;
    };
    setAnimationWeight(bobGroup, 1);
    setAnimationWeight(restGroup, 0);
    return setStrength;
}
