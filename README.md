# PONDERERS

Run a local server (e.g. `npx serve .`) and open the printed address, or deploy to
Vercel. Opening `index.html` directly by double-clicking it can hit browser
restrictions on the Firebase module imports.

Sign in with one of the two parent accounts to see:

- Today dashboard
- Calendar with Apple `.ics` import and export
- Meal planning and grocery list
- Temporary notes
- Wishlists
- Planning threads
- Child profiles
- Faith, prayer, gratitude, and encouragement
- Finger drawing board

Data syncs in real time between both parent accounts via Firebase
(Authentication + Firestore), with the browser's local storage used as an instant
offline-friendly cache. There's no public sign-up screen on purpose — see
`SETUP.md` to create the two parent accounts and connect your own Firebase
project before first use.

Next build step: open up beyond just the two parent accounts, if that's ever
wanted (e.g. grandparents, a babysitter view).
