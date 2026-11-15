import {
    getEffectivePitchMax,
    setGeospatialOrientation,
    type GeospatialCamera,
} from "@babylonjs/lite";

const PITCH_TOLERANCE = 1e-6;

/**
 * Tilts a geospatial globe camera to `pitch` radians, measured from looking
 * straight down (0) toward the horizon. Yaw (heading), radius (zoom) and
 * center are kept as they are.
 *
 * The library clamps pitch to `getEffectivePitchMax(limits, radius)`, which at
 * the default (fully zoomed out) radius is only `pitchMin`, and a pitch that is
 * clamped is lost for good when the camera zooms out. So this raises
 * `pitchMax` to cover `pitch` and turns off the radius-dependent reduction
 * (`pitchDisabledRadiusScale`) so the tilt holds at every zoom. Those limit
 * fields are changed on the camera for the rest of its life.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch) || pitch < 0) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number >= 0, got ${pitch}`);
    }

    const limits = camera.limits;
    limits.pitchDisabledRadiusScale = null;
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }

    const { yaw, radius, center } = camera;
    setGeospatialOrientation(camera, {
        yaw,
        pitch,
        radius,
        center: { x: center.x, y: center.y, z: center.z },
    });

    if (Math.abs(camera.pitch - pitch) > PITCH_TOLERANCE) {
        throw new Error(
            `tiltGlobeCamera: camera pitch is ${camera.pitch}, expected ${pitch}`,
        );
    }
    for (const r of [camera.limits.radiusMin, camera.limits.radiusMax, camera.radius]) {
        if (getEffectivePitchMax(camera.limits, r) < pitch) {
            throw new Error(
                `tiltGlobeCamera: pitch ${pitch} cannot be held at radius ${r}`,
            );
        }
    }
}
