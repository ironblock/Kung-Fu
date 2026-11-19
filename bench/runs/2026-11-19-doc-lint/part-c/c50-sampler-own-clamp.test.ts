// c-50. Line 619: "each sampler still clamps to its own first/last key."
// Checked on one clip with three tracks: a (keys 0 s..2 s), b (keys 0 s..1 s) and c (keys 0.5 s..1 s). A seek to 1.5 s
// gives a its sample, b its last key; a seek to 0.2 s gives c its first key.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

test("each track holds its own end keys", () => {
    const target = { a: -1, b: -1, c: -1 };
    const clip = createPropertyAnimationClip("c", [
        { path: "a", frameRate: 10, keys: [{ frame: 0, value: 0 }, { frame: 20, value: 20 }] },
        { path: "b", frameRate: 10, keys: [{ frame: 0, value: 0 }, { frame: 10, value: 7 }] },
        { path: "c", frameRate: 10, keys: [{ frame: 5, value: 3 }, { frame: 10, value: 9 }] },
    ]);
    const g = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    goToFrame(g, 15);
    expect(target.a).toBeCloseTo(15, 5);
    expect(target.b).toBe(7);
    goToFrame(g, 2);
    expect(target.c).toBe(3);
});
