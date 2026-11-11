"""Variants of a set of tasks: the same tasks, with other names in them.

A subject passes a task when every one of its tries passes, and the tries are not
one string repeated. So each try gets a variant: the code, the wording of the task
and the reference answer, with the names a task turns on replaced by others.
Variant 0 is the set as it stands.

Only names change. What a task asks, and the trap in it, stay the same. A task
that turns on no name of its own reads the same in every variant.

A set says which names change in its `set.json`, under `names`: for each name, the
name it has in each variant. A decoy built from a name is listed as a name too.
"""
import re

WORD = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")


def count(names):
    """How many variants a table of names gives. With no names there is one: the set itself."""
    return max((len(v) for v in names.values()), default=1)


def renamed(text, names, variant):
    """`text` with every whole name of the table replaced."""
    return WORD.sub(lambda m: names[m.group(0)][variant] if m.group(0) in names else m.group(0), text)


def code(text, names, variant):
    """A file of code. A name is replaced wherever it stands, in a string too."""
    return renamed(text, names, variant)


def wording(text, names, variant):
    """The wording of a task. Names change only inside `code`, never in the prose."""
    return re.sub(r"`[^`]*`", lambda m: renamed(m.group(0), names, variant), text)


def answer(text, names, variant):
    """A reference answer. Names change only inside "double quotes".

    Outside them an answer holds words of ast-grep's own, such as `kind: pair` and
    `field: key`, which must stay.
    """
    return re.sub(r'"[^"]*"', lambda m: renamed(m.group(0), names, variant), text)


def faults(names, variant, words_in_code):
    """What is wrong with one variant's names, as sentences. None when all is well."""
    found = []
    new = [each[variant] for each in names.values() if len(each) > variant]
    if len(set(new)) != len(new):
        found.append(f"variant {variant} gives two things one name")
    for old, each in names.items():
        if each[0] != old:
            found.append(f"`{old}` is not its own name in variant 0")
        if len(each) != count(names):
            found.append(f"`{old}` has {len(each)} names, and there are {count(names)} variants")
        elif variant and each[variant] in words_in_code:
            found.append(f"variant {variant} renames `{old}` to `{each[variant]}`, which the code already uses")
    return found
