import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** attachControl keeps wheel zoom from taking the radius below this. */
const WHEEL_MIN_RADIUS = 0.01;

/** Whether a zoom offset dies away under this inertia, coasting offset / (1 - inertia) in all. */
function settles(inertia: number): boolean {
    return inertia >= 0 && inertia < 1;
}

/**
 * Gives `camera` the library's mouse and touch controls on `canvas`: drag to orbit,
 * right-drag to pan, wheel and pinch to zoom. The library's wheel moves by a share of
 * the current radius. Here every notch moves the camera the same distance toward or
 * away from its target instead: the distance a notch gives with the default controls
 * on the camera as it is now. Returns a function that removes the controls.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // What the default wheel distance depends on, as it is now.
    const startRadius = camera.radius;
    const startWheelPrecision = camera.wheelPrecision;
    const startInertia = camera.inertia;

    const onWheel = (event: WheelEvent): void => {
        event.preventDefault();
        const deltaY = event.deltaY;
        if (!deltaY) return;

        // attachControl hears this event too and does
        //     inertialRadiusOffset -= deltaY * radius / (wheelPrecision * 1000)
        // which its frame hook then spends as radius -= offset, offset *= inertia.
        // Give its radius-proportional step back...
        const libraryStep = (deltaY * camera.radius) / (camera.wheelPrecision * 1000);

        // ...and take the step it would have taken at the start instead, rescaled if the
        // inertia has changed since, so that the coast still adds up to the same distance.
        const inertia = camera.inertia;
        let steadyStep = (deltaY * startRadius) / (startWheelPrecision * 1000);
        if (settles(inertia) && settles(startInertia)) {
            steadyStep *= (1 - inertia) / (1 - startInertia);
        }

        // Near the target a zoom-in notch can be longer than the way left to the floor.
        // Ask only for what fits: an excess would be soaked up at the floor while it
        // coasted and would eat into the zoom-out notches that follow.
        if (steadyStep < 0 && settles(inertia)) {
            const pending = camera.inertialRadiusOffset;
            const fits = Math.max(pending, (camera.radius - WHEEL_MIN_RADIUS) * (1 - inertia));
            steadyStep = pending - Math.min(pending - steadyStep, fits);
        }

        camera.inertialRadiusOffset += libraryStep - steadyStep;
    };

    // Added before attachControl's own wheel listener, and capturing, so it runs first and
    // the offset read above does not yet hold the library's step. (The give-back itself
    // works in either order.)
    const wheelOptions: AddEventListenerOptions = { capture: true, passive: false };
    canvas.addEventListener("wheel", onWheel, wheelOptions);

    let detachLibrary: () => void;
    try {
        detachLibrary = attachControl(camera, canvas, scene, {
            pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
            keyboard: false,
        });
    } catch (error) {
        canvas.removeEventListener("wheel", onWheel, wheelOptions);
        throw error;
    }

    let attached = true;
    return () => {
        if (!attached) return;
        attached = false;
        canvas.removeEventListener("wheel", onWheel, wheelOptions);
        // Removes the library's canvas listeners and its hook on the scene's frames.
        detachLibrary();
    };
}
