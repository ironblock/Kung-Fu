import { attachDevice } from "./scene-helpers";
import { createNullEngine, createSceneContext, registerScene, registerSceneWithShadowSupport } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n03: only registerSceneWithShadowSupport installs the shadow task", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("registerScene leaves the frame graph without a shadow task", async () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        await registerScene(scene);
        expect(scene._frameGraph._tasks.some((t) => t.name === "shadow")).toBe(false);
    });

    it("registerSceneWithShadowSupport puts one shadow task first", async () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        await registerSceneWithShadowSupport(scene);
        expect(scene._frameGraph._tasks.filter((t) => t.name === "shadow")).toHaveLength(1);
        expect(scene._frameGraph._tasks[0]!.name).toBe("shadow");
    });
});
