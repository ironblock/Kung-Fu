import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// A drag turns the camera this many times as far as the library default.
const ORBIT_SPEED_FACTOR = 2;

// The pointer input divides pixel movement by these sensibility values
// (larger value = slower). Dividing them by the speed factor makes the same
// mouse movement turn the camera twice as far. Drag glide (inertia) is built
// from the same per-pixel offsets, so it is scaled too. The wheel is untouched.
type PointerSensibility = {
    angularSensibilityX: number;
    angularSensibilityY: number;
};

export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    void scene;

    const pointers = camera.inputs.attached.pointers as PointerSensibility | undefined;
    if (!pointers) {
        throw new Error("attachFastOrbit: camera has no pointer input");
    }

    const originalX = pointers.angularSensibilityX;
    const originalY = pointers.angularSensibilityY;
    pointers.angularSensibilityX = originalX / ORBIT_SPEED_FACTOR;
    pointers.angularSensibilityY = originalY / ORBIT_SPEED_FACTOR;

    camera.attachControl(canvas, true);

    let removed = false;
    return () => {
        if (removed) {
            return;
        }
        removed = true;
        camera.detachControl();
        pointers.angularSensibilityX = originalX;
        pointers.angularSensibilityY = originalY;
    };
}
