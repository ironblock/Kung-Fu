// a-18, line 48: "readonly duration: number; // max of all sampler input times (seconds)"
// internal: AnimationClip values come from the glTF parser, so this probe runs the parser (see _loader.ts).
// Two samplers end at 1 s and 2.5 s; the clip's duration should be 2.5.
import { createAnimationGroups } from "@babylonjs/lite";
import { parsed } from "./_loader.ts";

test("a parsed clip's duration is the largest sampler end time", () => {
    const d = parsed();
    expect(d.clips[0]!.duration).toBe(2.5);
    expect(createAnimationGroups(d)[0]!.duration).toBe(2.5);
});
