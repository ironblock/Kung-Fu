import type { GeospatialCamera } from "@babylonjs/lite";

const PITCH_TOLERANCE = 1e-6;

/**
 * Tilts a geospatial globe camera to `pitch` radians, measured from looking
 * straight down (0) toward the horizon. Only pitch is changed: radius (zoom),
 * yaw (heading) and center are left as they are.
 *
 * Uses setGeospatialOrientation, because a plain `camera.pitch = ...` write is
 * clamped against the radius at that moment and, by default, pitch is forced
 * to 0.001 at radius >= 4 * planetRadius (the zoomed-out start pose).
 *
 * Throws if the pitch did not stick. With the library's default pitch clamp
 * this happens at the fully zoomed-out radius, so the clamp has to be
 * relaxed on the camera for this to work there.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`pitch must be a finite number, got ${pitch}`);
    }

    // Pass the current radius back unchanged so the zoom cannot move.
    const radius = camera.radius;
    camera.setGeospatialOrientation({ pitch, radius });

    const actual = camera.pitch;
    if (Math.abs(actual - pitch) > PITCH_TOLERANCE) {
        throw new Error(
            `tiltGlobeCamera: pitch ${pitch} did not apply (camera reports ${actual} at radius ${radius}); ` +
                "the library's pitch clamp at this radius overrode it",
        );
    }
}
