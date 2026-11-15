import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const isCtrlPrimary = (e: PointerEvent): boolean => e.button === 0 && e.ctrlKey && e.pointerType !== "touch";
    const detach = attachControl(camera, canvas, scene, { shouldHandlePointerDown: (e) => !isCtrlPrimary(e) });

    let panning = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent): void => {
        if (!isCtrlPrimary(e)) {
            return;
        }
        panning = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent): void => {
        if (!panning) {
            return;
        }
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        camera.inertialPanningX += -dx / camera.panningSensibility;
        camera.inertialPanningY += dy / camera.panningSensibility;
    };
    const onUp = (): void => {
        panning = false;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    return () => {
        detach();
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onUp);
    };
}
