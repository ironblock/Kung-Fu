I'm working on a small viewer app in /home/dev/b82fea/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /home/dev/b82fea/app/animation-api.d.ts, and the source of that code, in /home/dev/b82fea/app/animation-source.ts. Read them first.

# Mix the character's clips and the HUD's clips

Please add `src/mix-all.ts`. It exports:

```ts
export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[],
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void };
```

The types come from `@babylonjs/lite`.

`character` holds the clips of one skinned glTF character. They are all playing and not yet on any manager. `hud` is a plain object: play each of `hudClips` on it, looping, and return those groups as `hudGroups`, in the same order. `step(deltaMs)` moves every clip on by `deltaMs`; our loop calls it once a frame.

Later I set weights with the library's own setter. Whenever some of these clips have a weight below 1, on the character, on the HUD, or on both at once, what is shown must be the library's own weighted mix, on the character's bones and on the HUD alike.

Please keep every change inside /home/dev/b82fea/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.

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

FILE: app/animation-source.ts
```
// ===== src/animation/animation-group-mask.ts =====
// AnimationGroupMask — include/exclude animation targets by name.
// Mirrors Babylon.js AnimationGroupMask / AnimationGroupMaskMode: a mask is
// attached to an AnimationGroup (group.mask) and filters which targets animate.
// Pure state — no methods; behaviour lives in standalone functions.
//
// Fully opt-in: the first call to `createAnimationGroupMask` installs the resolver
// the animation controller uses to skip masked targets. Animated scenes that never
// create a mask don't pull this module, so the controller's masking branch folds
// away — they stay byte-identical.

import { _installAnimationMaskResolver } from "../skeleton/skeleton-updater.js";

/** Mode controlling how an {@link AnimationGroupMask} filters targets. */
export enum AnimationGroupMaskMode {
    /** Only the listed target names animate; every other target stays at its bind/rest pose. */
    Include = 0,
    /** Every target animates except the listed names (which stay at their bind/rest pose). */
    Exclude = 1,
}

/**
 * Filter applied to an {@link AnimationGroup} (via `group.mask`) that restricts which
 * targets the group animates, matched by target name.
 *
 * A target is identified by its name (the glTF node / bone name). The same mask can be
 * reused across animation groups whose targets are named the same way. Matching is exact
 * and case-sensitive. Masked-out targets are left untouched and therefore stay at their
 * bind/rest pose (matching Babylon.js, which pauses those targets).
 *
 * Pure state: create with {@link createAnimationGroupMask} and read membership with
 * {@link animationGroupMaskRetainsTarget}. To change an active mask, toggle `mode` or
 * `disabled`, or replace the `names` array (assign a new array, or push/pop): the
 * controller re-resolves whenever `mode`, `disabled`, the `names` array reference, or
 * its length changes. Editing `names` in place at the same length (e.g. `names[0] = …`
 * or reordering) is NOT detected — assign a new `names` array, or reassign `group.mask`,
 * to apply such a change.
 */
export interface AnimationGroupMask {
    /** How `names` is interpreted (Include vs Exclude). */
    mode: AnimationGroupMaskMode;
    /** Target (node/bone) names listed by the mask. */
    names: string[];
    /** When true the mask is ignored and every target animates (default false). */
    disabled: boolean;
}

/**
 * Whether the mask retains (keeps animating) the given target name.
 *
 * Mirrors Babylon.js `AnimationGroupMask.retainsTarget`: in Include mode a name is
 * retained when it is listed; in Exclude mode a name is retained when it is NOT listed.
 * A disabled mask retains every name.
 * @param mask - The mask to query.
 * @param name - The target (node/bone) name to test.
 * @returns True if a target with this name should animate, false if it is masked out.
 */
export function animationGroupMaskRetainsTarget(mask: AnimationGroupMask, name: string): boolean {
    if (mask.disabled) {
        return true;
    }
    return (mask.names.indexOf(name) !== -1) === (mask.mode === AnimationGroupMaskMode.Include);
}

/** Resolver installed into the animation controller: fills `out[i]=1` for every node
 *  index `i` whose channels must be skipped (masked out), `0` for retained nodes. */
function resolveAnimationMask(mask: AnimationGroupMask, nodeNames: readonly (string | undefined)[], out: Uint8Array, numNodes: number): void {
    for (let i = 0; i < numNodes; i++) {
        out[i] = animationGroupMaskRetainsTarget(mask, nodeNames[i] ?? "") ? 0 : 1;
    }
}

/**
 * Create an {@link AnimationGroupMask}.
 * @param names - Target names listed by the mask (copied). Defaults to empty.
 * @param mode - Include (only listed names animate) or Exclude (all but listed names animate).
 *               Defaults to {@link AnimationGroupMaskMode.Include}.
 * @returns A new mask. Assign it to `animationGroup.mask`.
 */
export function createAnimationGroupMask(names: string[] = [], mode: AnimationGroupMaskMode = AnimationGroupMaskMode.Include): AnimationGroupMask {
    // Activate the controller's masking path the first time any mask is created. Scenes
    // that never call this keep the resolver null, so the masking branch tree-shakes.
    _installAnimationMaskResolver(resolveAnimationMask);
    return { mode, names: names.slice(), disabled: false };
}

// ===== src/animation/animation-group-task.ts =====
import { tickAnimationCore } from "./animation-group.js";
import type { AnimationGroup } from "./animation-group.js";
import { addAnimationTask, createAnimationTask, removeAnimationTask } from "./animation-manager.js";
import type { AnimationManager, AnimationTask } from "./animation-manager.js";

export const ANIMATION_GROUP_TASK_CATEGORY = "animation-group";

interface AnimationGroupTaskManager extends AnimationManager {
    _animationGroups?: AnimationGroup[];
    _nextAnimationGroupOrder?: number;
}

interface AnimationGroupTaskGroup extends AnimationGroup {
    _animationTask?: AnimationTask;
}

function getMutableAnimationGroups(manager: AnimationManager): AnimationGroup[] {
    const managerInternal = manager as AnimationGroupTaskManager;
    let groups = managerInternal._animationGroups;
    if (!groups) {
        groups = [];
        managerInternal._animationGroups = groups;
    }
    return groups;
}

/** Returns the animation groups currently attached to `manager`, or an empty array if none. */
export function getAnimationGroups(manager: AnimationManager): readonly AnimationGroup[] {
    return (manager as AnimationGroupTaskManager)._animationGroups ?? [];
}

export function getAnimationGroupOwner(group: AnimationGroup): AnimationManager | undefined {
    return (group as AnimationGroupTaskGroup)._animationManager;
}

/** Attaches `group` to `manager` so it is ticked each update, creating its backing animation task on first use.
 *  @param manager - Animation manager that will own and drive the group.
 *  @param group - Animation group to attach.
 *  @throws If the group is already attached to a different manager. */
export function addAnimationGroup(manager: AnimationManager, group: AnimationGroup): void {
    const groupInternal = group as AnimationGroupTaskGroup;
    const owner = groupInternal._animationManager;
    if (owner && owner !== manager) {
        throw new Error(`AnimationGroup "${group.name}" is already attached to another AnimationManager`);
    }
    if (owner === manager) {
        return;
    }
    const managerInternal = manager as AnimationGroupTaskManager;
    if (groupInternal._animationOrderManager !== manager) {
        groupInternal._animationOrderManager = manager;
        groupInternal._animationOrder = managerInternal._nextAnimationGroupOrder ?? 0;
        managerInternal._nextAnimationGroupOrder = groupInternal._animationOrder + 1;
    }
    const task =
        groupInternal._animationTask ??
        createAnimationTask(
            (taskManager, deltaMs) => {
                tickAnimationCore(group, deltaMs, taskManager.engine);
            },
            {
                category: ANIMATION_GROUP_TASK_CATEGORY,
                dispose: (ownerManager) => {
                    const groups = (ownerManager as AnimationGroupTaskManager)._animationGroups;
                    const index = groups?.indexOf(group) ?? -1;
                    if (groups && index !== -1) {
                        groups.splice(index, 1);
                    }
                    if (groupInternal._animationManager === ownerManager) {
                        groupInternal._animationManager = undefined;
                    }
                    group._mixerCleanup?.(ownerManager);
                },
            }
        );
    const groups = getMutableAnimationGroups(manager);
    const order = groupInternal._animationOrder!;
    let groupIndex = groups.length;
    while (groupIndex > 0 && ((groups[groupIndex - 1] as AnimationGroupTaskGroup)._animationOrder ?? -1) > order) {
        groupIndex--;
    }
    groups.splice(groupIndex, 0, group);
    groupInternal._animationManager = manager;
    groupInternal._animationTask = task;
    addAnimationTask(manager, task);
    const nextTask = (groups[groupIndex + 1] as AnimationGroupTaskGroup | undefined)?._animationTask;
    if (nextTask) {
        const taskIndex = manager.animations.indexOf(task);
        const nextTaskIndex = manager.animations.indexOf(nextTask);
        if (taskIndex > nextTaskIndex && nextTaskIndex !== -1) {
            manager.animations.splice(taskIndex, 1);
            manager.animations.splice(nextTaskIndex, 0, task);
        }
    }
}

/** Attaches each group in `groups` to `manager` via {@link addAnimationGroup}. */
export function addAnimationGroups(manager: AnimationManager, groups: readonly AnimationGroup[]): void {
    for (const group of groups) {
        addAnimationGroup(manager, group);
    }
}

/** Detaches `group` from `manager`, removing its animation task so it is no longer ticked. */
export function removeAnimationGroup(manager: AnimationManager, group: AnimationGroup): void {
    const groupInternal = group as AnimationGroupTaskGroup;
    const task = groupInternal._animationTask;
    if (task && groupInternal._animationManager === manager) {
        removeAnimationTask(manager, task);
        return;
    }
    const groups = (manager as AnimationGroupTaskManager)._animationGroups;
    const index = groups?.indexOf(group) ?? -1;
    if (groups && index !== -1) {
        groups.splice(index, 1);
    }
    if (groupInternal._animationManager === manager) {
        groupInternal._animationManager = undefined;
    }
}

// ===== src/animation/animation-group.ts =====
// AnimationGroup — user-facing handle for a single animation clip.
// Stored on scene.animationGroups[]. Pure state interface.

import type { EngineContext } from "../engine/engine.js";
import type { AnimationClip, AnimationSampler, GltfAnimationData, NodeRest, SkeletonBinding } from "./types.js";
import type { AnimationGroupMask } from "./animation-group-mask.js";
import type { LiteMetadata } from "../metadata.js";
import { PATH_POINTER, PATH_TRANSLATION, PATH_ROTATION, PATH_SCALE } from "./types.js";
import { createAnimationController } from "../skeleton/skeleton-updater.js";
import type { AnimationController } from "../skeleton/skeleton-updater.js";
import type { AnimationManager } from "./animation-manager.js";
import { _setTickAnimationImpl } from "./animation-tick.js";

const DEFAULT_FRAME_RATE = 60;

/** @internal Custom accumulation for non-scalar property values such as affine matrices. */
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
    /** @internal Optional transform-aware accumulation in the weighted property mixer. */
    readonly _mix?: AnimationPropertyMixStrategy;
    /** @internal Target name used by AnimationGroupMask. */
    readonly _targetName?: string;
    /** @internal Deduplicated publication step after weighted property writes. */
    readonly _afterWrite?: () => void;
}
export type AnimationPropertyMixer = readonly [readonly AnimationPropertyRuntimeTrack[], number, number, number, number?];
export type AnimationGltfMixer = readonly [AnimationClip, readonly NodeRest[], readonly SkeletonBinding[]];
export interface AnimationAdditiveMixer {
    readonly referenceTime: number;
}

/** Lightweight public description of one target affected by an animation group. */
export interface TargetedAnimation {
    /** Runtime target object when one is directly addressable. */
    readonly target?: object;
    /** glTF node or bone name when available. */
    readonly targetName?: string;
    /** glTF node index for node channels. Undefined for manual property tracks. */
    readonly nodeIndex?: number;
    /** Animated path, e.g. `translation`, `rotation`, `scale`, `weights`, or a manual property path. */
    readonly path: string;
}

/** User-facing animation group — one per animation clip. Pure state. */
export interface AnimationGroup {
    /** Name of this animation. */
    readonly name: string;
    /** Duration in seconds. */
    readonly duration: number;
    /** Frame rate used by goToFrame(). */
    readonly frameRate?: number;
    /** True if currently playing. */
    isPlaying: boolean;
    /** Current playback time in seconds. */
    currentTime: number;
    /** @internal Authored playback start in seconds. */
    readonly _startTime?: number;
    /** Lightweight list of targets affected by this group. */
    readonly targetedAnimations: readonly TargetedAnimation[];
    /** User metadata bag. */
    metadata?: LiteMetadata;
    /** Playback speed multiplier (default 1). */
    speedRatio: number;
    /** Whether animation loops (default true). */
    loopAnimation: boolean;
    /** Weighted contribution used by AnimationManager mixing (default 1). */
    weight: number;
    /** Optional include/exclude target-name mask. When set, only targets the mask retains
     *  animate; masked-out targets stay at their bind/rest pose. Matched by glTF node /
     *  bone name. See {@link createAnimationGroupMask}. To update an active mask, change
     *  its `mode`/`disabled`, replace its `names` array, or reassign `group.mask`;
     *  in-place same-length edits of `names` are not picked up. */
    mask?: AnimationGroupMask;
    /** @internal Debug: internal animation controller. */
    readonly _ctrl?: AnimationController;
    /** @internal Manual property animation metadata used by the optional weighted mixer. */
    _propertyMixer?: AnimationPropertyMixer;
    /** @internal True only for the current manager tick when the property mixer consumed this group. */
    _propertyMixerHandled?: boolean;
    /** @internal glTF skeleton metadata used by the optional weighted mixer. */
    _gltfMixer?: AnimationGltfMixer;
    /** @internal Additive animation metadata used by the optional blending mixer. */
    _additive?: AnimationAdditiveMixer;
    /** @internal Whether stop() was called (suppresses tickAnimation). */
    _stopped: boolean;
    /** @internal The AnimationManager that currently owns/drives this group, if any. Set by
     *  {@link addAnimationGroup}. Type-only import, so it is erased at build — no runtime cycle
     *  and no bundle cost for always-loaded consumers (e.g. scene-core's render-loop tick). */
    _animationManager?: AnimationManager;
    /** @internal Optional mixer scratch cleanup invoked when this group leaves its manager. */
    _mixerCleanup?: (manager: AnimationManager) => void;
    /** @internal Stable first-attachment order within `_animationOrderManager`. */
    _animationOrder?: number;
    /** @internal Manager for which `_animationOrder` was allocated. */
    _animationOrderManager?: AnimationManager;
    /** @internal Applies the current time once without advancing playback. */
    _evaluate?: (engine?: EngineContext) => void;
}

/** Start playing an animation group. */
export function playAnimation(group: AnimationGroup): void {
    group.isPlaying = true;
    group._stopped = false;
}

/** Pause playback of an animation group. */
export function pauseAnimation(group: AnimationGroup): void {
    group.isPlaying = false;
}

/** Stop playback and reset to the first authored frame. */
export function stopAnimation(group: AnimationGroup): void {
    group.isPlaying = false;
    group.currentTime = group._startTime ?? 0;
    group._stopped = true;
}

/** Push the group's public playback state into its controller. */
function syncControllerFromGroup(group: AnimationGroup, ctrl: AnimationController): void {
    ctrl.time = group.currentTime;
    ctrl.playing = group.isPlaying;
    ctrl.speedRatio = group.speedRatio;
    ctrl.loop = group.loopAnimation;
    ctrl._setMask?.(group.mask ?? null);
}

/** @internal The real per-frame stepper, advancing the group unconditionally. Manager-driven
 *  callers (the weighted mixers and the generic group task) invoke this directly because they
 *  own the group and must always advance it. Lives in this dynamically-loaded module. */
export function tickAnimationCore(group: AnimationGroup, deltaMs: number, engine?: EngineContext): void {
    if (!group._stopped && group._ctrl) {
        syncControllerFromGroup(group, group._ctrl);
        group._ctrl.tick(deltaMs, engine);
        group.currentTime = group._ctrl.time;
    }
}

/** The scene auto-tick path. Registered on the always-loaded animation-tick forwarder, so this
 *  runs for the scene render-loop tick. Defers to an AnimationManager if one owns the group — the
 *  manager drives and blends it, so ticking here too would double-advance time and clobber the
 *  blended pose (last-writer-wins). Checked per-frame because the manager typically attaches after
 *  addToScene. Keeping the guard here (dynamically-loaded) rather than in scene-core keeps the
 *  always-loaded core free of the property read. */
function tickAnimationImpl(group: AnimationGroup, deltaMs: number, engine?: EngineContext): void {
    if (group._animationManager) {
        return;
    }
    tickAnimationCore(group, deltaMs, engine);
}

/** @internal Wire the always-loaded tickAnimation forwarder to its real implementation.
 *  Called by the group factories so a scene cannot hold groups before the impl is registered. */
export function _installTickAnimation(): void {
    _setTickAnimationImpl(tickAnimationImpl);
}

/** Seek to a specific frame, apply the pose, and pause. */
export function goToFrame(group: AnimationGroup, frame: number, engine?: EngineContext): void {
    const ctrl = group._ctrl;
    group.currentTime = frame / (group.frameRate || DEFAULT_FRAME_RATE);
    group.isPlaying = false;
    if (ctrl) {
        syncControllerFromGroup(group, ctrl);
        if (group._evaluate) {
            group._evaluate(engine);
            group.currentTime = ctrl.time;
        } else if (engine || !group._stopped || !group._gltfMixer) {
            ctrl.tick(0, engine);
            group.currentTime = ctrl.time;
        }
    }
}

/** Create AnimationGroup(s) from parsed glTF animation data.
 *  Returns one group per animation clip. */
export function createAnimationGroups(animData: GltfAnimationData): AnimationGroup[] {
    const { clips, nodes, skeletons, morphBindings, nodeTargets, excludedNodeIndices, nodeNames, boneOverrides } = animData;
    if (clips.length === 0) {
        return [];
    }

    _installTickAnimation();

    return clips.map((clip, clipIndex) => {
        const ctrl: AnimationController = createAnimationController(clip, nodes, skeletons, morphBindings, nodeTargets, excludedNodeIndices, boneOverrides, nodeNames);
        const started = clipIndex === 0;
        const startTime = clip._startTime ?? 0;
        const group: AnimationGroup = {
            name: clip.name || `animation_${clipIndex}`,
            duration: clip.duration,
            frameRate: clip.frameRate || DEFAULT_FRAME_RATE,
            isPlaying: started,
            currentTime: startTime,
            _startTime: startTime || undefined,
            targetedAnimations: clip.channels.map((ch) => {
                const nodeIndex = ch.nodeIdx >= 0 ? ch.nodeIdx : undefined;
                return {
                    target: nodeIndex !== undefined ? nodeTargets[nodeIndex] : undefined,
                    targetName: nodeIndex !== undefined ? nodeNames[nodeIndex] : undefined,
                    nodeIndex,
                    path: pathName(ch.path),
                };
            }),
            speedRatio: 1,
            loopAnimation: true,
            weight: 1,
            _ctrl: ctrl,
            _stopped: !started,
        };
        group._gltfMixer = [clip, nodes, skeletons];
        return group;
    });
}

function pathName(path: number): string {
    return path === PATH_TRANSLATION ? "translation" : path === PATH_ROTATION ? "rotation" : path === PATH_SCALE ? "scale" : path === PATH_POINTER ? "pointer" : "weights";
}

// ===== src/animation/animation-manager.ts =====
import type { EngineContext } from "../engine/engine.js";

/** A unit of per-frame animation work owned by an {@link AnimationManager}. */
export interface AnimationTask {
    /** @internal */
    readonly _entityType: "animation-task";
    active: boolean;
    /** @internal */
    _update: AnimationTaskUpdate;
    /** @internal */
    _dispose?: (manager: AnimationManager) => void;
    /** @internal */
    _category?: string;
    /** @internal */
    _owner?: AnimationManager;
}

/** Callback invoked each tick to advance a single {@link AnimationTask} by `deltaMs` milliseconds. */
export type AnimationTaskUpdate = (manager: AnimationManager, deltaMs: number, task: AnimationTask) => void;
/** Handler that drives all tasks of a given category in one pass; returns true if it handled that category this tick. */
export type AnimationTaskCategoryHandler = (manager: AnimationManager, deltaMs: number) => boolean;

/** Options for {@link createAnimationTask}. */
export interface AnimationTaskOptions {
    readonly category?: string;
    /** Called when the task is removed from its manager, allowing it to release any owned resources. */
    readonly dispose?: (manager: AnimationManager) => void;
}

/** Options for {@link createAnimationManager}. */
export interface AnimationManagerOptions {
    readonly engine?: EngineContext;
    readonly fixedDeltaMs?: number;
    /** Called after each autonomous tick with the step (in ms) that was applied. */
    readonly onUpdate?: (deltaMs: number) => void;
}

/** Owns a set of {@link AnimationTask}s and ticks them, either manually or via its own requestAnimationFrame loop. */
export interface AnimationManager {
    animations: AnimationTask[];
    fixedDeltaMs: number;
    running: boolean;
    readonly engine?: EngineContext;
    /** Called after each autonomous tick with the step (in ms) that was applied. */
    readonly onUpdate?: (deltaMs: number) => void;
    /** @internal Optional feature updaters installed by category-specific adapters. */
    _taskCategory?: string;
    /** @internal */
    _taskCategoryHandler?: AnimationTaskCategoryHandler;
    /** @internal Optional per-manager hook run each tick before the category handler (e.g. weight fades). */
    _preUpdate?: (manager: AnimationManager, deltaMs: number) => void;
    /** @internal */
    _rafId: number;
    /** @internal */
    _lastTime: number;
}

/** Creates an animation task that invokes `update` each tick.
 *  @param update - Callback that advances the task by the frame delta.
 *  @param options - Optional category and dispose hook.
 *  @returns The new, active animation task. */
export function createAnimationTask(update: AnimationTaskUpdate, options?: AnimationTaskOptions): AnimationTask {
    return {
        _entityType: "animation-task",
        active: true,
        _update: update,
        _category: options?.category,
        _dispose: options?.dispose,
    };
}

/** Creates an animation manager with no tasks attached.
 *  @param options - Optional engine, fixed timestep, and update callback.
 *  @returns The new manager. */
export function createAnimationManager(options?: AnimationManagerOptions): AnimationManager {
    return {
        animations: [],
        fixedDeltaMs: options?.fixedDeltaMs ?? 0,
        running: false,
        engine: options?.engine,
        onUpdate: options?.onUpdate,
        _rafId: 0,
        _lastTime: 0,
    };
}

/** Registers a single category `handler` on `manager` that drives every task tagged with `category` in one pass.
 *  @throws If `category` is empty. */
export function setAnimationTaskCategoryHandler(manager: AnimationManager, category: string, handler: AnimationTaskCategoryHandler): void {
    if (!category) {
        throw new Error("Animation task category is required.");
    }
    manager._taskCategory = category;
    manager._taskCategoryHandler = handler;
}

/** Attaches `task` to `manager` and marks it active.
 *  @throws If the task is already attached to a different manager. */
export function addAnimationTask(manager: AnimationManager, task: AnimationTask): void {
    const owner = task._owner;
    if (owner === manager) {
        return;
    }
    if (owner) {
        throw new Error("AnimationTask is already attached to another AnimationManager");
    }
    task.active = true;
    task._owner = manager;
    manager.animations.push(task);
}

/** Detaches `task` from `manager`, marking it inactive and running its dispose hook if it was attached. */
export function removeAnimationTask(manager: AnimationManager, task: AnimationTask): void {
    const index = manager.animations.indexOf(task);
    if (index !== -1) {
        removeAnimationTaskAt(manager, index);
    } else if (task._owner === manager) {
        task._owner = undefined;
        task.active = false;
    }
}

/** Removes and disposes every task attached to `manager`. */
export function clearAnimationManager(manager: AnimationManager): void {
    while (manager.animations.length > 0) {
        removeAnimationTaskAt(manager, manager.animations.length - 1);
    }
}

/** Advances every active task by `deltaMs` (or by `fixedDeltaMs` when set), running the category handler first.
 *  Ignores non-finite or negative steps. */
export function updateAnimationManager(manager: AnimationManager, deltaMs: number): void {
    const step = manager.fixedDeltaMs > 0 ? manager.fixedDeltaMs : deltaMs;
    if (!Number.isFinite(step) || step < 0) {
        return;
    }
    manager._preUpdate?.(manager, step);
    const handledCategory = manager._taskCategoryHandler?.(manager, step) ? manager._taskCategory : undefined;
    // Snapshot the list so a task's _update callback can remove itself or other
    // tasks (via removeAnimationTask) without shifting unvisited tasks out of the
    // iteration. Removed tasks are marked inactive and skipped below.
    const tasks = manager.animations.slice();
    for (let index = 0; index < tasks.length; index++) {
        const task = tasks[index]!;
        if (!task.active || (task._category && task._category === handledCategory)) {
            continue;
        }
        task._update(manager, step, task);
    }
}

/** Starts the manager's autonomous requestAnimationFrame loop. No-op if already running.
 *  @throws If `requestAnimationFrame` is unavailable in the host environment. */
export function startAnimationManager(manager: AnimationManager): void {
    if (manager.running) {
        return;
    }
    if (typeof requestAnimationFrame !== "function" || typeof cancelAnimationFrame !== "function") {
        throw new Error("AnimationManager autonomous mode requires requestAnimationFrame");
    }
    manager.running = true;
    manager._lastTime = 0;
    const tick = (now: number): void => {
        if (!manager.running) {
            return;
        }
        const deltaMs = manager._lastTime > 0 ? now - manager._lastTime : 0;
        manager._lastTime = now;
        const step = manager.fixedDeltaMs > 0 ? manager.fixedDeltaMs : deltaMs;
        updateAnimationManager(manager, deltaMs);
        manager.onUpdate?.(step);
        manager._rafId = requestAnimationFrame(tick);
    };
    manager._rafId = requestAnimationFrame(tick);
}

/** Stops the manager's autonomous requestAnimationFrame loop. No-op if not running. */
export function stopAnimationManager(manager: AnimationManager): void {
    if (!manager.running) {
        return;
    }
    cancelAnimationFrame(manager._rafId);
    manager._rafId = 0;
    manager._lastTime = 0;
    manager.running = false;
}

function removeAnimationTaskAt(manager: AnimationManager, index: number): void {
    const task = manager.animations[index]!;
    manager.animations.splice(index, 1);
    if (task._owner === manager) {
        task._owner = undefined;
    }
    task.active = false;
    task._dispose?.(manager);
}

// ===== src/animation/animation-tick.ts =====
// Tiny always-loaded forwarder for the per-frame animation tick. The real implementation
// (state sync + controller advance + writeback) lives in the dynamically-loaded animation
// module and registers itself here when the first animation group is created. This keeps the
// always-loaded scene render loop free of the animation logic (and of animation-group.ts),
// while staying fully synchronous: a scene cannot hold animation groups unless the animation
// module already loaded and registered the implementation, which happens before the first
// rendered frame can call tickAnimation.

import type { EngineContext } from "../engine/engine.js";
import type { AnimationGroup } from "./animation-group.js";

type TickAnimationFn = (group: AnimationGroup, deltaMs: number, engine?: EngineContext) => void;

let _tickAnimationImpl: TickAnimationFn | null = null;

/** @internal Register the real tick implementation. Called by the animation group factories. */
export function _setTickAnimationImpl(impl: TickAnimationFn): void {
    _tickAnimationImpl = impl;
}

/** @internal Advance animation by deltaMs. Forwards to the implementation registered when the
 *  first animation group was created; a no-op before any group exists. */
export function tickAnimation(group: AnimationGroup, deltaMs: number, engine?: EngineContext): void {
    _tickAnimationImpl?.(group, deltaMs, engine);
}

// ===== src/animation/animation-weight-fade.ts =====
import type { AnimationGroup } from "./animation-group.js";
import type { AnimationManager } from "./animation-manager.js";

// Weight-fade scheduling, decoupled from any specific blend mixer. A fade only tweens
// group.weight over time; whichever blend mixer is active (skeletal via
// enableAnimationBlending, or property via enablePropertyAnimationBlending) reads that
// weight to produce the blended pose. Keeping this mixer-agnostic preserves tree-shaking
// (a skeletal cross-fade must not pull in the property mixer, and vice versa) and avoids
// clobbering the manager's single category-handler slot.

interface AnimationWeightFade {
    readonly group: AnimationGroup;
    readonly from: number;
    readonly to: number;
    readonly durationMs: number;
    elapsedMs: number;
}

/** Options for {@link fadeAnimationWeight}. */
export interface FadeAnimationWeightOptions {
    readonly to: number;
    readonly durationMs: number;
    readonly from?: number;
}

/** Options for {@link crossFadeAnimationGroups}. */
export interface CrossFadeAnimationGroupsOptions {
    readonly durationMs: number;
    readonly toWeight?: number;
}

let fadesByManager: WeakMap<AnimationManager, AnimationWeightFade[]> | undefined;
/** Any `_preUpdate` hook that existed before the fade scheduler installed its own, preserved so
 *  the scheduler composes with (rather than clobbers) other per-manager pre-update behavior. */
let priorPreUpdateByManager: WeakMap<AnimationManager, NonNullable<AnimationManager["_preUpdate"]>> | undefined;

function getFades(manager: AnimationManager): AnimationWeightFade[] {
    fadesByManager ??= new WeakMap();
    let fades = fadesByManager.get(manager);
    if (!fades) {
        fades = [];
        fadesByManager.set(manager, fades);
    }
    return fades;
}

/** Per-manager pre-update hook: runs any pre-existing hook first, then advances all scheduled
 *  weight fades before the blend mixer runs. A stable module constant so installing it is
 *  idempotent — it is never wrapped, so repeated installs cannot grow a wrapper chain. */
function runManagerWeightFades(manager: AnimationManager, deltaMs: number): void {
    priorPreUpdateByManager?.get(manager)?.(manager, deltaMs);
    const fades = fadesByManager?.get(manager);
    if (fades) {
        updateFades(fades, deltaMs);
    }
}

/** Install {@link runManagerWeightFades} as the manager's pre-update hook exactly once, preserving
 *  any hook that was already present so both run each tick. */
function installWeightFadeHook(manager: AnimationManager): void {
    if (manager._preUpdate === runManagerWeightFades) {
        return;
    }
    if (manager._preUpdate) {
        (priorPreUpdateByManager ??= new WeakMap()).set(manager, manager._preUpdate);
    }
    manager._preUpdate = runManagerWeightFades;
}

/** Animates `group`'s blend weight toward `options.to` over `options.durationMs`.
 *
 *  Only schedules the weight tween — it does NOT enable blending. The caller must have enabled
 *  the appropriate mixer (`enableAnimationBlending` for skeletal/glTF groups, or
 *  `enablePropertyAnimationBlending` for property groups); if none is enabled the weight still
 *  tweens but no pose is blended.
 *  @throws If `to`/`from` are outside `[0, 1]` or the duration is not a finite positive number. */
export function fadeAnimationWeight(manager: AnimationManager, group: AnimationGroup, options: FadeAnimationWeightOptions): void {
    const to = validateWeight(options.to);
    const from = options.from === undefined ? group.weight : validateWeight(options.from);
    if (!(options.durationMs > 0) || !Number.isFinite(options.durationMs)) {
        throw new Error(`Animation weight fade duration must be a finite positive number, got ${options.durationMs}`);
    }

    group.weight = from;
    const fades = getFades(manager);
    for (let i = fades.length - 1; i >= 0; i--) {
        if (fades[i]!.group === group) {
            fades.splice(i, 1);
        }
    }
    fades.push({ group, from, to, durationMs: options.durationMs, elapsedMs: 0 });
    installWeightFadeHook(manager);
}

/** Cross-fades from `fromGroup` to `toGroup`, fading the first to weight 0 and the second to `options.toWeight` (default 1).
 *  Requires blending to be enabled on `manager` (see {@link fadeAnimationWeight}). */
export function crossFadeAnimationGroups(manager: AnimationManager, fromGroup: AnimationGroup, toGroup: AnimationGroup, options: CrossFadeAnimationGroupsOptions): void {
    const toWeight = validateWeight(options.toWeight ?? 1);
    fadeAnimationWeight(manager, fromGroup, { to: 0, durationMs: options.durationMs });
    fadeAnimationWeight(manager, toGroup, { to: toWeight, durationMs: options.durationMs });
}

function updateFades(fades: AnimationWeightFade[], deltaMs: number): void {
    for (let i = fades.length - 1; i >= 0; i--) {
        const fade = fades[i]!;
        fade.elapsedMs = Math.min(fade.durationMs, fade.elapsedMs + Math.max(0, deltaMs));
        const t = fade.elapsedMs / fade.durationMs;
        fade.group.weight = fade.from + (fade.to - fade.from) * t;
        if (fade.elapsedMs >= fade.durationMs) {
            fade.group.weight = fade.to;
            fades.splice(i, 1);
        }
    }
}

function validateWeight(weight: number): number {
    if (!Number.isFinite(weight) || weight < 0 || weight > 1) {
        throw new Error(`Animation weight must be a finite number between 0 and 1, got ${weight}`);
    }
    return weight;
}

// ===== src/animation/animation-weight.ts =====
import type { AnimationGroup } from "./animation-group.js";

/** Set the weighted contribution for an animation group. Feature-specific mixers remain explicit opt-ins. */
export function setAnimationWeight(group: AnimationGroup, weight: number): void {
    if (!Number.isFinite(weight) || weight < 0 || weight > 1) {
        throw new Error(`Animation weight must be a finite number between 0 and 1, got ${weight}`);
    }
    group.weight = weight;
}

// ===== src/animation/easing.ts =====
/** A segment-local animation progress transform. */
export type AnimationEasing = (gradient: number) => number;

/** Circular ease-in. */
export function circleEase(gradient: number): number {
    const clamped = Math.max(0, Math.min(1, gradient));
    return 1 - Math.sqrt(1 - clamped * clamped);
}

/** Quadratic ease-in. */
export function quadraticEase(gradient: number): number {
    return gradient * gradient;
}

/** Cubic ease-in. */
export function cubicEase(gradient: number): number {
    return gradient * gradient * gradient;
}

/** Quartic ease-in. */
export function quarticEase(gradient: number): number {
    const squared = gradient * gradient;
    return squared * squared;
}

/** Quintic ease-in. */
export function quinticEase(gradient: number): number {
    const squared = gradient * gradient;
    return squared * squared * gradient;
}

/** Sinusoidal ease-in. */
export function sineEase(gradient: number): number {
    return 1 - Math.sin((Math.PI / 2) * (1 - gradient));
}

/** Power ease-in. */
export function powerEase(gradient: number, power = 2): number {
    return Math.pow(gradient, Math.max(0, power));
}

/** Exponential ease-in. */
export function exponentialEase(gradient: number, exponent = 2): number {
    return exponent <= 0 ? gradient : (Math.exp(exponent * gradient) - 1) / (Math.exp(exponent) - 1);
}

/** Back ease-in. */
export function backEase(gradient: number, amplitude = 1): number {
    return gradient * gradient * gradient - gradient * Math.max(0, amplitude) * Math.sin(Math.PI * gradient);
}

/** Elastic ease-in. */
export function elasticEase(gradient: number, oscillations = 3, springiness = 3): number {
    const clampedOscillations = Math.max(0, oscillations);
    const clampedSpringiness = Math.max(0, springiness);
    const magnitude = clampedSpringiness === 0 ? gradient : (Math.exp(clampedSpringiness * gradient) - 1) / (Math.exp(clampedSpringiness) - 1);
    return magnitude * Math.sin((2 * Math.PI * clampedOscillations + Math.PI / 2) * gradient);
}

/** Bounce ease-in. */
export function bounceEase(gradient: number, bounces = 3, bounciness = 2): number {
    const clampedBounces = Math.max(0, bounces);
    const safeBounciness = bounciness <= 1 ? 1.001 : bounciness;
    const bouncePower = Math.pow(safeBounciness, clampedBounces);
    const inverseScale = 1 - safeBounciness;
    const scale = (1 - bouncePower) / inverseScale + bouncePower * 0.5;
    const scaledGradient = gradient * scale;
    const bounce = Math.floor(Math.log(-scaledGradient * inverseScale + 1) / Math.log(safeBounciness));
    const nextBounce = bounce + 1;
    const start = (1 - Math.pow(safeBounciness, bounce)) / (inverseScale * scale);
    const end = (1 - Math.pow(safeBounciness, nextBounce)) / (inverseScale * scale);
    const midpoint = (start + end) * 0.5;
    const offset = gradient - midpoint;
    const radius = midpoint - start;
    return (-Math.pow(1 / safeBounciness, clampedBounces - bounce) / (radius * radius)) * (offset - radius) * (offset + radius);
}

/**
 * Cubic Bezier ease-in from (0, 0) to (1, 1).
 *
 * The control-point x coordinates define time, so the curve parameter is refined
 * before sampling y. Results outside the animation interval settle to an endpoint.
 */
export function bezierCurveEase(gradient: number, x1 = 0, y1 = 0, x2 = 1, y2 = 1): number {
    if (gradient === 0) {
        return 0;
    }
    const xCubic = 1 - 3 * x2 + 3 * x1;
    const xQuadratic = 3 * x2 - 6 * x1;
    const xLinear = 3 * x1;
    let curveTime = gradient;
    for (let iteration = 0; iteration < 5; iteration++) {
        const squaredTime = curveTime * curveTime;
        const x = xCubic * squaredTime * curveTime + xQuadratic * squaredTime + xLinear * curveTime;
        const derivative = 3 * xCubic * squaredTime + 2 * xQuadratic * curveTime + xLinear;
        curveTime -= (x - gradient) / derivative;
        curveTime = Math.min(1, Math.max(0, curveTime));
    }
    const inverseTime = 1 - curveTime;
    return 3 * inverseTime * inverseTime * curveTime * y1 + 3 * inverseTime * curveTime * curveTime * y2 + curveTime * curveTime * curveTime;
}

/** Create a callback using a fixed power. */
export function createPowerEase(power = 2): AnimationEasing {
    return (gradient) => powerEase(gradient, power);
}

/** Create a callback using a fixed exponential exponent. */
export function createExponentialEase(exponent = 2): AnimationEasing {
    return (gradient) => exponentialEase(gradient, exponent);
}

/** Create a callback using a fixed back amplitude. */
export function createBackEase(amplitude = 1): AnimationEasing {
    return (gradient) => backEase(gradient, amplitude);
}

/** Create a callback using fixed elastic parameters. */
export function createElasticEase(oscillations = 3, springiness = 3): AnimationEasing {
    return (gradient) => elasticEase(gradient, oscillations, springiness);
}

/** Create a callback using fixed bounce parameters. */
export function createBounceEase(bounces = 3, bounciness = 2): AnimationEasing {
    return (gradient) => bounceEase(gradient, bounces, bounciness);
}

/** Create a callback using fixed cubic Bezier control points. */
export function createBezierCurveEase(x1 = 0, y1 = 0, x2 = 1, y2 = 1): AnimationEasing {
    return (gradient) => bezierCurveEase(gradient, x1, y1, x2, y2);
}

// ===== src/animation/evaluate.ts =====
// Keyframe interpolation engine — LINEAR, STEP, CUBICSPLINE.
// Pure functions, zero allocation in the hot path.

import { F32 } from "../engine/typed-arrays.js";
import type { AnimationEasing } from "./easing.js";
import type { AnimationSampler } from "./types.js";
import { INTERP_STEP, INTERP_CUBICSPLINE } from "./types.js";

/** Binary search: find index i such that `input[i] <= t < input[i+1]`. */
function findKeyframe(input: Float32Array, t: number): number {
    let lo = 0;
    let hi = input.length - 1;
    if (t <= input[0]!) {
        return 0;
    }
    if (t >= input[hi]!) {
        return hi > 0 ? hi - 1 : 0;
    }
    while (lo < hi - 1) {
        const mid = (lo + hi) >> 1;
        if (input[mid]! <= t) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    return lo;
}

// Reusable scratch for quaternion slerp (avoids per-call allocation)
const _quat = new F32([0, 0, 0, 1]);

/** Normalise 4 consecutive components (quaternion) in-place. No-op on zero length. */
function normalizeQuat4(buf: Float32Array, o: number): void {
    const x = buf[o]!;
    const y = buf[o + 1]!;
    const z = buf[o + 2]!;
    const w = buf[o + 3]!;
    const lenSq = x * x + y * y + z * z + w * w;
    if (lenSq > 0) {
        const inv = 1 / Math.sqrt(lenSq);
        buf[o] = x * inv;
        buf[o + 1] = y * inv;
        buf[o + 2] = z * inv;
        buf[o + 3] = w * inv;
    }
}

/** Spherical linear interpolation between two quaternions. Writes to out[].
 *  Lives here (not in math/mat4.ts) so non-animated scenes don't pay for it. */
function quatSlerp(out: Float32Array, ax: number, ay: number, az: number, aw: number, bx: number, by: number, bz: number, bw: number, t: number): void {
    let dot = ax * bx + ay * by + az * bz + aw * bw;
    if (dot < 0) {
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
        dot = -dot;
    }
    if (dot > 0.9995) {
        // Near-parallel: linear interpolation + normalize
        out[0] = ax + t * (bx - ax);
        out[1] = ay + t * (by - ay);
        out[2] = az + t * (bz - az);
        out[3] = aw + t * (bw - aw);
        normalizeQuat4(out, 0);
        return;
    }
    const theta = Math.acos(dot);
    const sinTheta = Math.sin(theta);
    const wa = Math.sin((1 - t) * theta) / sinTheta;
    const wb = Math.sin(t * theta) / sinTheta;
    out[0] = wa * ax + wb * bx;
    out[1] = wa * ay + wb * by;
    out[2] = wa * az + wb * bz;
    out[3] = wa * aw + wb * bw;
}

/** Babylon.js-compatible quaternion interpolation for caller-authored property animation. */
function propertyQuatSlerp(out: Float32Array, ax: number, ay: number, az: number, aw: number, bx: number, by: number, bz: number, bw: number, t: number): void {
    let dot = ax * bx + ay * by + az * bz + aw * bw;
    let endWeight: number;
    let startWeight: number;
    const negateEnd = dot < 0;
    if (negateEnd) {
        dot = -dot;
    }
    if (dot > 0.999999) {
        startWeight = 1 - t;
        endWeight = negateEnd ? -t : t;
    } else {
        const angle = Math.acos(dot);
        const inverseSine = 1 / Math.sin(angle);
        startWeight = Math.sin((1 - t) * angle) * inverseSine;
        endWeight = (negateEnd ? -1 : 1) * Math.sin(t * angle) * inverseSine;
    }
    out[0] = startWeight * ax + endWeight * bx;
    out[1] = startWeight * ay + endWeight * by;
    out[2] = startWeight * az + endWeight * bz;
    out[3] = startWeight * aw + endWeight * bw;
}

function copySample(output: Float32Array, srcOffset: number, stride: number, dst: Float32Array, dstOffset: number): void {
    for (let c = 0; c < stride; c++) {
        dst[dstOffset + c] = output[srcOffset + c]!;
    }
}

function interpolateLinearSample(output: Float32Array, keyIndex: number, stride: number, isQuat: boolean, gradient: number, dst: Float32Array, dstOffset: number): void {
    const s0 = keyIndex * stride;
    const s1 = (keyIndex + 1) * stride;
    if (isQuat) {
        propertyQuatSlerp(_quat, output[s0]!, output[s0 + 1]!, output[s0 + 2]!, output[s0 + 3]!, output[s1]!, output[s1 + 1]!, output[s1 + 2]!, output[s1 + 3]!, gradient);
        dst[dstOffset] = _quat[0]!;
        dst[dstOffset + 1] = _quat[1]!;
        dst[dstOffset + 2] = _quat[2]!;
        dst[dstOffset + 3] = _quat[3]!;
        return;
    }
    for (let c = 0; c < stride; c++) {
        dst[dstOffset + c] = output[s0 + c]! + gradient * (output[s1 + c]! - output[s0 + c]!);
    }
}

/**
 * Evaluate a sampler at time `t` and write the result into `dst` at `dstOffset`.
 * @param stride - Number of components per value (3 for vec3, 4 for quat).
 * @param isQuat - True for rotation channels (uses slerp instead of lerp).
 */
export function evaluateSampler(sampler: AnimationSampler, t: number, stride: number, isQuat: boolean, dst: Float32Array, dstOffset: number): void {
    const { input, output, interpolation } = sampler;
    const keyCount = input.length;

    if (keyCount === 0) {
        return;
    }
    if (keyCount === 1 || t <= input[0]!) {
        // Clamp to first keyframe
        const srcOff = interpolation === INTERP_CUBICSPLINE ? stride : 0; // skip in-tangent
        for (let c = 0; c < stride; c++) {
            dst[dstOffset + c] = output[srcOff + c]!;
        }
        return;
    }
    const idx = findKeyframe(input, t);
    const t0 = input[idx]!;
    const t1 = input[idx + 1]!;

    if (interpolation === INTERP_STEP) {
        const srcOff = (t >= t1 ? idx + 1 : idx) * stride;
        for (let c = 0; c < stride; c++) {
            dst[dstOffset + c] = output[srcOff + c]!;
        }
        return;
    }

    const dt = t1 - t0;
    const f = t >= t1 ? 1 : dt > 0 ? (t - t0) / dt : 0; // fractional time between keyframes

    if (interpolation === INTERP_CUBICSPLINE) {
        // Hermite spline: p(t) = (2t³-3t²+1)p0 + (t³-2t²+t)m0 + (-2t³+3t²)p1 + (t³-t²)m1
        const f2 = f * f;
        const f3 = f2 * f;
        const h00 = 2 * f3 - 3 * f2 + 1;
        const h10 = f3 - 2 * f2 + f;
        const h01 = -2 * f3 + 3 * f2;
        const h11 = f3 - f2;

        const k0 = idx * stride * 3; // [inTangent0, value0, outTangent0]
        const k1 = (idx + 1) * stride * 3;
        for (let c = 0; c < stride; c++) {
            const p0 = output[k0 + stride + c]!; // value at idx
            const m0 = output[k0 + 2 * stride + c]! * dt; // outTangent at idx * deltaTime
            const p1 = output[k1 + stride + c]!; // value at idx+1
            const m1 = output[k1 + c]! * dt; // inTangent at idx+1 * deltaTime
            dst[dstOffset + c] = h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1;
        }

        // Normalize quaternion result for cubicspline rotation
        if (isQuat) {
            normalizeQuat4(dst, dstOffset);
        }
        return;
    }

    // LINEAR interpolation
    const s0 = idx * stride;
    const s1 = (idx + 1) * stride;

    if (isQuat) {
        quatSlerp(_quat, output[s0]!, output[s0 + 1]!, output[s0 + 2]!, output[s0 + 3]!, output[s1]!, output[s1 + 1]!, output[s1 + 2]!, output[s1 + 3]!, f);
        dst[dstOffset] = _quat[0]!;
        dst[dstOffset + 1] = _quat[1]!;
        dst[dstOffset + 2] = _quat[2]!;
        dst[dstOffset + 3] = _quat[3]!;
    } else {
        for (let c = 0; c < stride; c++) {
            dst[dstOffset + c] = output[s0 + c]! + f * (output[s1 + c]! - output[s0 + c]!);
        }
    }
}

/**
 * Evaluate a caller-authored property sampler with an optional transform of the
 * selected segment's normalized progress. Kept separate from {@link evaluateSampler}
 * so imported glTF samplers retain their unchanged LINEAR/STEP/CUBICSPLINE path.
 */
export function evaluatePropertySampler(
    sampler: AnimationSampler,
    t: number,
    stride: number,
    isQuat: boolean,
    easing: AnimationEasing | undefined,
    dst: Float32Array,
    dstOffset: number
): void {
    const { input, output, interpolation } = sampler;
    // Property key times are stored as Float32. Canonicalize caller-authored
    // double-precision times to the same domain so exact frame/key boundaries
    // select the authored key rather than the preceding STEP segment.
    const sampleTime = Math.fround(t);
    const keyCount = input.length;

    if (keyCount === 0) {
        return;
    }
    if (keyCount === 1 || sampleTime <= input[0]!) {
        copySample(output, 0, stride, dst, dstOffset);
        return;
    }
    if (sampleTime >= input[keyCount - 1]!) {
        copySample(output, (keyCount - 1) * stride, stride, dst, dstOffset);
        return;
    }

    const idx = findKeyframe(input, sampleTime);
    if (interpolation === INTERP_STEP) {
        copySample(output, idx * stride, stride, dst, dstOffset);
        return;
    }

    const t0 = input[idx]!;
    const t1 = input[idx + 1]!;
    const dt = t1 - t0;
    const linearGradient = dt > 0 ? (sampleTime - t0) / dt : 0;
    const gradient = easing ? easing(linearGradient) : linearGradient;

    interpolateLinearSample(output, idx, stride, isQuat, gradient, dst, dstOffset);
}

// ===== src/animation/frame-interpolation.ts =====
import type { SceneContext } from "../scene/scene-core.js";

/** Coerce an unknown rejection reason (e.g. `AbortSignal.reason`, which is typed `any`) to an Error. */
function toError(reason: unknown): Error {
    return reason instanceof Error ? reason : new Error(String(reason));
}

/**
 * Shared sentinel used to retire a finished driver in place. `scene._beforeRender` is walked with a
 * live `for...of` loop each frame, so a finished driver must not change the array length mid-frame
 * (that would skip the next callback). It swaps itself for this noop instead; trailing noops are then
 * trimmed so the array cannot grow without bound.
 */
const RetiredDriver = (): void => {};

/**
 * Per-frame update callback driven by {@link runFrameInterpolation}. Called once
 * per rendered frame with the frame's delta time in seconds.
 * @param deltaSeconds - Elapsed time since the previous frame, in seconds.
 * @returns `true` to keep interpolating next frame, or `false` when the goal has
 *   been reached (natural completion). To cancel the interpolation, throw — the
 *   thrown value becomes the returned promise's rejection reason.
 */
export type FrameInterpolationStep = (deltaSeconds: number) => boolean;

/**
 * Drive a per-frame interpolation from a scene's render loop until it completes,
 * is canceled via the abort signal, or the step throws. This owns the
 * `scene._beforeRender` registration and guarantees the callback is detached on
 * every exit path (completion, cancellation, or error). It is entity-agnostic —
 * it knows nothing about cameras or transforms.
 * @param scene - The scene whose render loop advances the interpolation.
 * @param step - The per-frame update. Return `false` to finish; throw to cancel.
 * @param signal - Optional abort signal. When it aborts, the loop is detached and
 *   the returned promise rejects with the signal's reason. If it is already
 *   aborted, `step` never runs.
 * @returns A promise that resolves when `step` returns `false` (completed) and
 *   rejects if `step` throws or the signal aborts.
 */
export function runFrameInterpolation(scene: SceneContext, step: FrameInterpolationStep, signal?: AbortSignal): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (signal?.aborted) {
            reject(toError(signal.reason));
            return;
        }

        let settled = false;
        let onAbort: (() => void) | undefined;

        // Detach the driver and stop listening for aborts. Idempotent via the
        // `settled` guard so completion, cancellation, and abort can't double-act.
        const finish = (): void => {
            if (settled) {
                return;
            }
            settled = true;
            const list = scene._beforeRender;
            const index = list.indexOf(driver);
            if (index >= 0) {
                // Do NOT splice: scene-core walks `_beforeRender` with a live for-of, so shrinking the
                // array mid-frame (finish() can run from inside `driver` during that walk) would skip
                // the next callback — e.g. another active interpolation. Retire the slot in place, then
                // trim any trailing retired slots so the array can't grow without bound.
                list[index] = RetiredDriver;
                while (list.length > 0 && list[list.length - 1] === RetiredDriver) {
                    list.pop();
                }
            }
            if (onAbort && signal) {
                signal.removeEventListener("abort", onAbort);
            }
        };

        const driver = (deltaMs: number): void => {
            if (settled) {
                return;
            }
            // Fall back to a nominal 60 FPS step when the render loop reports a
            // non-positive delta, so the interpolation always makes progress.
            const deltaSeconds = (deltaMs > 0 ? deltaMs : 1000 / 60) / 1000;
            let shouldContinue: boolean;
            try {
                shouldContinue = step(deltaSeconds);
            } catch (error) {
                finish();
                reject(toError(error));
                return;
            }
            if (!shouldContinue) {
                finish();
                resolve();
            }
        };

        if (signal) {
            onAbort = (): void => {
                finish();
                reject(toError(signal.reason));
            };
            signal.addEventListener("abort", onAbort);
        }

        scene._beforeRender.push(driver);
    });
}

// ===== src/animation/property-animation.ts =====
import { F32 } from "../engine/typed-arrays.js";
import { playAnimation, _installTickAnimation } from "./animation-group.js";
import type { AnimationGroup, AnimationPropertyRuntimeTrack } from "./animation-group.js";
import { addAnimationGroup } from "./animation-group-task.js";
import type { AnimationManager } from "./animation-manager.js";
import { INTERP_LINEAR, INTERP_STEP } from "./types.js";
import type { AnimationSampler } from "./types.js";
import { evaluatePropertySampler } from "./evaluate.js";
import type { AnimationEasing } from "./easing.js";
import type { AnimationController } from "../skeleton/skeleton-updater.js";

const DEFAULT_FRAME_RATE = 60;

/** A keyframe value: a single scalar or a fixed-length tuple of components (e.g. a vector or quaternion). */
export type AnimationKeyframeValue = number | readonly number[];

/** A single keyframe on a property animation track. Supply exactly one of `time` (seconds) or `frame`. */
export interface AnimationKeyframe {
    readonly time?: number;
    readonly frame?: number;
    readonly value: AnimationKeyframeValue;
}

/** Interpolation mode between keyframes: smooth `"linear"` or hold-previous `"step"`. */
export type PropertyAnimationInterpolation = "linear" | "step";

/** Options describing one animated property track passed to {@link createPropertyAnimationClip}. */
export interface PropertyAnimationTrackOptions {
    readonly path: string;
    readonly keys: readonly AnimationKeyframe[];
    readonly frameRate?: number;
    readonly interpolation?: PropertyAnimationInterpolation;
    readonly quaternion?: boolean;
    /** Optional transform of normalized progress within each non-STEP segment. */
    readonly easing?: AnimationEasing;
}

/** Options for {@link createPropertyAnimationClip}. */
export interface PropertyAnimationClipOptions {
    readonly frameRate?: number;
}

/** A compiled animation track: a sampler plus the metadata needed to evaluate and write its property. */
export interface PropertyAnimationTrack {
    readonly path: string;
    readonly sampler: AnimationSampler;
    readonly stride: number;
    readonly quaternion: boolean;
    readonly easing?: AnimationEasing;
}

/** A reusable, target-independent set of compiled property tracks with a total duration. */
export interface PropertyAnimationClip {
    readonly name: string;
    readonly tracks: readonly PropertyAnimationTrack[];
    readonly duration: number;
    readonly frameRate: number;
}

/** Options for {@link createPropertyAnimationGroup}, controlling looping, speed, and play range. */
export interface CreatePropertyAnimationGroupOptions {
    readonly loop?: boolean;
    readonly speedRatio?: number;
    readonly fromFrame?: number;
    readonly toFrame?: number;
    readonly fromTime?: number;
    readonly toTime?: number;
}

type PropertyWriter = (output: Float32Array, offset: number) => void;

interface ResolvedPropertyBinding {
    readonly mixTarget: () => object;
    readonly mixProperty: string;
    readonly writer: PropertyWriter;
}

interface PathSettable {
    set: (...values: number[]) => void;
}

/** Compiles a set of track definitions into a reusable {@link PropertyAnimationClip}.
 *  @param name - Clip name.
 *  @param tracks - One or more track definitions; their keyframes are sorted and baked into samplers.
 *  @param options - Optional default frame rate.
 *  @returns The compiled clip, with its duration set to the longest track.
 *  @throws If no tracks are provided. */
export function createPropertyAnimationClip(name: string, tracks: readonly PropertyAnimationTrackOptions[], options?: PropertyAnimationClipOptions): PropertyAnimationClip {
    if (tracks.length === 0) {
        throw new Error("createPropertyAnimationClip requires at least one track");
    }
    const frameRate = options?.frameRate ?? tracks[0]?.frameRate ?? DEFAULT_FRAME_RATE;
    let duration = 0;
    const builtTracks = tracks.map((track) => {
        const trackFrameRate = track.frameRate ?? frameRate;
        const sampler = createSampler(track, trackFrameRate);
        const trackDuration = sampler.input[sampler.input.length - 1] ?? 0;
        if (trackDuration > duration) {
            duration = trackDuration;
        }
        return {
            path: track.path,
            sampler,
            stride: getTrackStride(track),
            quaternion: track.quaternion === true || track.path === "rotationQuaternion" || track.path.endsWith(".rotationQuaternion"),
            easing: track.easing,
        };
    });
    return { name, tracks: builtTracks, duration, frameRate };
}

/** Binds `clip` to `target`'s properties, creates a playing animation group, and attaches it to `manager`.
 *  @param manager - Animation manager that drives the resulting group.
 *  @param target - Object whose properties (resolved by each track's dotted path) are animated.
 *  @param clip - Compiled clip to play.
 *  @param options - Optional looping, speed, and play-range overrides.
 *  @returns The started animation group.
 *  @throws If the resolved play range does not have `toTime` greater than `fromTime`. */
export function createPropertyAnimationGroup(
    manager: AnimationManager,
    target: object,
    clip: PropertyAnimationClip,
    options?: CreatePropertyAnimationGroupOptions
): AnimationGroup {
    const runtimeTracks: AnimationPropertyRuntimeTrack[] = [];
    for (let i = 0; i < clip.tracks.length; i++) {
        const track = clip.tracks[i]!;
        const binding = resolvePropertyBinding(target, track.path, track.stride);
        runtimeTracks.push({
            sampler: track.sampler,
            stride: track.stride,
            quaternion: track.quaternion,
            easing: track.easing,
            writer: binding.writer,
            mixTarget: binding.mixTarget,
            mixProperty: binding.mixProperty,
        });
    }

    const fromTime = options?.fromTime ?? (options?.fromFrame !== undefined ? options.fromFrame / clip.frameRate : 0);
    const toTime = options?.toTime ?? (options?.toFrame !== undefined ? options.toFrame / clip.frameRate : clip.duration);
    if (!(toTime > fromTime)) {
        throw new Error("Animation play range must have toTime greater than fromTime");
    }

    const group = createPointerAnimationGroup(clip.name, clip.duration, clip.frameRate, runtimeTracks, fromTime, toTime, options);
    group.loopAnimation = options?.loop ?? true;
    group.speedRatio = options?.speedRatio ?? 1;
    group._propertyMixer = [runtimeTracks, fromTime, toTime, clip.duration];
    playAnimation(group);
    addAnimationGroup(manager, group);
    return group;
}

function createPointerAnimationGroup(
    name: string,
    duration: number,
    frameRate: number,
    tracks: readonly AnimationPropertyRuntimeTrack[],
    fromTime: number,
    toTime: number,
    options?: CreatePropertyAnimationGroupOptions
): AnimationGroup {
    const applyAt = (time: number): void => {
        for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
            const track = tracks[trackIndex]!;
            evaluatePropertySampler(track.sampler, time, track.stride, track.quaternion, track.easing, _pointerScratch, 0);
            track.writer(_pointerScratch, 0);
            track._afterWrite?.();
        }
    };
    const ctrl: AnimationController = {
        time: fromTime,
        playing: false,
        speedRatio: options?.speedRatio ?? 1,
        loop: options?.loop ?? true,
        tick(deltaMs: number): void {
            if (!ctrl.playing) {
                return;
            }
            ctrl.time += (deltaMs / 1000) * ctrl.speedRatio;
            const rangeDuration = Math.max(0, toTime - fromTime);
            if (rangeDuration <= 0) {
                return;
            }
            if (ctrl.loop) {
                ctrl.time = fromTime + ((ctrl.time - fromTime) % rangeDuration);
                if (ctrl.time < fromTime) {
                    ctrl.time += rangeDuration;
                }
            } else {
                ctrl.time = Math.min(Math.max(ctrl.time, fromTime), toTime);
            }
            applyAt(ctrl.time);
            if (!ctrl.loop && ctrl.speedRatio >= 0 && ctrl.time >= toTime) {
                ctrl.playing = false;
                group.isPlaying = false;
                group._stopped = true;
            }
        },
    };
    _installTickAnimation();
    const group: AnimationGroup = {
        name,
        duration,
        frameRate: frameRate || DEFAULT_FRAME_RATE,
        isPlaying: false,
        currentTime: fromTime,
        _startTime: fromTime || undefined,
        targetedAnimations: tracks.map((track) => ({ target: track.mixTarget(), path: track.mixProperty })),
        speedRatio: options?.speedRatio ?? 1,
        loopAnimation: options?.loop ?? true,
        weight: 1,
        _ctrl: ctrl,
        _stopped: false,
        _evaluate: () => {
            ctrl.time = Math.min(Math.max(ctrl.time, 0), duration);
            applyAt(ctrl.time);
        },
    };
    return group;
}

const _pointerScratch = new F32(16);

function createSampler(track: PropertyAnimationTrackOptions, frameRate: number): AnimationSampler {
    if (track.keys.length === 0) {
        throw new Error(`Animation track "${track.path}" requires at least one key`);
    }
    if (!(frameRate > 0)) {
        throw new Error(`Animation track "${track.path}" requires a positive frameRate`);
    }

    const stride = getTrackStride(track);
    const sorted = [...track.keys].sort((a, b) => getKeyTime(a, frameRate, track.path) - getKeyTime(b, frameRate, track.path));
    const input = new F32(sorted.length);
    const output = new F32(sorted.length * stride);
    let lastTime = -Infinity;
    for (let i = 0; i < sorted.length; i++) {
        const key = sorted[i]!;
        const time = getKeyTime(key, frameRate, track.path);
        if (time < lastTime) {
            throw new Error(`Animation track "${track.path}" key times must be monotonically increasing`);
        }
        input[i] = time;
        lastTime = time;
        writeKeyValue(track.path, key.value, stride, output, i * stride);
    }
    return {
        input,
        output,
        interpolation: track.interpolation === "step" ? INTERP_STEP : INTERP_LINEAR,
    };
}

function getTrackStride(track: PropertyAnimationTrackOptions): number {
    const value = track.keys[0]?.value;
    if (value === undefined) {
        throw new Error(`Animation track "${track.path}" requires at least one key`);
    }
    return typeof value === "number" ? 1 : value.length;
}

function getKeyTime(key: AnimationKeyframe, frameRate: number, path: string): number {
    const hasTime = key.time !== undefined;
    const hasFrame = key.frame !== undefined;
    if (hasTime === hasFrame) {
        throw new Error(`Animation key for "${path}" must provide exactly one of time or frame`);
    }
    const time = hasTime ? key.time! : key.frame! / frameRate;
    if (!(time >= 0)) {
        throw new Error(`Animation key for "${path}" must have a non-negative time`);
    }
    return time;
}

function writeKeyValue(path: string, value: AnimationKeyframeValue, stride: number, output: Float32Array, offset: number): void {
    if (typeof value === "number") {
        if (stride !== 1) {
            throw new Error(`Animation key for "${path}" expected ${stride} values`);
        }
        output[offset] = value;
        return;
    }
    if (value.length !== stride) {
        throw new Error(`Animation key for "${path}" expected ${stride} values`);
    }
    for (let i = 0; i < stride; i++) {
        output[offset + i] = value[i]!;
    }
}

function resolvePropertyBinding(target: object, path: string, stride: number): ResolvedPropertyBinding {
    const parts = path.split(".");
    if (parts.length === 0 || parts.some((p) => p.length === 0)) {
        throw new Error(`Invalid animation property path "${path}"`);
    }

    const property = parts[parts.length - 1]!;
    const mixTarget = createMixTargetResolver(target, parts, property, path);
    const owner = mixTarget();

    return { mixTarget, mixProperty: property, writer: createPathPropertyWriter(mixTarget, owner, property, stride, path) };
}

function resolvePropertyOwner(target: object, parts: readonly string[], path: string): Record<string, unknown> {
    let owner: unknown = target;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]!;
        const record = asRecord(owner, path);
        if (!(part in record)) {
            throw new Error(`Animation property path "${path}" could not resolve "${part}"`);
        }
        owner = record[part];
    }
    return asRecord(owner, path);
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
    if ((typeof value !== "object" && typeof value !== "function") || value === null) {
        throw new Error(`Animation property path "${path}" reached a non-object value`);
    }
    return value as Record<string, unknown>;
}

function isSettable(value: unknown): value is PathSettable {
    return (typeof value === "object" || typeof value === "function") && value !== null && typeof (value as { set?: unknown }).set === "function";
}

function createMixTargetResolver(target: object, parts: readonly string[], property: string, path: string): () => Record<string, unknown> {
    return () => {
        const owner = resolvePropertyOwner(target, parts, path);
        if (!(property in owner)) {
            throw new Error(`Animation property path "${path}" could not resolve "${property}"`);
        }
        return owner;
    };
}

function createPathPropertyWriter(
    resolveTarget: () => Record<string, unknown>,
    initialOwner: Record<string, unknown>,
    property: string,
    stride: number,
    path: string
): PropertyWriter {
    let owner = initialOwner;
    let write = createPropertyWriter(owner, property, stride, path);
    return (output, offset) => {
        const currentOwner = resolveTarget();
        if (currentOwner !== owner) {
            owner = currentOwner;
            write = createPropertyWriter(owner, property, stride, path);
        }
        write(output, offset);
    };
}

function createPropertyWriter(target: Record<string, unknown>, property: string, stride: number, path: string): PropertyWriter {
    if (stride === 1) {
        return (output, offset) => {
            target[property] = output[offset]!;
        };
    }
    if (stride > 4) {
        throw new Error(`Animation property path "${path}" has unsupported vector size ${stride}`);
    }

    let targetValue = target[property];
    let writeValue = createVectorValueWriter(targetValue, stride, path);
    return (output, offset) => {
        const currentValue = target[property];
        if (currentValue !== targetValue) {
            targetValue = currentValue;
            writeValue = createVectorValueWriter(currentValue, stride, path);
        }
        writeValue(output, offset);
    };
}

function createVectorValueWriter(targetValue: unknown, stride: number, path: string): PropertyWriter {
    if (isSettable(targetValue)) {
        switch (stride) {
            case 2:
                return (output, offset) => targetValue.set(output[offset]!, output[offset + 1]!);
            case 3:
                return (output, offset) => targetValue.set(output[offset]!, output[offset + 1]!, output[offset + 2]!);
            case 4:
                return (output, offset) => targetValue.set(output[offset]!, output[offset + 1]!, output[offset + 2]!, output[offset + 3]!);
        }
    }

    const valueRecord = asRecord(targetValue, path);
    const components = "xyzw";
    for (let i = 0; i < stride; i++) {
        if (!(components[i]! in valueRecord)) {
            throw new Error(`Animation property path "${path}" could not resolve component "${components[i]!}"`);
        }
    }
    return (output, offset) => {
        for (let i = 0; i < stride; i++) {
            valueRecord[components[i]!] = output[offset + i]!;
        }
    };
}

// ===== src/animation/types.ts =====
// Animation data types — flat structs, no classes.
// Designed for zero-allocation per-frame evaluation.

import type { Mat4 } from "../math/types.js";
import type { StorageBuffer } from "../resource/storage-buffer.js";
import type { Skeleton } from "../skeleton/bone-control.js";

// Interpolation modes (numeric for fast comparison in hot path)
export const INTERP_LINEAR = 0;
export const INTERP_STEP = 1;
export const INTERP_CUBICSPLINE = 2;

// Target paths (numeric)
export const PATH_TRANSLATION = 0;
export const PATH_ROTATION = 1;
export const PATH_SCALE = 2;
export const PATH_WEIGHTS = 3;
/** KHR_animation_pointer target — value is dispatched to an arbitrary writer
 *  resolved from the JSON pointer at load time. */
export const PATH_POINTER = 4;

export type InterpMode = 0 | 1 | 2;
export type TargetPath = 0 | 1 | 2 | 3 | 4;

/** Parsed keyframe sampler — times + values + interpolation. */
export interface AnimationSampler {
    /** Keyframe timestamps in seconds (monotonically increasing). */
    readonly input: Float32Array;
    /** Keyframe output values (vec3/quat/scalar packed sequentially).
     *  For CUBICSPLINE: [inTangent, value, outTangent] per keyframe. */
    readonly output: Float32Array;
    readonly interpolation: InterpMode;
}

/** Single animation channel — targets one node property, or an arbitrary
 *  KHR_animation_pointer target resolved at load time to a writer function. */
export interface AnimationChannel {
    readonly samplerIdx: number;
    /** For standard channels: glTF node index. For `PATH_POINTER`: unused (-1). */
    readonly nodeIdx: number;
    readonly path: TargetPath;
    /** PATH_POINTER only: invoked per-frame with the interpolated sampler output.
     *  The writer is responsible for applying the value to the runtime target
     *  (node.visible, material factor, camera fov, light color, ...). */
    readonly pointerWriter?: (output: Float32Array, offset: number) => void;
    /** PATH_POINTER only: number of floats per keyframe (1, 3, 4, ...). */
    readonly pointerArity?: number;
    /** PATH_POINTER only: true when LINEAR interpolation should use quaternion slerp. */
    readonly pointerQuaternion?: boolean;
}

/** One animation clip (may animate many nodes). */
export interface AnimationClip {
    readonly name: string;
    readonly channels: readonly AnimationChannel[];
    readonly samplers: readonly AnimationSampler[];
    /** Total playback duration in seconds. */
    readonly duration: number;
    /** @internal Authored first sample time. Defaults to 0 for glTF. */
    readonly _startTime?: number;
    /** Frame rate used by AnimationGroup goToFrame(); defaults to 60. */
    readonly frameRate?: number;
}

/** Per-node rest pose TRS + parent link for hierarchy traversal. */
export interface NodeRest {
    readonly parentIdx: number; // -1 for root nodes
    /** @internal */
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

/** Connects a skeleton to its GPU bone texture for per-frame updates. */
export interface SkeletonBinding {
    readonly jointNodes: readonly number[];
    readonly inverseBindMatrices: Float32Array;
    readonly invMeshWorld: Mat4;
    readonly boneTexture: GPUTexture;
    readonly boneCount: number;
    readonly boneMatrices: Float32Array;
    readonly runtimeSkeleton?: SkeletonData;
}

/** Connects a morph-target mesh to its GPU weight buffer for per-frame updates. */
export interface MorphBinding {
    /** Node index that owns the morph targets. */
    readonly nodeIdx: number;
    /** GPU storage buffer written each frame with current weights (header + weights array). */
    readonly weightsBuffer: GPUBuffer;
    /** CPU mirror of the current weights, used by deformation-aware picking. */
    readonly weights: Float32Array;
    /** Number of morph targets. */
    readonly targetCount: number;
    readonly runtimeMorphTargets?: MorphTargetData;
}

/** Minimal structural view of a scene node's animatable transform. Lets the
 *  animation controller apply plain glTF node-TRS channels (translation/rotation/
 *  scale) to scene nodes without importing the scene layer. `SceneNode` is
 *  structurally compatible with this interface. */
export interface AnimatedNodeTarget {
    readonly position: { set(x: number, y: number, z: number): void };
    readonly rotationQuaternion: { set(x: number, y: number, z: number, w: number): void };
    readonly scaling: { set(x: number, y: number, z: number): void };
}

/** Everything the animation system needs, parsed from a glTF file. */
export interface GltfAnimationData {
    readonly clips: readonly AnimationClip[];
    readonly nodes: readonly NodeRest[];
    readonly skeletons: readonly SkeletonBinding[];
    readonly morphBindings: readonly MorphBinding[];
    /** Scene-node targets indexed by glTF node index. Used to write plain node-TRS
     *  channels (non-skeletal node animation) back onto the live scene graph so the
     *  affected meshes — and their descendants — actually move. */
    readonly nodeTargets: readonly (AnimatedNodeTarget | undefined)[];
    /** Node indices excluded from node-TRS writeback: skin joints (driven by the
     *  skeleton path) plus skinned-mesh nodes and all their ancestors (their bone
     *  matrices bake an `invMeshWorld` captured at load, so moving them at runtime
     *  would double-transform the skinned vertices). */
    readonly excludedNodeIndices: ReadonlySet<number>;
    /** glTF node names indexed by node index (undefined for unnamed nodes). Used by
     *  {@link AnimationGroupMask} to resolve include/exclude target names to the node
     *  indices its channels animate. */
    readonly nodeNames: readonly (string | undefined)[];
    /** Shared node-index → bone override map, present only when `enableBoneControl()`
     *  installed bone control. Handed to every AnimationController so a playing clip
     *  honours user bone overrides (animation wins per-component). `undefined` on the
     *  default path. Typed as `unknown` value to keep the internal `BoneOverride`
     *  shape out of the public API surface. */
    readonly boneOverrides?: ReadonlyMap<number, unknown>;
}

// ─── GPU-side data objects attached to Mesh ─────────────────────────────────

/** Skeleton GPU data — bone texture + vertex buffers for skinning.
 *  Created by createSkeleton() in skeleton/create-skeleton.ts.
 *  Attached to mesh.skeleton. */
export interface SkeletonData {
    readonly boneTexture: GPUTexture;
    readonly boneCount: number;
    readonly jointsBuffer: GPUBuffer;
    readonly weightsBuffer: GPUBuffer;
    readonly joints: Uint16Array | Uint8Array;
    readonly weights: Float32Array;
    readonly boneMatrices: Float32Array;
    /** Extra joints/weights for 8-bone skinning (JOINTS_1/WEIGHTS_1). */
    readonly joints1Buffer: GPUBuffer | null;
    readonly weights1Buffer: GPUBuffer | null;
    readonly joints1: Uint16Array | Uint8Array | null;
    readonly weights1: Float32Array | null;
    /** @internal Extra-owner count when shared with a clone via `cloneTransformNode` — see
     *  resource/ref-count.ts. Absent/undefined means exactly one (implicit) owner. */
    _refCount?: number;
    /** @internal True once the last owning mesh has released the GPU resources. Animation
     *  controllers may outlive removed meshes, so they use this to skip stale uploads. */
    _disposed?: boolean;
    /** @internal Shared ownership for skin vertex buffers reused by VAT data. */
    readonly _skinBuffers: SkinBufferData;
    /** @internal Shared node-index → bone override map, stamped by `enableBoneControl`'s
     *  skeleton builder when bone control is active. Bridges user bone overrides to the
     *  optional weighted-blend mixer (which reuses this shared runtime skeleton), so a
     *  blended clip honours overrides without any always-loaded plumbing. Undefined on the
     *  default path. Typed `unknown` value to keep the internal `BoneOverride` shape private. */
    _overrides?: ReadonlyMap<number, unknown>;
    /** @internal Public handle stamped only by the opt-in glTF bone-control builder. */
    _skeleton?: Skeleton;
}

/** @internal Ref-counted skin vertex buffers shared by live skeletons and VAT data. */
export interface SkinBufferData {
    jointsBuffer: GPUBuffer;
    weightsBuffer: GPUBuffer;
    joints1Buffer: GPUBuffer | null;
    weights1Buffer: GPUBuffer | null;
    /** @internal Extra-owner count shared by a live skeleton and one or more VAT data objects. */
    _refCount?: number;
}

/** VAT (Vertex Animation Texture) GPU data — BAKED skinning. Attached to `mesh.vat` by vat/vat-baker.ts.
 *  The skeletal animation is pre-evaluated into `texture` (one frame per row); the shader reads bone
 *  matrices from the current frame's row instead of a live per-frame upload, so the mesh thin-instances.
 *  Reuses the same joints/weights vertex-buffer field names as SkeletonData so the renderable binds either. */
export interface VatData {
    readonly boneCount: number;
    /** Baked bone-matrix texture: rgba32float, (boneCount*4) × frameCount, one animation frame per row
     *  (identical per-row layout to the live bone texture in skeleton/create-skeleton.ts). */
    readonly texture: GPUTexture;
    readonly frameCount: number;
    /** UBO consumed by the VAT vertex fragment: `params` vec4 = (fromRow, toRow, frameOffset, fps);
     *  `clock` vec4 .x = elapsed seconds. Advanced by the VAT manager (vat/vat-baker.ts). */
    readonly settingsBuffer: GPUBuffer;
    readonly jointsBuffer: GPUBuffer;
    readonly weightsBuffer: GPUBuffer;
    readonly joints1Buffer: GPUBuffer | null;
    readonly weights1Buffer: GPUBuffer | null;
    /** @internal Shared ownership record for the baked texture. */
    readonly _textureResource: { readonly texture: GPUTexture; _refCount?: number };
    /** @internal Shared ownership for skin vertex buffers reused from the baked skeleton. */
    readonly _skinBuffers: SkinBufferData;
    /** @internal Extra-owner count when shared with a clone via `cloneTransformNode`. */
    _refCount?: number;
    /** Optional per-instance VAT params texture (rgba32float, (2*instanceCount) x 1): TWO texels per
     *  thin-instance — A=(fromRow,toRow,offset,fps), B=(fromRow,toRow,blend,fps) — so each instance plays
     *  its own clip + phase (and can blend two clips) from the one shared baked texture. Present + the mesh
     *  thin-instanced ⇒ the VAT vertex path reads its frame rows from this texture indexed by
     *  `@builtin(instance_index)` instead of the shared settings UBO. Set via the VatHandle. */
    instanceTexture?: GPUTexture | null;
    /** @internal Authoritative dual-clip params used by a custom VAT material and every derived
     *  mesh pass (including picking). Set through setVatInstanceStorage(). */
    _instanceStorage?: StorageBuffer | null;
}

/** Morph target GPU data — delta storage buffer + weights storage buffer.
 *  Created by createMorphTargets() in morph/create-morph-targets.ts.
 *  Attached to mesh.morphTargets. */
export interface MorphTargetData {
    /** Per-target names, index-aligned with targets and weights, when supplied by the source. */
    readonly names?: readonly string[];
    /** Read-only storage buffer: 6 f32 per (target, vertex) — position xyz then normal xyz. */
    readonly deltasBuffer: GPUBuffer;
    readonly count: number;
    /** Read-only storage buffer: 16-byte header (count, vertexCount) + one f32 weight per target. */
    readonly weightsBuffer: GPUBuffer;
    readonly targets: readonly { positions: Float32Array; normals: Float32Array | null }[];
    readonly weights: Float32Array<ArrayBuffer>;
    /** @internal Extra-owner count when shared with a clone via `cloneTransformNode` — see
     *  resource/ref-count.ts. Absent/undefined means exactly one (implicit) owner. */
    _refCount?: number;
    /** @internal True once the last owning mesh has released the GPU resources. */
    _disposed?: boolean;
}

// ===== src/animation/weighted-gltf-mixer.ts =====
import { F32, I32, U8 } from "../engine/typed-arrays.js";
import { tickAnimationCore } from "./animation-group.js";
import type { AnimationGltfMixer, AnimationGroup } from "./animation-group.js";
import { ANIMATION_GROUP_TASK_CATEGORY, getAnimationGroupOwner, getAnimationGroups } from "./animation-group-task.js";
import { setAnimationTaskCategoryHandler } from "./animation-manager.js";
import type { AnimationManager } from "./animation-manager.js";
import type { NodeRest, SkeletonBinding } from "./types.js";
import { PATH_ROTATION, PATH_SCALE, PATH_TRANSLATION } from "./types.js";
import { evaluateSampler } from "./evaluate.js";
import { composeMat4IntoBuffer } from "../math/compose-mat4-into-buffer.js";
import { multiplyMat4IntoBuffer } from "../math/multiply-mat4-into-buffer.js";
import { _rightHanded } from "#coordinate-system";
import type { Mat4Storage } from "../math/types.js";
import { _boneApplier } from "../skeleton/bone-control-hooks.js";
import type { BoneOverride } from "../skeleton/bone-control.js";

type PropertyMixerHandler = (manager: AnimationManager, deltaMs: number, onlyPropertyGroups: boolean) => boolean;
type PropertyMixerDirectHandler = (manager: AnimationManager, group: AnimationGroup) => void;
type PropertyMixerFinishHandler = (manager: AnimationManager) => void;
let _propertyMixerHandler: PropertyMixerHandler | null = null;
let _propertyMixerDirectHandler: PropertyMixerDirectHandler | null = null;
let _propertyMixerFinishHandler: PropertyMixerFinishHandler | null = null;

/** @internal Install opt-in property-track handling for the skeletal blend manager. */
export function _installPropertyMixerHandler(
    handler: PropertyMixerHandler | null,
    directHandler: PropertyMixerDirectHandler | null = null,
    finishHandler: PropertyMixerFinishHandler | null = null
): void {
    _propertyMixerHandler = handler;
    _propertyMixerDirectHandler = directHandler;
    _propertyMixerFinishHandler = finishHandler;
}

const GLTF_CLIP = 0;
const GLTF_NODES = 1;
const GLTF_SKELETONS = 2;
const TRS_STRIDE = 12;
const T_OFF = 0;
const R_OFF = 3;
const S_OFF = 7;

// glTF root transform, same as the loader's `__root__` (load-gltf.ts): the RH→LH X mirror diag(-1, 1, 1, 1),
// or identity in a right-handed engine, which keeps glTF's native space.
// prettier-ignore
const ROOT_TRANSFORM = new F32([_rightHanded ? 1 : -1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1]);

const _boneTmp = new F32(16);

interface WeightedGltfTarget {
    readonly nodes: readonly NodeRest[];
    readonly skeletons: readonly SkeletonBinding[];
    readonly overrides: ReadonlyMap<number, unknown> | undefined;
    /** Per-node base rotation (quaternion) captured after the rest pose + bone overrides are
     *  written and before accumulation. It is the "original value" the partial-weight rotation
     *  slerp in `uploadTarget` blends against, so an overridden bone keeps its override for the
     *  unanimated remainder — matching Babylon.js, which blends a weighted animation against the
     *  target's current value, not its rest pose. Undefined unless bone control is active, so
     *  blend-only scenes allocate nothing and keep using the node rest rotation. */
    readonly baseRot: Float32Array | undefined;
    readonly trs: Float32Array;
    readonly localMat: Float32Array;
    readonly worldMat: Float32Array;
    readonly topoOrder: Int32Array;
    readonly tWeight: Float32Array;
    readonly rWeight: Float32Array;
    readonly sWeight: Float32Array;
    active: boolean;
}

interface WeightedGltfScratch {
    readonly keys: Set<object>;
    readonly targets: Map<object, WeightedGltfTarget>;
    readonly sample: Float32Array;
    readonly reference: Float32Array;
    readonly delta: Float32Array;
}

let scratchByManager: WeakMap<AnimationManager, WeightedGltfScratch> | undefined;

/** Options for {@link setAnimationAdditive}, selecting the reference pose subtracted from an additive animation. */
export interface AnimationAdditiveOptions {
    readonly referenceFrame?: number;
    readonly referenceTime?: number;
}

/** Enable advanced animation blending for a manager. Kept opt-in so manual-only weights do not pay for skeletal mixing code. */
export function enableAnimationBlending(manager: AnimationManager): void {
    setAnimationTaskCategoryHandler(manager, ANIMATION_GROUP_TASK_CATEGORY, updateWeightedGltfAnimations);
}

/** Mark an animation group as additive. Reference defaults to frame 0, matching Babylon.js MakeAnimationAdditive. */
export function setAnimationAdditive(group: AnimationGroup, options?: AnimationAdditiveOptions): void {
    if (options?.referenceFrame !== undefined && options.referenceTime !== undefined) {
        throw new Error("Additive animation reference must use either referenceFrame or referenceTime, not both");
    }
    const referenceTime = options?.referenceTime ?? (options?.referenceFrame ?? 0) / (group.frameRate || 60);
    if (!Number.isFinite(referenceTime) || referenceTime < 0) {
        throw new Error(`Additive animation reference time must be a finite non-negative number, got ${referenceTime}`);
    }
    group._additive = { referenceTime };
    const owner = getAnimationGroupOwner(group);
    if (owner) {
        enableAnimationBlending(owner);
    }
}

function getScratch(manager: AnimationManager): WeightedGltfScratch {
    scratchByManager ??= new WeakMap();
    let scratch = scratchByManager.get(manager);
    if (!scratch) {
        scratch = {
            keys: new Set<object>(),
            targets: new Map<object, WeightedGltfTarget>(),
            sample: new F32(16),
            reference: new F32(16),
            delta: new F32(16),
        };
        scratchByManager.set(manager, scratch);
    }
    return scratch;
}

function updateWeightedGltfAnimations(manager: AnimationManager, deltaMs: number): boolean {
    const handledPropertyGroups = _propertyMixerHandler?.(manager, deltaMs, true) ?? false;
    const scratch = getScratch(manager);
    const keys = scratch.keys;
    keys.clear();

    const groups = getAnimationGroups(manager);
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
        const group = groups[groupIndex]!;
        const mixer = group._gltfMixer;
        if (group._stopped || !mixer || (group.weight === 1 && !group._additive)) {
            continue;
        }
        keys.add(mixer[GLTF_NODES]);
    }

    if (keys.size === 0) {
        if (handledPropertyGroups) {
            for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
                const group = groups[groupIndex]!;
                if (group._stopped) {
                    continue;
                }
                if (group._propertyMixerHandled) {
                    _propertyMixerDirectHandler?.(manager, group);
                } else {
                    tickAnimationCore(group, deltaMs, manager.engine);
                }
            }
            _propertyMixerFinishHandler?.(manager);
        }
        return handledPropertyGroups;
    }

    scratch.targets.forEach(resetWeightedGltfTarget);

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
        const group = groups[groupIndex]!;
        if (group._stopped) {
            continue;
        }
        if (handledPropertyGroups && group._propertyMixerHandled) {
            _propertyMixerDirectHandler?.(manager, group);
            continue;
        }

        const mixer = group._gltfMixer;
        if (mixer && keys.has(mixer[GLTF_NODES])) {
            if (group._additive) {
                getTarget(scratch, mixer).active = true;
                advanceGroupTime(group, mixer, deltaMs);
            } else {
                accumulateGroup(manager, scratch, group, mixer, deltaMs);
            }
            continue;
        }

        tickAnimationCore(group, deltaMs, manager.engine);
    }

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
        const group = groups[groupIndex]!;
        const mixer = group._gltfMixer;
        if (!group._stopped && group._additive && mixer && keys.has(mixer[GLTF_NODES])) {
            accumulateAdditiveGroup(scratch, group, mixer);
        }
    }

    scratch.targets.forEach((target, key) => {
        if (target.active && keys.has(key)) {
            uploadTarget(manager, target);
        }
    });
    if (handledPropertyGroups) {
        _propertyMixerFinishHandler?.(manager);
    }

    return true;
}

function resetWeightedGltfTarget(target: WeightedGltfTarget): void {
    target.active = false;
    target.tWeight.fill(0);
    target.rWeight.fill(0);
    target.sWeight.fill(0);
    resetTarget(target);
    // Apply opt-in bone overrides on top of the rest pose, BEFORE accumulation so animated
    // components overwrite them while untouched or masked-out components keep the override —
    // matching the single-clip controller path (skeleton-updater.ts). Routed through the same
    // null hook, so blend bundles without bone control pay only a branch.
    const overrides = target.overrides;
    if (overrides !== undefined) {
        if (overrides.size > 0) {
            _boneApplier?.(overrides as ReadonlyMap<number, BoneOverride>, target.trs, target.nodes.length);
        }
        // Snapshot the post-override rotations: accumulation overwrites the rotation slot, but
        // `uploadTarget` still needs the pre-animation value to slerp against at partial weight.
        const baseRot = target.baseRot!;
        const trs = target.trs;
        for (let i = 0; i < target.nodes.length; i++) {
            const src = i * TRS_STRIDE + R_OFF;
            const dst = i * 4;
            baseRot[dst] = trs[src]!;
            baseRot[dst + 1] = trs[src + 1]!;
            baseRot[dst + 2] = trs[src + 2]!;
            baseRot[dst + 3] = trs[src + 3]!;
        }
    }
}

/** True when this channel is masked OUT for the group (mask active, node named, excluded).
 *  One helper shared by both accumulate paths — mirrors `animationGroupMaskRetainsTarget`
 *  (animation-group-mask.ts) inline so blend-only bundles don't pull in the mask module. */
function channelMaskedOut(group: AnimationGroup, channelIndex: number, nodeIdx: number): boolean {
    const mask = group.mask;
    if (mask === undefined || mask.disabled || nodeIdx < 0) {
        return false;
    }
    const name = group.targetedAnimations[channelIndex]!.targetName ?? "";
    return (mask.names.indexOf(name) !== -1) !== (mask.mode === 0); /* Include */
}

function getTarget(scratch: WeightedGltfScratch, mixer: AnimationGltfMixer): WeightedGltfTarget {
    const nodes = mixer[GLTF_NODES];
    let target = scratch.targets.get(nodes);
    if (!target) {
        const numNodes = nodes.length;
        const skeletons = mixer[GLTF_SKELETONS];
        // Bone overrides ride on the shared runtime skeleton (stamped by enableBoneControl).
        // Undefined unless bone control is active, so blend-only scenes pay nothing.
        const overrides = skeletons.length > 0 ? skeletons[0]!.runtimeSkeleton?._overrides : undefined;
        target = {
            nodes,
            skeletons,
            overrides,
            baseRot: overrides !== undefined ? new F32(numNodes * 4) : undefined,
            trs: new F32(numNodes * TRS_STRIDE),
            localMat: new F32(numNodes * 16),
            worldMat: new F32(numNodes * 16),
            topoOrder: computeTopoOrder(nodes),
            tWeight: new F32(numNodes),
            rWeight: new F32(numNodes),
            sWeight: new F32(numNodes),
            active: false,
        };
        scratch.targets.set(nodes, target);
        // The per-tick reset pass runs over `scratch.targets` BEFORE any group is accumulated,
        // so a target created during this tick would otherwise stay zero-filled for every
        // component no channel writes — masked-out channels and overridden-but-unanimated
        // bones would collapse to a zero matrix on the first tick only. Seed it here so tick 1
        // matches every subsequent tick.
        resetWeightedGltfTarget(target);
    }
    return target;
}

function resetTarget(target: WeightedGltfTarget): void {
    const { nodes, trs } = target;
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!;
        const off = i * TRS_STRIDE;
        trs[off + T_OFF] = n.tx;
        trs[off + T_OFF + 1] = n.ty;
        trs[off + T_OFF + 2] = n.tz;
        trs[off + R_OFF] = n.rx;
        trs[off + R_OFF + 1] = n.ry;
        trs[off + R_OFF + 2] = n.rz;
        trs[off + R_OFF + 3] = n.rw;
        trs[off + S_OFF] = n.sx;
        trs[off + S_OFF + 1] = n.sy;
        trs[off + S_OFF + 2] = n.sz;
    }
}

function accumulateAdditiveGroup(scratch: WeightedGltfScratch, group: AnimationGroup, mixer: AnimationGltfMixer): void {
    const additive = group._additive;
    const weight = group.weight;
    if (!additive || weight === 0) {
        return;
    }

    const target = getTarget(scratch, mixer);
    const clip = mixer[GLTF_CLIP];
    const t = group.currentTime;
    for (let channelIndex = 0; channelIndex < clip.channels.length; channelIndex++) {
        const ch = clip.channels[channelIndex]!;
        const sampler = clip.samplers[ch.samplerIdx]!;
        const nodeIdx = ch.nodeIdx;
        if (channelMaskedOut(group, channelIndex, nodeIdx)) {
            continue;
        }
        const base = nodeIdx * TRS_STRIDE;
        switch (ch.path) {
            case PATH_TRANSLATION:
                evaluateSampler(sampler, t, 3, false, scratch.sample, 0);
                evaluateSampler(sampler, additive.referenceTime, 3, false, scratch.reference, 0);
                target.trs[base + T_OFF] = target.trs[base + T_OFF]! + (scratch.sample[0]! - scratch.reference[0]!) * weight;
                target.trs[base + T_OFF + 1] = target.trs[base + T_OFF + 1]! + (scratch.sample[1]! - scratch.reference[1]!) * weight;
                target.trs[base + T_OFF + 2] = target.trs[base + T_OFF + 2]! + (scratch.sample[2]! - scratch.reference[2]!) * weight;
                break;
            case PATH_SCALE:
                evaluateSampler(sampler, t, 3, false, scratch.sample, 0);
                evaluateSampler(sampler, additive.referenceTime, 3, false, scratch.reference, 0);
                target.trs[base + S_OFF] = target.trs[base + S_OFF]! + (scratch.sample[0]! - scratch.reference[0]!) * weight;
                target.trs[base + S_OFF + 1] = target.trs[base + S_OFF + 1]! + (scratch.sample[1]! - scratch.reference[1]!) * weight;
                target.trs[base + S_OFF + 2] = target.trs[base + S_OFF + 2]! + (scratch.sample[2]! - scratch.reference[2]!) * weight;
                break;
            case PATH_ROTATION:
                evaluateSampler(sampler, t, 4, true, scratch.sample, 0);
                evaluateSampler(sampler, additive.referenceTime, 4, true, scratch.reference, 0);
                quatRefInverseTimesSample(scratch.delta, scratch.reference, scratch.sample);
                applyAdditiveQuaternion(target.trs, base + R_OFF, scratch.delta, weight);
                break;
        }
    }
}

function accumulateGroup(manager: AnimationManager, scratch: WeightedGltfScratch, group: AnimationGroup, mixer: AnimationGltfMixer, deltaMs: number): void {
    if (!manager.engine) {
        throw new Error("Weighted glTF animation requires an AnimationManager engine");
    }

    const target = getTarget(scratch, mixer);
    const t = advanceGroupTime(group, mixer, deltaMs);
    const weight = group.weight;
    target.active = true;
    if (weight === 0) {
        return;
    }

    const clip = mixer[GLTF_CLIP];
    for (let channelIndex = 0; channelIndex < clip.channels.length; channelIndex++) {
        const ch = clip.channels[channelIndex]!;
        const sampler = clip.samplers[ch.samplerIdx]!;
        const nodeIdx = ch.nodeIdx;
        if (channelMaskedOut(group, channelIndex, nodeIdx)) {
            continue;
        }
        const base = nodeIdx * TRS_STRIDE;
        switch (ch.path) {
            case PATH_TRANSLATION:
                evaluateSampler(sampler, t, 3, false, scratch.sample, 0);
                if (target.tWeight[nodeIdx] === 0) {
                    target.trs[base + T_OFF] = 0;
                    target.trs[base + T_OFF + 1] = 0;
                    target.trs[base + T_OFF + 2] = 0;
                }
                target.trs[base + T_OFF] = target.trs[base + T_OFF]! + scratch.sample[0]! * weight;
                target.trs[base + T_OFF + 1] = target.trs[base + T_OFF + 1]! + scratch.sample[1]! * weight;
                target.trs[base + T_OFF + 2] = target.trs[base + T_OFF + 2]! + scratch.sample[2]! * weight;
                target.tWeight[nodeIdx] = target.tWeight[nodeIdx]! + weight;
                break;
            case PATH_SCALE:
                evaluateSampler(sampler, t, 3, false, scratch.sample, 0);
                if (target.sWeight[nodeIdx] === 0) {
                    target.trs[base + S_OFF] = 0;
                    target.trs[base + S_OFF + 1] = 0;
                    target.trs[base + S_OFF + 2] = 0;
                }
                target.trs[base + S_OFF] = target.trs[base + S_OFF]! + scratch.sample[0]! * weight;
                target.trs[base + S_OFF + 1] = target.trs[base + S_OFF + 1]! + scratch.sample[1]! * weight;
                target.trs[base + S_OFF + 2] = target.trs[base + S_OFF + 2]! + scratch.sample[2]! * weight;
                target.sWeight[nodeIdx] = target.sWeight[nodeIdx]! + weight;
                break;
            case PATH_ROTATION: {
                evaluateSampler(sampler, t, 4, true, scratch.sample, 0);
                if (target.rWeight[nodeIdx] === 0) {
                    target.trs[base + R_OFF] = scratch.sample[0]!;
                    target.trs[base + R_OFF + 1] = scratch.sample[1]!;
                    target.trs[base + R_OFF + 2] = scratch.sample[2]!;
                    target.trs[base + R_OFF + 3] = scratch.sample[3]!;
                    target.rWeight[nodeIdx] = weight;
                    break;
                }
                const accumulatedWeight = target.rWeight[nodeIdx]!;
                quatSlerpInto(
                    target.trs,
                    base + R_OFF,
                    target.trs[base + R_OFF]!,
                    target.trs[base + R_OFF + 1]!,
                    target.trs[base + R_OFF + 2]!,
                    target.trs[base + R_OFF + 3]!,
                    scratch.sample[0]!,
                    scratch.sample[1]!,
                    scratch.sample[2]!,
                    scratch.sample[3]!,
                    weight / (accumulatedWeight + weight)
                );
                target.rWeight[nodeIdx] = accumulatedWeight + weight;
                break;
            }
        }
    }
}

function advanceGroupTime(group: AnimationGroup, mixer: AnimationGltfMixer, deltaMs: number): number {
    const clip = mixer[GLTF_CLIP];
    const startTime = clip._startTime ?? 0;
    const endTime = startTime + clip.duration;
    const isPlaying = group.isPlaying;
    if (isPlaying) {
        group.currentTime += (deltaMs / 1000) * group.speedRatio;
    }

    if (clip.duration <= 0) {
        group.currentTime = startTime;
        return group.currentTime;
    }

    if (group.loopAnimation && isPlaying) {
        group.currentTime = startTime + ((group.currentTime - startTime) % clip.duration);
        if (group.currentTime < startTime) {
            group.currentTime += clip.duration;
        }
    } else {
        group.currentTime = Math.min(Math.max(group.currentTime, startTime), endTime);
    }
    return group.currentTime;
}

function uploadTarget(manager: AnimationManager, target: WeightedGltfTarget): void {
    if (!manager.engine) {
        throw new Error("Weighted glTF animation requires an AnimationManager engine");
    }
    const device = manager.engine._device;
    const { nodes, trs, localMat, worldMat } = target;

    // Re-apply bone visibility AFTER accumulation, mirroring the single-clip controller
    // path (skeleton-updater.ts): hiding must beat clips that animate the bone's scale.
    const overrides = target.overrides;
    if (overrides !== undefined && overrides.size > 0) {
        _boneApplier?.(overrides as ReadonlyMap<number, BoneOverride>, trs, nodes.length, true);
    }

    for (let i = 0; i < nodes.length; i++) {
        const rotationWeight = target.rWeight[i]!;
        if (rotationWeight > 0 && rotationWeight < 1) {
            const off = i * TRS_STRIDE + R_OFF;
            // Blend the animated remainder against the pre-animation pose: the post-override
            // base when bone control is active, otherwise the node's rest rotation.
            const baseRot = target.baseRot;
            const node = nodes[i]!;
            const bo = i * 4;
            const bx = baseRot ? baseRot[bo]! : node.rx;
            const by = baseRot ? baseRot[bo + 1]! : node.ry;
            const bz = baseRot ? baseRot[bo + 2]! : node.rz;
            const bw = baseRot ? baseRot[bo + 3]! : node.rw;
            quatSlerpInto(trs, off, bx, by, bz, bw, trs[off]!, trs[off + 1]!, trs[off + 2]!, trs[off + 3]!, rotationWeight);
        } else if (rotationWeight > 0) {
            normalizeQuaternionAt(trs, i * TRS_STRIDE + R_OFF);
        }
    }

    for (let idx = 0; idx < nodes.length; idx++) {
        const nodeIdx = target.topoOrder[idx]!;
        const node = nodes[nodeIdx]!;
        const off = nodeIdx * TRS_STRIDE;
        if (node._matrix) {
            localMat.set(node._matrix, nodeIdx * 16);
        } else {
            composeMat4IntoBuffer(
                localMat,
                nodeIdx * 16,
                trs[off + T_OFF]!,
                trs[off + T_OFF + 1]!,
                trs[off + T_OFF + 2]!,
                trs[off + R_OFF]!,
                trs[off + R_OFF + 1]!,
                trs[off + R_OFF + 2]!,
                trs[off + R_OFF + 3]!,
                trs[off + S_OFF]!,
                trs[off + S_OFF + 1]!,
                trs[off + S_OFF + 2]!
            );
        }

        const parentIdx = node.parentIdx;
        if (parentIdx >= 0) {
            multiplyMat4IntoBuffer(worldMat, nodeIdx * 16, worldMat, parentIdx * 16, localMat, nodeIdx * 16);
        } else {
            multiplyMat4IntoBuffer(worldMat, nodeIdx * 16, ROOT_TRANSFORM, 0, localMat, nodeIdx * 16);
        }
    }

    for (let skeletonIndex = 0; skeletonIndex < target.skeletons.length; skeletonIndex++) {
        const skel = target.skeletons[skeletonIndex]!;
        if (skel.runtimeSkeleton?._disposed) {
            continue;
        }
        const boneData = skel.boneMatrices;
        for (let bi = 0; bi < skel.boneCount; bi++) {
            const jointIdx = skel.jointNodes[bi]!;
            const ibmOff = bi * 16;
            multiplyMat4IntoBuffer(_boneTmp, 0, skel.invMeshWorld as unknown as Mat4Storage, 0, worldMat, jointIdx * 16);
            multiplyMat4IntoBuffer(boneData, bi * 16, _boneTmp, 0, skel.inverseBindMatrices, ibmOff);
        }

        const texWidth = skel.boneCount * 4;
        device.queue.writeTexture({ texture: skel.boneTexture }, boneData.buffer, { bytesPerRow: texWidth * 16 }, { width: texWidth, height: 1 });
    }
}

function computeTopoOrder(nodes: readonly { readonly parentIdx: number }[]): Int32Array {
    const order = new I32(nodes.length);
    const visited = new U8(nodes.length);
    let cursor = 0;

    function visit(idx: number): void {
        if (visited[idx]!) {
            return;
        }
        visited[idx] = 1;
        const p = nodes[idx]!.parentIdx;
        if (p >= 0) {
            visit(p);
        }
        order[cursor++] = idx;
    }

    for (let i = 0; i < nodes.length; i++) {
        visit(i);
    }
    return order;
}

function normalizeQuaternionAt(values: Float32Array, offset: number): void {
    const x = values[offset]!;
    const y = values[offset + 1]!;
    const z = values[offset + 2]!;
    const w = values[offset + 3]!;
    const lenSq = x * x + y * y + z * z + w * w;
    if (lenSq > 0) {
        const inv = 1 / Math.sqrt(lenSq);
        values[offset] = x * inv;
        values[offset + 1] = y * inv;
        values[offset + 2] = z * inv;
        values[offset + 3] = w * inv;
    }
}

function quatRefInverseTimesSample(out: Float32Array, ref: Float32Array, sample: Float32Array): void {
    const ax = -ref[0]!;
    const ay = -ref[1]!;
    const az = -ref[2]!;
    const aw = ref[3]!;
    const bx = sample[0]!;
    const by = sample[1]!;
    const bz = sample[2]!;
    const bw = sample[3]!;
    out[0] = aw * bx + ax * bw + ay * bz - az * by;
    out[1] = aw * by - ax * bz + ay * bw + az * bx;
    out[2] = aw * bz + ax * by - ay * bx + az * bw;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    normalizeQuaternionAt(out, 0);
}

function applyAdditiveQuaternion(base: Float32Array, offset: number, delta: Float32Array, weight: number): void {
    const bx = base[offset]!;
    const by = base[offset + 1]!;
    const bz = base[offset + 2]!;
    const bw = base[offset + 3]!;
    const dx = delta[0]!;
    const dy = delta[1]!;
    const dz = delta[2]!;
    const dw = delta[3]!;
    quatSlerpInto(
        base,
        offset,
        bx,
        by,
        bz,
        bw,
        bw * dx + bx * dw + by * dz - bz * dy,
        bw * dy - bx * dz + by * dw + bz * dx,
        bw * dz + bx * dy - by * dx + bz * dw,
        bw * dw - bx * dx - by * dy - bz * dz,
        weight
    );
}

function quatSlerpInto(out: Float32Array, offset: number, ax: number, ay: number, az: number, aw: number, bx: number, by: number, bz: number, bw: number, t: number): void {
    let dot = ax * bx + ay * by + az * bz + aw * bw;
    if (dot < 0) {
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
        dot = -dot;
    }
    if (dot > 0.9995) {
        out[offset] = ax + t * (bx - ax);
        out[offset + 1] = ay + t * (by - ay);
        out[offset + 2] = az + t * (bz - az);
        out[offset + 3] = aw + t * (bw - aw);
        normalizeQuaternionAt(out, offset);
        return;
    }
    const theta = Math.acos(dot);
    const sinTheta = Math.sin(theta);
    const wa = Math.sin((1 - t) * theta) / sinTheta;
    const wb = Math.sin(t * theta) / sinTheta;
    out[offset] = wa * ax + wb * bx;
    out[offset + 1] = wa * ay + wb * by;
    out[offset + 2] = wa * az + wb * bz;
    out[offset + 3] = wa * aw + wb * bw;
}

// ===== src/animation/weighted-pointer-mixer.ts =====
import { F32 } from "../engine/typed-arrays.js";
import { tickAnimationCore } from "./animation-group.js";
import type { AnimationGroup, AnimationPropertyMixer, AnimationPropertyMixStrategy, AnimationPropertyRuntimeTrack } from "./animation-group.js";
import { ANIMATION_GROUP_TASK_CATEGORY, getAnimationGroups } from "./animation-group-task.js";
import { setAnimationTaskCategoryHandler } from "./animation-manager.js";
import type { AnimationManager } from "./animation-manager.js";
import { evaluatePropertySampler } from "./evaluate.js";

const MIX_TRACKS = 0;
const MIX_FROM = 1;
const MIX_TO = 2;
const MIX_DURATION = 3;
const MIX_START = 4;

interface WeightedPointerBucket {
    target: object;
    property: string;
    values: Float32Array;
    writer: (output: Float32Array, offset: number) => void;
    arity: number;
    quaternion: boolean;
    mix?: AnimationPropertyMixStrategy;
    afterWrite?: () => void;
    contested: boolean;
    active: boolean;
    hasReference: boolean;
    totalWeight: number;
    refX: number;
    refY: number;
    refZ: number;
    refW: number;
}

interface WeightedPointerScratch {
    readonly buckets: WeightedPointerBucket[];
    readonly sample: Float32Array;
    readonly afterWrites: Set<() => void>;
    bucketCount: number;
}

let scratchByManager: WeakMap<AnimationManager, WeightedPointerScratch> | undefined;

/** Enables weighted property-animation blending on `manager` by registering its category handler. */
export function enablePropertyAnimationBlending(manager: AnimationManager): void {
    setAnimationTaskCategoryHandler(manager, ANIMATION_GROUP_TASK_CATEGORY, _updateWeightedPointerAnimations);
}

function getScratch(manager: AnimationManager): WeightedPointerScratch {
    scratchByManager ??= new WeakMap();
    let scratch = scratchByManager.get(manager);
    if (!scratch) {
        scratch = {
            buckets: [],
            sample: new F32(16),
            afterWrites: new Set(),
            bucketCount: 0,
        };
        scratchByManager.set(manager, scratch);
    }
    return scratch;
}

/** @internal Drive property-mixer groups, optionally leaving every other animation-group category member untouched. */
export function _updateWeightedPointerAnimations(manager: AnimationManager, deltaMs: number, onlyPropertyGroups = false): boolean {
    const scratch = getScratch(manager);
    scratch.afterWrites.clear();
    scratch.bucketCount = 0;
    let contestedCount = 0;

    const groups = getAnimationGroups(manager);
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
        const group = groups[groupIndex]!;
        group._propertyMixerHandled = false;
        const mixer = group._propertyMixer;
        if (group._stopped || !mixer) {
            continue;
        }
        group._mixerCleanup = clearManagerScratch;
        if (group.weight === 1) {
            continue;
        }
        const tracks = mixer[MIX_TRACKS];
        for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
            const track = tracks[trackIndex]!;
            if (trackMaskedOut(group, track)) {
                continue;
            }
            const bucket = getTrackBucket(scratch, track);
            if (!bucket.contested) {
                bucket.contested = true;
                contestedCount++;
            }
        }
    }

    if (contestedCount === 0 && !onlyPropertyGroups) {
        scratch.buckets.length = 0;
        return false;
    }

    let handledPropertyGroups = 0;
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
        const group = groups[groupIndex]!;
        if (group._stopped) {
            continue;
        }

        const mixer = group._propertyMixer;
        const tracks = mixer?.[MIX_TRACKS];
        if (!tracks) {
            if (!onlyPropertyGroups) {
                tickAnimationCore(group, deltaMs, manager.engine);
            }
            continue;
        }
        const mixGroup = onlyPropertyGroups || group.weight !== 1 || tracks.some((track) => !trackMaskedOut(group, track) && findTrackBucket(scratch, track)?.contested);
        if (!mixGroup) {
            if (!onlyPropertyGroups) {
                tickAnimationCore(group, deltaMs, manager.engine);
            }
            continue;
        }
        group._propertyMixerHandled = true;
        handledPropertyGroups++;

        const t = advancePropertyGroupTime(group, mixer, deltaMs);
        const weight = group.weight;
        if (weight === 0) {
            continue;
        }

        for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
            const track = tracks[trackIndex]!;
            if (trackMaskedOut(group, track)) {
                continue;
            }
            evaluatePropertySampler(track.sampler, t, track.stride, track.quaternion, track.easing, scratch.sample, 0);
            const bucket = findTrackBucket(scratch, track);
            if (!bucket?.contested) {
                if (!onlyPropertyGroups) {
                    track.writer(scratch.sample, 0);
                    if (track._afterWrite) {
                        scratch.afterWrites.add(track._afterWrite);
                    }
                }
                continue;
            }
            if (weight !== 0) {
                accumulateWeightedTrack(bucket, track, scratch.sample, weight);
            }
        }
    }

    scratch.buckets.length = scratch.bucketCount;
    for (let bucketIndex = 0; bucketIndex < scratch.bucketCount; bucketIndex++) {
        const bucket = scratch.buckets[bucketIndex]!;
        if (!bucket.active) {
            continue;
        }
        if (bucket.quaternion && bucket.arity === 4) {
            normalizeQuaternion(bucket.values);
        }
        bucket.mix?.finish(bucket.values, bucket.totalWeight);
        bucket.writer(bucket.values, 0);
        if (bucket.afterWrite) {
            scratch.afterWrites.add(bucket.afterWrite);
        }
    }
    if (!onlyPropertyGroups) {
        _finishWeightedPointerAnimations(manager);
    }

    return handledPropertyGroups > 0;
}

/** @internal Write a mixed group's uncontested tracks when the outer manager reaches its registration slot. */
export function _writeUncontestedPointerTracks(manager: AnimationManager, group: AnimationGroup): void {
    const scratch = scratchByManager?.get(manager);
    const tracks = group._propertyMixer?.[MIX_TRACKS];
    if (!scratch || !tracks || !group._propertyMixerHandled) {
        return;
    }
    for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
        const track = tracks[trackIndex]!;
        if (trackMaskedOut(group, track) || findTrackBucket(scratch, track)?.contested) {
            continue;
        }
        evaluatePropertySampler(track.sampler, group.currentTime, track.stride, track.quaternion, track.easing, scratch.sample, 0);
        track.writer(scratch.sample, 0);
        if (track._afterWrite) {
            scratch.afterWrites.add(track._afterWrite);
        }
    }
}

/** @internal Publish deduplicated property side effects after every manager group has evaluated. */
export function _finishWeightedPointerAnimations(manager: AnimationManager): void {
    const afterWrites = scratchByManager?.get(manager)?.afterWrites;
    if (!afterWrites) {
        return;
    }
    for (const publish of afterWrites) {
        publish();
    }
    afterWrites.clear();
}

function clearManagerScratch(manager: AnimationManager): void {
    scratchByManager?.delete(manager);
}

function trackMaskedOut(group: AnimationGroup, track: AnimationPropertyRuntimeTrack): boolean {
    const mask = group.mask;
    if (!mask || mask.disabled) {
        return false;
    }
    return (mask.names.indexOf(track._targetName ?? "") !== -1) !== (mask.mode === 0);
}

function advancePropertyGroupTime(group: AnimationGroup, mixer: AnimationPropertyMixer, deltaMs: number): number {
    if (group.isPlaying) {
        group.currentTime += (deltaMs / 1000) * group.speedRatio;
    }

    const clipStart = mixer[MIX_START] ?? 0;
    const clipEnd = clipStart + mixer[MIX_DURATION];
    const fromTime = Math.max(clipStart, Math.min(mixer[MIX_FROM], clipEnd));
    const toTime = mixer[MIX_TO] > fromTime ? Math.min(mixer[MIX_TO], clipEnd) : clipEnd;
    const duration = Math.max(0, toTime - fromTime);
    if (duration <= 0) {
        group.currentTime = fromTime;
        return group.currentTime;
    }

    if (group.isPlaying) {
        if (group.loopAnimation) {
            group.currentTime = fromTime + ((group.currentTime - fromTime) % duration);
            if (group.currentTime < fromTime) {
                group.currentTime += duration;
            }
        } else {
            group.currentTime = Math.min(Math.max(group.currentTime, fromTime), toTime);
            if (group.speedRatio >= 0 && group.currentTime >= toTime) {
                group.isPlaying = false;
                group._stopped = true;
            }
        }
    } else {
        group.currentTime = Math.min(Math.max(group.currentTime, clipStart), clipEnd);
    }
    return group.currentTime;
}

function findTrackBucket(scratch: WeightedPointerScratch, track: AnimationPropertyRuntimeTrack): WeightedPointerBucket | undefined {
    const target = track.mixTarget();
    for (let bucketIndex = 0; bucketIndex < scratch.bucketCount; bucketIndex++) {
        const bucket = scratch.buckets[bucketIndex]!;
        if (bucket.target === target && bucket.property === track.mixProperty) {
            return bucket;
        }
    }
    return undefined;
}

function getTrackBucket(scratch: WeightedPointerScratch, track: AnimationPropertyRuntimeTrack): WeightedPointerBucket {
    const buckets = scratch.buckets;
    const arity = track.stride;
    const target = track.mixTarget();
    for (let bucketIndex = 0; bucketIndex < scratch.bucketCount; bucketIndex++) {
        const candidate = buckets[bucketIndex]!;
        if (candidate.target !== target || candidate.property !== track.mixProperty) {
            continue;
        }
        if (candidate.arity !== arity) {
            throw new Error("Weighted animation channels for the same property must use the same value size");
        }
        candidate.writer = track.writer;
        candidate.quaternion = track.quaternion;
        if (!!candidate.mix !== !!track._mix) {
            throw new Error("Weighted animation channels for the same property must use the same mixing strategy");
        }
        candidate.mix = track._mix;
        candidate.afterWrite = track._afterWrite;
        return candidate;
    }

    let bucket = buckets[scratch.bucketCount];
    if (bucket) {
        bucket.target = target;
        bucket.property = track.mixProperty;
        bucket.writer = track.writer;
        bucket.quaternion = track.quaternion;
        bucket.mix = track._mix;
        bucket.afterWrite = track._afterWrite;
        bucket.contested = false;
        bucket.active = false;
        bucket.hasReference = false;
        bucket.totalWeight = 0;
        bucket.refX = 0;
        bucket.refY = 0;
        bucket.refZ = 0;
        bucket.refW = 1;
        if (bucket.arity === arity) {
            bucket.values.fill(0);
        } else {
            bucket.values = new F32(arity);
            bucket.arity = arity;
        }
    } else {
        bucket = {
            target,
            property: track.mixProperty,
            values: new F32(arity),
            writer: track.writer,
            arity,
            quaternion: track.quaternion,
            mix: track._mix,
            afterWrite: track._afterWrite,
            contested: false,
            active: false,
            hasReference: false,
            totalWeight: 0,
            refX: 0,
            refY: 0,
            refZ: 0,
            refW: 1,
        };
        buckets.push(bucket);
    }
    scratch.bucketCount++;
    return bucket;
}

function accumulateWeightedTrack(bucket: WeightedPointerBucket, track: AnimationPropertyRuntimeTrack, sample: Float32Array, weight: number): void {
    bucket.active = true;
    if (bucket.mix) {
        bucket.mix.accumulate(bucket.values, sample, weight, bucket.totalWeight);
        bucket.totalWeight += weight;
        return;
    }

    let sign = 1;
    if (bucket.quaternion && track.stride === 4) {
        if (!bucket.hasReference) {
            bucket.refX = sample[0]!;
            bucket.refY = sample[1]!;
            bucket.refZ = sample[2]!;
            bucket.refW = sample[3]!;
            bucket.hasReference = true;
        } else {
            const dot = bucket.refX * sample[0]! + bucket.refY * sample[1]! + bucket.refZ * sample[2]! + bucket.refW * sample[3]!;
            sign = dot < 0 ? -1 : 1;
        }
    }

    for (let i = 0; i < track.stride; i++) {
        bucket.values[i] = bucket.values[i]! + sample[i]! * weight * sign;
    }
    bucket.totalWeight += weight;
}

function normalizeQuaternion(values: Float32Array): void {
    const x = values[0]!;
    const y = values[1]!;
    const z = values[2]!;
    const w = values[3]!;
    const lenSq = x * x + y * y + z * z + w * w;
    if (lenSq > 0) {
        const inv = 1 / Math.sqrt(lenSq);
        values[0] = x * inv;
        values[1] = y * inv;
        values[2] = z * inv;
        values[3] = w * inv;
    }
}

```

Reply with every file you write or change, each as a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the files, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
