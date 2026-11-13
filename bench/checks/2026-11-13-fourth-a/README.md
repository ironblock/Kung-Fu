# The check's own programs

These were written by the agent that checked the write-up of `../../runs/2026-11-13-fourth-a`. They are not part of the bench, and the self-check does not cover them. They are kept so that the split of a try's tokens by kind can be made again.

- `index.py` and `analyse.py` read the harness's own records, which are not kept. They say which record is which try's, and for each step how many of the characters that came back are the task, the guide, the tool's help, the code, or something else. What they made is here: `analysed-2026-11-13-fourth-a.json` for this run, and `analysed-2026-11-13-third-shell.json` for the pilot.
- `parts2.py <run> [tokens of the harness's text]` reads one of those files and prints the tokens of a try before its first right call, by kind. `parts3.py <run>` prints the differences between arms, with the pairs drawn again and with the tasks drawn again. Both run from this directory with nothing else.
- `harness.py` and `helps.py` read the harness's records too: what the harness added after a subject began, and which part of the help each subject asked for.

The tokens of a step are the harness's count. Inside a step they are shared by characters, so each part is near and not exact.
