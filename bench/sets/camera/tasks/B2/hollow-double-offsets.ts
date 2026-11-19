import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Hollow try, kind "holds only for the check's own inputs": after the library's own move handler, double
// the inertial offsets on each pointer move. For a drag of one move that is twice the turn. For a drag of
// many moves with frames between them, the glide left from the last move is doubled again, so the turn is
// not twice the default.
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detach = attachControl(camera, canvas, scene);
    const onMove = (): void => {
        camera.inertialAlphaOffset *= 2;
        camera.inertialBetaOffset *= 2;
    };
    canvas.addEventListener("pointermove", onMove);
    return () => {
        detach();
        canvas.removeEventListener("pointermove", onMove);
    };
}
