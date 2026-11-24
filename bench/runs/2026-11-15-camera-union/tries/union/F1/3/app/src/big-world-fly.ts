import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

/**
 * Keyboard/mouse fly controls for very large worlds.
 *
 * The library's own fly controls do all the work: keys, mouse look, inertia
 * and glide. We leave camera.speed, angularSensitivity and inertia alone, so
 * mouse look is exactly the library's. Each frame, after the library has moved
 * the camera, we look at how far the camera's position moved and add 19 more
 * times that same offset to position and target. The result is that every
 * translation the keys produce (including the coast after a key is released)
 * is 20 times as long. Mouse look only changes the view direction, not the
 * position, so it is never amplified.
 *
 * Assumptions (the library source is not available to check them):
 *  - attachFreeControl moves position and target together on key input, and
 *    changes only target (not position) on mouse drags.
 *  - Per-frame work runs from scene._beforeRender, which is an array the
 *    library pushes to. This field is not in the public type declarations.
 */

const FLY_MULTIPLIER = 20;

type FrameHook = () => void;

interface BeforeRenderHost {
    _beforeRender?: unknown;
}

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Attach the library's controls first, so its per-frame step is pushed
    // before ours and runs before ours in each frame.
    const detachLibrary = attachFreeControl(camera, canvas, scene);

    const hooks = (scene as unknown as BeforeRenderHost)._beforeRender;
    if (!Array.isArray(hooks)) {
        detachLibrary();
        throw new Error("attachBigWorldFly: scene._beforeRender is not an array; cannot install the per-frame step.");
    }

    // Position as it was left at the end of the previous frame.
    let lastX = camera.position.x;
    let lastY = camera.position.y;
    let lastZ = camera.position.z;

    const extraScale = FLY_MULTIPLIER - 1;

    const frameStep: FrameHook = () => {
        const p = camera.position;
        const t = camera.target;

        const dx = p.x - lastX;
        const dy = p.y - lastY;
        const dz = p.z - lastZ;

        if (dx !== 0 || dy !== 0 || dz !== 0) {
            const ex = dx * extraScale;
            const ey = dy * extraScale;
            const ez = dz * extraScale;

            // Shift position and target by the same amount, so the view
            // direction (and therefore mouse look) is unchanged.
            p.x += ex;
            p.y += ey;
            p.z += ez;
            t.x += ex;
            t.y += ey;
            t.z += ez;
        }

        lastX = p.x;
        lastY = p.y;
        lastZ = p.z;
    };

    hooks.push(frameStep);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;

        const index = hooks.indexOf(frameStep);
        if (index >= 0) {
            hooks.splice(index, 1);
        }

        detachLibrary();
    };
}
