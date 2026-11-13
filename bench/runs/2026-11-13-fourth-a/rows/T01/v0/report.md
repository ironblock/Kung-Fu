A. The task asks for one ast-grep outline command, run on src, that lists every top-level class declaration (exported, default-exported, or not, with or without extends) and excludes class expressions, nested classes, and non-class names.
B. sure

answer.txt contains: ast-grep outline --items structure --type class src

Its output lists Bin, Sorter, Scale, Crate, ColdCrate, Pallet, CrateError, and Depot. Lidded, Fragile, and the nested Leg in routes.js are correctly left out.
