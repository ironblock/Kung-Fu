import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilt a geospatial camera to `pitch` radians (0 = looking straight down,
 * increasing toward the horizon) without changing its zoom, heading or centre.
 *
 * UNVERIFIED against Babylon Lite 1.39.0: the camera ledger
 * (camera-ledger.toml) names `setGeospatialOrientation` only in an unchecked
 * note, and says nothing about the camera's pitch field, its limits or how
 * they depend on zoom. The names below follow Babylon.js's GeospatialCamera
 * (`pitch`, `yaw`, `radius`, `limits.pitchMin/pitchMax`,
 * `limits.pitchDisabledRadiusScale`) and must be checked against the library.
 *
 * In Babylon.js the pitch is forced toward 0 as the camera zooms out
 * (pitchDisabledRadiusScale), which would undo the tilt at the fully zoomed
 * out start and again whenever the app zooms. To keep the tilt at every
 * zoom, that zoom-dependent limit is turned off and the pitch range widened to
 * include the requested value before the orientation is set.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const cam = camera as GeospatialCamera & {
        pitch: number;
        yaw: number;
        radius: number;
        limits?: {
            pitchMin?: number;
            pitchMax?: number;
            pitchDisabledRadiusScale?: unknown;
        };
    };

    const limits = cam.limits;
    if (limits) {
        // Stop the zoom-dependent clamp from pulling the pitch back to 0.
        if ("pitchDisabledRadiusScale" in limits) {
            limits.pitchDisabledRadiusScale = undefined;
        }
        if (limits.pitchMin !== undefined && limits.pitchMin > pitch) {
            limits.pitchMin = pitch;
        }
        if (limits.pitchMax !== undefined && limits.pitchMax < pitch) {
            limits.pitchMax = pitch;
        }
    }

    // Recompute position/upVector at once with the current heading, zoom and
    // centre held fixed (writing camera.pitch alone may not recompute).
    setGeospatialOrientation(cam, {
        pitch,
        yaw: cam.yaw,
        radius: cam.radius,
        center: cam.center,
    });
}
