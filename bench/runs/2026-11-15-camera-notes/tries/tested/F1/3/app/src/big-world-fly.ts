import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Every movement key (W/A/S/D, arrows, rise and sink keys) moves the camera
// FAST_MULTIPLIER times as far as the library default while held.
//
// camera.speed is deliberately left untouched: free-camera turning coasting
// depends on speed (see camera-notes.md, note 50), so scaling speed would
// change how far a mouse drag turns the camera. Mouse look therefore keeps
// the library defaults.
const FAST_MULTIPLIER = 20;

const RISE_KEYS = ["Space", "PageUp"] as const;
const SINK_KEYS = ["ShiftLeft", "ShiftRight", "PageDown"] as const;
const PLANAR_KEYS = [
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
] as const;

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // upKeys/downKeys replace the library's defaults, so pass the defaults
    // explicitly to keep rise/sink behaviour unchanged.
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: RISE_KEYS,
        downKeys: SINK_KEYS,
        fastKeys: [...PLANAR_KEYS, ...RISE_KEYS, ...SINK_KEYS],
        fastMultiplier: FAST_MULTIPLIER,
    });
}
