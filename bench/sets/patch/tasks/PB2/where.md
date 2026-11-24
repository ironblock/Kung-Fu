# PB2, inside: `closeFor` drops the pieces too short to lock through

**The right change.** In `closeFor` (lines 125 to 141 of the starting file, with its comment), the two lines that
push what is left of a cut window, lines 136 and 137:

    if (window.opens < start) pieces.push({ ...window, closes: start });
    if (end < window.closes) pieces.push({ ...window, opens: end });

Each piece is now pushed only when it is 12 minutes or longer, and otherwise its length is added to `lost`. The
reference does it in four lines, with the file's own `LOCKING` (12, at line 28, which the outline shows).

**What it needs of the file.** The body of `closeFor`: the names `pieces`, `start`, `end` and `lost`, and that the
loop skips a window the closure does not touch before any piece is made. A patch must quote those lines exactly.

**What a wrong answer is likely to do.**

- Drop the short pieces and not add their minutes to what is returned (`hollow-kept.ts`).
- Test `> 12` in place of `>= 12`, and so drop a piece of exactly 12 minutes (`hollow-edge.ts`).
- Sweep the whole list for windows under 12 minutes after the loop, and so remove short windows the closure never
  touched (`hollow-all.ts`). The ask says those stay.
- Change the cut window in place (`window.closes = start`) and not make new pieces (`hollow-inplace.ts`). The module
  shares window objects between lists (`deepEnough` hands the same objects back), and the ask says everything else
  stays as it is. `unchanged` pins that `closeFor` does not alter a window that was in the list, when it cuts it in
  two ("closeFor changes the list it is given and not the windows that were in it") and when it trims one end
  ("closeFor leaves a window it trims as it was and puts a new one in the list"). The check's last case asks the
  same where a short piece is dropped.
- Apply the rule only to a window cut in two (`hollow-two.ts`), or judge a window's two pieces together
  (`hollow-together.ts`).
- Make up the body from the outline, and have the edit refused.
- Write the function anew and return a new list in place of changing the caller's. `unchanged` fails that.
- Write the whole file anew and get another function slightly wrong. `hollow-lost.ts` stands for that: its
  `windowsFor` does not join two windows that only meet. Six more files stand for other such slips:
  `hollow-opening.ts`, `hollow-overlap.ts`, `hollow-chain.ts` (`windowsFor`), `hollow-entrysort.ts`,
  `hollow-plansort.ts` (a caller's list sorted in place) and `hollow-board.ts`.

**A right answer that needs no line of the body.** A patch can quote only `closeFor`'s first line, which the outline
prints, keep the old body under a new name behind it, and put in front a new `closeFor` that calls the old one and
then takes out of the list each window that was not there before and is under 12 minutes long, adding its minutes
to what is returned. It applies, it passes the check, and it is right. So a pass in the `outline-1` arm is not by
itself a guess that landed: read it for this before it is counted. Written in place, the change needs the body.

The check skips one pinned case, "closeFor keeps a piece of a few minutes", which is what the change undoes.
