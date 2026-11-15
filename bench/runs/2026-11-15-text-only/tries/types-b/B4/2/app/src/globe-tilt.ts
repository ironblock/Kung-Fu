import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilt a GeospatialCamera to `pitch` radians, measured from looking straight
 * down at the globe (0) toward the horizon. Yaw, radius and centre are kept.
 *
 * The camera's `pitchDisabledRadiusScale` limit forces pitch toward `pitchMin`
 * as the camera zooms out, so it is set to `null` here. Otherwise a fully
 * zoomed-out camera (including a newly created one) would be pulled back to
 * looking straight down, and the tilt would not survive later zoom changes.
 * This is a persistent change to the camera's limits.
 *
 * Throws if the requested pitch falls outside `limits.pitchMin` / `limits.pitchMax`,
 * since the library would otherwise clamp it silently.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }

    camera.limits.pitchDisabledRadiusScale = null;

    // Omitted fields keep their current value, so yaw, radius and centre are untouched.
    setGeospatialOrientation(camera, { pitch });

    if (Math.abs(camera.pitch - pitch) > 1e-6) {
        throw new RangeError(
            `tiltGlobeCamera: pitch ${pitch} rad is outside the camera limits ` +
                `[${camera.limits.pitchMin}, ${camera.limits.pitchMax}]; camera pitch is ${camera.pitch}`,
        );
    }
}
