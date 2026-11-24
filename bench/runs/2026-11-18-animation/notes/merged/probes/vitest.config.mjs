// Runs the merged probes against the library checkout, the way app/vitest.config.ts runs the app.
// Run from app/: npx vitest run --config ../merged/probes/vitest.config.mjs
// The probes come from three lists that reach app/checks/helpers.ts in three ways
// ("../helpers.js", "#helpers", "../../app/checks/helpers.ts"); the aliases below send all three there.
// globals is on because one list's probes use describe/it/expect without importing them.
import { resolve } from "node:path";

const here = import.meta.dirname;
const base = resolve(here, "../..");
const lite = resolve(base, "babylon-lite/packages/babylon-lite/src");
const helpers = resolve(base, "app/checks/helpers.ts");

export default {
    root: here,
    resolve: {
        alias: [
            { find: "@babylonjs/lite", replacement: resolve(lite, "index.ts") },
            { find: "babylon-lite/shader/wgsl.js", replacement: resolve(lite, "shader/wgsl.ts") },
            { find: "#helpers", replacement: helpers },
            { find: /^\.\.\/helpers\.js$/, replacement: helpers },
        ],
    },
    test: {
        environment: "node",
        globals: true,
        include: ["*.test.ts"],
    },
};
