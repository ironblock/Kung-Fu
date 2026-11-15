import type { SceneContext } from "@babylonjs/lite";

// Derive the fog config type from the scene itself, since FogConfig is not
// exported from the library's public barrel.
type FogConfig = NonNullable<SceneContext["fog"]>;

// Linear fog: no fog nearer than MIST_START units from the camera, and full
// fog colour from MIST_END units on.
const MIST_START = 30;
const MIST_END = 120;
const MIST_COLOR: [number, number, number] = [0.75, 0.8, 0.88];

export function addMist(scene: SceneContext): void {
    // NOTE: the field names below follow Babylon.js conventions and are NOT
    // verified against the library's FogConfig type (it is not in scene-api.d.ts).
    // The compiler will flag any mismatch against the real type.
    const fog: FogConfig = {
        mode: "linear",
        start: MIST_START,
        end: MIST_END,
        color: MIST_COLOR,
    };
    scene.fog = fog;
}
