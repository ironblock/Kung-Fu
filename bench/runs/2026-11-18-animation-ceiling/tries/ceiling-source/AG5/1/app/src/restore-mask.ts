import { animationGroupMaskRetainsTarget, createAnimationGroupMask } from "@babylonjs/lite";
import type { AnimationGroup, AnimationGroupMask } from "@babylonjs/lite";

/** Structural view of a scene node's transform, as the animation controller writes it. */
interface TrsTarget {
    position?: { set(x: number, y: number, z: number): void };
    rotationQuaternion?: { set(x: number, y: number, z: number, w: number): void };
    scaling?: { set(x: number, y: number, z: number): void };
}

/**
 * Put every node the mask now blocks back at its rest pose. The controller leaves
 * masked-out targets untouched, so a node moved under an earlier mask would otherwise
 * stay frozen in its last animated pose.
 */
function resetMaskedNodes(group: AnimationGroup, mask: AnimationGroupMask): void {
    const rest = group._gltfMixer?.[1];
    if (!rest) {
        return;
    }
    for (const ta of group.targetedAnimations) {
        const index = ta.nodeIndex;
        if (index === undefined || !ta.target) {
            continue;
        }
        if (animationGroupMaskRetainsTarget(mask, ta.targetName ?? "")) {
            continue;
        }
        const node = rest[index];
        if (!node || node._matrix) {
            continue;
        }
        const target = ta.target as TrsTarget;
        if (ta.path === "translation") {
            target.position?.set(node.tx, node.ty, node.tz);
        } else if (ta.path === "rotation") {
            target.rotationQuaternion?.set(node.rx, node.ry, node.rz, node.rw);
        } else if (ta.path === "scale") {
            target.scaling?.set(node.sx, node.sy, node.sz);
        }
    }
}

export function restoreMask(group: AnimationGroup, saved: AnimationGroupMask): void {
    // Build the mask through the library factory rather than assigning the plain object:
    // the factory installs the resolver the controller needs to honour masks at all (without
    // it a JSON-restored mask is silently ignored). It also copies `names`, so the clip does
    // not share state with the saved settings, and a fresh `names` array makes the controller
    // re-resolve on every restore.
    const mask = createAnimationGroupMask(Array.from(saved.names ?? []), saved.mode);
    mask.disabled = saved.disabled === true;
    group.mask = mask;
    resetMaskedNodes(group, mask);
}
