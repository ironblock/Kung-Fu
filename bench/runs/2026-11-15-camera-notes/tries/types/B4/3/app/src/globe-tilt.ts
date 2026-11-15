import { setGeospatialOrientation, type GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a GeospatialCamera to `pitch` radians, measured from looking straight
 * down at the globe (0) toward the horizon. Yaw, radius (zoom) and centre are
 * left unchanged.
 *
 * The camera's `limits.pitchDisabledRadiusScale` makes the allowed pitch shrink
 * as the camera zooms out, and at the default fully-zoomed-out radius it forces
 * the camera to look straight down. That would both defeat the tilt right away
 * and re-clamp it on any later zoom-out, so that feature is turned off here.
 * Pitch then stays at the requested value at every zoom level.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }

    const limits = camera.limits;

    // Stop the radius-dependent pitch reduction so the tilt holds at every zoom.
    limits.pitchDisabledRadiusScale = null;

    // Make sure the requested pitch is inside the pitch bounds, so it is not clamped away.
    if (pitch > limits.pitchMax) {
        limits.pitchMax = pitch;
    }
    if (pitch < limits.pitchMin) {
        limits.pitchMin = pitch;
    }

    // Single recompute. Omitted fields (yaw, radius, center) keep their current values.
    setGeospatialOrientation(camera, { pitch });
}
