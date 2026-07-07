# Setting up accounts and cloud sync

This adds two things to PONDERERS: a sign-in screen (just the two of you, no public
sign-up) and a shared database so the same data shows up on both phones/computers.

Everything below happens in the Firebase console (free tier is plenty for this) and
takes about 15-20 minutes the first time.

## 1. Create the Firebase project

1. Go to https://console.firebase.google.com and click **Add project**.
2. Name it whatever you like (e.g. "ponderers"). Google Analytics is optional, you
   don't need it for this.
3. Once the project is created, click the **</>** (web) icon to register a web app.
   You don't need Firebase Hosting for this step, since you're deploying on Vercel.
4. After registering, Firebase shows you a `firebaseConfig` object with values like
   `apiKey`, `authDomain`, `projectId`, etc. Keep this tab open, you'll paste these
   into `firebase.js` in step 5.

## 2. Turn on email/password sign-in

1. In the left sidebar, go to **Build > Authentication**, then click **Get started**.
2. Under **Sign-in method**, enable **Email/Password**.
3. Go to the **Users** tab and click **Add user**. Create one account for each
   parent (their real email + a password they'll remember). There is no sign-up
   form anywhere in the app on purpose, these two accounts are the only way in.
4. Click each user row to see their **User UID** — copy both. You'll need them in
   step 4.

## 3. Create the database

1. Go to **Build > Firestore Database**, click **Create database**.
2. Choose a location close to you, and start in **production mode** (the rules you
   add in the next step will handle access control).

## 4. Lock the database to just the two of you

1. Open `firestore.rules` (included in this project) and replace
   `PARENT_1_UID` and `PARENT_2_UID` with the two UIDs from step 2.4.
2. In the Firebase console, go to **Firestore Database > Rules**, paste in the
   edited contents of `firestore.rules`, and click **Publish**.

This is what actually protects the data — anyone could technically see your
`firebaseConfig` values in the page source (that's normal and expected for client
apps), but these rules mean Firestore will reject every request that isn't from one
of your two signed-in accounts.

## 5. Add your config to the app

Open `firebase.js` and replace the placeholder values in `firebaseConfig` with the
real ones from step 1.4:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## 6. Test it locally

Opening `index.html` directly by double-clicking it can run into browser
restrictions on ES module imports. Instead, serve the folder locally, for example:

```
npx serve .
```

then open the printed `http://localhost:...` address. Sign in with one of the two
accounts you created. If it's the very first sign-in for this household, whatever
is already in that browser's local data becomes the starting point for the shared
cloud data — nothing is wiped.

One small heads up: any finger drawings saved before this change lived only in
that browser's local storage and won't carry over automatically, since drawings
now sync through the cloud. Everything else (events, meals, notes, wishes,
threads, children, faith content) does carry over.

## 7. Deploy to Vercel

Since your HR system already runs on Vercel + Firebase, this follows the same
pattern:

1. Push this project to a GitHub repo (or update the existing one).
2. In Vercel, **Add New > Project**, import that repo.
3. Framework preset: **Other**. No build command, no output directory override
   needed — it's a static `index.html`/`app.js`/`styles.css` site.
4. Deploy. Vercel gives you a URL like `ponderers.vercel.app`.

## 8. Authorize your real domain

Firebase Auth only allows sign-in from domains you've explicitly approved.

1. In Firebase, go to **Authentication > Settings > Authorized domains**.
2. Add your Vercel domain (e.g. `ponderers.vercel.app`, and your custom domain too
   if you set one up later).

`localhost` is already authorized by default, which is why local testing in step 6
works without this step.

## 9. Try it from both sides

Open the Vercel URL on two different devices (or two browser profiles), sign in
with each parent account, and add a note or event on one. It should appear on the
other within a second or two, even if you're on different wifi networks.

## Good to know

- **Last write wins.** If both of you edit at the exact same moment, whichever
  save reaches the server last is the one that sticks for that whole sync —
  there's no merge of individual fields. For two people sharing a calendar, this
  is rarely a real problem in practice, but it's worth knowing about.
- **Reset affects both of you.** The "reset sample data" option now resets the
  shared household data for both accounts, not just the device you're on.
- **Drawings are capped.** Only the most recent 30 drawings sync, and each is
  shrunk before saving, so a busy kid with a tablet won't fill up storage.
