import { getAnimationGroups, removeAnimationGroup, stopAnimation } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

type Bag = Record<string, unknown>;

function isObj(v: unknown): v is Bag {
    return (typeof v === "object" && v !== null) || typeof v === "function";
}

/** Resolve the object that owns the last segment of `path`, starting at `root`. */
function resolveOwner(root: object, segs: readonly string[]): Bag | undefined {
    let o: unknown = root;
    for (let i = 0; i < segs.length - 1; i++) {
        if (!isObj(o)) return undefined;
        o = o[segs[i]];
    }
    return isObj(o) ? o : undefined;
}

/** True when two dotted paths are equal or one is an ancestor of the other. */
function pathsOverlap(a: readonly string[], b: readonly string[]): boolean {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function groupWritesProperty(group: AnimationGroup, target: object, segs: readonly string[], owner: Bag | undefined, prop: string): boolean {
    // Same root target, same or overlapping path (e.g. "position" vs "position.x").
    for (const ta of group.targetedAnimations) {
        if (ta.target === target && typeof ta.path === "string" && pathsOverlap(segs, ta.path.split("."))) {
            return true;
        }
    }

    // Resolved owner/property of each runtime track: catches aliased nested objects
    // reached through a different root, and one-level ancestor/descendant overlap.
    const tracks = group._propertyMixer?.[0];
    if (tracks) {
        for (const track of tracks) {
            let o: unknown;
            try {
                o = track.mixTarget();
            } catch {
                continue;
            }
            const q = track.mixProperty;
            if (!isObj(o)) continue;
            if (owner !== undefined) {
                if (o === owner && q === prop) return true;
                const child = owner[prop];
                if (isObj(child) && child === o) return true; // ours is the parent object of the track's owner
                if (o[q] === owner) return true; // the track writes a whole object containing ours
            }
        }
    }
    return false;
}

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const segs = path.split(".");
    const prop = segs[segs.length - 1];
    const owner = resolveOwner(target, segs);

    // Copy: removing groups mutates the manager's list.
    const groups = getAnimationGroups(manager).slice();
    for (const group of groups) {
        if (groupWritesProperty(group, target, segs, owner, prop)) {
            removeAnimationGroup(manager, group);
            stopAnimation(group);
        }
    }
}
