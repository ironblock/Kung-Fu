// c-88. Lines 676-678: "Each group retains its first-attachment order token, so reattaching an older paused group
// restores its precedence relative to newer groups instead of appending it after them."
// Two checks. (1) Lite, public calls: groups A then B on one manager; A removed and added again: the manager lists
// A before B again. (2) Compat package: two delegated animatables write one property, the older holding 1, the newer 2;
// the newer's write lands last (2). The older is paused and restarted; the newer still lands last (2), as before.
import { addAnimationGroup, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, getAnimationGroups, removeAnimationGroup } from "@babylonjs/lite";
import { anim, frame, makeScene } from "./_compat";

test("Lite keeps the first-attachment order", () => {
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    const a = createPropertyAnimationGroup(manager, { v: 0 }, clip);
    const b = createPropertyAnimationGroup(manager, { v: 0 }, clip);
    removeAnimationGroup(manager, a);
    expect(getAnimationGroups(manager)).toEqual([b]);
    addAnimationGroup(manager, a);
    expect(getAnimationGroups(manager)).toEqual([a, b]);
});

test("compat: a restarted older animatable keeps its place", () => {
    const scene = makeScene();
    const target = { v: 0 };
    const hold = (v: number) => anim("v", [{ frame: 0, value: v }, { frame: 10, value: v }]);
    const older = scene.beginDirectAnimation(target, [hold(1)], 0, 10, true);
    scene.beginDirectAnimation(target, [hold(2)], 0, 10, true);
    frame(scene, 100);
    expect(target.v).toBe(2);
    older.pause();
    older.restart();
    frame(scene, 100);
    expect(target.v).toBe(2);
});
