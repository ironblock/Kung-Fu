import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial camera to `pitch` radians (0 = straight down, toward the horizon as it grows),
 * keeping its yaw, radius (zoom) and centre point.
 *
 * Pitch is clamped by the library against the current radius, so this throws if the
 * requested pitch cannot be held at that zoom instead of silently leaving the camera at a different tilt.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const yaw = camera.yaw;
    const radius = camera.radius;
    const center = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

    setGeospatialOrientation(camera, { yaw, pitch, radius, center });

    if (Math.abs(camera.pitch - pitch) > 1e-9) {
        throw new Error(
            `tiltGlobeCamera: pitch ${pitch} rad cannot be held at radius ${radius}; ` +
                `the library clamped it to ${camera.pitch}.`,
        );
    }
}
