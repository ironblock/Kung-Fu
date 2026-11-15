import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial camera to `pitch` radians (0 = looking straight down,
 * increasing toward the horizon) without changing zoom, heading or centre.
 *
 * UNVERIFIED: the camera ledger (camera-ledger.toml) says nothing about the
 * geospatial camera's pitch, its limits, or how zoom affects pitch. The
 * property names below follow the full Babylon.js GeospatialCamera
 * (`pitch`, `limits.pitchMin`, `limits.pitchMax`,
 * `limits.pitchDisabledRadiusScale`) and have not been checked against
 * Babylon Lite 1.39.0.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const cam = camera as unknown as {
        pitch: number;
        limits?: {
            pitchMin?: number;
            pitchMax?: number;
            pitchDisabledRadiusScale?: unknown;
        };
    };

    const limits = cam.limits;
    if (limits) {
        // Make sure the requested tilt is inside the pitch range.
        if (typeof limits.pitchMin === "number" && limits.pitchMin > pitch) {
            limits.pitchMin = pitch;
        }
        if (typeof limits.pitchMax === "number" && limits.pitchMax < pitch) {
            limits.pitchMax = pitch;
        }
        // In Babylon.js, pitch is forced toward 0 when the camera is far from
        // the planet (a newly created camera starts fully zoomed out). Turn
        // that off so the tilt holds at every zoom, now and after later zooms.
        const scale = limits.pitchDisabledRadiusScale as
            | { x: number; y: number }
            | number
            | undefined;
        if (typeof scale === "number") {
            limits.pitchDisabledRadiusScale = Number.POSITIVE_INFINITY;
        } else if (scale && typeof scale === "object") {
            scale.x = Number.POSITIVE_INFINITY;
            scale.y = Number.POSITIVE_INFINITY;
        }
    }

    // Only pitch is written: radius (zoom), yaw (heading) and centre are left alone.
    cam.pitch = pitch;
}
