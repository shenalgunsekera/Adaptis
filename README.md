# Adaptis

The Adaptis website and its admin panel.

Next.js (App Router) · Firestore · Firebase Auth and Storage · Nodemailer over
Gmail · deployed on Vercel.

Every visible string, every image, the navigation, the footer and the
search-engine metadata are held in Firestore and edited at `/admin`. The copy
deck ships in `src/content` and is used both as the seed and as the fallback
whenever Firestore cannot be reached, so the site renders correctly on a clean
checkout with no credentials.

```
npm install
npm run dev        # http://localhost:3000, admin at /admin
npm run build
npm run typecheck
npm run audit      # layout, accessibility and contrast, in a real browser
npm run perf       # Core Web Vitals against a budget
npm run compliance # design-system rules: shadows, radii, faces, case
npm run colours    # every painted colour against the canonical set
npm run pairings   # the combinations the brand bars outright
npm run spacing    # every literal step on the 4px scale
npm run tokens     # live values vs the design system's token files
npm run images     # re-encode photography and rebuild blur placeholders
```

**Start here: [docs/SETUP.md](docs/SETUP.md)** — Firebase, environment,
loading the copy, Vercel, how editing works, the decisions baked into this
build, and what is still outstanding.
