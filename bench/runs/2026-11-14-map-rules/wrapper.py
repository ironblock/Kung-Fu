#!/usr/bin/env python3
"""Run a tool and write the call down: what was asked, by whom, how it ended, and how much it printed.

`setup.sh` copies this into a mapper's `bin` once for each tool, with the real program and the log put in.
The log is outside the mapper's directory. What the tool printed is passed on untouched and is not kept.
"""
import json, os, subprocess, sys, time

REAL, LOG, NAME = "@REAL@", "@LOG@", "@NAME@"
ran = subprocess.run([REAL] + sys.argv[1:], stdin=sys.stdin, capture_output=True)
try:
    by = open(f"/proc/{os.getppid()}/comm").read().strip()
except OSError:
    by = ""
with open(LOG, "a", encoding="utf-8") as log:
    log.write(json.dumps({"at": round(time.time(), 3), "tool": NAME, "args": sys.argv[1:], "in": os.getcwd(),
                          "started by": by, "status": ran.returncode, "printed": len(ran.stdout),
                          "complained": len(ran.stderr),
                          "complaint": ran.stderr.decode("utf-8", "replace")[:400]}) + "\n")
sys.stdout.buffer.write(ran.stdout)
sys.stderr.buffer.write(ran.stderr)
sys.exit(ran.returncode)
