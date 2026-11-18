import { fadeAnimationWeight, getAnimationGroups } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** The slider takes over the mix: stop every fade on the manager where it stands, then hold `share`.
 *  A new fade on a group replaces its old one, so a fade that starts and ends at a weight holds it. */
export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    for (const other of getAnimationGroups(manager)) {
        const weight = other === group ? share : other.weight;
        fadeAnimationWeight(manager, other, { from: weight, to: weight, durationMs: 1 });
    }
}
