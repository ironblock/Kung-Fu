# PP2, inside: `fill`, a fallback after a bar

**The right change.** In `fill` (lines 601 to 636 of the file, with its comment on line 600), the place where a field's name is taken and looked up, lines 623 to 626. The text between the braces is split at its first bar. The part before it, trimmed, is the name. When `fields` has no value for the name and a bar was written, the part after the bar goes into the text and nothing is listed as missing:

```ts
        const inner = template.slice(at + 1, close);
        const bar = inner.indexOf("|");
        const name = (bar < 0 ? inner : inner.slice(0, bar)).trim();
        if (Object.hasOwn(fields, name)) {
            text += fields[name];
        } else if (bar >= 0) {
            text += inner.slice(bar + 1);
        } else {
```

The `else` branch that follows stays as it is: a field with no bar and no value is listed once and left in the text.

**Why it needs the body.** The first line, `fill(template: string, fields: Record<string, string>): Filled`, says nothing of how a field is found, of doubled braces, of a brace never closed, of what "has a value" means (`Object.hasOwn`, so an empty string counts and `toString` does not), or of what happens to a field with no value. The ask says these stay as they are. A function written anew from the first line gets some of them wrong, and the edit that replaces the body cannot quote it.

**Wrong answers that are likely.**

- The fallback used for an empty value too, as `fields[name] || fallback` does (`hollow-empty.ts`). "takes an empty string as a value" fails.
- The fallback used, and the name still listed in `missing` (`hollow-listed.ts`).
- The fallback trimmed, as the name is (`hollow-trimmed.ts`). "keeps the fallback exactly as written" fails.
- The split made at the last bar, or with `split("|")` and only the second piece kept (`hollow-lastbar.ts`). "splits at the first bar" fails.
- `fields[name] !== undefined` in place of `Object.hasOwn`. "counts only a field that was given" fails, and so does the case of `unchanged` with `{toString}`.
- A rewrite of the loop with a regular expression. It tends to lose the doubled braces or the brace that is never closed, which `unchanged` pins.
- A file written anew. `unchanged` fails wherever the guess differs, as it does for `hollow-lost.ts`, where `formatPence` writes whole pounds with `.00`.
- The whole of what is in the braces looked up first, as a key (`hollow-wholekey.ts`). "looks up only the name before the bar" fails.
- The split made with a regular expression whose `.` stops at a newline (`hollow-newline.ts`). "keeps the fallback exactly as written" fails.
- A doubled brace in the fallback made one brace (`hollow-unescaped.ts`). The ask says that opening braces in the fallback are text and that doubled braces behave as today outside a field, so `{a|x{{y}` gives `x{{y`. "keeps an opening brace in the fallback as text" fails.
- A bar at the very start not taken as a bar (`hollow-leadingbar.ts`), or an empty name before a bar never given a value (`hollow-emptyname.ts`). The name is then the empty string, which empty braces already treat as a name. "takes an empty name before the bar as a name" fails both.
- A fallback that names a field given that field's value (`hollow-fallbackfield.ts`). "puts the fallback in as it is written" fails.
- A regular-expression pass over the fallbacks before the old loop (`hollow-regexfirst.ts`). It loses the doubled braces round `{{boat|x}}`.
- The closing brace looked for past a doubled one (`hollow-closebrace.ts`). A field with no bar changes, and `unchanged` fails it: `{a}}` gives `x}` today.

**Hollow answers that change another function,** each failed by a case of `unchanged` that all three checks run: `hollow-movequiet.ts` (`move` by the default quiet hours), `hollow-negdeposit.ts` (a deposit below nought gets a notice), `hollow-halfpenny.ts` (`formatPence(-50.5)` rounds away from nought), `hollow-noprof.ts` (no "prof" in the titles), `hollow-samequiet.ts` (`parseQuiet` turns the same time twice into 0 to 0), `hollow-backyears.ts` (`dateOf` counts 365 days for every year back) and `hollow-errortrim.ts` (`tidyError` trims before its dots).

**The case of `unchanged` the change alters,** and the check skips: "fill: a bar inside the braces is part of the name". Before the change `{boat|your boat}` was a field named `boat|your boat`.

**What the check does not test.** What `checkTemplates` says of a template that uses a bar: the ask is silent on it.

**A road that needs no body.** The old `fill` can be kept under a new name, quoting only its first line, and a new `fill` written before it that settles each field with a bar and hands the rest to the old one. It passes. It needs a guess the outline does not give: that a doubled brace is one brace, so that a fallback can be handed on with its braces doubled. Read an `outline-1` pass for it before it is counted.
