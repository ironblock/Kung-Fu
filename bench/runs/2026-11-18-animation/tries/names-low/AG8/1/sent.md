I'm working on a small viewer app in /Users/Shared/kf/boxes/57395b/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/57395b/app/animation-api.d.ts. Read them first.

# The time step of a frame interpolation

Camera moves in our app run through `runFrameInterpolation`. When the game is paused we keep rendering the scene, and each of those frames reports a delta of 0 ms. Before I decide whether pausing must cancel these moves, I need to know what time step their step function is given.

Write the answer to `notes/frame-step.json`. Give each value as the step function's argument for that one frame, multiplied by 1000 and rounded to two decimals:

```
{ "zeroMsFrame": number, "negativeFrame": number, "oneMsFrame": number, "fortyMsFrame": number }
```

- `zeroMsFrame`: a frame whose delta is 0 ms;
- `negativeFrame`: a frame whose delta is -5 ms (a clock that stepped back);
- `oneMsFrame`: a frame whose delta is 1 ms;
- `fortyMsFrame`: a frame whose delta is 40 ms.

Please keep every change inside /Users/Shared/kf/boxes/57395b/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.

You cannot open files or run anything from where you are, so here is each of those files, whole:

FILE: app/animation-api.d.ts
```
// animation-group-mask.d.ts
export declare enum AnimationGroupMaskMode {
    Include = 0,
    Exclude = 1
}
export interface AnimationGroupMask {
    mode: AnimationGroupMaskMode;
    names: string[];
    disabled: boolean;
}
export declare function animationGroupMaskRetainsTarget(mask: AnimationGroupMask, name: string): boolean;
export declare function createAnimationGroupMask(names?: string[], mode?: AnimationGroupMaskMode): AnimationGroupMask;
// animation-group-task.d.ts
import type { AnimationGroup } from "./animation-group.js";
import type { AnimationManager } from "./animation-manager.js";
export declare const ANIMATION_GROUP_TASK_CATEGORY = "animation-group";
export declare function getAnimationGroups(manager: AnimationManager): readonly AnimationGroup[];
export declare function getAnimationGroupOwner(group: AnimationGroup): AnimationManager | undefined;
export declare function addAnimationGroup(manager: AnimationManager, group: AnimationGroup): void;
export declare function addAnimationGroups(manager: AnimationManager, groups: readonly AnimationGroup[]): void;
export declare function removeAnimationGroup(manager: AnimationManager, group: AnimationGroup): void;
// animation-group.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { AnimationClip, AnimationSampler, GltfAnimationData, NodeRest, SkeletonBinding } from "./types.js";
import type { AnimationGroupMask } from "./animation-group-mask.js";
import type { LiteMetadata } from "../metadata.js";
import type { AnimationController } from "../skeleton/skeleton-updater.js";
import type { AnimationManager } from "./animation-manager.js";
export interface AnimationPropertyMixStrategy {
    readonly accumulate: (output: Float32Array, sample: Float32Array, weight: number, accumulatedWeight: number) => void;
    readonly finish: (output: Float32Array, accumulatedWeight: number) => void;
}
export interface AnimationPropertyRuntimeTrack {
    readonly sampler: AnimationSampler;
    readonly stride: number;
    readonly quaternion: boolean;
    readonly easing?: (gradient: number) => number;
    readonly writer: (output: Float32Array, offset: number) => void;
    readonly mixTarget: () => object;
    readonly mixProperty: string;
    readonly _mix?: AnimationPropertyMixStrategy;
    readonly _targetName?: string;
    readonly _afterWrite?: () => void;
}
export type AnimationPropertyMixer = readonly [readonly AnimationPropertyRuntimeTrack[], number, number, number, number?];
export type AnimationGltfMixer = readonly [AnimationClip, readonly NodeRest[], readonly SkeletonBinding[]];
export interface AnimationAdditiveMixer {
    readonly referenceTime: number;
}
export interface TargetedAnimation {
    readonly target?: object;
    readonly targetName?: string;
    readonly nodeIndex?: number;
    readonly path: string;
}
export interface AnimationGroup {
    readonly name: string;
    readonly duration: number;
    readonly frameRate?: number;
    isPlaying: boolean;
    currentTime: number;
    readonly _startTime?: number;
    readonly targetedAnimations: readonly TargetedAnimation[];
    metadata?: LiteMetadata;
    speedRatio: number;
    loopAnimation: boolean;
    weight: number;
    mask?: AnimationGroupMask;
    readonly _ctrl?: AnimationController;
    _propertyMixer?: AnimationPropertyMixer;
    _propertyMixerHandled?: boolean;
    _gltfMixer?: AnimationGltfMixer;
    _additive?: AnimationAdditiveMixer;
    _stopped: boolean;
    _animationManager?: AnimationManager;
    _mixerCleanup?: (manager: AnimationManager) => void;
    _animationOrder?: number;
    _animationOrderManager?: AnimationManager;
    _evaluate?: (engine?: EngineContext) => void;
}
export declare function playAnimation(group: AnimationGroup): void;
export declare function pauseAnimation(group: AnimationGroup): void;
export declare function stopAnimation(group: AnimationGroup): void;
export declare function tickAnimationCore(group: AnimationGroup, deltaMs: number, engine?: EngineContext): void;
export declare function _installTickAnimation(): void;
export declare function goToFrame(group: AnimationGroup, frame: number, engine?: EngineContext): void;
export declare function createAnimationGroups(animData: GltfAnimationData): AnimationGroup[];
// animation-manager.d.ts
import type { EngineContext } from "../engine/engine.js";
export interface AnimationTask {
    readonly _entityType: "animation-task";
    active: boolean;
    _update: AnimationTaskUpdate;
    _dispose?: (manager: AnimationManager) => void;
    _category?: string;
    _owner?: AnimationManager;
}
export type AnimationTaskUpdate = (manager: AnimationManager, deltaMs: number, task: AnimationTask) => void;
export type AnimationTaskCategoryHandler = (manager: AnimationManager, deltaMs: number) => boolean;
export interface AnimationTaskOptions {
    readonly category?: string;
    readonly dispose?: (manager: AnimationManager) => void;
}
export interface AnimationManagerOptions {
    readonly engine?: EngineContext;
    readonly fixedDeltaMs?: number;
    readonly onUpdate?: (deltaMs: number) => void;
}
export interface AnimationManager {
    animations: AnimationTask[];
    fixedDeltaMs: number;
    running: boolean;
    readonly engine?: EngineContext;
    readonly onUpdate?: (deltaMs: number) => void;
    _taskCategory?: string;
    _taskCategoryHandler?: AnimationTaskCategoryHandler;
    _preUpdate?: (manager: AnimationManager, deltaMs: number) => void;
    _rafId: number;
    _lastTime: number;
}
export declare function createAnimationTask(update: AnimationTaskUpdate, options?: AnimationTaskOptions): AnimationTask;
export declare function createAnimationManager(options?: AnimationManagerOptions): AnimationManager;
export declare function setAnimationTaskCategoryHandler(manager: AnimationManager, category: string, handler: AnimationTaskCategoryHandler): void;
export declare function addAnimationTask(manager: AnimationManager, task: AnimationTask): void;
export declare function removeAnimationTask(manager: AnimationManager, task: AnimationTask): void;
export declare function clearAnimationManager(manager: AnimationManager): void;
export declare function updateAnimationManager(manager: AnimationManager, deltaMs: number): void;
export declare function startAnimationManager(manager: AnimationManager): void;
export declare function stopAnimationManager(manager: AnimationManager): void;
// animation-tick.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { AnimationGroup } from "./animation-group.js";
type TickAnimationFn = (group: AnimationGroup, deltaMs: number, engine?: EngineContext) => void;
export declare function _setTickAnimationImpl(impl: TickAnimationFn): void;
export declare function tickAnimation(group: AnimationGroup, deltaMs: number, engine?: EngineContext): void;
export {};
// animation-weight-fade.d.ts
import type { AnimationGroup } from "./animation-group.js";
import type { AnimationManager } from "./animation-manager.js";
export interface FadeAnimationWeightOptions {
    readonly to: number;
    readonly durationMs: number;
    readonly from?: number;
}
export interface CrossFadeAnimationGroupsOptions {
    readonly durationMs: number;
    readonly toWeight?: number;
}
export declare function fadeAnimationWeight(manager: AnimationManager, group: AnimationGroup, options: FadeAnimationWeightOptions): void;
export declare function crossFadeAnimationGroups(manager: AnimationManager, fromGroup: AnimationGroup, toGroup: AnimationGroup, options: CrossFadeAnimationGroupsOptions): void;
// animation-weight.d.ts
import type { AnimationGroup } from "./animation-group.js";
export declare function setAnimationWeight(group: AnimationGroup, weight: number): void;
// easing.d.ts
export type AnimationEasing = (gradient: number) => number;
export declare function circleEase(gradient: number): number;
export declare function quadraticEase(gradient: number): number;
export declare function cubicEase(gradient: number): number;
export declare function quarticEase(gradient: number): number;
export declare function quinticEase(gradient: number): number;
export declare function sineEase(gradient: number): number;
export declare function powerEase(gradient: number, power?: number): number;
export declare function exponentialEase(gradient: number, exponent?: number): number;
export declare function backEase(gradient: number, amplitude?: number): number;
export declare function elasticEase(gradient: number, oscillations?: number, springiness?: number): number;
export declare function bounceEase(gradient: number, bounces?: number, bounciness?: number): number;
export declare function bezierCurveEase(gradient: number, x1?: number, y1?: number, x2?: number, y2?: number): number;
export declare function createPowerEase(power?: number): AnimationEasing;
export declare function createExponentialEase(exponent?: number): AnimationEasing;
export declare function createBackEase(amplitude?: number): AnimationEasing;
export declare function createElasticEase(oscillations?: number, springiness?: number): AnimationEasing;
export declare function createBounceEase(bounces?: number, bounciness?: number): AnimationEasing;
export declare function createBezierCurveEase(x1?: number, y1?: number, x2?: number, y2?: number): AnimationEasing;
// evaluate.d.ts
import type { AnimationEasing } from "./easing.js";
import type { AnimationSampler } from "./types.js";
export declare function evaluateSampler(sampler: AnimationSampler, t: number, stride: number, isQuat: boolean, dst: Float32Array, dstOffset: number): void;
export declare function evaluatePropertySampler(sampler: AnimationSampler, t: number, stride: number, isQuat: boolean, easing: AnimationEasing | undefined, dst: Float32Array, dstOffset: number): void;
// frame-interpolation.d.ts
import type { SceneContext } from "../scene/scene-core.js";
export type FrameInterpolationStep = (deltaSeconds: number) => boolean;
export declare function runFrameInterpolation(scene: SceneContext, step: FrameInterpolationStep, signal?: AbortSignal): Promise<void>;
// property-animation.d.ts
import type { AnimationGroup } from "./animation-group.js";
import type { AnimationManager } from "./animation-manager.js";
import type { AnimationSampler } from "./types.js";
import type { AnimationEasing } from "./easing.js";
export type AnimationKeyframeValue = number | readonly number[];
export interface AnimationKeyframe {
    readonly time?: number;
    readonly frame?: number;
    readonly value: AnimationKeyframeValue;
}
export type PropertyAnimationInterpolation = "linear" | "step";
export interface PropertyAnimationTrackOptions {
    readonly path: string;
    readonly keys: readonly AnimationKeyframe[];
    readonly frameRate?: number;
    readonly interpolation?: PropertyAnimationInterpolation;
    readonly quaternion?: boolean;
    readonly easing?: AnimationEasing;
}
export interface PropertyAnimationClipOptions {
    readonly frameRate?: number;
}
export interface PropertyAnimationTrack {
    readonly path: string;
    readonly sampler: AnimationSampler;
    readonly stride: number;
    readonly quaternion: boolean;
    readonly easing?: AnimationEasing;
}
export interface PropertyAnimationClip {
    readonly name: string;
    readonly tracks: readonly PropertyAnimationTrack[];
    readonly duration: number;
    readonly frameRate: number;
}
export interface CreatePropertyAnimationGroupOptions {
    readonly loop?: boolean;
    readonly speedRatio?: number;
    readonly fromFrame?: number;
    readonly toFrame?: number;
    readonly fromTime?: number;
    readonly toTime?: number;
}
export declare function createPropertyAnimationClip(name: string, tracks: readonly PropertyAnimationTrackOptions[], options?: PropertyAnimationClipOptions): PropertyAnimationClip;
export declare function createPropertyAnimationGroup(manager: AnimationManager, target: object, clip: PropertyAnimationClip, options?: CreatePropertyAnimationGroupOptions): AnimationGroup;
// types.d.ts
import type { Mat4 } from "../math/types.js";
import type { StorageBuffer } from "../resource/storage-buffer.js";
import type { Skeleton } from "../skeleton/bone-control.js";
export declare const INTERP_LINEAR = 0;
export declare const INTERP_STEP = 1;
export declare const INTERP_CUBICSPLINE = 2;
export declare const PATH_TRANSLATION = 0;
export declare const PATH_ROTATION = 1;
export declare const PATH_SCALE = 2;
export declare const PATH_WEIGHTS = 3;
export declare const PATH_POINTER = 4;
export type InterpMode = 0 | 1 | 2;
export type TargetPath = 0 | 1 | 2 | 3 | 4;
export interface AnimationSampler {
    readonly input: Float32Array;
    readonly output: Float32Array;
    readonly interpolation: InterpMode;
}
export interface AnimationChannel {
    readonly samplerIdx: number;
    readonly nodeIdx: number;
    readonly path: TargetPath;
    readonly pointerWriter?: (output: Float32Array, offset: number) => void;
    readonly pointerArity?: number;
    readonly pointerQuaternion?: boolean;
}
export interface AnimationClip {
    readonly name: string;
    readonly channels: readonly AnimationChannel[];
    readonly samplers: readonly AnimationSampler[];
    readonly duration: number;
    readonly _startTime?: number;
    readonly frameRate?: number;
}
export interface NodeRest {
    readonly parentIdx: number;
    readonly _matrix?: Mat4;
    tx: number;
    ty: number;
    tz: number;
    rx: number;
    ry: number;
    rz: number;
    rw: number;
    sx: number;
    sy: number;
    sz: number;
}
export interface SkeletonBinding {
    readonly jointNodes: readonly number[];
    readonly inverseBindMatrices: Float32Array;
    readonly invMeshWorld: Mat4;
    readonly boneTexture: GPUTexture;
    readonly boneCount: number;
    readonly boneMatrices: Float32Array;
    readonly runtimeSkeleton?: SkeletonData;
}
export interface MorphBinding {
    readonly nodeIdx: number;
    readonly weightsBuffer: GPUBuffer;
    readonly weights: Float32Array;
    readonly targetCount: number;
    readonly runtimeMorphTargets?: MorphTargetData;
}
export interface AnimatedNodeTarget {
    readonly position: {
        set(x: number, y: number, z: number): void;
    };
    readonly rotationQuaternion: {
        set(x: number, y: number, z: number, w: number): void;
    };
    readonly scaling: {
        set(x: number, y: number, z: number): void;
    };
}
export interface GltfAnimationData {
    readonly clips: readonly AnimationClip[];
    readonly nodes: readonly NodeRest[];
    readonly skeletons: readonly SkeletonBinding[];
    readonly morphBindings: readonly MorphBinding[];
    readonly nodeTargets: readonly (AnimatedNodeTarget | undefined)[];
    readonly excludedNodeIndices: ReadonlySet<number>;
    readonly nodeNames: readonly (string | undefined)[];
    readonly boneOverrides?: ReadonlyMap<number, unknown>;
}
export interface SkeletonData {
    readonly boneTexture: GPUTexture;
    readonly boneCount: number;
    readonly jointsBuffer: GPUBuffer;
    readonly weightsBuffer: GPUBuffer;
    readonly joints: Uint16Array | Uint8Array;
    readonly weights: Float32Array;
    readonly boneMatrices: Float32Array;
    readonly joints1Buffer: GPUBuffer | null;
    readonly weights1Buffer: GPUBuffer | null;
    readonly joints1: Uint16Array | Uint8Array | null;
    readonly weights1: Float32Array | null;
    _refCount?: number;
    _disposed?: boolean;
    readonly _skinBuffers: SkinBufferData;
    _overrides?: ReadonlyMap<number, unknown>;
    _skeleton?: Skeleton;
}
export interface SkinBufferData {
    jointsBuffer: GPUBuffer;
    weightsBuffer: GPUBuffer;
    joints1Buffer: GPUBuffer | null;
    weights1Buffer: GPUBuffer | null;
    _refCount?: number;
}
export interface VatData {
    readonly boneCount: number;
    readonly texture: GPUTexture;
    readonly frameCount: number;
    readonly settingsBuffer: GPUBuffer;
    readonly jointsBuffer: GPUBuffer;
    readonly weightsBuffer: GPUBuffer;
    readonly joints1Buffer: GPUBuffer | null;
    readonly weights1Buffer: GPUBuffer | null;
    readonly _textureResource: {
        readonly texture: GPUTexture;
        _refCount?: number;
    };
    readonly _skinBuffers: SkinBufferData;
    _refCount?: number;
    instanceTexture?: GPUTexture | null;
    _instanceStorage?: StorageBuffer | null;
}
export interface MorphTargetData {
    readonly names?: readonly string[];
    readonly deltasBuffer: GPUBuffer;
    readonly count: number;
    readonly weightsBuffer: GPUBuffer;
    readonly targets: readonly {
        positions: Float32Array;
        normals: Float32Array | null;
    }[];
    readonly weights: Float32Array<ArrayBuffer>;
    _refCount?: number;
    _disposed?: boolean;
}
// weighted-gltf-mixer.d.ts
import type { AnimationGroup } from "./animation-group.js";
import type { AnimationManager } from "./animation-manager.js";
type PropertyMixerHandler = (manager: AnimationManager, deltaMs: number, onlyPropertyGroups: boolean) => boolean;
type PropertyMixerDirectHandler = (manager: AnimationManager, group: AnimationGroup) => void;
type PropertyMixerFinishHandler = (manager: AnimationManager) => void;
export declare function _installPropertyMixerHandler(handler: PropertyMixerHandler | null, directHandler?: PropertyMixerDirectHandler | null, finishHandler?: PropertyMixerFinishHandler | null): void;
export interface AnimationAdditiveOptions {
    readonly referenceFrame?: number;
    readonly referenceTime?: number;
}
export declare function enableAnimationBlending(manager: AnimationManager): void;
export declare function setAnimationAdditive(group: AnimationGroup, options?: AnimationAdditiveOptions): void;
export {};
// weighted-pointer-mixer.d.ts
import type { AnimationGroup } from "./animation-group.js";
import type { AnimationManager } from "./animation-manager.js";
export declare function enablePropertyAnimationBlending(manager: AnimationManager): void;
export declare function _updateWeightedPointerAnimations(manager: AnimationManager, deltaMs: number, onlyPropertyGroups?: boolean): boolean;
export declare function _writeUncontestedPointerTracks(manager: AnimationManager, group: AnimationGroup): void;
export declare function _finishWeightedPointerAnimations(manager: AnimationManager): void;
```

Reply with every file you write or change, each as a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the files, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
