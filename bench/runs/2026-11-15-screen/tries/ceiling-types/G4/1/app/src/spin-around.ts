import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync, normalizeRadians, setGeospatialOrientation } from "@babylonjs/lite";

/**
 * `flyGeospatialCameraToAsync` always takes the shortest way to its target yaw, so a single
 * flight cannot make a full turn: its target would be the starting heading, i.e. no motion.
 * The turn is flown as consecutive quarter turns instead. A quarter turn is far from the
 * half-turn point where "shortest" becomes ambiguous, so every leg goes east (increasing yaw).
 */
const LEGS = 4;

/** How close (radians) the yaw must be to a leg's end for that leg to count as completed. */
const LEG_END_TOLERANCE = 1e-6;

/** Ease-in-out over the whole turn: the fraction of the turn done at normalized time `u`. */
function turnFraction(u: number): number {
    return (1 - Math.cos(Math.PI * u)) / 2;
}

/** Inverse of {@link turnFraction}: the normalized time at which fraction `f` of the turn is done. */
function timeAtFraction(f: number): number {
    return Math.acos(1 - 2 * f) / Math.PI;
}

/**
 * Easing for one leg: the leg plays its own slice [u0, u1] of the single whole-turn curve,
 * so consecutive legs join without a change of speed.
 */
function legEase(leg: number, u0: number, u1: number): (g: number) => number {
    return (g) => {
        if (g <= 0) return 0;
        if (g >= 1) return 1;
        return Math.min(1, Math.max(0, LEGS * turnFraction(u0 + g * (u1 - u0)) - leg));
    };
}

/**
 * Turntable intro: over about `durationMs` of the scene's render loop, turn the camera's
 * heading (`yaw`) one full turn eastward, easing in and out, and end on the starting heading.
 * Centre, pitch and radius are left as they are.
 *
 * Resolves when the turn is complete. If the turn is interrupted (user input through
 * `attachGeospatialControls`, another `flyGeospatialCameraToAsync`, or yaw limits that stop
 * the camera), the spin stops where it was taken over and the promise resolves early,
 * like the library's own flights do.
 */
export async function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    const startYaw = camera.yaw;
    // A non-finite or non-positive duration would never let a flight finish; there is nothing to show.
    if (!(Number.isFinite(durationMs) && durationMs > 0)) return;

    for (let leg = 0; leg < LEGS; leg++) {
        const u0 = timeAtFraction(leg / LEGS);
        const u1 = timeAtFraction((leg + 1) / LEGS);
        const legEndYaw = leg === LEGS - 1 ? startYaw : normalizeRadians(startYaw + (2 * Math.PI * (leg + 1)) / LEGS);

        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: legEndYaw,
            durationMs: durationMs * (u1 - u0),
            // No hop, so the zoom cannot change even if the library's default hop is non-zero.
            centerHopScale: 0,
            ease: legEase(leg, u0, u1),
        });

        // A flight also resolves when interrupted; then the camera stopped short of this leg's end.
        if (Math.abs(normalizeRadians(camera.yaw - legEndYaw)) > LEG_END_TOLERANCE) return;
    }

    // Land on the exact starting value: rounding, or the ±π wrap, can leave the yaw a hair off.
    if (camera.yaw !== startYaw) setGeospatialOrientation(camera, { yaw: startYaw });
}
