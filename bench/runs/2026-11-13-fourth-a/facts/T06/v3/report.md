A. The task asks for one ast-grep outline command that lists every top-level function declaration in src (exported or not, including export default function) and excludes arrow functions and function expressions stored in variables, nested functions, methods, and classes.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T06/v3/answer.txt:
ast-grep outline --items structure --type function --match 'function' src

It lists 19 items: mileage, fetchRoute, plan, reroute, watch, byWeight, fasten (sorting.js), open, pad, fasten, fastenAll, unfasten, stamp, letterhead, melt, fasten (wax.js default export), fasten and weigh (tools.js), classify. It drops the unexported arrow consts onChange, shortcut, lazyBook and round, which --type function alone would have kept.
