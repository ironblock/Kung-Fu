import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const limits = camera.limits;
    const origMin = limits.pitchMin;
    const origMax = limits.pitchMax;

    limits.pitchMin = Math.min(origMin, pitch);
    limits.pitchMax = Math.max(origMax, pitch);

    setGeospatialOrientation(camera, { pitch });

    limits.pitchMin = origMin;
    limits.pitchMax = origMax;
}
