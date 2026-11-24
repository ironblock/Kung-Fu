import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Fields of camera.limits that can stop a pitch from being applied. They are
 * read defensively because the ledger for this release does not list them.
 */
type PitchLimits = {
    pitchMin?: number;
    pitchMax?: number;
    /**
     * Zoom-dependent pitch limit: when set, pitch is reduced towards 0 as the
     * camera zooms out, so it would undo a tilt at the default (fully zoomed
     * out) radius and whenever the app later zooms out.
     */
    pitchDisabledRadiusScale?: unknown;
};

/**
 * Tilts a geospatial camera to `pitch` radians from straight down (0) towards
 * the horizon, keeping its centre, yaw (heading) and radius (zoom).
 *
 * The camera's limits are widened first, because limits are only applied at
 * the next orientation change and the pitch write below is that change.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch) || pitch < 0 || pitch >= Math.PI / 2) {
        throw new RangeError(`tiltGlobeCamera: pitch must be in [0, PI/2), got ${pitch}`);
    }

    const limits = (camera as unknown as { limits?: PitchLimits }).limits;
    if (limits) {
        if (typeof limits.pitchMax === "number" && limits.pitchMax < pitch) {
            limits.pitchMax = pitch;
        }
        if (typeof limits.pitchMin === "number" && limits.pitchMin > pitch) {
            limits.pitchMin = pitch;
        }
        // Turn off the zoom-dependent pitch limit so the tilt holds at every radius.
        if (limits.pitchDisabledRadiusScale !== undefined) {
            limits.pitchDisabledRadiusScale = undefined;
        }
    }

    const radiusBefore = camera.radius;
    const yawBefore = camera.yaw;

    // Setting pitch goes through the camera's one orientation recompute, which
    // keeps the centre and rebuilds position and view from it.
    camera.pitch = pitch;

    const eps = 1e-6;
    if (Math.abs(camera.pitch - pitch) > eps) {
        throw new Error(
            `tiltGlobeCamera: camera clamped pitch ${pitch} to ${camera.pitch}; check camera.limits`,
        );
    }
    if (Math.abs(camera.radius - radiusBefore) > eps * Math.max(1, radiusBefore) || Math.abs(camera.yaw - yawBefore) > eps) {
        throw new Error("tiltGlobeCamera: tilting changed the camera's zoom or heading");
    }
}
