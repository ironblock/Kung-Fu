# PL2, inside: `issue`

Rewritten on 2026-11-22 by the mender, Claude Opus 5.5, when the task was changed. Until then PL2 asked for a change
to `lift`. The adversary showed that it could be written from the outline alone, as a guard put straight after the
first line of `lift`, with nothing of the body.

**The right change.** In `issue` (lines 123 to 137 of the file), the block that finds a notice with the same
reference. Where it now takes the old notice out with `splice(old, 1)` and goes on to put the new one on top, it
puts the new notice in the old one's place, `register.notices[old] = notice`, and returns. The two tests that refuse
a notice stay where they are, before it. A notice under a new reference still goes on top by the `unshift` at the
end. The reference changes the comment above the block, replaces the `splice` and adds the `return`.

**What it needs of the file.** The body of `issue`: that it refuses a notice before it looks at the register, what
it refuses, and that it throws a `RangeError` to do so. A refused reissue must leave the old notice where it was.
The ask says only "a notice it refuses now, it still refuses in the same way". `Register.notices` is in the outline.
Nothing outside `issue` is needed.

**Why a reader of the outline alone is short of it.** The plainest edit that quotes only the first line of `issue`
is a guard straight after it: find the old notice, put the new one in its place, return. That skips the refusals.
`hollow-unchecked.ts` is that answer, and the check fails it. To pass with a guard, the reader must guess both
refusals and the class of error exactly. A guard that reads `to` as the last day (`to < from`), or that throws a
plain `Error`, or that tests only the days, fails. I ran each of these.

**Two right answers that need no body.** Both keep the old body under a new name, by an edit that puts a new
`issue` in place of the first line and gives the old one another first line. (1) The new `issue` calls the old one,
which refuses or puts the notice on top, and then moves the notice back to where the old one stood. (2) The new
`issue` calls the old one on an empty register, only for its refusals, then puts the notice in place itself. Both
pass. This road is open in any `inside` task whose change can be made around a call to the old body, and the other
modules' menders left it for the run's author. So read each `outline-1` pass for whether it kept the old body under a
new name, and count those beside the score.

**What a wrong answer is likely to do.**

- Put the guard before the refusals, as above. `hollow-unchecked.ts` does this. The case "a reissue it refuses is
  refused as before, and the register is left as it was" fails it, and so does the helper's "issue: a refused reissue
  leaves the old notice where it was".
- Read "should not overrule the notices issued after it" as "goes to the bottom of the register".
  `hollow-bottom.ts` does this. The case "keeps the place of a notice in the middle, and of the one on top" fails it.
- Put the new notice in place, but forget to return, so that it goes on top as well; or put it in beside the old one
  and keep both. The first case fails these, and the case for another stretch.
- Take the old place only when the stretch is the same. `hollow-samestretch.ts` does this. The case "takes the old
  notice's place whatever stretch the new one is for" fails it.
- Put the new notice in place before the restriction's times are tested, so a reissue refused for its times is left
  on the register. `hollow-timeslate.ts` does this. The case on refused reissues fails it.
- Write the whole file anew. `hollow-lost.ts` is such a file: `issue` is right, and `cruisingMinutes` adds up the
  minutes of the legs, each rounded up, where the file rounds up once for the whole route.

**Wrong answers in the rest of the file.** The other eleven of the adversary's thirteen, each with the right `issue`
and one other function changed a little: `hollow-throughbroken.ts`, `hollow-openfirst.ts`, `hollow-ringnull.ts`,
`hollow-negstart.ts`, `hollow-furlongslegs.ts`, `hollow-lockslegs.ts`, `hollow-prunenoday.ts`,
`hollow-sharesnoday.ts`, `hollow-inforcesign.ts`, `hollow-oversign.ts` and `hollow-tallysign.ts`. PL1's `where.md`
names the function each one changes.

A right answer need not cut the register's list in place: `other.ts` puts a new list on the register with `map`,
and passes.

The helper's case "issue: a notice issued again under its reference replaces the old one and goes on top" pins the
old behaviour, and this check skips it, and no other.
