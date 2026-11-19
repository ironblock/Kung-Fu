// c-05. Line 555: "Manual property clips share the packed keyframe representation with glTF animation, but they do
// not masquerade as glTF `AnimationChannel`s."
// Internal design with public fields. Checked: a property clip's track holds a sampler of the same shape as a glTF
// AnimationSampler (Float32Array input of key times in seconds, Float32Array output packed key after key, numeric
// interpolation); the clip has no `channels`, and the group's targeted animations carry no glTF node index.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";

test("packed samplers, no channels", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "p", keys: [{ time: 0, value: [1, 2, 3] }, { time: 2, value: [4, 5, 6] }] }]);
    const s = clip.tracks[0]!.sampler;
    expect(s.input).toBeInstanceOf(Float32Array);
    expect(s.output).toBeInstanceOf(Float32Array);
    expect(Array.from(s.input)).toEqual([0, 2]);
    expect(Array.from(s.output)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(typeof s.interpolation).toBe("number");
    expect("channels" in clip).toBe(false);
    const group = createPropertyAnimationGroup(createAnimationManager(), { p: { x: 0, y: 0, z: 0 } }, clip);
    expect(group.targetedAnimations[0]!.nodeIndex).toBeUndefined();
});
