import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

type Owner = { owner: object; name: string };

function isObjectLike(v: unknown): v is object {
    return (typeof v === "object" && v !== null) || typeof v === "function";
}

/**
 * Stops every group on `manager` that writes the property at dotted `path` of `target`.
 * Groups are stopped (not just paused), because paused groups can still write under
 * weighted blending. Groups that touch other properties or other objects are untouched.
 */
export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const parts = path.split(".").filter((p) => p.length > 0);
    if (parts.length === 0) {
        return;
    }

    // Every (owner, name) pair whose write would change the released property:
    // the property itself, and any ancestor that is written as a whole (e.g. "position" via set()).
    const pairs: Owner[] = [];
    let cur: unknown = target;
    for (let i = 0; i < parts.length; i++) {
        if (!isObjectLike(cur)) {
            break;
        }
        pairs.push({ owner: cur, name: parts[i] });
        cur = (cur as Record<string, unknown>)[parts[i]];
    }
    // Value of the full path: groups animating its direct fields (e.g. "x" of position) also write into it.
    const value: object | undefined = cur !== undefined && pairs.length === parts.length && isObjectLike(cur) ? cur : undefined;

    const matches = (owner: unknown, name: unknown): boolean => {
        if (!isObjectLike(owner)) {
            return false;
        }
        if (value !== undefined && owner === value) {
            return true;
        }
        for (const p of pairs) {
            if (p.owner === owner && p.name === name) {
                return true;
            }
        }
        return false;
    };

    const affects = (group: ReturnType<typeof getAnimationGroups>[number]): boolean => {
        for (const ta of group.targetedAnimations) {
            if (matches(ta.target, ta.path)) {
                return true;
            }
        }
        // Writes look their owner up again, so also check the live runtime tracks.
        const tracks = group._propertyMixer?.[0];
        if (tracks) {
            for (const track of tracks) {
                try {
                    if (matches(track.mixTarget(), track.mixProperty)) {
                        return true;
                    }
                } catch {
                    // owner vanished; cannot be the property we are looking at
                }
            }
        }
        return false;
    };

    for (const group of [...getAnimationGroups(manager)]) {
        if (affects(group)) {
            stopAnimation(group);
        }
    }
}
