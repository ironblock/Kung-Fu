// a-48, line 183: "export interface AnimationGroup {"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
// The interface spans lines 183-196. Each field is read with the type the document gives it.
import type { AnimationController, AnimationGroup, AnimationGroupMask, TargetedAnimation } from "@babylonjs/lite";

declare const g: AnimationGroup;
export const name: string = g.name;
export const duration: number = g.duration;
export const frameRate: number = g.frameRate;
export const isPlaying: boolean = g.isPlaying;
export const currentTime: number = g.currentTime;
export const targetedAnimations: readonly TargetedAnimation[] = g.targetedAnimations;
export const speedRatio: number = g.speedRatio;
export const loopAnimation: boolean = g.loopAnimation;
export const weight: number = g.weight;
export const mask: AnimationGroupMask | undefined = g.mask;
export const stopped: boolean = g._stopped;
export const ctrl: AnimationController | undefined = g._ctrl;
