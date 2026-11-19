// c-57. Line 629 (map row): `scene.beginDirectAnimation(target, [anim], from, to, loop)` corresponds to
// `createPropertyAnimationGroup(manager, target, clip, { fromFrame: from, toFrame: to, loop })`.
// Checked: with those options the group starts at `from`, plays to `to` and, with loop true, wraps back to `from`; with
// loop false it stops at `to`.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const clip = () => createPropertyAnimationClip("c", [{ path: "v", frameRate: 10, keys: [{ frame: 0, value: 0 }, { frame: 40, value: 40 }] }]);

test("fromFrame / toFrame / loop", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const g = createPropertyAnimationGroup(manager, target, clip(), { fromFrame: 10, toFrame: 30, loop: true });
    expect(g.currentTime).toBe(1);
    updateAnimationManager(manager, 1000);
    expect(target.v).toBeCloseTo(20, 4);
    updateAnimationManager(manager, 1500);
    expect(target.v).toBeCloseTo(15, 4);

    const m2 = createAnimationManager();
    const t2 = { v: -1 };
    const once = createPropertyAnimationGroup(m2, t2, clip(), { fromFrame: 10, toFrame: 30, loop: false });
    updateAnimationManager(m2, 5000);
    expect(t2.v).toBe(30);
    expect(once.isPlaying).toBe(false);
});
