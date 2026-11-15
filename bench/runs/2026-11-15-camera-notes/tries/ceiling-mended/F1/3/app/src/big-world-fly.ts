import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How many times farther than the library default each movement key moves the camera. */
const MOVE_MULTIPLIER = 20;

// The keys attachFreeControl uses, matched by event.code (camera notes 31).
const RISE_KEYS = ["Space", "PageUp"] as const;
const SINK_KEYS = ["ShiftLeft", "ShiftRight", "PageDown"] as const;
const MOVEMENT_KEYS = [
    "KeyW", "KeyA", "KeyS", "KeyD",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    ...RISE_KEYS,
    ...SINK_KEYS,
] as const;

/**
 * Attaches the library's keyboard and mouse fly controls to `camera` on `canvas`,
 * with every movement key moving the camera MOVE_MULTIPLIER times as far.
 *
 * camera.speed is left alone on purpose: turning stops once the decayed turn falls
 * below speed * 0.001, so raising speed would cut mouse-look coasting short and change
 * how far a drag turns the camera. Instead we use the library's own fast-move
 * multiplier, and every movement key counts as a fast key, so whenever one of them is
 * held the movement is multiplied and mouse look keeps the library's default behaviour.
 *
 * Returns a function that removes the controls (canvas listeners and the per-frame step).
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detach = attachConfigurableFreeControl(camera, canvas, scene, {
        // upKeys/downKeys replace the defaults, so pass exactly attachFreeControl's keys.
        upKeys: RISE_KEYS,
        downKeys: SINK_KEYS,
        fastKeys: MOVEMENT_KEYS,
        fastMultiplier: MOVE_MULTIPLIER,
    });

    let attached = true;
    return () => {
        if (!attached) return;
        attached = false;
        detach();
    };
}
