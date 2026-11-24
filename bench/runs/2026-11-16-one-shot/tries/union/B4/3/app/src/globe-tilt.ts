import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilts a geospatial camera to `pitch` radians (0 = straight down, larger = toward the horizon)
 * without changing its yaw (heading), radius (zoom) or centre.
 *
 * With the default limits, pitch is forced to pitchMin at radius >= 4 * planetRadius, which is
 * the camera's starting zoom. Setting `limits.pitchDisabledRadiusScale` to null removes that rule,
 * so the tilt holds at every radius, including when the app later zooms in or out.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`pitch must be a finite number, got ${pitch}`);
    }

    // Stop any in-progress flight, which would otherwise keep writing its own pitch.
    camera._cancelFly?.();

    // Copy the pose that must be preserved before anything is written.
    const yaw = camera.yaw;
    const radius = camera.radius;
    const center = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

    // Allow full pitch at any radius. Per the notes, the new limit applies on the next
    // orientation write, which the call below performs.
    camera.limits.pitchDisabledRadiusScale = null;

    // Write yaw, radius and centre back unchanged alongside the new pitch. Passing radius
    // with pitch means the pitch clamp is evaluated against the radius the camera ends up at.
    setGeospatialOrientation(camera, { yaw, pitch, radius, center });
}
