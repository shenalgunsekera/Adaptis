# Setting the Adaptis site up

Written for whoever deploys and maintains this site. It assumes no prior
knowledge of this codebase, and some familiarity with Firebase and Vercel.

---

## What this is

A Next.js site with an admin panel. Every visible string, every image, the
navigation, the footer and the search-engine metadata are held in Firestore and
edited through `/admin`. The shipped copy deck lives in `src/content` and is
used as the seed, and as the fallback whenever Firestore cannot be reached — so
the site renders correctly on a clean checkout with no credentials at all.

| Piece | Where |
| --- | --- |
| Public pages | `src/app/[[...slug]]/page.tsx`, one route for all eleven |
| Section components | `src/components/sections/` |
| Admin panel | `src/app/admin/` |
| Content schema | `src/lib/types.ts` |
| Shipped copy | `src/content/` |
| Design tokens | `src/styles/tokens.css` |
| Brand rule checks | `src/lib/brandCheck.ts` |

---

## 1. Firebase

Create a project at <https://console.firebase.google.com>.

**Firestore.** Build → Firestore Database → Create database. Production mode,
region `northamerica-northeast2` (Toronto) or whichever is closest. Then
Rules → paste the contents of `firestore.rules` → Publish.

These rules deny the browser everything, which is correct: the public site
reads content on the server through the Admin SDK, and the admin panel writes
through API routes that check a server-side allowlist. Nothing needs client
access to the database.

**Storage.** Build → Storage → Get started. Then Rules → paste `storage.rules`
→ Publish. Site imagery is public to read, writable only by a signed-in
account, and capped at 8MB and image types.

**Authentication.** Build → Authentication → Get started → Email/Password →
Enable. Then Users → Add user, and create an account for each editor. These are
the people who will sign in at `/admin`.

**A service account.** Project settings → Service accounts → Generate new
private key. This downloads a JSON file. Three values out of it become
environment variables below. Keep the file out of the repository.

---

## 2. Environment

Copy `.env.example` to `.env.local` and fill it in. Two things are easy to get
wrong:

**The private key has newlines in it.** Paste it wrapped in double quotes with
the `\n` sequences intact, exactly as it appears in the JSON file. The app
normalises both that form and real newlines.

**`SMTP_PASS` is not the Gmail account password.** Gmail rejects account
passwords for SMTP. Generate a 16-character app password at
<https://myaccount.google.com> → Security → App passwords, which requires
two-step verification to be on first. It can be revoked from that same page
without changing the account password.

`ADMIN_EMAILS` is the list of people permitted to edit. An account must exist in
Firebase Auth *and* be on this list. It is held in the environment rather than
in the database deliberately: someone who reached Firestore must not be able to
add themselves as an editor.

---

## 3. Loading the copy

Run the site, sign in at `/admin` with one of the accounts you created, and
press **Fill empty pages** on the overview screen. That writes the eleven pages
and the site settings into Firestore from `src/content`.

**Reset to shipped copy** replaces everything with the same seed, discarding
edits. It asks first.

Until the seed runs, the public site serves the same content directly from
`src/content`, so it looks right either way.

---

## 4. Running it

```
npm install
npm run dev      # http://localhost:3000, admin at /admin
npm run build    # production build
npm run typecheck
```

### The audit

`npm run audit` loads every page in a real browser at 320, 360, 390, 768, 1024
and 1440px and checks what the handoff says must hold: no horizontal overflow,
a side gutter never below 20px, no tap target under 24px, one h1 per page,
headings in order, a working skip link, alt text on every image, one Naples
form per page, a light section between the last dark one and the Halite
footer, no gradients or shadows, sentence case, and a title, description and
canonical URL on every page.

Run it against a build that is already serving:

```
npm run build
npm start &
npm run audit
```

It needs Chrome. Set `CHROME` if it is not at the default Windows path, and
`BASE` to audit a deployed URL instead of localhost.

---

## 5. Vercel

Import the repository at <https://vercel.com/new>. Framework preset is detected
as Next.js and needs no changes.

Add every variable from `.env.local` under Settings → Environment Variables, for
Production, Preview and Development. The `NEXT_PUBLIC_` ones are compiled into
the browser bundle and are public by design; the rest are server-only and are
never sent to the browser.

After the first deploy, set the real domain in the admin panel under
**Navigation and footer → Site address**. It drives canonical URLs, the sitemap
and `robots.txt`.

---

## 6. How editing works

`/admin` has four screens.

**Overview** lists the eleven pages with how many brand and accessibility
checks each is failing, and how many enquiries are unread.

**Pages** opens the section editor. A page is an ordered list of sections; each
section has a ground (Ink, Card, Page or Halite), a visibility switch, a
"drafted, awaiting sign-off" flag, and its own fields. Sections can be
reordered, hidden, added and removed.

**Navigation and footer** edits what appears on every page, including the call
to action, which reads the same in all nineteen of its positions.

**Enquiries** is the contact-form inbox.

### The checks

`src/lib/brandCheck.ts` runs on every keystroke in the editor and again on the
server before a save. It enforces the rules the handoff lists as ones that must
not be broken:

- one connected Naples form per page, normally the call to action
- the two darks never touch, so the last section before the Halite footer must
  be light
- one h1 per page
- sentence case throughout
- alt text on every image
- a source on every published figure

A page that breaks one of these is refused by the server. The editor can
override with **Save anyway**, and the finding stays on the record.

Two further checks are informational: sections still flagged as drafted, and
placeholders still in place before launch.

---

## 7. Decisions baked into this build

These came from the handoff specification and from the client. They are
recorded here so they are not re-litigated by whoever inherits this.

**Ink is the site's ground.** Halite is the footer and nothing else, with at
least one full light section above it. Secondary text on Ink is Hairline
`#D8D6D4` at 8.77:1. This resolves the brand conflict in section 3 of the
handoff, which blocked design.

**The dark ramp is an extension.** `--ink-recessed`, `--ink-raised` and
`--ink-hover` in `tokens.css` are not canonical Rise v2 values. They step Ink in
lightness only, leaving hue and chroma alone, so the ramp reads as one
material. They are marked `[ext]` and grouped for the brand owner to review.

**The hero carousel is built for photography and ships without it.** The
overlay is a flat Ink scrim rather than a gradient, because gradients are
barred. Any slide with no image draws the module grammar instead, so the hero
is correct before anything is licensed and stays correct if an image fails to
load. Add images, alt text and credits per slide in the admin panel.

**Two sections are drafted and flagged.** The founder's note on the About page
is drawn from the founding story already in the About copy, which the handoff
sanctions. The team impact section is built from the five published case
studies, and every figure in it names the engagement record it came from — no
aggregate impact statistic has been revived. Both are marked "awaiting
sign-off" in the admin panel and appear in the checks until that flag is
cleared.

**The Work page is Customer stories**, at `/customer-stories`, with `/work`
redirecting to it permanently.

---

## 8. Still outstanding

Carried forward from the handoff, and visible in the admin checks:

- **Imagery.** No photography exists. Stock needs licensing and uploading.
- **Elms Sans.** Requested from Google Fonts in its own stylesheet link so that
  its absence cannot break the other three faces. If it does not load, the
  display face falls back to Source Serif 4, which is what the reference build
  shipped. Self-host it in production and it will be picked up with no other
  change.
- **Self-hosting the other three faces.** Geist, Geist Mono and Source Serif 4
  load from Google Fonts, which is correct for a draft only.
- **The sixth case study**, a buildings-in-operation engagement. The slot is
  built and switched on.
- **Two team profiles.** Sohani Withanage's details, and one unnamed third.
- **One claim to verify before launch.** A proposed Ontario amendment may change
  the 50,000 sq ft EWRB threshold quoted on Building record and on Reporting
  and disclosure.
