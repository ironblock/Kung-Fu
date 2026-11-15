import type { SceneContext } from "@babylonjs/lite";
import { setFog } from "@babylonjs/lite";

// Linear distance fog for the harbour scene's morning mist.
// Nothing is fogged nearer than FOG_START units from the camera; everything
// at FOG_END units or beyond is fully the fog colour.
const FOG_START = 30;
const FOG_END = 120;
const FOG_COLOR: [number, number, number] = [0.75, 0.8, 0.88];

export function addMist(scene: SceneContext): void {
    // Uses the setFog API from the provided declarations. The FogConfig field
    // names (mode/start/end/color) are NOT in those declarations (FogConfig is
    // defined in material/standard/standard-material.d.ts, which is missing) and
    // are unverified. Also unverified: that setFog is exported from the package root.
    setFog(scene, {
        mode: "linear",
        start: FOG_START,
        end: FOG_END,
        color: FOG_COLOR,
    });
}
