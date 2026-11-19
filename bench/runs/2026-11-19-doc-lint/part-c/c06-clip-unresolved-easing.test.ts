// c-06. Line 555: "`createPropertyAnimationClip()` stores reusable unresolved property tracks, including an optional
// easing callback."
// Checked: making a clip needs no target (its path names nothing that exists yet); the track keeps the path as text and
// the very easing function given; the one clip then plays on two different targets, with the easing used on both.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("clip keeps path text and easing; reusable", () => {
    const easing = (g: number) => g * g;
    const clip = createPropertyAnimationClip("c", [{ path: "position.x", easing, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    expect(clip.tracks[0]!.path).toBe("position.x");
    expect(clip.tracks[0]!.easing).toBe(easing);
    const manager = createAnimationManager();
    const a = { position: { x: -1 } };
    const b = { position: { x: -1 } };
    createPropertyAnimationGroup(manager, a, clip);
    createPropertyAnimationGroup(manager, b, clip);
    updateAnimationManager(manager, 500);
    expect(a.position.x).toBe(2.5);
    expect(b.position.x).toBe(2.5);
});
