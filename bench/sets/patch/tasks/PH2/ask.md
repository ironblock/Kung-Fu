# Keep gear of different weights apart

When the same thing is put in the same place twice, the manifest folds the two into one row and keeps the first unit weight. That hides weight: a 13.5 kg gas bottle and a 15 kg one come out as two bottles at 13.5 kg.

Please change `Manifest.addLoad` in `src/manifest.ts`. A new item is folded into a row only when that row has the same unit weight as well as the same thing in the same place. When no row matches in all three, the item becomes a row of its own, after the rows already there.

Everything else about adding load stays as it is: what is refused, how a label is tidied and matched, and what is given back.
