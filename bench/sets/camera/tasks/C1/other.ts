import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Another right answer: switch the library's own wheel zoom off and feed the zoom momentum ourselves,
// at the rate the library gives at the starting distance.
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const startRadius = camera.radius;
    const basePrecision = camera.wheelPrecision;
    const detach = attachControl(camera, canvas, scene);
    camera.wheelPrecision = Infinity;
    const onWheel = (e: WheelEvent): void => {
        camera.inertialRadiusOffset -= (e.deltaY * startRadius) / (basePrecision * 1000);
    };
    canvas.addEventListener("wheel", onWheel);
    return () => {
        detach();
        canvas.removeEventListener("wheel", onWheel);
        camera.wheelPrecision = basePrecision;
    };
}
