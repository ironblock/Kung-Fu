// a-62, lines 220-224: "export interface AnimationGroupMask {" "mode: AnimationGroupMaskMode;" "names: string[]; // target (node/bone) names" "disabled: boolean; ..."
import { AnimationGroupMaskMode, createAnimationGroupMask } from "@babylonjs/lite";

test("a mask is { mode, names, disabled }", () => {
    const m = createAnimationGroupMask(["a", "b"], AnimationGroupMaskMode.Exclude);
    expect(m).toEqual({ mode: AnimationGroupMaskMode.Exclude, names: ["a", "b"], disabled: false });
});
