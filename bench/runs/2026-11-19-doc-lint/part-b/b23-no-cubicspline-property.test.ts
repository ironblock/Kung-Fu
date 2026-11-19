// b-23. Lines 336-337: "Property tracks cannot produce CUBICSPLINE samplers"
// The interpolation option is typed "linear" | "step". Even a value outside the type compiles to a
// LINEAR sampler (code 0) with stride floats per key, never CUBICSPLINE (code 2).
import { createPropertyAnimationClip } from "@babylonjs/lite";

test("no property track interpolation option yields a CUBICSPLINE sampler", () => {
    const keys = [{ time: 0, value: 0 }, { time: 1, value: 1 }];
    for (const interpolation of ["linear", "step", "cubicspline", "CUBICSPLINE", undefined]) {
        const clip = createPropertyAnimationClip("c", [{ path: "v", interpolation: interpolation as never, keys }]);
        const sampler = clip.tracks[0]!.sampler;
        expect(sampler.interpolation).not.toBe(2);
        expect(sampler.output.length).toBe(2);
    }
});
