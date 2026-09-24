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

### Images

Photography lives in `public/images`. After adding or replacing any of it,
run:

```
npm run images
```

That caps each source at 1800px and re-encodes it, then writes a blur
placeholder per image into `src/content/blur.json`. The placeholder is what
the page paints while the real photograph is still arriving, which is why
nothing reflows as images land.

Every photograph renders through `src/components/Img.tsx`, which serves AVIF
or WebP at the size the layout asks for. Exactly one image per page carries
`priority` — the largest thing above the fold. Everything else stays lazy.

### Performance

`npm run perf` loads each page in a real browser with the cache disabled and
measures Core Web Vitals against a budget: LCP under 2.5s, CLS under 0.1, FCP
under 1.8s, and under 900KB transferred. It stops at `load` rather than at
network idle, because the hero carousel keeps fetching for as long as it
rotates and that says nothing about how fast the page arrived.

It then waits for the opening curtain to lift before reading LCP. This matters
on the home page: while the curtain is up, the largest thing painted is the
curtain's own one-liner, so a reading taken too early reports about 300ms and
is measuring the wrong element. What counts is when the headline behind it
arrives, which is around 1.6s.

That figure is mostly the curtain, and the curtain is editable. The hero runs
its entrance *behind* it and finishes as it begins to lift, so lengthening the
curtain in **Appearance** pushes LCP out roughly one-for-one, and shortening
or disabling it pulls LCP back to about 400ms. `heroDelay` in `src/lib/boot.ts`
derives its timing from whatever the curtain is set to; nothing needs
re-tuning by hand.

The first run against a cold server is always slower: the image optimiser
compiles each derivative on first request. Vercel caches those at the edge,
and `minimumCacheTTL` is set to a year. Measure the second run. Run it against
an otherwise idle machine, too — a browser left open from another check is
enough to push the home page over budget.

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

`/admin` has six screens, grouped in the rail as Site, Presentation and
Audience.

**Overview** lists the eleven pages with how many brand and accessibility
checks each is failing, how many views each drew over the last thirty days,
and how many enquiries are unread.

**Pages** opens the section editor. A page is an ordered list of sections; each
section has a ground (Ink, Card, Page or Halite), a visibility switch, a
"drafted, awaiting sign-off" flag, and its own fields. Sections can be
reordered, hidden, added and removed.

**Navigation and footer** edits what appears on every page, including the call
to action, which reads the same in all nineteen of its positions.

**Appearance** holds the judgement calls the brand system leaves open: how
heavy the Ink scrim over the hero photograph is, how long the carousel rests
on a frame, whether the module lattice shows and at what strength, whether
photographs lift on hover, whether sections arrive as they scroll into view,
and whether the opening curtain plays and for how long.

It deliberately has no colour picker. Every colour on the site comes from the
Rise v2 palette, and which value may sit on which ground is fixed; a free
picker would let an editor break a contrast pair or put a barred colour where
it cannot go. Colour is chosen per section, from the accent selector, which
only offers values the brand actually has.

The scrim slider warns below 55%. That is not a matter of taste: under it the
headline stops clearing AA against the brighter frames of the carousel.

**Engagement** shows views and enquiries over 7, 30 or 90 days, as a row of
figures, a hairline bar chart and a most-read table. See section 9.

**Enquiries** is the contact-form inbox.

### Two section types that ship unused

**Testimonials** and **Client logos** are fully wired — schema, renderer,
admin fields, brand checks — but only the logo strip appears in the shipped
copy, on Who we serve. No testimonial is seeded, because inventing a quote and
attributing it to a named person at a named firm is not something to ship by
default. Add real ones from the section editor: **Add section → Testimonials**.

The logo strip names clients rather than showing marks, which is what the
anonymization rule asks for anyway. Supplying an image for a client swaps the
name for the mark automatically.

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

---

## 9. Engagement

Two numbers are counted, both aggregated per day and neither tied to a person:
how many times each page was viewed, and how many enquiries the contact form
produced. `/admin/engagement` reads them over a 7, 30 or 90 day window, and the
overview carries the thirty-day figure per page.

**What is stored.** One Firestore document per day, at `analytics/YYYY-MM-DD`,
holding a total view count, a per-path view count, and an enquiry count. All
three are incremented with `FieldValue.increment(1)`. Nothing else is written.

**What is not stored.** No cookie is set. No identifier, session, fingerprint,
address or user-agent is recorded against a view. Nothing is sent to a third
party. There is therefore nothing here to obtain consent for and nothing to
hand over on request, which is the reason it was built this way rather than by
dropping in an analytics tag.

**How a view is counted.** `TrackView` fires once per pathname, after paint, on
an idle callback, via `sendBeacon`. It respects Do Not Track. `/api/track`
validates the submitted path against the known page list and returns 204 for
anything it does not recognise, so the counter cannot be filled with invented
paths. Failures are swallowed: counting must never affect the page being
counted.

**Reading the chart.** Bars are daily views, scaled to the busiest day in the
window. A marker under a bar means that day produced at least one enquiry.
Conversion is enquiries over views across the whole window.

The figures only start once Firestore is connected. Until then the screen says
so rather than showing zeros as if they were measurements.
