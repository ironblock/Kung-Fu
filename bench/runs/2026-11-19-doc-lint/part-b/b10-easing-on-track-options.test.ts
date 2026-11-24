// b-10. Lines 304-306: "Property-animation easing is a caller-supplied function on each `PropertyAnimationTrackOptions`, not a built-in curve registry and not part of the generic `AnimationSampler` shape used by glTF."
// Checked: each track takes its own easing function; the compiled track keeps that very function;
// the sampler object carries only input, output and interpolation. ("Not a registry" is read as:
// the option takes a function, not a curve name; that part is not asserted beyond the function being kept.)
import { createPropertyAnimationClip } from "@babylonjs/lite";

test("easing is a per-track function option and is not on the sampler", () => {
    const a = (g: number) => g * g;
    const b = (g: number) => g;
    const clip = createPropertyAnimationClip("c", [
        { path: "a", easing: a, keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] },
        { path: "b", easing: b, keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] },
        { path: "c", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] },
    ]);
    expect(clip.tracks[0]!.easing).toBe(a);
    expect(clip.tracks[1]!.easing).toBe(b);
    expect(clip.tracks[2]!.easing).toBeUndefined();
    for (const track of clip.tracks) {
        expect(Object.keys(track.sampler).sort()).toEqual(["input", "interpolation", "output"]);
    }
});
