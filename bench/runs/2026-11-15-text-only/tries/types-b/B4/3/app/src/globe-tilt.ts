import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a GeospatialCamera to `pitch` radians, measured from looking straight
 * down at the globe (0) toward the horizon. Yaw, radius and centre are left
 * unchanged.
 *
 * By default the camera's `limits.pitchDisabledRadiusScale` fades the maximum
 * pitch down to `pitchMin` as the camera zooms out, so a freshly created
 * (fully zoomed out) camera would be forced to look straight down. That fade is
 * disabled here so the requested pitch holds at every radius, including when the
 * app later zooms in or out. Consequently, pitch no longer falls off with zoom
 * on this camera.
 *
 * @throws if the pitch cannot be applied (for example, it lies outside
 *   `limits.pitchMin`..`limits.pitchMax`), so the caller never gets a silently
 *   clamped tilt.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }

    camera.limits.pitchDisabledRadiusScale = null;
    camera.pitch = pitch;

    if (Math.abs(camera.pitch - pitch) > 1e-9) {
        throw new Error(
            `tiltGlobeCamera: pitch ${pitch} was clamped to ${camera.pitch} ` +
                `(pitchMin ${camera.limits.pitchMin}, pitchMax ${camera.limits.pitchMax})`,
        );
    }
}
