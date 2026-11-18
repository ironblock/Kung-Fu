I'm working on a small viewer app in /Users/Shared/kf/boxes/a5c9c4/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/a5c9c4/app/animation-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/a5c9c4/app/animation-notes.md. Read them first.

Our doors open with a property animation clip that turns `door.angle` from 0 to 90 at a steady rate over 1 s (keys in seconds, default frame rate). To close a door I would like to play the same clip backward as a one-shot, a group made with `loop: false` and `speedRatio: -1`, rather than author a second clip. Before choosing, I need to know how that behaves. The door starts open (angle 90); we update the manager ourselves, 50 ms at a time. Write `notes/backward-door.json`:

```json
{
  "freshAngleAfterHalfSecond": number,
  "seekedAngleAfterHalfSecond": number,
  "seekedIsPlayingAfterThreeSeconds": boolean,
  "loopingAngleAfterQuarterSecond": number
}
```

"Fresh" is a group just made that way. "Seeked" is one made that way, then sent to its end with `goToFrame(group, 60)` and started with `playAnimation(group)` before the updates. "Looping" is a group made with `loop: true` and `speedRatio: -1`.

Please keep every change inside /Users/Shared/kf/boxes/a5c9c4/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.

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

FILE: app/animation-notes.md
```
# Notes on how the animation code of Babylon Lite 1.39.0 behaves

1. createPropertyAnimationGroup returns a group that is already playing and held by the manager, but its time advances only in updateAnimationManager. Scene frames (stepScene) never move it.
2. The deltaMs of updateAnimationManager is in milliseconds. currentTime, duration, key time, fromTime and toTime are in seconds, and a frame number is seconds times frameRate.
3. createPropertyAnimationGroup loops unless given loop: false. speedRatio and weight start at 1.
4. Nothing is written when a property group is created. Its first update writes the value at fromTime + step; updateAnimationManager(manager, 0) writes the value at fromTime.
5. With loop: false, a property group clamps at toTime, writes that value, then sets isPlaying to false. Later updates write nothing to the target.
6. goToFrame seeks to frame / group.frameRate seconds and pauses the group (isPlaying false). A property group writes that value at once; playAnimation goes on from there.
7. stopAnimation sets currentTime to fromTime (0 with no range) and writes nothing, so the target keeps its last value. After it, isPlaying = true does not resume the group; playAnimation does.
8. playAnimation on a property group that finished with loop: false leaves currentTime at toTime, so it stops again on the next update. Call stopAnimation, or set currentTime, before playAnimation to replay.
9. A looping property group keeps currentTime in [fromTime, toTime): an update that lands exactly on toTime writes the fromTime value, not the last key's.
10. A paused property group writes nothing on updates, even after currentTime is set. goToFrame, or an update after playAnimation, writes the value.
11. currentTime, speedRatio and loopAnimation can be set on a playing group. The next update starts from them, adding its step to the new currentTime.
12. runFrameInterpolation calls step on each later scene frame, not at once, with the delta in seconds (1/60 when it is 0 or less). Returning false or undefined ends it and resolves the promise.
13. Each key needs exactly one of time (seconds) or frame, or createPropertyAnimationClip throws. Keys are sorted by time, and clip.duration is the latest key time over all tracks.
14. A frame key uses its track's frameRate, else the clip's: options.frameRate, else the first track's frameRate, else 60. fromFrame, toFrame and goToFrame use the clip's.
15. evaluateSampler and evaluatePropertySampler are not exported from "@babylonjs/lite", nor are tickAnimation, tickAnimationCore, getAnimationGroupOwner and ANIMATION_GROUP_TASK_CATEGORY.
16. Keys of 2 to 4 numbers call set(...) on the property's object if it has set, else write its x, y, z, w. An {r, g, b} object makes createPropertyAnimationGroup throw; animate "color.r" alone instead.
17. group.weight changes nothing unless the manager has enablePropertyAnimationBlending (property groups) or enableAnimationBlending (glTF groups). Without it, every group writes its full value.
18. Under enablePropertyAnimationBlending, a property with any group of weight other than 1 gets the sum of value x weight over its groups, not divided by the total and with no original value. One group at 0.5 writes half.
19. crossFadeAnimationGroups fades from the groups' current weights, and a new group's weight is 1, so set toGroup's weight to 0 first. It neither plays nor stops either group.
20. fadeAnimationWeight sets weight to from (default: the current weight) at once, then moves it linearly by each update's step, before the groups run. A new fade on the same group replaces the old one.
21. When fixedDeltaMs > 0, every update uses it in place of deltaMs. Otherwise a negative, NaN or infinite deltaMs makes updateAnimationManager do nothing.
22. A track slerps only if its path is or ends in "rotationQuaternion", or it has quaternion: true. Other 4-number tracks are lerped per component and not normalized.
23. createPropertyAnimationGroup throws if a part of the dotted path is missing. Each write looks the owner up again, so a replaced target.position is followed; a vanished one makes the update throw.
24. fromTime/toTime win over fromFrame/toFrame, and currentTime starts at fromTime. toTime must exceed fromTime or creation throws, so a clip whose keys all sit at time 0 needs a toTime.
25. Before a track's first key it writes the first key's value, and after its last key the last key's value.
26. With interpolation "step", a track writes each key's value from that key's time until the next key's time. Its easing is not used.
27. Each update runs groups and tasks in the order they were first attached. Without blending, groups that write one property overwrite each other, and the last attached wins.
28. If step throws, the runFrameInterpolation promise rejects with an Error (a thrown non-Error is wrapped). If the signal aborts, it rejects with signal.reason and step is not called again.
29. createAnimationGroups makes one group per clip and only the first plays; the others do not move until playAnimation. An unnamed clip's group is named animation_<index>.
30. Scene frames advance a glTF group only if it came in through addToScene with an asset container; pushing it into scene.animationGroups does nothing. Once a manager holds it, the scene skips it.
31. A paused glTF group still writes its pose at currentTime on every update. A glTF group with loopAnimation false stays at its end with isPlaying still true.
32. goToFrame on a stopped glTF group, such as any clip but the first before playAnimation, writes nothing unless an engine is passed as its third argument.
33. goToFrame past the end wraps on a looping glTF group and clamps on a non-looping one. On a property group it clamps to [0, clip duration], ignoring fromTime and toTime.
34. A glTF group writes a node target only through position.set, rotationQuaternion.set and scaling.set, for the paths its clip animates. Nodes in excludedNodeIndices are never written.
35. Under enablePropertyAnimationBlending, a property whose groups all have weight 0 is not written, though their time runs. A paused group with weight other than 1 keeps writing each update.
36. A manager has one blending mode: the last call of enablePropertyAnimationBlending or enableAnimationBlending wins. Under enableAnimationBlending, property group weights are ignored.
37. Under enableAnimationBlending, a glTF group whose weight is not 1 makes the update throw unless the manager has an engine, and even then it does not write node targets.
38. group.mask matches glTF node names exactly, case included. A masked-out node gets its rest values written for the paths the clip animates. Without blending, a mask does not change what property groups write.
39. createAnimationGroupMask() with no arguments is Include mode with no names, so it masks out every node.
40. An in-place edit of mask.names at the same length (names[0] = "b") is not seen; assign a new array. disabled = true lets every node animate.
41. The easing functions other than bezierCurveEase are ease-in curves; (g) => 1 - f(1 - g) eases out. A track's easing reshapes each key-to-key segment, not the whole clip.
42. Eased values are not clamped, so with backEase or elasticEase a track writes values outside its keys' range. bezierCurveEase(1) with default control points returns NaN.
43. A negative speedRatio plays a property group backwards. With loop: false it clamps at fromTime and never ends: isPlaying stays true.
44. onUpdate runs only in startAnimationManager's requestAnimationFrame loop, whose first step is 0. startAnimationManager throws where requestAnimationFrame is missing, as in Node.
45. setAnimationWeight throws outside [0, 1], but a direct group.weight write is not checked: under property blending, weight 2 doubles that group's share.
46. removeAnimationGroup stops a group's updates. Adding a group held by another manager throws until it is removed, and a re-added group takes back its first-attach place.
47. In a property group, each targetedAnimations entry is { target, path }: the object that owns the last path part, and that part. For "position" on a node, target is the node.
48. The INTERP_* and PATH_* constants are not exported from "@babylonjs/lite"; write their numbers in hand-built clips.
49. setAnimationAdditive on a group held by a manager calls enableAnimationBlending on that manager, which ends its property blending.
50. Under enablePropertyAnimationBlending, a rotationQuaternion sum is normalized, so a weight above 0 on a lone quaternion track has no effect: it writes its full value.
```

Reply with every file you write or change, each as a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the files, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
