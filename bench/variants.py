"""Variants of the pilot's tasks: the same tasks, with other names in them.

A subject passes a task when every one of its tries passes, and the tries are not
one string repeated. So each try gets a variant: the code, the wording of the task
and the reference answer, with the names a task turns on replaced by others.
Variant 0 is the pilot as it stands.

Only names change. What a task asks, and the trap in it, stay the same. Tasks that
turn on no name of their own, such as every call to `console.log`, read the same
in every variant.
"""
import re

# The names the tasks turn on, and beside each the decoys built from it.
NAMES = {
    "load": ["load", "pull", "sync", "boot"],
    "reload": ["reload", "repull", "resync", "reboot"],
    "alpha": ["alpha", "north", "amber", "delta"],
    "beta": ["beta", "south", "coral", "sigma"],
    "alphabet": ["alphabet", "northern", "amberish", "deltas"],
    "key": ["key", "slot", "tag", "mark"],
    "key2": ["key2", "slot2", "tag2", "mark2"],
    "monkey": ["monkey", "monslot", "montag", "monmark"],
    "pair": ["pair", "join", "link", "bind"],
    "Stage": ["Stage", "Phase", "Step", "Round"],
    "StageList": ["StageList", "PhaseList", "StepList", "RoundList"],
    "StageRunner": ["StageRunner", "PhaseRunner", "StepRunner", "RoundRunner"],
    "StageName": ["StageName", "PhaseName", "StepName", "RoundName"],
    "finish": ["finish", "close", "settle", "seal"],
    "done": ["done", "ready", "last", "over"],
}
COUNT = 4
WORD = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")


def renamed(text, variant):
    """`text` with every whole name of the table replaced."""
    return WORD.sub(lambda m: NAMES[m.group(0)][variant] if m.group(0) in NAMES else m.group(0), text)


def code(text, variant):
    """A file of code. A name is replaced wherever it stands, in a string too."""
    return renamed(text, variant)


def wording(text, variant):
    """The wording of a task. Names change only inside `code`, never in the prose."""
    return re.sub(r"`[^`]*`", lambda m: renamed(m.group(0), variant), text)


def answer(text, variant):
    """A reference answer. Names change only inside "double quotes".

    Outside them an answer holds words of ast-grep's own, such as `kind: pair` and
    `field: key`, which must stay.
    """
    return re.sub(r'"[^"]*"', lambda m: renamed(m.group(0), variant), text)


def faults(variant, words_in_code):
    """What is wrong with one variant's names, as sentences. None when all is well."""
    found = []
    new = [names[variant] for names in NAMES.values()]
    if len(set(new)) != len(new):
        found.append(f"variant {variant} gives two things one name")
    for old, names in NAMES.items():
        if len(names) != COUNT:
            found.append(f"`{old}` has {len(names)} names, and there are {COUNT} variants")
        elif variant and names[variant] in words_in_code:
            found.append(f"variant {variant} renames `{old}` to `{names[variant]}`, which the code already uses")
    return found
