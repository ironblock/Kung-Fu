import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, AttachControlOptions, SceneContext } from "@babylonjs/lite";

// Another right answer: the controls read their button mapping on every press, so pick it per press.
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const mappings: NonNullable<AttachControlOptions["pointerMappings"]> = { primaryButton: "rotate", secondaryButton: "pan" };
    const choose = (e: PointerEvent): void => {
        mappings.primaryButton = e.ctrlKey ? "pan" : "rotate";
    };
    canvas.addEventListener("pointerdown", choose); // before the library's own pointerdown listener
    const detach = attachControl(camera, canvas, scene, { pointerMappings: mappings });
    return () => {
        detach();
        canvas.removeEventListener("pointerdown", choose);
    };
}
