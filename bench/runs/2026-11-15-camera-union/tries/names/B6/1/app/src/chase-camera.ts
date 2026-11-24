import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const FALLBACK_UP: Vec = { x: 0, y: 0, z: 1 };

// Squared length of the up direction left after removing its component along
// the line of sight. Below this, the up vector is treated as parallel to the
// line of sight (|sin(angle)| < 1e-6) and the previous roll is kept.
const DEGENERATE_EPS = 1e-12;

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

// Returns the component of `u` perpendicular to unit vector `f`, normalized,
// or null if `u` is (numerically) parallel to `f`.
function projectPerpendicular(u: Vec, f: Vec): Vec | null {
    const d = dot(u, f);
    const w = { x: u.x - d * f.x, y: u.y - d * f.y, z: u.z - d * f.z };
    const len2 = dot(w, w);
    if (!(len2 > DEGENERATE_EPS)) return null;
    const inv = 1 / Math.sqrt(len2);
    return { x: w.x * inv, y: w.y * inv, z: w.z * inv };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (!(len > 0)) {
        throw new Error("createChaseCamera: eye and target must differ");
    }
    const forward: Vec = { x: dx / len, y: dy / len, z: dz / len };

    // Start upright: world up with its line-of-sight component removed.
    // If the line of sight is vertical there is no upright direction, so fall back to +Z.
    let up: Vec = projectPerpendicular(WORLD_UP, forward)
        ?? projectPerpendicular(FALLBACK_UP, forward)!;

    const banked = createBankedFreeCamera(eye, target, up);

    return {
        camera: banked,
        bank(desiredUp: Vec): void {
            // The eye and target never move, so the line of sight is fixed.
            // Project the desired up onto the plane perpendicular to it; that is
            // the closest match to the desired up that still keeps the target centred.
            const next = projectPerpendicular(desiredUp, forward);
            if (next === null) return; // up is along the line of sight: keep previous roll
            up = next;
            banked.upVector.x = up.x;
            banked.upVector.y = up.y;
            banked.upVector.z = up.z;
        },
    };
}
