// a-86, line 256: "export function createPropertyAnimationClip(name: string, tracks: readonly PropertyAnimationTrackOptions[], options?: PropertyAnimationClipOptions): PropertyAnimationClip;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { createPropertyAnimationClip } from "@babylonjs/lite";
import type { PropertyAnimationClip, PropertyAnimationClipOptions, PropertyAnimationTrackOptions } from "@babylonjs/lite";

export const asDocumented: (name: string, tracks: readonly PropertyAnimationTrackOptions[], options?: PropertyAnimationClipOptions) => PropertyAnimationClip = createPropertyAnimationClip;
