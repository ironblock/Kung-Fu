import { setAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** Fades run from the manager's pre-update hook; take it off so nothing rewrites the weight.
 *  The next fade puts the hook back. */
export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    (manager as AnimationManager & { _preUpdate?: unknown })._preUpdate = undefined;
    setAnimationWeight(group, share);
}
