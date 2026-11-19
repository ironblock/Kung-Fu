import { createTransformNode } from "@babylonjs/lite";
import type { ArcRotateCamera, TransformNode } from "@babylonjs/lite";

// Orbit a pivot: the camera keeps its own centre, and a pivot node carries it to the picked point.
const pivots = new WeakMap<ArcRotateCamera, TransformNode>();

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    let pivot = pivots.get(camera);
    if (!pivot) {
        pivot = createTransformNode("focus-pivot");
        pivots.set(camera, pivot);
        camera.parent = pivot;
    }
    pivot.position.x = point.x - camera.target.x;
    pivot.position.y = point.y - camera.target.y;
    pivot.position.z = point.z - camera.target.z;
}
