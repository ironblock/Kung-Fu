A. The task asks for one ast-grep 0.51.1 command, run from the directory containing src, that matches every JavaScript class declaration with an extends clause (plain or dotted base, top level or nested, extends on its own line), matching the whole declaration, and excludes class expressions, plain declarations, functions, and string mentions.
B. unsure

The answer is in answer.txt: ast-grep run --pattern 'class $C extends $B { $$$BODY }' --lang js src

I did not verify this against the src files or with ast-grep, because I could not list the directory with the tools I had. Two things could make it miss matches: files whose extensions are not recognized as JavaScript, and gitignored or hidden files, which ast-grep skips by default. I left out --no-ignore flags because I was not certain ast-grep 0.51.1 supports them.
