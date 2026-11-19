// Runs the part-b probes against a checkout of the library.
// LITE_SRC must name the checkout's packages/babylon-lite/src directory.
// VITEST_CACHE may name a cache directory outside the repository.
// Run from a directory whose node_modules holds vitest, for example:
//   LITE_SRC=<checkout>/packages/babylon-lite/src npx vitest run --config <this file>
// "@babylonjs/lite" is the package's public entry (src/index.ts).
// "#compat/" reaches the same checkout's packages/babylon-lite-compat/src. Only the probes
// whose comment says "compat package" use it; that package imports Lite as "babylon-lite".
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { readFileSync } from "node:fs";

const here = import.meta.dirname;
const lite = process.env.LITE_SRC;
if (!lite) {
    throw new Error("Set LITE_SRC to the library's packages/babylon-lite/src directory");
}
const compat = resolve(lite, "../../babylon-lite-compat/src");
// The checkout has no node_modules. Its own dependencies are taken from the node_modules of the
// directory vitest is run from (the runner), by name, as the runner's package.json lists them.
const runner = process.cwd();
const runnerDeps = Object.keys(JSON.parse(readFileSync(resolve(runner, "package.json"), "utf8")).dependencies ?? {});
const depAliases = runnerDeps
    .filter((name) => !["vitest", "vite", "typescript"].includes(name) && !name.startsWith("@types/"))
    .map((name) => ({ find: new RegExp(`^${name.replace(/[/.]/g, "\\$&")}(?=/|$)`), replacement: resolve(runner, "node_modules", name) }));

export default {
    root: here,
    cacheDir: process.env.VITEST_CACHE ?? resolve(tmpdir(), "lint-doc-b-cache"),
    resolve: {
        alias: [
            { find: "@babylonjs/lite", replacement: resolve(lite, "index.ts") },
            { find: /^babylon-lite$/, replacement: resolve(lite, "index.ts") },
            { find: "babylon-lite/shader/wgsl.js", replacement: resolve(lite, "shader/wgsl.ts") },
            { find: /^#compat\/(.*)$/, replacement: compat + "/$1" },
            ...depAliases,
        ],
    },
    test: {
        // Keep vitest's transformed-module cache out of the repository.
        fsModuleCache: false,
        environment: "node",
        globals: true,
        include: ["*.test.ts"],
    },
};
