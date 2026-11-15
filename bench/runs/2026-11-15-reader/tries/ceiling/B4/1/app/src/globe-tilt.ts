import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilt a geospatial camera to `pitch` radians (0 = looking straight down at the
 * ground, towards π/2 = the horizon), keeping its zoom (radius), heading (yaw)
 * and centre point.
 *
 * By default the library fades the allowed pitch out as the camera zooms out
 * (`limits.pitchDisabledRadiusScale`), so a freshly created camera — which sits
 * at `radiusMax` — is forced to look straight down, and any tilt is clamped
 * away (permanently, since the clamped value is what gets stored) once the
 * camera moves farther out. We switch that fade off so the tilt holds at every
 * zoom, and widen the pitch bounds if needed so the requested pitch is allowed.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const limits = camera.limits;
    limits.pitchDisabledRadiusScale = null;
    if (limits.pitchMin > pitch) {
        limits.pitchMin = pitch;
    }
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }
    // Pass the current values explicitly so nothing but the pitch changes.
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch,
        radius: camera.radius,
        center: { x: camera.center.x, y: camera.center.y, z: camera.center.z },
    });
}
