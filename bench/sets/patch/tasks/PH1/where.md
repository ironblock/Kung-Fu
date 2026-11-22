# PH1, beside: a new method `changesAt` on the class `Manifest`

## The right change

One new method in the class `Manifest`, anywhere among its members. The reference puts it before `headcountOn`, straight after `aboardOn` (line 599 of the file):

```ts
changesAt(legIndex: number): { on: Person[]; off: Person[] } {
    const now = this.aboardOn(legIndex);
    if (legIndex === 0) {
        return { on: now, off: [] };
    }
    const before = this.aboardOn(legIndex - 1);
    return {
        on: now.filter((p) => !before.some((q) => q.id === p.id)),
        off: before.filter((p) => !now.some((q) => q.id === p.id)),
    };
}
```

Nothing else in the file changes.

## What the outline gives, and what the ask adds

The outline shows `aboardOn(legIndex: number): Person[] {` among the members of `Manifest`, and `id: string` in `Person`. That is enough: the method is two calls to `aboardOn` and a comparison by id.

The outline does not show three things, and the ask says each:

- What `boardLeg` and `leaveLeg` mean. `leaveLeg` is the first leg a person is not aboard for, and `-1` stands for "to the end" (the body of `isAboard`, lines 227 to 233). The ask says to go by what the class answers about who is aboard, and not by the people's own fields.
- The order of the lists. `aboardOn` gives people in the order they were added, which is not the roster's order. The ask says to keep the order the class gives.
- What `aboardOn` does for an index that is not a leg (it gives an empty list). The ask says the first leg's answer outright, and says the method is only called with the index of a leg the manifest has. The check calls it with no other index.

## What a wrong answer is likely to do

- **Read the fields with a guess** (`hollow-fields.ts`): `on` from `boardLeg === legIndex`, `off` from `leaveLeg === legIndex - 1`, taking `leaveLeg` for the last leg aboard. `on` comes out right and `off` is wrong for everyone who leaves. The check fails it at `changesAt(passage(), 1).off`.
- **Read the fields with the right meaning** (`hollow-fieldsright.ts`, and `hollow-fieldsall.ts`, which does it for the first leg too): `on` from `boardLeg === legIndex`, `off` from `leaveLeg === legIndex`. It is right for everyone whose span holds a leg. The check fails it at "goes by who is aboard, so someone whose legs hold none of the passage neither comes on nor goes off", which adds people with `boardLeg` 1 and `leaveLeg` 1, and the like, as the ask's "not by the people's own fields" allows.
- **Take the people from `roster()`** (`hollow-roster.ts`): the right people in the sorted order, skipper first. The check fails it on the order of the first leg's `on`.
- **Put `off` in another order** (`hollow-offroster.ts`, the roster's order; `hollow-offsorted.ts`, by id). The check fails both at "keeps both lists in the order the people were added, which is not the roster's order nor the ids'".
- **Tell people apart by name** (`hollow-byname.ts`). The check fails it at "two people of one name are told apart by their ids".
- **Hand out the manifest's own objects.** An answer that filters the people with `isAboard` and gives the stored objects, not copies, passes. The ask asks only that the method itself change nothing, and an answer that calls `aboardOn` gets copies without knowing it. It is not a wrong answer here.
- **Add the method at the end of the file,** with an empty SEARCH. That puts a method outside the class and the file does not load. This is a failure of the patch, not of the logic.
- **Quote a member's first line with the wrong indent or with a `;`** the outline does not show. The outline prints members with two spaces and prints fields without their `;`. An edit that quotes a field line with a `;` and the outline's two spaces still finds the text only if those bytes are in the file.
- **Write the file anew.** `hollow-lost.ts` is the reference with one other function changed as a rewrite from the outline might change it: `comparePeople` compares surnames with regard to case. The check fails it through `unchanged`, at the roster's order.
- **One other function a little off.** Each of these is a right `changesAt` with one change elsewhere, and the check fails each through `unchanged`: `hollow-jacketage.ts` (a swimmer of twelve needs a lifejacket), `hollow-tieorder.ts` (problems of one code on one leg not put in the order of their detail), `hollow-metrefloor.ts` (`formatDistance` floors the metres), `hollow-sealperson.ts`, `hollow-sealremove.ts` and `hollow-sealleg.ts` (a sealed manifest refuses before it throws), `hollow-pencetrunc.ts` (`formatPence` drops a part of a penny), `hollow-aboardnegative.ts` and `hollow-spannegative.ts` (any `leaveLeg` below 0 taken for the end, in `isAboard` and in `legSpan`), `hollow-kmfloor.ts` (`parseLegLine` floors the metres), `hollow-infantage.ts` (`headcount` counts an age of 1.5), `hollow-hourdigits.ts` (`parseClock` takes three digits of hours).
