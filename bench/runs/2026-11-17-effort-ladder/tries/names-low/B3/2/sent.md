I'm working on a small viewer app in /Users/Shared/kf/boxes/abeac7/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /Users/Shared/kf/boxes/abeac7/app/camera-api.d.ts. Read them first.

# Fly-through controls with a boost key

Our architecture walkthrough uses the library's free camera. Please write `src/fly-controls.ts` exporting:

```ts
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void;
```

It gives the camera the library's keyboard and mouse fly controls on that canvas: W/A/S/D or the arrow keys to move, the mouse to look around, Space to rise and PageDown to sink. Holding Shift (left or right) makes the camera move three times as fast. Shift is only a speed key. Holding it, alone or together with other keys, must never move the camera up or down by itself.

The returned function removes the controls: no listeners left on the canvas and nothing of ours left running each frame.

Please keep every change inside /Users/Shared/kf/boxes/abeac7/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.

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

Reply with every file you write or change, each as a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the files, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
