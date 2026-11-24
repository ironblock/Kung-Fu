I'm working on a small app in /home/dev/c7a26b/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Approving a swap settles the other requests for the shift

I want to change `Rota.decideSwap` in `src/rota.ts`. One shift can have several swap requests pending at once, each to a different person. Today, when I approve one of them, the others stay pending.

From now on, when a request is approved, I want every other request for the same shift that is still pending to become refused, with the same `decidedAt` as the approved one. Requests for other shifts must not be touched. Requests that were already decided must keep their status and their `decidedAt`. Refusing a request should still change no other request. When approving throws, as it can today, no request may change at all.

Please keep every change inside /home/dev/c7a26b/app.
