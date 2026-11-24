I'm working on a small app in /home/dev/63aa9f/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Show the percentage on the discount line

Customers ask me how big the discount for a long hire is. The quote only says "Long hire discount" and an amount.

Please change `quoteHire` in `src/tariff.ts` so that the label of the discount line also says the percentage that the length of the hire earns, in brackets after the words it has now. A hire that earns ten percent has the label `Long hire discount (10%)`. Write the percentage as a plain number with no zeros it does not need: a hire that earns seven and a half percent has `Long hire discount (7.5%)`, and one that earns five percent has `Long hire discount (5%)`. The label says the percentage earned even when the cap has held the amount below it.

Nothing else about the quote changes: not the amount on the discount line, not the other lines or their order, not the total. A hire that earns no discount still has no discount line.

Please keep every change inside /home/dev/63aa9f/app.
