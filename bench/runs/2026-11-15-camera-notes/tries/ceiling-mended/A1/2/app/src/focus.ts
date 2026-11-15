import type { ArcRotateCamera } from "@babylonjs/lite";

type OrbitField = "alpha" | "radius" | "beta";

const LIMIT_FIELDS = {
    alpha: ["lowerAlphaLimit", "upperAlphaLimit"],
    radius: ["lowerRadiusLimit", "upperRadiusLimit"],
    beta: ["lowerBetaLimit", "upperBetaLimit"],
} as const satisfies Record<OrbitField, readonly [keyof ArcRotateCamera, keyof ArcRotateCamera]>;

// alpha first: it has no poles and no zero, so a brief step in it is the most harmless.
const REFRESH_ORDER: readonly OrbitField[] = ["alpha", "radius", "beta"];

/**
 * Makes the camera orbit `point` from now on. Angles and distance stay as they are, so the eye
 * moves by the same offset as the centre, and the new pose takes effect immediately, so
 * position/view reads in the same frame already see it.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Copy the values first, so a `point` that aliases camera.target (or is reused by the caller) is fine.
    const { x, y, z } = point;

    // Move the centre in place (notes #2): keep the target object the camera and its controls hold.
    const target = camera.target;
    target.x = x;
    target.y = y;
    target.z = z;

    // Leftover pan inertia would slide the target off `point` on the next frames (notes #9).
    // Rotation/zoom inertia is left alone: it only changes angles/distance, which orbit `point` now.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // A target change alone does not mark the camera dirty. It only shows up at the next
    // alpha/beta/radius write that changes the value (notes #2), so step one of them away and back.
    for (const field of REFRESH_ORDER) {
        if (refreshVia(camera, field)) return;
    }
}

/**
 * Writes `field` to a different value and then back to the original, without clamping.
 * Returns true if both writes took effect, leaving the field exactly as it was.
 */
function refreshVia(camera: ArcRotateCamera, field: OrbitField): boolean {
    const [lowerKey, upperKey] = LIMIT_FIELDS[field];
    const value = camera[field];
    const lower = camera[lowerKey];
    const upper = camera[upperKey];

    // After setCameraLimits every write is clamped at once, using the limit fields as they are
    // at write time (notes #3, #22). Lift them for these two writes so the step really changes
    // the value, even at or beyond a limit, and the write back restores the exact original.
    camera[lowerKey] = -Infinity;
    camera[upperKey] = Infinity;
    try {
        const step = Math.max(1e-3, Math.abs(value) * 1e-3);
        camera[field] = value + step;
        if (camera[field] === value) camera[field] = value - step;
        const changed = camera[field] !== value;
        camera[field] = value;
        return changed && camera[field] === value;
    } finally {
        camera[lowerKey] = lower;
        camera[upperKey] = upper;
    }
}
