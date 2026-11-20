import { defineConfig } from "vitest/config";

// The grader's config: the hidden checks in place of the app's tests. The app uses no library.
export default defineConfig({
    test: {
        environment: "node",
        include: ["checks/**/*.test.ts"],
    },
});
