# CLAUDE.md — Helm / Compass

Design logic and decisions for a personal kanban board that lives on a TV in Joel's project room, controlled from a phone. This file is the context a future Claude (or future Joel) needs to keep working on the project without re-deriving everything.

## The problem being solved

Joel describes himself as forgetful and bad at completing to-dos. The existing system that works for him is physical: a wall divided into four sections (To Do / Doing / Waiting / Done) with color-coded post-its. The app's job is to digitize that wall without losing what makes it work — glanceability, physicality, and the dopamine of moving a note to Done. It is not a general-purpose task manager; it's *his wall*, on a TV, always on when the room is occupied.

## The four sections and their rules

1. **To Do** — the backlog, subdivided into an Eisenhower matrix (important × urgent, four quadrants). Largest area on the TV. Quadrant is derived from two booleans on the task (`important`, `urgent`) — not stored as a quadrant name — so mobile entry is two simple toggles (Joel's explicit preference) and the quadrant math lives in one place.
2. **Doing** — hard cap of **3 tasks**. This is a working-memory guardrail, so it's enforced in the UI (mobile blocks moving a 4th item in, with an explanatory message) *and made visible* on the TV: three fixed slots rendered as dashed outlines, numbered 1–3. An empty slot is information ("you have capacity"), not wasted space. Doing is the brightest thing on the wall.
3. **Waiting** — blocked on third parties. Deliberately deprioritized visually (reduced opacity, smaller notes, no rotation) because it shouldn't occupy attention, but it stays on screen so a returned email triggers "oh right, that."
4. **Done** — append-only trophy list, newest first. TV shows a running total plus the ~30 most recent as a dim strikethrough list with category dots and relative dates ("today", "3d ago"). Mobile shows the full scrollable history. The total count is styled in the accent color — it's the motivational number.

## Visual design

**Metaphor: keep the post-its.** The signature decision is that tasks render as actual sticky notes — square-ish, slight stable random rotation (hashed from the task ID so notes don't jiggle on re-render), a darker "adhesive strip" along the top edge, paper shadows, and handwritten-style type (Caveat) for the task text. New notes "settle" onto the wall with a small spring animation (disabled under `prefers-reduced-motion`).

**Palette: dark wall, bright notes.** Background is near-black slate (`#17191F`) — this is a TV in a room, so a light UI would be a glowing rectangle of eye strain; a dark wall makes the colored notes read exactly like paper under a spotlight. Section chrome is deliberately quiet (Archivo Black labels, letterspaced, in muted gray) so the notes carry all the color.

**Emphasis hierarchy (per Joel's spec):** To Do largest (left ~70%, 2×2 grid) → Doing emphasized (amber `#FFC845` accent, subtle glow, brighter panel) → Waiting and Done dimmed (62% opacity, smaller type). The amber accent is used *only* for Doing and the Done total — spending the one bright color on focus and reward.

**Category colors** (Joel's existing physical system, preserved exactly in spirit):

| Category | Color | Rationale |
|---|---|---|
| Gabe (son) | `#AEE1F9` light blue | existing post-it color |
| Civic | `#FFD84D` yellow | MBTA yellow |
| Friends | `#FFCBA4` peach | existing |
| Medical | `#FF7B6B` red | existing |
| Work | `#B9E8A8` light green | Illuminate NE brand |
| Finances | `#1E6B3C` dark green | existing; light text for contrast |
| Tonight | starry CSS background | nightlife app tasks; stars are pure CSS radial-gradients, no image asset |

Categories are user-editable: add with name + color picker + optional "starry" background. Text color is auto-derived from luminance (`readableText()`), so any picked color stays legible. Deleting a category is blocked while tasks still use it.

**Type stack:** Archivo Black (section labels only — loud, architectural), Caveat 700 (note text — handwriting, big enough to read from across a room at ~2vmin), Rubik (all UI chrome). All sizes on the TV view use `vmin` so the layout scales to any TV/monitor resolution without media queries.

## Architecture

Two single-file HTML apps + one shared config module, matching Joel's standing preference: **no build step, vanilla JS, Firebase, GitHub Pages** (same pattern as relay-race and Bounty Board).

- `index.html` — **Helm**, the TV view. The TV is a laptop's external monitor with mouse + keyboard, so Helm is no longer read-only: notes (and Done rows) are draggable onto any quadrant or the Doing/Waiting/Done sections — its *only* interaction. There's no editor UI; content edits stay on the phone. Drops write through the same `applyPatch()` path in both live and demo mode; a modal date prompt appears on moves into the Schedule quadrant or Doing (Enter = confirm, Esc = skip). The Doing cap blocks the drop with a toast, mirroring Compass.
- `mobile.html` — **Compass**, the controller. Tabs per section — **opens on Doing** so current tasks stay top of mind. To Do groups each quadrant in a bordered panel (Helm-style delineation; empty quadrants aren't rendered). The Doing tab mirrors Helm's three fixed slots: tasks as taller "big" cards, remaining capacity as dashed numbered slots. Bottom-sheet editor (title, category chips, ★ Important / ⚡ Urgent toggles, section picker), FAB to add, category manager sheet. Cards are **swipeable** (pointer events, axis-locked against vertical scroll via `touch-action: pan-y`): swipe right reveals Doing + Done buttons (Waiting + Done on the Doing tab; Doing disabled when full), swipe left reveals the four quadrant chips (current quadrant disabled on To Do). A full right swipe is a shortcut — To Do → Doing (bounces with a toast when full), Doing/Waiting → Done; leftward has no full-swipe default. The Done tab is inert. All swipe moves funnel through `moveTask()`, which applies the same date-prompt and field-cleanup rules as the editor and Helm's drag-and-drop.
- `firebase-config.js` — config + default category seed + demo data. Both views import it, so the config is pasted once.

**Demo mode:** while `apiKey === "PASTE_ME"`, both views run on in-memory sample data (Joel's actual example tasks). This lets the design be previewed and iterated before the Firebase project exists. Mobile edits in demo mode don't persist — a toast says so.

**Firebase (new project, per Joel's choice):**

- Firestore, two collections:
  - `tasks`: `{ title, cat (category doc id), status: "todo"|"doing"|"waiting"|"done", important: bool, urgent: bool, createdAt, completedAt, scheduledAt?, targetAt? }`. `completedAt` is set via `serverTimestamp()` only on the transition *into* done (checked against previous status so re-saving a done task doesn't bump it to the top). `scheduledAt` (Schedule-quadrant tasks) and `targetAt` (Doing completion target) are **ms epoch numbers**, not Firestore Timestamps — simpler to read/write from both clients. Both are prompted for on the transition *into* their home (Schedule quadrant / Doing) — via drag on Helm, and via new-task creation or editor save on Compass — always skippable ("Schedule later" / "No target"), editable later in the Compass sheet, and deleted (`deleteField()`) when the task moves back out. Display is ambient only: a small 📅/🎯 line on the note that turns into a red pill once past due (`render()` re-runs every 60s to keep this fresh). No reminders, no auto-escalation — overdue styling was an explicit choice over auto-flipping tasks to urgent.
  - `categories`: `{ name, color, text, starry, order }`. Seeded from `DEFAULT_CATEGORIES` on first run if the collection is empty (mobile does the seeding; TV just reads).
- Firebase JS SDK v10 modular, loaded from the gstatic CDN via dynamic `import()` inside `<script type="module">` — the import only happens in live mode, so demo mode makes zero network calls to Firebase.
- SDK version is pinned in the import URLs; bump deliberately, both files at once.

**Doing-limit enforcement** is client-side only (`doingCount()` excludes the task being edited, so moving a task already in Doing doesn't false-trip the limit). With one user on both clients this is sufficient; a Firestore rule can't easily count documents anyway.

**Auth:** both apps gate their UI behind a "Sign in with Google" screen (Firebase Auth, `GoogleAuthProvider`, `signInWithPopup`) shown over a full-screen `.gate` div while `firebaseConfig.apiKey !== 'PASTE_ME'`. Firestore listeners aren't attached until `onAuthStateChanged` reports a signed-in user, so there's no permission-denied noise pre-login. The real enforcement is the Firestore rule (`request.auth.token.email == "jpaul156@gmail.com"`) — the client gate is just UX, not security. Demo mode is unaffected: it never touches Firebase, so the gate never renders. Helm runs on a laptop plugged into the TV as an external monitor, so the one-time interactive Google sign-in is no different from signing into anything else on that machine; the session then persists in the browser.

## Deliberate non-features

- No drag-and-drop *on the phone* — swiping replaced it. Horizontal swipes reveal move buttons (with full-swipe-right shortcuts); dragging cards between columns would fight vertical scrolling on a small screen. (The TV got drag-and-drop once Joel confirmed it's a laptop screen with a mouse — see Architecture.)
- No reminders or notifications. `scheduledAt`/`targetAt` exist but are display-only with passive overdue styling; urgency remains a toggle Joel sets with his own judgment — that's the Eisenhower method. The wall's job is ambient visibility, not nagging.
- No occupancy/screen-off logic — handled in hardware (controlled outlet), explicitly out of scope.

## Ideas parked for later

- Gentle auto-scroll on the TV's Done list when it overflows.
- Weekly "done this week" count next to the all-time total.
- A "stale" treatment (slowly curling/fading note?) for To Do items untouched for 30+ days — the digital equivalent of a post-it losing its stick.
- Order/priority within a quadrant (currently Firestore document order, effectively insertion order).
