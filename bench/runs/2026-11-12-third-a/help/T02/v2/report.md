A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only top-level exported function declarations named exactly `bolt` (with or without async, export or export default), excluding look-alikes such as boltAll, parameters named bolt, constants calling bolt, re-exports, non-exported declarations, and class methods.

B. unsure

The command is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/help/T02/v2/answer.txt as: ast-grep outline -l javascript --items all --type function --match '^export\s+(default\s+)?(async\s+)?function\s+bolt\b' --no-ignore hidden --no-ignore dot --no-ignore vcs src

Unverified points: I could not run ast-grep or see src, so the --match regex is assumed to be tested against the first source line (which starts with "export"). If --match is instead tested only against names or signatures without the export keyword, the filter would miss everything. The --no-ignore flags are there so that every file is searched, but extensionless files would still be skipped by -l javascript.
