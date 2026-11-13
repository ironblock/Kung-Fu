A. The task asks for one ast-grep outline command that lists every exported top-level const or let that has a value, and excludes non-exported declarations, export lists, exported functions and classes, and re-exports.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/none/T04/v2/answer.txt:
ast-grep outline --items exports --type constant,variable src

It lists the 13 expected items: MAX_TIER, Lidded, VERSION, LABEL_SIZES, sample, DEFAULT_ROUTE, chosenTrack, lastError, nearest, byLength, bins, sorted, colours. The default names view prints 19 lines because of group headers and file headers, and the grader said presentation does not matter. Nothing under src was changed.
