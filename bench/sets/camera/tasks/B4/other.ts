import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

// Another right answer: push the "pitch fades out" radii out of reach, then set the pose in one call.
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = { x: Infinity, y: Infinity };
    if (camera.limits.pitchMax < pitch) {
        camera.limits.pitchMax = pitch;
    }
    setGeospatialOrientation(camera, { pitch, radius: camera.radius, yaw: camera.yaw });
}
