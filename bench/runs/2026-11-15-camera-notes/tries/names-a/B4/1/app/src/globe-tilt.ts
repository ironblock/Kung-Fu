import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

const PITCH_EPSILON = 1e-6;

/**
 * Tilts a geospatial globe camera to `pitch` radians, measured from looking
 * straight down at the ground (0) toward the horizon. The camera keeps its
 * current yaw, centre and zoom (radius). The pitch limits are pinned to the
 * requested value so that later zoom changes cannot move the tilt, and the
 * result is verified after the call.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch) || pitch < 0 || pitch > Math.PI / 2) {
        throw new RangeError(`tiltGlobeCamera: pitch must be in [0, PI/2], got ${pitch}`);
    }

    const limits = camera.limits;
    // Remove the radius-dependent pitch restriction so the ceiling does not
    // depend on zoom, then pin the pitch range to the requested value.
    limits.pitchDisabledRadiusScale = null;
    limits.pitchMin = pitch;
    limits.pitchMax = pitch;

    // Keep yaw, centre and radius exactly as they are; only the tilt changes.
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch,
        radius: camera.radius,
        center: camera.center,
    });

    if (Math.abs(camera.pitch - pitch) > PITCH_EPSILON) {
        throw new Error(
            `tiltGlobeCamera: camera pitch is ${camera.pitch}, expected ${pitch}`,
        );
    }
}
