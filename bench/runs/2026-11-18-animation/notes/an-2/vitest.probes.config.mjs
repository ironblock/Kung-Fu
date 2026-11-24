// Runs the probes under notes/probes against the library checkout, the way app/vitest.config.ts does.
// Run from app/: npx vitest run --config ../notes/vitest.probes.config.mjs
import { resolve } from "node:path";

const here = import.meta.dirname;
const lite = resolve(here, "../babylon-lite/packages/babylon-lite/src");

export default {
    root: here,
    resolve: {
        alias: {
            "@babylonjs/lite": resolve(lite, "index.ts"),
            "babylon-lite/shader/wgsl.js": resolve(lite, "shader/wgsl.ts"),
        },
    },
    test: {
        environment: "node",
        globals: true,
        include: ["probes/**/*.test.ts"],
    },
};
