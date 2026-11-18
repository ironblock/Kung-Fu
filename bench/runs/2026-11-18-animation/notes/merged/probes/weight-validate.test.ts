import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, setAnimationWeight } from "@babylonjs/lite";

test("setAnimationWeight throws unless the weight is finite and in [0, 1]; assigning group.weight is not checked", () => {
    const group = createPropertyAnimationGroup(createAnimationManager(), { v: 0 }, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]));
    expect(() => setAnimationWeight(group, 1.5)).toThrow("Animation weight must be a finite number between 0 and 1, got 1.5");
    expect(() => setAnimationWeight(group, -0.1)).toThrow();
    expect(() => setAnimationWeight(group, Number.NaN)).toThrow();
    setAnimationWeight(group, 0);
    setAnimationWeight(group, 1);
    group.weight = 3;
    expect(group.weight).toBe(3);
});
