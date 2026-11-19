// a-31, line 99: "export interface PropertyAnimationTrackOptions {"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
// The interface spans lines 99-111.
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
import type { AnimationEasing, AnimationKeyframe, PropertyAnimationInterpolation, PropertyAnimationTrackOptions } from "@babylonjs/lite";

export const same: Equal<
    PropertyAnimationTrackOptions,
    {
        readonly path: string;
        readonly keys: readonly AnimationKeyframe[];
        readonly frameRate?: number;
        readonly interpolation?: PropertyAnimationInterpolation;
        readonly quaternion?: boolean;
        readonly easing?: AnimationEasing;
    }
> = true;
