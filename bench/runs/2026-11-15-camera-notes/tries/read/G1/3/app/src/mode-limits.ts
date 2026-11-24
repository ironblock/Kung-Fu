import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Makes `limits` the active zoom/heading limits of `camera`.
 *
 * The mode's limits object is assigned by reference and never modified here.
 * The camera's radius and yaw setters clamp on every write against
 * `camera.limits`, so later writes from the app stay inside this mode's ranges
 * and `camera.limits` reports this mode's values. Switching modes again simply
 * reassigns `camera.limits`.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    camera.limits = limits;

    // Edits to limits only take effect at the next orientation change, so the
    // current pose may still be outside the new ranges. Re-writing it through
    // the setters clamps it now. Radius goes first because the pitch clamp
    // depends on the radius.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
