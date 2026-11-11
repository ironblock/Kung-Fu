"""Where a set of tasks is, and what it says about itself.

A set is a directory with `tasks.md`, the marked code under `marked/src`,
`reference/answers.txt`, and `set.json`. The pilot is the set named `pilot`. Any
other set is under `sets/`.

`set.json` holds four things:

  code       one sentence for the subject: what is under `src`, and which files count
  names      the names that change from variant to variant (see variants.py)
  wrappers   for a task where a wrapping node is as good an answer as the node
             itself, the rule that finds the wrapper
  groups     the tasks that are added up together when arms are compared, each
             group under a name (see compare.py). A set may name none.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))


def where(name):
    """The directory of a set."""
    if name == "pilot":
        return os.path.join(os.path.dirname(HERE), "pilot")
    return os.path.join(HERE, "sets", name)


def about(name):
    """What a set says about itself."""
    told = json.load(open(os.path.join(where(name), "set.json"), encoding="utf-8"))
    return {"code": told["code"], "names": told.get("names", {}), "wrappers": told.get("wrappers", {}),
            "groups": told.get("groups", {})}


def built(name, variant):
    """Where `build.py` puts one variant of a set."""
    return os.path.join(HERE, "built", name, str(variant))
