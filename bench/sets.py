"""Where a set of tasks is, and what it says about itself.

A set is a directory with `tasks.md`, the marked code under `marked/src`,
`reference/answers.txt`, and `set.json`. The pilot is the set named `pilot`. Any
other set is under `sets/`.

`set.json` holds four things, and may hold two more:

  code       one sentence for the subject: what is under `src`, and which files count
  names      the names that change from variant to variant (see variants.py)
  wrappers   for a task where a wrapping node is as good an answer as the node
             itself, the rule that finds the wrapper
  groups     the tasks that are added up together when arms are compared, each
             group under a name (see compare.py). A set may name none.
  form       the line of `task.md` that says what form an answer takes. Without
             it, the line is the one for `ast-grep run` and `ast-grep scan`
  graded     the line of `task.md` that says what an answer is graded on. Without
             it, the line speaks of matches

A set may hold more than one body of code, each for some of its tasks. Then the
marked code is under `marked/<body>/src`, one directory for each body, and
`set.json` holds one thing more:

  bodies     for each body, by its name, the tasks that are about it. Every task
             is in one body. A body with two tasks is a pair, and `build.py`
             checks it as one (see there)
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
FORM = "One line in `answer.txt`, in the form `ast-grep run ...` or `ast-grep scan --inline-rules '...' ...`."
GRADED = ("It is graded on what it matches. It must match every piece of code the task describes, once each,"
          " and nothing else.")


def where(name):
    """The directory of a set."""
    if name == "pilot":
        return os.path.join(os.path.dirname(HERE), "pilot")
    return os.path.join(HERE, "sets", name)


def about(name):
    """What a set says about itself."""
    told = json.load(open(os.path.join(where(name), "set.json"), encoding="utf-8"))
    return {"code": told["code"], "names": told.get("names", {}), "wrappers": told.get("wrappers", {}),
            "groups": told.get("groups", {}), "form": told.get("form", FORM), "graded": told.get("graded", GRADED),
            "bodies": told.get("bodies", {})}


def built(name, variant):
    """Where `build.py` puts one variant of a set."""
    return os.path.join(HERE, "built", name, str(variant))


def clean(name, variant, task):
    """The directory that holds the `src` a task is about, as `build.py` built it."""
    for body, tasks in about(name)["bodies"].items():
        if task in tasks:
            return os.path.join(built(name, variant), "bodies", body, "clean")
    return os.path.join(built(name, variant), "clean")
