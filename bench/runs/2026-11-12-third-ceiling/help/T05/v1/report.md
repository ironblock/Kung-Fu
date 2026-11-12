A. The task asks for a single `ast-grep outline` command over `src` that lists exactly the `export` statements that declare nothing themselves (bare name lists like `export { a as b, c };` and re-exports like `export * from`, `export * as x from`, `export { A, B } from`, including multi-line forms), while leaving out exported declarations and `import` statements.
B. unsure
