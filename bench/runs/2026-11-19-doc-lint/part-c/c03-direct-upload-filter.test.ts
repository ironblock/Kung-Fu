// c-03. Line 553: "A direct controller uploads only skeletons containing a joint targeted by that clip, or a joint
// below a targeted ancestor; otherwise independently playing clips from the same asset would reset one another's rigs
// to rest pose."
// Checked: one asset, two skeletons. Skeleton A's joint is node 1, a child of node 0; skeleton B's joint is node 2.
// A clip that moves node 0 (an ancestor of A's joint) uploads A's bone texture only. A clip that moves node 2 (B's
// joint) uploads B's only. Driven by a manager with an engine stand-in, as a direct (unweighted) group is.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, playAnimation, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, recordingEngine, rest, skeleton } from "./_fx";

test("a clip uploads only the skeletons it moves", () => {
    const rec = recordingEngine();
    const skelA = skeleton(1, "A");
    const skelB = skeleton(2, "B");
    const [onAncestor, onJoint] = createAnimationGroups(
        gltf([moveClip("ancestor", 0, 10, 1, 0), moveClip("joint", 0, 10, 1, 2)], [rest(), rest(0), rest()], { skeletons: [skelA, skelB] })
    );
    const m1 = createAnimationManager({ engine: rec.engine });
    playAnimation(onAncestor!);
    addAnimationGroup(m1, onAncestor!);
    updateAnimationManager(m1, 100);
    expect(rec.calls.filter((c) => c.method === "writeTexture").map((c) => (c.resource as { name: string }).name)).toEqual(["A"]);

    rec.calls.length = 0;
    const m2 = createAnimationManager({ engine: rec.engine });
    playAnimation(onJoint!);
    addAnimationGroup(m2, onJoint!);
    updateAnimationManager(m2, 100);
    expect(rec.calls.filter((c) => c.method === "writeTexture").map((c) => (c.resource as { name: string }).name)).toEqual(["B"]);
});
