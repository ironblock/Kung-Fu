A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only the exported top-level function declarations named exactly `seal` (with or without async, and with export or export default), and excludes look-alikes such as sealAll, unseal, parameters named seal, constants calling seal, re-export lists, unexported functions, and class methods.

B. sure

The command is written to /tmp/kf-work/2026-11-13-runner-check-b/none/T02/v0/answer.txt:
ast-grep outline --items exports --type function --view names --match 'export (default )?(async )?function seal\(' src

Running it lists three items: seal in src/wax.js (export default), seal in src/labels.js, and seal in src/sorting.js (export async). The unexported seal in src/tools.js is excluded, as are sealAll, unseal, stamp, and the re-export in src/index.js. Nothing under src was changed.
