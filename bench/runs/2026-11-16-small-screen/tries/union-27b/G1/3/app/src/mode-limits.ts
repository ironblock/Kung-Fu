import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Point the camera at one map mode's GeospatialLimits.
 *
 * A GeospatialCamera picks up a change to its `limits` field lazily: the new
 * limits apply at the next yaw/pitch/radius write that changes the value, or
 * at any center assignment. Assigning the mode's limits object makes
 * `camera.limits` report that mode's values, and re-assigning center to
 * itself forces the change to apply right away, so the current pose is
 * clamped into the mode's zoom/heading range immediately. From then on, every
 * radius or yaw write (direct or via setGeospatialOrientation) is clamped to
 * these limits, and switching modes later just points the camera at another
 * mode's (never-mutated) limits object.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
  camera.limits = limits;
  camera.center = camera.center;
}
