Work only in the directory /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/kf/ceiling

It contains tasks.md, a directory src with the code the tasks are about, and bin/ast-grep (ast-grep 0.51.1). Put bin on your PATH:

export PATH=/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/kf/ceiling/bin:$PATH

Read tasks.md. You may read the code under src and run ast-grep as often as you like, from that directory. Do not read any file outside that directory and do not use the network. Do not change anything under src.

Write your answers to answers.txt in that directory, in the form tasks.md describes. Before you finish, run each answer yourself and check, by reading the code, that it matches exactly what the task describes: every piece of code the task describes, once each, and nothing else.

When you are done, report back in this exact structure and nothing else:
A. How many ast-grep commands you ran in total.
B. For each task T01 to T14: how many attempts you made before the answer you kept, and the lines (file:line) your kept answer matches.
C. Any task whose wording left you unsure what should count as a match. Quote the words and say what you could not decide. If none, say "none".
