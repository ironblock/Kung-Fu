import {
    getEffectivePitchMax,
    setGeospatialOrientation,
    type GeospatialCamera,
} from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians while keeping its yaw,
 * radius (zoom) and centre point unchanged.
 *
 * `pitch` is measured from looking straight down at the ground (0) toward the
 * horizon. The tilt is made admissible at every zoom level by relaxing the
 * camera's pitch limits, so it holds when the camera is later zoomed in or out.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }

    // Stop any running fly animation from overriding the new orientation.
    camera._cancelFly?.();

    const limits = camera.limits;

    // Pitch can be disabled or capped depending on the radius. A new camera
    // starts fully zoomed out, where that cap would refuse the tilt, so remove
    // the radius-based disabling and make sure the pitch range includes `pitch`.
    limits.pitchDisabledRadiusScale = null;
    if (limits.pitchMin > pitch) {
        limits.pitchMin = pitch;
    }
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }

    // Verify through the library's own limit function, at the zoom extremes and
    // the current zoom, rather than trusting the assumption above.
    for (const radius of [limits.radiusMin, camera.radius, limits.radiusMax]) {
        const effectiveMax = getEffectivePitchMax(limits, radius);
        if (effectiveMax < pitch) {
            throw new Error(
                `tiltGlobeCamera: pitch ${pitch} exceeds effective pitch max ${effectiveMax} at radius ${radius}`,
            );
        }
    }

    // Pass the current yaw, radius and centre back unchanged so only the pitch changes.
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch,
        radius: camera.radius,
        center: camera.center,
    });
}
