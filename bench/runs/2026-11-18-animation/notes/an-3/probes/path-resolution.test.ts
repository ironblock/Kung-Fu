import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";
import { rampClip, thrown } from "./_lib";

it("a missing path part throws at creation; each write looks the owner up again; a vanished owner throws in the update", () => {
    const manager = createAnimationManager();
    const clip = rampClip("a.b.c");
    expect(thrown(() => createPropertyAnimationGroup(manager, { a: {} }, clip))).toMatch(/could not resolve "b"/);
    expect(thrown(() => createPropertyAnimationGroup(manager, { a: { b: {} } }, clip))).toMatch(/could not resolve "c"/);

    const m2 = createAnimationManager();
    const target: { position?: { x: number } } = { position: { x: 0 } };
    createPropertyAnimationGroup(m2, target, rampClip("position.x"));
    const old = target.position!;
    target.position = { x: -1 };
    updateAnimationManager(m2, 500);
    expect(target.position.x).toBe(5);
    expect(old.x).toBe(0);
    target.position = undefined;
    expect(thrown(() => updateAnimationManager(m2, 100))).toMatch(/position\.x/);
});
