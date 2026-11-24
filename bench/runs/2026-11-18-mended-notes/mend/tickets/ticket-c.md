# Ticket c

## The note at fault
Note 36: "getProjectionMatrix does not apply camera.viewport; pass getEffectiveAspectRatio(camera, width, height) as the aspect to match what is rendered."

## What the library does
File: camera/camera.ts, function getEffectiveAspectRatio, lines 236-239. It is also re-exported from camera/viewport.ts line 2 and from index.ts.
v = camera?.viewport. It returns (targetWidth / targetHeight) * (v ? v.width / v.height : 1). It reads the raw width and height fields of the normalised viewport. It does not call resolveCameraViewport, does not clamp any edge, does not use x or y, and does not round to pixels. With no camera or no viewport it returns the plain target ratio.
Because of this, when the viewport edges lie inside [0,1] the value equals the ratio of the pixel rectangle that resolveCameraViewport gives, up to pixel rounding. When an edge lies outside [0,1], resolveCameraViewport shrinks the rectangle (viewport.ts 20-31) but getEffectiveAspectRatio does not, so the two disagree.

Where it is used: the render passes set their viewport with _applyCameraViewport (camera.ts 242-253; called from frame-graph/render-task-base.ts 566 and frame-graph/geometry-renderer-task.ts 897). That helper also uses the raw fields with floor and ceil and no clamp01, and does nothing when the camera has no viewport. The projection in the render code is built with getEffectiveAspectRatio. resolveCameraViewport is used elsewhere, by picking (picking/gpu-picker.ts 328) and gizmo dragging (gizmo/pointer-drag.ts 568).

## How the note misleads
The note gives no formula, and does not say that the value can differ from the shape of the rectangle resolveCameraViewport returns. A reader may take it to be the aspect of that clamped, pixel-rounded rectangle. What is true: the function is a formula on the raw viewport fields, target ratio times viewport width over viewport height, with nothing clamped or rounded. It agrees with the unclamped rectangle the render passes set, and with resolveCameraViewport's rectangle only where no clamping or rounding changes the shape.
