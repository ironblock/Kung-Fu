import {
    createAnimationManager,
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    crossFadeAnimationGroups,
    enablePropertyAnimationBlending,
    pauseAnimation,
    updateAnimationManager,
} from "@babylonjs/lite";

const constant = (value: number) => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value }, { time: 1, value }] }]);

test("crossFadeAnimationGroups fades fromGroup to 0 and toGroup to toWeight (default 1), each from its current weight", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    const walk = createPropertyAnimationGroup(manager, target, constant(10));
    const run = createPropertyAnimationGroup(manager, target, constant(20));
    run.weight = 0;
    crossFadeAnimationGroups(manager, walk, run, { durationMs: 1000 });
    updateAnimationManager(manager, 250);
    expect(walk.weight).toBe(0.75);
    expect(run.weight).toBe(0.25);
    expect(target.v).toBe(12.5);
    updateAnimationManager(manager, 1000);
    expect(walk.weight).toBe(0);
    expect(run.weight).toBe(1);
    expect(target.v).toBe(20);
});

test("the fade does not play, pause or remove groups: a paused toGroup stays paused, a faded-out group keeps playing", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const a = createPropertyAnimationGroup(manager, { v: 0 }, constant(1));
    const b = createPropertyAnimationGroup(manager, { v: 0 }, constant(2));
    pauseAnimation(b);
    crossFadeAnimationGroups(manager, a, b, { durationMs: 100, toWeight: 0.5 });
    updateAnimationManager(manager, 500);
    expect(b.isPlaying).toBe(false);
    expect(b.weight).toBe(0.5);
    expect(a.weight).toBe(0);
    expect(a.isPlaying).toBe(true);
    updateAnimationManager(manager, 300);
    expect(a.currentTime).toBeCloseTo(0.8, 10);
});

test("without a blending call the weights still change, but each group writes its full value", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const walk = createPropertyAnimationGroup(manager, target, constant(10));
    const run = createPropertyAnimationGroup(manager, target, constant(20));
    crossFadeAnimationGroups(manager, run, walk, { durationMs: 1000 });
    updateAnimationManager(manager, 500);
    expect(run.weight).toBe(0.5);
    expect(target.v).toBe(20);
});

test("a new group has weight 1, so a cross-fade to it keeps it at 1 and the fading group adds on top", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    const walk = createPropertyAnimationGroup(manager, target, constant(10));
    const run = createPropertyAnimationGroup(manager, target, constant(20));
    crossFadeAnimationGroups(manager, walk, run, { durationMs: 1000 });
    updateAnimationManager(manager, 250);
    expect(run.weight).toBe(1);
    expect(walk.weight).toBe(0.75);
    expect(target.v).toBe(27.5);
});
