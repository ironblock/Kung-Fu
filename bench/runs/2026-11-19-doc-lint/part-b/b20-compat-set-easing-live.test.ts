// b-20. Lines 328-329: "Changing or clearing `Animation.setEasingFunction()` during playback takes effect without recompiling the native clip."
// Compat package (@babylonjs/lite-compat, the same release). A direct animation of one float track
// is built the way the compat layer builds it (Animatable._create, an internal entry the compat scene
// calls); it runs natively on a Lite group. Assigning, then clearing, the animation's easing while
// it plays changes the written value at the next manager update, with the same Lite group.
import { createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { Animatable, Animation } from "#compat/animations/animation.ts";

test("setEasingFunction during native playback takes effect on the next update", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const anim = new Animation("a", "v", 100);
    anim.setKeys([
        { frame: 0, value: 0 },
        { frame: 100, value: 100 },
    ]);
    const animatable = Animatable._create(() => manager, target, [anim], 0, 100, true, 1);
    const lite = animatable._lite;
    expect(lite).toBeDefined();
    updateAnimationManager(manager, 500);
    expect(target.v).toBe(50);
    anim.setEasingFunction({ ease: (g: number) => g * g });
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(25);
    anim.setEasingFunction(null);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(50);
    expect(animatable._lite).toBe(lite);
});
