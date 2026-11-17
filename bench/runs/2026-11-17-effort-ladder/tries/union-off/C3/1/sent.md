I'm working on a small viewer app in /Users/Shared/kf/boxes/47842e/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /Users/Shared/kf/boxes/47842e/app/camera-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/47842e/app/camera-notes.md. Read them first.

# Holding two arrow keys

Our viewer uses the library's own arrow-key control for the orbit (arc-rotate) camera, `keyboard: true` with default settings, scene running. QA says it behaves differently with two arrow keys held. Before deciding whether to tune it, I need to know, keys held for 60 frames, nothing else touching the camera:

1. Holding Right and Up together: how far does `alpha` turn, as a fraction of how far it turns with Right alone?
2. Holding Alt with Right and Up together: the same fraction, against Alt with Right alone.
3. Holding Ctrl with Right and Up together: does the orbit target move the same distance as with Ctrl and Right alone?

Please write the answer to `notes/arrow-keys.json` in the app, in this shape, fractions to two decimals:

```json
{ "rotateFraction": 0.0, "altFraction": 0.0, "ctrlSameDistance": true or false }
```

Please keep every change inside /Users/Shared/kf/boxes/47842e/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.

Here are the files in the app that matter:

FILE: app/camera-api.d.ts
```
// arc-rotate-controls.d.ts
import type { ArcRotateCamera } from "./arc-rotate.js";
import type { SceneContext } from "../scene/scene.js";
import type { ArcRotateKeyboardOptions } from "./arc-rotate-keyboard-controls.js";
export type ArcRotatePointerAction = "rotate" | "pan";
export interface ArcRotatePointerMappings {
    primaryButton?: ArcRotatePointerAction;
    secondaryButton?: ArcRotatePointerAction;
}
export interface AttachControlOptions {
    pointerMappings?: ArcRotatePointerMappings;
    keyboard?: boolean | ArcRotateKeyboardOptions;
    shouldHandlePointerDown?: (event: PointerEvent) => boolean;
    isExternalDragActive?: () => boolean;
    isExternalPickPending?: () => boolean;
}
export interface ArcRotateCameraLimits {
    lowerAlphaLimit?: number;
    upperAlphaLimit?: number;
    lowerBetaLimit?: number;
    upperBetaLimit?: number;
    lowerRadiusLimit?: number;
    upperRadiusLimit?: number;
}
type ArcRotateKeyboardAttachment = readonly [applyInput: () => void, dispose: () => void];
type ArcRotateKeyboardFactory = (camera: ArcRotateCamera, canvas: HTMLCanvasElement, keyboard: boolean | ArcRotateKeyboardOptions | undefined) => ArcRotateKeyboardAttachment | undefined;
export declare function _installArcRotateKeyboardControls(factory: ArcRotateKeyboardFactory): void;
export declare function setCameraLimits(camera: ArcRotateCamera, limits: ArcRotateCameraLimits, scene?: SceneContext): () => void;
export declare function attachControl(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene?: SceneContext, options?: AttachControlOptions): () => void;
export {};
// arc-rotate-interpolate.d.ts
import type { Vec3 } from "../math/types.js";
import type { ArcRotateCamera } from "./arc-rotate.js";
import type { SceneContext } from "../scene/scene-core.js";
export interface ArcRotateInterpolationGoal {
    alpha?: number;
    beta?: number;
    radius?: number;
    target?: Vec3;
}
export interface ArcRotateInterpolationOptions {
    interpolationFactor?: number;
}
export declare function interpolateArcRotateCamera(camera: ArcRotateCamera, scene: SceneContext, goal: ArcRotateInterpolationGoal, signal?: AbortSignal, options?: ArcRotateInterpolationOptions): Promise<void>;
// arc-rotate-keyboard-controls.d.ts
export interface ArcRotateKeyboardMappings {
    left?: readonly string[];
    right?: readonly string[];
    up?: readonly string[];
    down?: readonly string[];
}
export interface ArcRotateKeyboardOptions {
    keys?: ArcRotateKeyboardMappings;
    preventDefault?: boolean;
    angularSensitivity?: number;
    panningSensitivity?: number;
    zoomingSensitivity?: number;
}
export declare function enableArcRotateKeyboardControls(): void;
// arc-rotate.d.ts
import type { Camera, NormalizedViewport } from "./camera.js";
import type { Vec3, Mat4 } from "../math/types.js";
import type { IWorldMatrixProvider, IParentable } from "../scene/parentable.js";
import type { SceneNode } from "../scene/scene-node.js";
export interface ArcRotateCamera extends Camera, IWorldMatrixProvider, IParentable {
    alpha: number;
    beta: number;
    radius: number;
    target: Vec3;
    fov: number;
    nearPlane: number;
    farPlane: number;
    viewport?: NormalizedViewport;
    children: SceneNode[];
    inertia: number;
    panningInertia: number;
    angularSensibility: number;
    panningSensibility: number;
    wheelPrecision: number;
    inertialAlphaOffset: number;
    inertialBetaOffset: number;
    inertialRadiusOffset: number;
    inertialPanningX: number;
    inertialPanningY: number;
    lowerAlphaLimit?: number;
    upperAlphaLimit?: number;
    lowerBetaLimit?: number;
    upperBetaLimit?: number;
    lowerRadiusLimit?: number;
    upperRadiusLimit?: number;
    _clampToLimits?: () => void;
    parent: IWorldMatrixProvider | null;
    readonly worldMatrix: Mat4;
    readonly worldMatrixVersion: number;
}
export declare function createArcRotateCamera(alpha: number, beta: number, radius: number, target: Vec3): ArcRotateCamera;
// banked-free-camera.d.ts
import type { Vec3 } from "../math/types.js";
import { ObservableVec3 } from "../math/observable-vec3.js";
import { type FreeCamera } from "./free-camera.js";
export interface BankedFreeCamera extends FreeCamera {
    readonly upVector: ObservableVec3;
}
export declare function createBankedFreeCamera(position: Vec3, target: Vec3, up?: Vec3): BankedFreeCamera;
// camera.d.ts
import type { Vec3, Mat4 } from "../math/types.js";
import type { SceneNode } from "../scene/scene-node.js";
import type { Mat4Storage } from "../math/types.js";
import type { OrthographicBounds } from "./orthographic.js";
export interface Camera {
    name?: string;
    fov: number;
    nearPlane: number;
    farPlane: number;
    viewport?: NormalizedViewport;
    children: SceneNode[];
    readonly worldMatrix: Mat4;
    readonly worldMatrixVersion: number;
    _viewCache: Mat4Storage;
    _viewVer?: number;
    _projCache: Mat4Storage;
    _projVer?: number;
    _projAspect?: number;
    _vpCache: Mat4Storage;
    _vpVer?: number;
    _vpAspect?: number;
    _useFloatingOrigin?: boolean;
    _projRev?: number;
    _projFov?: number;
    _projNear?: number;
    _projFar?: number;
    ortho?: OrthographicBounds | null;
}
export interface NormalizedViewport {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare function getViewMatrix(camera: Camera): Mat4;
export declare function _installOrthographicProjector(write: (camera: Camera, aspectRatio: number, out: Mat4Storage) => void): void;
export declare function _cameraChangeKey(camera: Camera): number;
export declare function getProjectionMatrix(camera: Camera, aspectRatio: number): Mat4;
export declare function getViewProjectionMatrix(camera: Camera, aspectRatio: number): Mat4;
export declare function getCameraPosition(camera: Camera): Vec3;
export declare function getEffectiveAspectRatio(camera: Camera | null | undefined, targetWidth: number, targetHeight: number): number;
export declare function _applyCameraViewport(pass: GPURenderPassEncoder, camera: Camera | null | undefined, targetWidth: number, targetHeight: number): void;
// configurable-free-camera-controls.d.ts
import type { FreeCamera } from "./free-camera.js";
import type { SceneContext } from "../scene/scene.js";
export interface FreeCameraControlOptions {
    upKeys?: readonly string[];
    downKeys?: readonly string[];
    fastKeys?: readonly string[];
    fastMultiplier?: number;
}
export declare function attachConfigurableFreeControl(camera: FreeCamera, canvas: HTMLCanvasElement, scene?: SceneContext, options?: FreeCameraControlOptions): () => void;
// free-camera-controls.d.ts
import type { FreeCamera } from "./free-camera.js";
import type { SceneContext } from "../scene/scene.js";
export declare function attachFreeControl(camera: FreeCamera, canvas: HTMLCanvasElement, scene?: SceneContext): () => void;
// free-camera.d.ts
import type { Camera } from "./camera.js";
import type { Vec3, Mat4 } from "../math/types.js";
import type { IWorldMatrixProvider, IParentable } from "../scene/parentable.js";
import { ObservableVec3 } from "../math/observable-vec3.js";
export interface FreeCamera extends Camera, IWorldMatrixProvider, IParentable {
    readonly position: ObservableVec3;
    readonly target: ObservableVec3;
    speed: number;
    angularSensitivity: number;
    inertia: number;
    parent: IWorldMatrixProvider | null;
    readonly worldMatrix: Mat4;
    readonly worldMatrixVersion: number;
    _yaw: number;
    _pitch: number;
}
export declare function createFreeCamera(position: Vec3, target: Vec3): FreeCamera;
export declare function _createFreeCamera(position: Vec3, target: Vec3, up: Vec3): FreeCamera;
// geospatial-camera-controls.d.ts
import type { GeospatialCamera } from "./geospatial-camera.js";
import type { SceneContext } from "../scene/scene-core.js";
export interface GeospatialControlOptions {
    zoomToCursor?: boolean;
    checkCollisions?: boolean;
    doubleTapAnimationDurationMs?: number;
    doubleTapEasingFunction?: ((g: number) => number) | null;
}
export declare function attachGeospatialControls(camera: GeospatialCamera, canvas: HTMLCanvasElement, scene: SceneContext, options?: GeospatialControlOptions): () => void;
// geospatial-camera-fly.d.ts
import type { GeospatialCamera } from "./geospatial-camera.js";
import type { SceneContext } from "./../scene/scene-core.js";
import type { Vec3 } from "../math/types.js";
export interface GeospatialFlyOptions {
    yaw?: number;
    pitch?: number;
    radius?: number;
    center?: Vec3;
    durationMs?: number;
    centerHopScale?: number;
    ease?: (g: number) => number;
}
export declare function flyGeospatialCameraToAsync(camera: GeospatialCamera, scene: SceneContext, options: GeospatialFlyOptions): Promise<void>;
// geospatial-camera.d.ts
import type { Camera, NormalizedViewport } from "./camera.js";
import type { Vec3, Mat4 } from "../math/types.js";
import type { SceneNode } from "../scene/scene-node.js";
import type { IWorldMatrixProvider, IParentable } from "../scene/parentable.js";
import type { GeospatialLimits } from "./geospatial-limits.js";
export interface GeospatialCameraOptions {
    planetRadius: number;
}
export interface GeospatialOrientation {
    yaw?: number;
    pitch?: number;
    radius?: number;
    center?: Vec3;
}
export interface GeospatialCamera extends Camera, IWorldMatrixProvider, IParentable {
    center: Vec3;
    yaw: number;
    pitch: number;
    radius: number;
    limits: GeospatialLimits;
    readonly position: Vec3;
    readonly upVector: Vec3;
    fov: number;
    nearPlane: number;
    farPlane: number;
    viewport?: NormalizedViewport;
    children: SceneNode[];
    parent: IWorldMatrixProvider | null;
    readonly worldMatrix: Mat4;
    readonly worldMatrixVersion: number;
    _lookAt: Vec3;
    _setOrientation: (yaw: number, pitch: number, radius: number, center: Vec3) => void;
    _cancelFly?: () => void;
}
export declare function normalizeRadians(angle: number): number;
export declare function computeLocalBasis(worldPos: Vec3, refEast: Vec3, refNorth: Vec3, refUp: Vec3): void;
export declare function computeLookAtFromYawPitch(yaw: number, pitch: number, center: Vec3, result: Vec3): Vec3;
export declare function computeYawPitchFromLookAt(lookAt: Vec3, center: Vec3, currentYaw: number, result: {
    x: number;
    y: number;
}): {
    x: number;
    y: number;
};
export declare function clampCenterFromPoles(center: Vec3): Vec3;
export declare function setGeospatialOrientation(camera: GeospatialCamera, orientation: GeospatialOrientation): void;
export declare function createGeospatialCamera(options: GeospatialCameraOptions): GeospatialCamera;
// geospatial-limits.d.ts
export interface GeospatialLimits {
    planetRadius: number;
    radiusMin: number;
    radiusMax: number;
    pitchMin: number;
    pitchMax: number;
    pitchDisabledRadiusScale: {
        x: number;
        y: number;
    } | null;
    yawMin: number;
    yawMax: number;
}
export declare const GEO_EPSILON = 0.001;
export declare function createGeospatialLimits(planetRadius: number): GeospatialLimits;
export declare function getEffectivePitchMax(limits: GeospatialLimits, currentRadius: number): number;
export declare function clampZoomDistance(limits: GeospatialLimits, zoomDistance: number, currentRadius: number, distanceToTarget?: number): number;
// geospatial-movement.d.ts
import type { Vec3 } from "../math/types.js";
export declare const REFERENCE_FRAME_RATE = 60;
export declare function frameDecay(inertia: number, effMs: number, referenceFrameMs?: number): number;
export declare function integrateInertialVelocity(velocity: number, pixelDelta: number, inertia: number, effMs: number, hasActiveInput: boolean): number;
export declare function computePanSpeedMultiplier(center: Vec3, position: Vec3): number;
export declare function computeZoomSpeedMultiplier(distanceToTarget: number): number;
// orthographic.d.ts
import type { Camera } from "./camera.js";
export interface OrthographicBounds {
    halfHeight: number;
    left: number | null;
    right: number | null;
    bottom: number | null;
    top: number | null;
}
export interface OrthographicBoundsOptions {
    halfHeight?: number;
    left?: number | null;
    right?: number | null;
    bottom?: number | null;
    top?: number | null;
}
export declare function enableOrthographicCamera(camera: Camera, bounds?: OrthographicBoundsOptions): OrthographicBounds;
export declare function disableOrthographicCamera(camera: Camera): void;
// viewport.d.ts
import type { Camera, NormalizedViewport } from "./camera.js";
export { getEffectiveAspectRatio } from "./camera.js";
export interface PixelViewport {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare const FULL_VIEWPORT: NormalizedViewport;
export declare function resolveCameraViewport(camera: Camera | null | undefined, targetWidth: number, targetHeight: number): PixelViewport;
// world-to-screen.d.ts
import type { Mat4, Vec3 } from "../math/types.js";
import type { PixelViewport } from "./viewport.js";
export interface ScreenProjectionOptions {
    viewport: PixelViewport;
    backingWidth: number;
    backingHeight: number;
    worldOrigin?: Vec3;
    cssWidth?: number;
    cssHeight?: number;
}
export interface ScreenProjectionResult extends Vec3 {
    cssX: number;
    cssY: number;
    clipW: number;
    behindCamera: boolean;
    clipped: boolean;
    offscreen: boolean;
}
export declare function projectPointToViewportToRef<T extends Vec3>(point: Vec3, world: Mat4, transform: Mat4, viewport: PixelViewport, result: T): T;
export declare function projectWorldToScreenToRef<T extends ScreenProjectionResult>(point: Vec3, view: Mat4, viewProjection: Mat4, options: ScreenProjectionOptions, result: T): T;
export declare function projectWorldToScreen(point: Vec3, view: Mat4, viewProjection: Mat4, options: ScreenProjectionOptions): ScreenProjectionResult;
```

FILE: app/camera-notes.md
```
# Notes on how the camera code of Babylon Lite 1.39.0 behaves

1. attachControl without a scene moves nothing on drags or wheel: they only add to inertialAlphaOffset, inertialRadiusOffset and the like, applied by the hook it pushes on scene._beforeRender. A two-finger pinch still writes radius at once.
2. Hand-set lower/upper alpha/beta/radius limit fields clamp no write until setCameraLimits runs (interpolateArcRotateCamera clamps its goals anyway). After it each write is clamped at once; the call clamps the pose and zeroes that offset.
3. Assigning a new object to ArcRotateCamera.target does not mark the camera dirty, nor do writes to it. It shows up at the next alpha/beta/radius write that changes the value (cam.radius = cam.radius does not). Write target.x/y/z in place.
4. createArcRotateCamera sets nearPlane 0.1, farPlane 1000 and panningSensibility 50 (fov 0.8, angularSensibility 1000, wheelPrecision 3, inertia and panningInertia 0.9).
5. attachFreeControl aims from FreeCamera._yaw/_pitch, set only at creation and by its own drags. A target set by hand is replaced on the next key move or drag, with target placed 1 unit ahead of position.
6. interpolateArcRotateCamera rejects its promise if alpha, beta, radius or target change by anything else between its frames, a second call on the camera included; a change before its first frame becomes the start. That frame zeroes inertia.
7. GeospatialCamera clamps pitch against the radius it is applied with: from 4*planetRadius pitch is forced to 0.001, falling linearly from 2R; the start radius is 4R (or 10 if larger). Set radius first, or both in setGeospatialOrientation.
8. An ArcRotate camera has no beta limits by default; attachControl's frame step clamps beta to [0.01, PI-0.01], but only on frames where inertialAlphaOffset or inertialBetaOffset is non-zero. beta = 0 written directly stays 0.
9. attachControl's keyboard: true is ignored unless enableArcRotateKeyboardControls() ran first. Keys are heard on the canvas (tabIndex made 0 if no tabindex attribute); held arrows add 1/angularSensitivity (default 100) per frame, normalised.
10. flyGeospatialCameraToAsync resolves, never rejects, when cut short by a newer flight or by input through attachGeospatialControls; the camera stays where the flight stopped.
11. Writing GeospatialCamera.center.x/y/z in place moves no eye at once, but the next yaw/pitch/radius write orbits the changed center. Assign a whole new object to center (or use setGeospatialOrientation) to re-orbit at once.
12. enableOrthographicCamera defaults halfHeight to 1; null planes are +-halfHeight vertically and +-halfHeight*aspect horizontally, fov is ignored, and writes to the returned bounds take effect on the next getProjectionMatrix.
13. resolveCameraViewport counts camera.viewport.y from the bottom but returns y from the top: {x:0,y:0,width:0.5,height:0.5} on 800x600 gives {x:0,y:300,width:400,height:300}. Edges are clamped to the canvas: {x:-0.5,width:1} gives width 400.
14. attachControl acts only on button 0 (rotate) and 2 (pan): a middle-button drag does nothing and Ctrl+left still rotates. pointerMappings apply to mouse and pen; a touch pointer always rotates.
15. disposeScene does not remove the canvas listeners added by attachControl; only the function attachControl returns does.
16. In attachConfigurableFreeControl, upKeys and downKeys replace the defaults (upKeys ['KeyE'] makes Space do nothing). fastMultiplier defaults to 1, so fastKeys alone do not speed anything up.
17. Projection is reverse-Z: getProjectionMatrix maps nearPlane to depth 1 and farPlane to depth 0, so the z of projectWorldToScreen is 1 at the near plane and 0 at the far plane.
18. attachControl's wheel does inertialRadiusOffset -= deltaY*radius/(wheelPrecision*1000) and each frame radius -= that offset, so positive deltaY zooms out, in steps proportional to radius; radius never goes below 0.01.
19. A right-drag of dx px adds -dx/panningSensibility to inertialPanningX; each frame the target moves inertialPanningX*radius/1000 along the camera's right vector, then the offset is multiplied by panningInertia.
20. createGeospatialCamera's limits default to radiusMin 10 (in world units, whatever the planet size) and radiusMax 4*planetRadius; the camera has nearPlane 1 and farPlane 16*planetRadius.
21. attachGeospatialControls pans the centre on left drag and turns yaw on right drag; it listens for keys on window, not on the canvas, and leaves the canvas tabIndex alone.
22. attachControl's two-finger pinch writes radius directly, scaling it by start distance / current distance, before any frame runs and with no inertial offset.
23. Calling enableOrthographicCamera again replaces camera.ortho with fresh bounds; the old object no longer drives the projection. disableOrthographicCamera sets camera.ortho to null.
24. projectWorldToScreen: a point behind the camera has behindCamera, offscreen and clipped true; one past farPlane but in frame has only clipped; x/y are never clamped, so an off-side point keeps an x beyond the viewport.
25. In attachFreeControl, KeyW and ArrowUp both move along the look direction including pitch, Space moves straight up world Y, and a middle-button drag turns the camera, as a left drag does.
26. projectWorldToScreen throws RangeError when the viewport width/height or backingWidth/backingHeight is not positive, or when only one of cssWidth/cssHeight is given.
27. Each frame a held move key adds speed * max(deltaMs, 1) / sqrt(100000) to the free camera's move, which then decays by inertia, so the distance per frame scales with deltaMs and a 0 ms frame moves as 1 ms does.
28. createFreeCamera has no upVector and always builds its basis on world +Y; only createBankedFreeCamera has upVector, and writing it rolls the camera.
29. setCameraLimits clamps the current pose at once; from then on each write that changes alpha/beta/radius is clamped in the same statement, using the limit fields as they are then, and zeroes that inertial offset only if it hit a bound.
30. attachFreeControl and attachConfigurableFreeControl given no scene never move the camera: all motion is applied in their _beforeRender step.
31. projectWorldToScreen returns x/y in backing pixels, cssX/cssY scaled by cssWidth/backingWidth, z as 0..1 depth, and offscreen x/y unclamped. It throws RangeError on a zero-size viewport or a cssWidth without cssHeight.
32. Each frame interpolateArcRotateCamera moves 1 - 2^(-dt/interpolationFactor) of the remaining way, dt being the frame delta in seconds (a delta <= 0 counts as 1/60 s) and the factor 0.1 by default; a factor <= 0 snaps on the first frame.
33. setCameraLimits writes only the fields present in its argument, so calls add up; a field passed as undefined removes that bound.
34. Each frame attachControl adds the whole alpha/beta offset (subtracts inertialRadiusOffset from radius), then multiplies it by inertia; pan offsets decay by panningInertia instead, so inertia 0 stops a drag or zoom at once but not a pan.
35. getViewMatrix, getProjectionMatrix and getViewProjectionMatrix return the camera's own cache object, overwritten in place on the next change (or other aspect); copy it to keep a value.
36. getProjectionMatrix does not apply camera.viewport; pass getEffectiveAspectRatio(camera, width, height) as the aspect to match what is rendered.
37. A change to GeospatialCamera.limits applies at the next yaw/pitch/radius write that changes the value, or at any center assignment (cam.center = cam.center works). limits.pitchDisabledRadiusScale = null allows full pitch at any radius.
38. attachGeospatialControls: a left drag pans the center; a drag with any other button rotates, yaw += dx*PI/500 with no coasting.
39. Arc-rotate keys: ArrowUp lowers beta, ArrowRight raises alpha; Ctrl+arrows pan (inertialPanningX/Y); with Alt, a held ArrowUp adds 1/zoomingSensitivity (default 25) to inertialRadiusOffset each frame, so radius falls faster each frame.
40. attachFreeControl turns on a drag with button 0, 1 or 2 (right drag turns right, down looks down); a drag adds dx/angularSensitivity to a turn velocity applied each frame, then times inertia, so it coasts. Pitch is clamped to +-(PI/2-0.01).
41. flyGeospatialCameraToAsync times the flight from the frame deltas given to _beforeRender (durationMs default 1000; a delta <= 0 counts as 1000/60 ms) and turns yaw the short way round (3 to -3 passes through PI).
42. createFreeCamera starts with fov 0.8, nearPlane 1 and farPlane 10000, unlike createArcRotateCamera's 0.1 and 1000.
43. Assigning camera.ortho by hand is ignored (perspective is used) until enableOrthographicCamera has been called at least once.
44. createGeospatialCamera starts at center (R,0,0), yaw 0, pitch 0.001, radius 4R, nearPlane 1, farPlane 16R; limits radiusMin 10, radiusMax 4R, pitchMax PI/2-0.01 clamp radius writes. If 4R < 10 it starts at 10 and writes above 10 give 4R.
45. With default limits a GeospatialCamera's pitch is forced to pitchMin (0.001) at radius >= 4*planetRadius and is free only at <= 2*planetRadius. The camera starts at radius 4*planetRadius, so a pitch set there stays ~0.
46. interpolateArcRotateCamera clamps alpha/beta/radius goals to the camera's limits and resolves at the clamped value. It moves nothing until a scene frame runs.
47. Assigning camera.ortho = null by hand keeps the cached orthographic matrix, and the rebuild after a fov write still has the ortho p[12], p[13] and p[15]=1; disableOrthographicCamera clears those and switches at once.
48. attachGeospatialControls zooms by the sign of wheel deltaY only, and the zoom coasts over later frames, while a right-drag rotation stops on the first frame without input.
49. In attachGeospatialControls pan and rotation have zero inertia and stop with the input; only zoom coasts (inertia 0.9, frame-rate normalised). Speeds and inertias are fixed constants, not options.
50. A wheel event with nonzero deltaY heard by attachGeospatialControls during a flyGeospatialCameraToAsync ends the fly on the next frame and resolves its promise; one with deltaY 0 (a sideways scroll) does not.
51. A geospatial center written with spherical latitude asin(z/|center|) beyond +-87.13 degrees (0.05 rad from the +-Z pole) is moved to +-87.13, keeping its distance from the origin and its longitude.
52. createFreeCamera sets _yaw = atan2(dx, dz) of the look direction (0 looks along +Z); writing _yaw alone does not change the view until a control move rebuilds target from it.
53. In attachControl, shouldHandlePointerDown false ignores that press; isExternalDragActive true mid-drag ends the drag and zeroes rotation and pan offsets; isExternalPickPending true swallows moves.
54. In GeospatialCamera north is +Z: at a centre on +X, yaw 0 looks toward +Z and yaw PI/2 (east) toward -Y. yaw is wrapped to [-PI, PI), so yaw = PI reads back -PI; a centre on a pole is moved off it.
55. attachFreeControl moves on WASD and arrows, Space/PageUp up, ShiftLeft/ShiftRight/PageDown down, and turns on a drag with button 0, 1 or 2. One 16 ms frame of W moves speed*16/sqrt(100000). Without a scene nothing moves.
56. In interpolateArcRotateCamera both alpha and beta take the shortest arc mod 2*PI, goals are clamped to the camera's limits every frame, a NaN goal field counts as omitted, and the end snaps exactly to the clamped goal.
57. Arc-rotate key speed comes from the keyboard options (angularSensitivity 100, panningSensitivity 50, zoomingSensitivity 25), not the camera's sensibilities; held keys add input every frame, heard on the canvas.
58. interpolateArcRotateCamera ends with alpha, beta and radius set exactly to the goal clamped to the limit fields, alpha unwrapped: a goal of 2*PI from alpha 0 ends on the first frame at 2*PI; a goal past a limit ends on the limit.
59. A geospatial camera's yaw and pitch read back wrapped to [-PI, PI): yaw = 4 reads 4 - 2*PI, yaw = PI reads -PI.
60. checkCollisions (default false) in attachGeospatialControls lifts center each frame so the eye stays at least limits.planetRadius + limits.radiusMin from the origin.
61. attachGeospatialControls picks by a ray against a sphere of limits.planetRadius at the origin, not scene meshes. A button-0 double-click flies center to the picked point over doubleTapAnimationDurationMs (1000).
62. When the setCameraLimits clamp hits a bound it zeroes that channel's inertial offset. Only the function returned by the latest setCameraLimits call stops the clamping; it leaves the limit fields set.
63. When camera._useFloatingOrigin is set, getViewMatrix zeroes its translation, so the matrices are camera-relative; projectWorldToScreen then needs worldOrigin set to the camera's world position.
64. After a pan or zoom ends, the center moves to where the look vector hits the planet, radius set to that distance. checkCollisions (default false) keeps the eye at least planetRadius+radiusMin from the origin.
65. attachFreeControl stops look inertia once the decayed turn (drag px / angularSensitivity, times inertia each frame) falls below speed * 0.001, so at speed 1000 a 200 px drag turns once with no glide while a 3000 px drag still glides.
66. attachFreeControl listens for keys on the canvas, setting tabIndex 0 if it has no tabindex, so keys work only while the canvas has focus. Buttons 0, 1 and 2 all drag to look; there is no pointer lock.
67. attachGeospatialControls clamps rotated pitch to [0, PI/2-0.001] before the limits, and picks by ray against a sphere of limits.planetRadius at the origin, not against meshes.
68. A FreeCamera whose view direction is parallel to world Y (target straight above or below) gets an identity rotation and looks along +Z.
69. A FreeCamera's view is built from position and target alone. Moving position keeps it aimed at the same target point, so it turns; to translate, move target by the same amount.
70. Rotate drag: inertialAlphaOffset -= dx/angularSensibility and inertialBetaOffset -= dy/angularSensibility; each frame alpha and beta add their offset.
71. Geospatial keys: arrows pan north/east by radius*0.0015 per frame, Ctrl+arrows rotate, Equal/NumpadAdd and Minus/NumpadSubtract zoom along the look vector.
72. attachGeospatialControls flies the centre to the clicked globe point over 1000 ms on a dblclick with button 0 and buttons 0; a dblclick with buttons 1 (a button still held) is ignored.
73. Arc keyboard listeners are on the canvas (given tabIndex 0 if it has none), so it needs focus; blur clears held keys. A custom key list replaces that direction's arrow default; codes are KeyboardEvent.code.
74. fov, nearPlane and farPlane are plain fields; a write takes effect at the next getProjectionMatrix/getViewProjectionMatrix call, which compares them by value.
75. getCameraPosition reads the world matrix translation, so it includes the camera's parent transform.
76. Ortho bounds are view-space world units around the camera's view axis; depth still comes from camera.nearPlane and farPlane.
77. In a right-handed build the controls flip the sign of alpha/yaw and horizontal pan, so a drag turns the same way on screen.
78. projectPointToViewportToRef does no validation, allocates per call, multiplies transform by a world matrix, accepts zero-size viewports, and writes only x, y, z.
```

Reply with every file you write or change, each as a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the files, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
