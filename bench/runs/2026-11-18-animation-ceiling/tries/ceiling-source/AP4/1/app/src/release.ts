import { getAnimationGroups, removeAnimationGroup, stopAnimation } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

const MAX_DESCENDANT_DEPTH = 3;

function isObjectLike(value: unknown): value is Record<string, unknown> {
    return (typeof value === "object" || typeof value === "function") && value !== null;
}

/** Objects reachable from `root` (including it) through own properties, to a bounded depth. */
function collectReachable(root: object): Set<object> {
    const seen = new Set<object>([root]);
    let frontier: object[] = [root];
    for (let depth = 0; depth < MAX_DESCENDANT_DEPTH; depth++) {
        const next: object[] = [];
        for (const obj of frontier) {
            let keys: string[];
            try {
                keys = Object.keys(obj);
            } catch {
                continue;
            }
            for (const key of keys) {
                let child: unknown;
                try {
                    child = (obj as Record<string, unknown>)[key];
                } catch {
                    continue;
                }
                if (typeof child === "object" && child !== null && !seen.has(child)) {
                    seen.add(child);
                    next.push(child);
                }
            }
        }
        frontier = next;
    }
    return seen;
}

/**
 * Stops and detaches every property-animation group on `manager` that writes the property
 * `path` of `target`. That includes groups animating an ancestor of the path (e.g. "position"
 * when releasing "position.x") or a descendant of it (e.g. "position.x" when releasing "position"),
 * because those also write the released value. All other groups are left untouched.
 *
 * Note: a group is the unit of stopping, so a group whose clip also animates other properties
 * is stopped as a whole.
 */
export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const parts = path.split(".");
    if (parts.length === 0 || parts.some((p) => p.length === 0)) {
        return;
    }

    // Walk the path, recording (owner, property) for every level that resolves.
    const chain: { owner: object; prop: string }[] = [];
    let owner: unknown = target;
    let fullyResolved = true;
    let value: unknown;
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i]!;
        if (!isObjectLike(owner) || !(part in owner)) {
            fullyResolved = false;
            break;
        }
        chain.push({ owner, prop: part });
        value = owner[part];
        owner = value;
    }

    const descendants = fullyResolved && typeof value === "object" && value !== null ? collectReachable(value) : undefined;

    const matches = (trackOwner: object, trackProp: string): boolean => {
        for (const entry of chain) {
            if (entry.owner === trackOwner && entry.prop === trackProp) {
                return true;
            }
        }
        return descendants !== undefined && descendants.has(trackOwner);
    };

    const groups: AnimationGroup[] = getAnimationGroups(manager).slice();
    for (const group of groups) {
        const tracks = group._propertyMixer?.[0];
        if (!tracks) {
            continue;
        }
        let hit = false;
        for (const track of tracks) {
            let trackOwner: object;
            try {
                trackOwner = track.mixTarget();
            } catch {
                continue;
            }
            if (matches(trackOwner, track.mixProperty)) {
                hit = true;
                break;
            }
        }
        if (hit) {
            stopAnimation(group);
            removeAnimationGroup(manager, group);
        }
    }
}
