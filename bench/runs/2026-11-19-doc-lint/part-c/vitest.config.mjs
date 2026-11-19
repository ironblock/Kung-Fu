// Runs the part-c probes against a checkout of the library.
// LITE_SRC must name the checkout's packages/babylon-lite/src directory.
// LITE_DEPS must name a node_modules directory that holds the library's own dependencies
// (the checkout has none of its own); bare imports of those packages are sent there.
// VITEST_CACHE should name a cache directory outside the repository.
// PROBES may name the directory that holds the probes, when this file is run from a copy
// placed outside the repository (so that vite writes no temporary files next to the probes).
// Run from a directory whose node_modules holds vitest, for example:
//   LITE_SRC=<checkout>/packages/babylon-lite/src LITE_DEPS=<node_modules> npx vitest run --config <this file>
// "@babylonjs/lite" is the package's public entry (src/index.ts).
// "#compat/" reaches the same checkout's packages/babylon-lite-compat/src; only the probes whose
//   comment says "compat package" use it. That package imports Lite as "babylon-lite".
// "#lite-src/" reaches one internal module; only the probes whose comment says "internal" use it.
import { resolve } from "node:path";
import { tmpdir } from "node:os";

const here = process.env.PROBES ?? import.meta.dirname;
const lite = process.env.LITE_SRC;
const deps = process.env.LITE_DEPS;
if (!lite || !deps) {
    throw new Error("Set LITE_SRC to the library's packages/babylon-lite/src directory and LITE_DEPS to a node_modules directory with its dependencies");
}
const compat = resolve(lite, "../../babylon-lite-compat/src");
const cache = process.env.VITEST_CACHE ?? resolve(tmpdir(), "lint-doc-c-cache");

export default {
    root: here,
    cacheDir: cache,
    resolve: {
        alias: [
            { find: "@babylonjs/lite", replacement: resolve(lite, "index.ts") },
            { find: /^babylon-lite$/, replacement: resolve(lite, "index.ts") },
            { find: "babylon-lite/shader/wgsl.js", replacement: resolve(lite, "shader/wgsl.ts") },
            { find: /^(text-shaper|manifold-3d|mathcat|navcat|@recast-navigation\/[^/]+|@babylonjs\/havok)(\/.*)?$/, replacement: resolve(deps) + "/$1$2" },
            { find: /^#compat\/(.*)$/, replacement: compat + "/$1" },
            { find: /^#lite-src\/(.*)$/, replacement: resolve(lite) + "/$1" },
        ],
    },
    test: {
        environment: "node",
        globals: true,
        include: ["*.test.ts"],
        fsModuleCachePath: resolve(cache, "modules"),
    },
};
