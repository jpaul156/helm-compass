# Helm / Compass

A four-section (To Do / Doing / Waiting / Done) post-it wall for a TV, controlled from a phone.

- `index.html` — **Helm**, the TV display. Read-only, realtime. Point the TV's browser here and forget it.
- `mobile.html` — **Compass**, the phone controller. Add tasks, toggle ★/⚡, move between sections, manage categories.
- `firebase-config.js` — paste your Firebase config here (both views import it).
- `CLAUDE.md` — design rationale and data model.

Both views run in **demo mode** with sample data until you paste a real config, so you can preview immediately.

## Setup

### 1. Firebase (new project)

1. [console.firebase.google.com](https://console.firebase.google.com) → Add project (e.g. `helm-compass`). Analytics off.
2. Build → **Firestore Database** → Create database → production mode → `us-east1` or similar.
3. Build → **Authentication** → Get started → enable the **Google** sign-in provider.
4. Rules tab (Firestore) → paste and publish, swapping in your Google account email:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.token.email == "jpaul156@gmail.com";
    }
  }
}
```

   Both Helm and Compass gate their UI behind a "Sign in with Google" screen and only start reading/writing Firestore once signed in. The rule above is the real enforcement — the client-side gate is just UX.

5. Project settings (gear) → Your apps → Web app (`</>`) → register → copy the `firebaseConfig` object into `firebase-config.js`, replacing the placeholder.

No indexes needed — sorting happens client-side.

### 2. GitHub Pages

```bash
git init && git add . && git commit -m "Helm / Compass"
gh repo create helm-compass --public --source=. --push
```

Repo → Settings → Pages → Deploy from branch → `main` / root.

- Helm (TV): `https://jpaul156.github.io/helm-compass/`
- Compass (phone): `https://jpaul156.github.io/helm-compass/mobile.html` (Add to Home Screen for an app-like launch)

### 3. The TV

Any browser in fullscreen/kiosk mode works. Categories seed themselves (your six colors + starry Tonight) the first time the mobile app connects to a live Firestore.
