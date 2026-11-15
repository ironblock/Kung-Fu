import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const startRadius = camera.radius;
    const basePrecision = camera.wheelPrecision;
    // Registered before the library's wheel listener, so it runs first on every wheel event.
    const onWheel = (): void => {
        camera.wheelPrecision = (basePrecision * camera.radius) / startRadius;
    };
    canvas.addEventListener("wheel", onWheel);
    const detach = attachControl(camera, canvas, scene);
    return () => {
        detach();
        canvas.removeEventListener("wheel", onWheel);
        camera.wheelPrecision = basePrecision;
    };
}
