# Setting up accounts and cloud sync

This adds two things to PONDERERS: a sign-in screen for just the two of you, and a shared cloud database so the same data shows up on both phones/computers.

Everything below happens in the Firebase console. The free tier is plenty for this and takes about 15-20 minutes the first time.

## 1. Create the Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) and click **Add project**.
2. Name it whatever you like, for example `ponderers`.
3. Google Analytics is optional; you do not need it for this app.
4. Once the project is created, click the **Web** icon to register a web app.
5. You do not need Firebase Hosting for this step, since you are deploying on Vercel.
6. After registering, Firebase shows you a `firebaseConfig` object with values like `apiKey`, `authDomain`, `projectId`, and more. Keep this tab open; you will paste these into `firebase.js` in step 5.

## 2. Turn on email/password sign-in

1. In the left sidebar, go to **Build > Authentication** and click **Get started**.
2. Under **Sign-in method**, enable **Email/Password**.
3. Go to the **Users** tab and click **Add user**.
4. Create one account for each parent using the real email addresses and passwords they will use.
5. Click each user row and copy both user UIDs. You will use them in step 4.

There is no public sign-up form in the app on purpose. These parent accounts are the only way in.

## 3. Create Firestore

1. In the left sidebar, go to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose a location close to you.
4. Start in **production mode**.

## 4. Add Firestore rules and seed the household

### 4a. Publish the Firestore rules

1. Open the `firestore.rules` file included in this project.
2. In Firebase, go to **Firestore Database > Rules**.
3. Paste in the contents of `firestore.rules` and click **Publish**.

These rules protect the app by allowing access only to signed-in users who have their own `users/{uid}` document and an active membership in the correct household.

### 4b. Create the required documents

Before sign-in will work fully, create the following Firestore documents manually in **Firestore Database > Data**.

Use your two real Firebase Auth UIDs in place of `UID_1` and `UID_2`.

#### Document: `users/UID_1`
```json
{
  "displayName": "Dad",
  "defaultHouseholdId": "ponderers-home"
}
```

#### Document: `users/UID_2`
```json
{
  "displayName": "Mom",
  "defaultHouseholdId": "ponderers-home"
}
```

#### Document: `households/ponderers-home`
```json
{
  "familyName": "The PONDERERS Home"
}
```

#### Document: `households/ponderers-home/members/UID_1`
```json
{
  "displayName": "Dad",
  "role": "owner",
  "status": "active"
}
```

#### Document: `households/ponderers-home/members/UID_2`
```json
{
  "displayName": "Mom",
  "role": "parent",
  "status": "active"
}
```

If you want, you can rename `ponderers-home` to something else; just make sure both users point to the same `defaultHouseholdId`, and that the household document uses that same ID.

## 5. Add your Firebase config to the app

Open `firebase.js` and replace the placeholder values in `firebaseConfig` with the real values from step 1.

Example:

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

These values are meant to be public in client-side code. Real protection comes from your Firestore rules and Firebase Authentication, not from hiding config values.

## 6. Test locally

Opening `index.html` directly by double-clicking it can run into browser restrictions on ES module imports.

Instead, serve the folder locally. For example:

```bash
npx serve .
```

Then open the printed `http://localhost...` address.

Sign in with one of the two parent accounts you created. If it is the first sign-in for this household, whatever is already in that browser's local data becomes the starting point for the shared cloud data.

One small heads-up: any finger drawings saved before this cloud change lived only in that browser's local storage and will not carry over automatically, because drawings now sync through Firestore separately. Everything else, including events, meals, notes, wishes, threads, children, and faith content, will sync into the shared household data.

## 7. Deploy to Vercel

Since your HR system already runs on Vercel + Firebase, this follows the same general pattern:

1. Push this project to GitHub or update the existing repo.
2. In Vercel, click **Add New Project** and import the repo.
3. Use the **Other** framework preset.
4. No build command or output directory override is needed; this is a static `index.html` + `app.js` + `styles.css` app.
5. Deploy.

Vercel will give you a URL like `ponderers.vercel.app`.

## 8. Authorize the real domain

Firebase Auth only allows sign-in from domains you explicitly approve.

1. In Firebase, go to **Authentication > Settings > Authorized domains**.
2. Add your Vercel domain, for example `ponderers.vercel.app`.
3. Add your custom domain too later if you attach one.

`localhost` is already authorized by default, which is why local testing works before this step.

## 9. Test both sides

Open the deployed URL on two devices, or on two browser profiles.

1. Sign in with one parent account on one device.
2. Sign in with the other parent account on the other device.
3. Add a note or event on one side.
4. It should appear on the other within a second or two, even on different networks.

## Good to know

- **Last write wins.** If both of you edit at the exact same moment, the last write that reaches Firestore becomes the saved household state for that sync cycle.
- **Reset affects both of you.** The reset sample data option resets the shared household data for both accounts, not just the current device.
- **Drawings are capped.** Only the most recent 30 drawings sync, and each image is shrunk before saving, so storage usage stays reasonable.
- **Membership drives access.** If a signed-in user is missing either the `users/{uid}` document or the `households/{householdId}/members/{uid}` document with `status: "active"`, Firestore will deny access.
