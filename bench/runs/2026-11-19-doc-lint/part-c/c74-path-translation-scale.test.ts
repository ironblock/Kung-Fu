// c-74. Line 646 (map row): `Animation.ANIMATIONTYPE_VECTOR3` corresponds to `PATH_TRANSLATION = 0`, `PATH_SCALE = 2`.
// These are not exported by the package (internal names). Their user-visible effect is checked: glTF channel path 0 is
// translation (written to position) and path 2 is scale (written to scaling).
import * as Lite from "@babylonjs/lite";
import type { ClipSpec } from "./_fx";
import { gltf, nodeRecorder, rest } from "./_fx";

test("channel path 0 is translation, 2 is scale", () => {
    expect("PATH_TRANSLATION" in Lite || "PATH_SCALE" in Lite).toBe(false);
    const node = nodeRecorder();
    const clip: ClipSpec = {
        name: "c",
        duration: 1,
        channels: [
            { samplerIdx: 0, nodeIdx: 0, path: 0 },
            { samplerIdx: 1, nodeIdx: 0, path: 2 },
        ],
        samplers: [
            { input: new Float32Array([0, 1]), output: new Float32Array([1, 2, 3, 1, 2, 3]), interpolation: 0 },
            { input: new Float32Array([0, 1]), output: new Float32Array([4, 5, 6, 4, 5, 6]), interpolation: 0 },
        ],
    };
    const [g] = Lite.createAnimationGroups(gltf([clip], [rest()], { targets: [node] }));
    expect(g!.targetedAnimations.map((t) => t.path)).toEqual(["translation", "scale"]);
    const manager = Lite.createAnimationManager();
    Lite.addAnimationGroup(manager, g!);
    Lite.updateAnimationManager(manager, 100);
    expect(node.p).toEqual([1, 2, 3]);
    expect(node.s).toEqual([4, 5, 6]);
});
