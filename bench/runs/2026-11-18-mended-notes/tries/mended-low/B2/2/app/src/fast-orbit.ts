import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / 2;
    const dispose = attachControl(camera, canvas, scene);
    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        camera.angularSensibility = originalSensibility;
        dispose();
    };
}
