import type { GeospatialCamera } from "@babylonjs/lite";

// Hold a tilt on the camera without loosening its limits for everyone else: whenever the app zooms,
// lift the fade only for the length of that change, and put the tilt back.
const held = new WeakMap<GeospatialCamera, number>();

function withFadeOff(camera: GeospatialCamera, f: () => void): void {
    const saved = camera.limits.pitchDisabledRadiusScale;
    camera.limits.pitchDisabledRadiusScale = null;
    try { f(); } finally { camera.limits.pitchDisabledRadiusScale = saved; }
}

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!held.has(camera)) {
        const proto = Object.getOwnPropertyDescriptor(camera, "radius")!;
        Object.defineProperty(camera, "radius", {
            configurable: true,
            enumerable: true,
            get: () => proto.get!.call(camera),
            set: (v: number) => withFadeOff(camera, () => {
                proto.set!.call(camera, v);
                const p = held.get(camera)!;
                (camera as any).pitch = p === camera.pitch ? p + 1e-12 : p;
                (camera as any).pitch = p;
            }),
        });
    }
    held.set(camera, pitch);
    withFadeOff(camera, () => { camera.pitch = pitch; });
}
