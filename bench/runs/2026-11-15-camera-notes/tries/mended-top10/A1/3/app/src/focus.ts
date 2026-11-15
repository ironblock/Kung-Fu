import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Make an arc-rotate camera orbit `point`.
 *
 * alpha, beta and radius are left untouched, so the camera keeps its angles and
 * distance and moves by the same offset as the target does (point - old target).
 * The target is written in place, because replacing the target object leaves
 * worldMatrix stale (see camera-notes.md, item 7).
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Drop pending drag/wheel/pan inertia. Otherwise it would be applied on the
    // next render and move the camera off `point`.
    camera.inertialAlphaOffset = 0;
    camera.inertialBetaOffset = 0;
    camera.inertialRadiusOffset = 0;
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;
}
