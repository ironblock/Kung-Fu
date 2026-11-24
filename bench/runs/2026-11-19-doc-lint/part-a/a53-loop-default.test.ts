// a-53, line 191: "loopAnimation: boolean; // default true"
import { bothKinds } from "./_groups.ts";

test("loopAnimation is true by default", () => {
    const { gltf, property } = bothKinds();
    expect([gltf.loopAnimation, property.loopAnimation]).toEqual([true, true]);
});
