import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

const FAST_ORBIT_DRAG_MULTIPLIER = 2;
const FAST_ORBIT_SENSIBILITY_FACTOR = 1 / FAST_ORBIT_DRAG_MULTIPLIER;

interface FastOrbitState {
    originalAngularSensibility: number;
    activeCount: number;
}

const fastOrbitStates = new WeakMap<ArcRotateCamera, FastOrbitState>();

function fastSensibility(value: number): number {
    return Number.isFinite(value) ? value * FAST_ORBIT_SENSIBILITY_FACTOR : value;
}

function applyFastSensibility(camera: ArcRotateCamera, state: FastOrbitState): void {
    camera.angularSensibility = fastSensibility(state.originalAngularSensibility);
}

function releaseFastOrbit(camera: ArcRotateCamera, state: FastOrbitState): void {
    state.activeCount -= 1;

    if (state.activeCount <= 0) {
        camera.angularSensibility = state.originalAngularSensibility;
        fastOrbitStates.delete(camera);
    } else {
        applyFastSensibility(camera, state);
    }
}

export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    let state = fastOrbitStates.get(camera);

    if (!state) {
        state = {
            originalAngularSensibility: camera.angularSensibility,
            activeCount: 0,
        };
        fastOrbitStates.set(camera, state);
    }

    state.activeCount += 1;

    let disposeControls: () => void = () => {};

    try {
        applyFastSensibility(camera, state);

        const cleanup = attachControl(camera, canvas, scene, {
            keyboard: false,
        });

        disposeControls = typeof cleanup === "function" ? cleanup : () => {};

        // Keep the camera fast even if attachControl captured or restored the
        // sensitivity internally during attachment.
        applyFastSensibility(camera, state);
    } catch (error) {
        releaseFastOrbit(camera, state);
        throw error;
    }

    let disposed = false;

    return () => {
        if (disposed) {
            return;
        }

        disposed = true;

        try {
            disposeControls();
        } finally {
            releaseFastOrbit(camera, state);
        }
    };
}
