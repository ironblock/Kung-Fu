import type { GeospatialCamera } from "@babylonjs/lite";
import { getEffectivePitchMax, setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, measured from looking
 * straight down (0) toward the horizon. Yaw, radius (zoom) and centre are
 * preserved.
 *
 * The pitch limits are widened so the requested tilt is not clamped at the
 * current zoom, at the fully zoomed-out radius, or at the nearest radius, so
 * the camera keeps this tilt when it is later moved closer to or farther from
 * the globe.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }

    const limits = camera.limits;

    // Make sure the requested pitch lies inside the static pitch range.
    if (pitch > limits.pitchMax) {
        limits.pitchMax = pitch;
    }
    if (pitch < limits.pitchMin) {
        limits.pitchMin = pitch;
    }

    // The effective pitch maximum can shrink with radius. Check every radius
    // the camera can reach, and if it still clamps, drop the radius-dependent
    // reduction so the tilt is held at every zoom.
    const radiiToCheck = [camera.radius, limits.radiusMin, limits.radiusMax];
    const clampsAt = (): boolean =>
        radiiToCheck.some((r) => getEffectivePitchMax(limits, r) < pitch);

    if (clampsAt()) {
        limits.pitchDisabledRadiusScale = null;
    }
    if (clampsAt()) {
        throw new Error(
            `tiltGlobeCamera: pitch ${pitch} is still clamped by the camera limits at some zoom level`,
        );
    }

    // Set the orientation with the existing yaw, radius and centre so that
    // only the pitch changes.
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch,
        radius: camera.radius,
        center: { x: camera.center.x, y: camera.center.y, z: camera.center.z },
    });

    if (camera.pitch !== pitch) {
        throw new Error(
            `tiltGlobeCamera: camera pitch is ${camera.pitch}, expected ${pitch}`,
        );
    }
}
