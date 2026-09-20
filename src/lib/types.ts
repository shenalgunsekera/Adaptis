/* ============================================================================
   Adaptis — content schema

   Every visible string on the public site is addressable through these types.
   A page is an ordered list of sections; a section declares its ground and its
   content. The admin panel edits exactly this shape, so anything typed here is
   editable there, and nothing renders that is not typed here.
   ========================================================================= */

export type Ground = "ink" | "card" | "page" | "halite";

/** Token names released for service-line identity. See tokens.css. */
export type Accent =
  | "naples"
  | "naples-light"
  | "apricot"
  | "cassiopeia"
  | "billabong"
  | "none";

export interface Cta {
  label: string;
  href: string;
}

export interface ImageRef {
  /** Storage or remote URL. Empty string renders the module grammar instead. */
  src: string;
  /** Required on every image. Never decorative-empty for content imagery. */
  alt: string;
  /** Credit line for licensed stock, shown in the admin and in page source. */
  credit?: string;
}

/* --- Section payloads ---------------------------------------------------- */

export interface HeroSlide {
  id: string;
  /** The service line this slide belongs to. */
  eyebrow: string;
  asideTitle: string;
  asideBody: string;
  image: ImageRef;
  accent: Accent;
  href?: string;
}

export interface HomeHeroSection {
  type: "homeHero";
  eyebrow: string;
  /** The page's single h1. Fixed across slides: one h1 per page. */
  title: string;
  lede: string;
  primaryCta: Cta;
  /** "primary" makes the hero button the page's single Naples form.
      "oncard" hands that yellow to a band elsewhere on the page. */
  primaryStyle?: "primary" | "oncard";
  secondaryCta?: Cta;
  slides: HeroSlide[];
  /** Milliseconds between slides. 0 disables autoplay. */
  autoplayMs: number;
}

export interface PageHeroSection {
  type: "pageHero";
  eyebrow: string;
  title: string;
  lede: string;
  accent: Accent;
  image?: ImageRef;
  /** When true, draws the module grammar instead of an image. */
  showModules: boolean;
}

export interface ProseSection {
  type: "prose";
  eyebrow?: string;
  title?: string;
  paras: string[];
  /** Renders the title as a two-tone display line, splitting on the marker. */
  duotoneTail?: string;
}

export interface SplitProseSection {
  type: "splitProse";
  eyebrow?: string;
  title: string;
  paras: string[];
  asideTitle?: string;
  asideParas: string[];
}

export interface CardItem {
  id: string;
  title: string;
  body: string;
  tag?: string;
  href?: string;
  accent: Accent;
  /** Optional figure. A tile with one becomes a story card. */
  image?: ImageRef;
}

export interface CardGridSection {
  type: "cardGrid";
  eyebrow?: string;
  title?: string;
  intro?: string;
  cards: CardItem[];
  /** Draws the accent keyline across the top of each tile. */
  accentKeyline: boolean;
}

export interface AreaItem {
  id: string;
  name: string;
  lead: string;
  body: string;
  tag?: string;
  href?: string;
  accent: Accent;
}

export interface AreaListSection {
  type: "areaList";
  eyebrow?: string;
  title?: string;
  intro?: string[];
  areas: AreaItem[];
}

export interface ServiceItem {
  id: string;
  name: string;
  lead: string;
  application: string[];
  outcome: string[];
}

export interface ServiceBlocksSection {
  type: "serviceBlocks";
  eyebrow?: string;
  title?: string;
  services: ServiceItem[];
  accent: Accent;
}

export interface StepItem {
  id: string;
  title: string;
  body: string;
}

export interface StepsSection {
  type: "steps";
  eyebrow?: string;
  title?: string;
  steps: StepItem[];
  accent: Accent;
}

export interface ListSection {
  type: "list";
  eyebrow?: string;
  title?: string;
  intro?: string;
  /** Optional column headings, e.g. "New construction". */
  groups: { id: string; title?: string; items: string[] }[];
  accent: Accent;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  /** Required before a figure may be published. Enforced in the admin. */
  source: string;
}

export interface CaseItem {
  id: string;
  client: string;
  lead: string;
  challenge: string;
  approach: string;
  results: string;
  stats: StatItem[];
  tags: string[];
  quote?: { text: string; attribution: string };
  image: ImageRef;
}

export interface CaseStudiesSection {
  type: "caseStudies";
  eyebrow?: string;
  title?: string;
  intro?: string;
  cases: CaseItem[];
  accent: Accent;
  /** Renders an empty, admin-visible slot after the last case. */
  showGapSlot: boolean;
  gapSlotNote?: string;
}

/** The "Consulting Areas" panel the client marked up on Scion: a dense grid
    of the named services, each with its glyph and a one-line description. */
export interface ServiceIndexSection {
  type: "serviceIndex";
  eyebrow?: string;
  title: string;
  intro?: string;
  items: {
    id: string;
    title: string;
    lead: string;
    href: string;
    accent: Accent;
  }[];
}

/** "Image patterns, match Adaptis's design language" — the client's Notion
    markup of the Scion mission block: two offset figures set on the module
    grid, against a heading and a hairline list. The offset is the brand's own
    bridged-module relationship, not a decorative collage. */
export interface ImagePatternSection {
  type: "imagePattern";
  eyebrow?: string;
  title: string;
  paras: string[];
  imageA: ImageRef;
  imageB: ImageRef;
  items: { id: string; text: string }[];
  link?: Cta;
  accent: Accent;
}

export interface QuoteSection {
  type: "quote";
  text: string;
  attribution: string;
  accent: Accent;
}

export interface BandSection {
  type: "band";
  title: string;
  support: string;
  /** "naples" spends the page's single yellow here, as area rather than a
      control. Any page using it must not also use a Naples button. The brand
      system's stated intent is for the yellow to be a mass. */
  variant: "naples" | "plain";
  /** Optional button inside the band. On a Naples band it is Ink, because
      the band is already the page's yellow. */
  cta?: Cta;
}

export interface FounderNoteSection {
  type: "founderNote";
  eyebrow: string;
  /** Lead sentence, rendered at full strength. */
  title: string;
  /** Continuation, rendered at secondary. */
  titleTail: string;
  left: string[];
  right: string[];
  name: string;
  role: string;
  signature?: ImageRef;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  credentials: string[];
  bio: string;
  photo: ImageRef;
  accent: Accent;
  /** Renders the dashed empty profile at full size. */
  placeholder: boolean;
}

export interface TeamSection {
  type: "team";
  eyebrow: string;
  title: string;
  titleTail?: string;
  intro: string;
  members: TeamMember[];
}

export interface ImpactSection {
  type: "impact";
  eyebrow: string;
  title: string;
  lede: string;
  paras: string[];
  stats: StatItem[];
  clients: { id: string; name: string }[];
  clientsNote: string;
}

export interface LifecycleSection {
  type: "lifecycle";
  eyebrow?: string;
  title?: string;
  items: { id: string; title: string; body: string }[];
}

export interface ContactFormSection {
  type: "contactForm";
  eyebrow?: string;
  title: string;
  intro?: string;
  submitLabel: string;
  successMessage: string;
  /** Five fields, per the specification. Labels are editable; the set is not. */
  labels: {
    name: string;
    organization: string;
    email: string;
    subject: string;
    message: string;
  };
  subjectOptions: { id: string; label: string }[];
  privacyNote: string;
}

export interface ContactDetailsSection {
  type: "contactDetails";
  title: string;
  lines: string[];
  email: string;
  phone: string;
  website: string;
  linkedin: string;
}

export interface CtaSection {
  type: "cta";
  title: string;
  body: string;
  cta: Cta;
  /** "primary" spends the page's yellow here; "ink" or "oncard" does not. */
  style: "primary" | "ink" | "oncard";
}

export type SectionBody =
  | HomeHeroSection
  | PageHeroSection
  | ProseSection
  | SplitProseSection
  | CardGridSection
  | AreaListSection
  | ServiceBlocksSection
  | ServiceIndexSection
  | ImagePatternSection
  | StepsSection
  | ListSection
  | CaseStudiesSection
  | QuoteSection
  | BandSection
  | FounderNoteSection
  | TeamSection
  | ImpactSection
  | LifecycleSection
  | ContactFormSection
  | ContactDetailsSection
  | CtaSection;

export type SectionType = SectionBody["type"];

export interface Section {
  id: string;
  ground: Ground;
  visible: boolean;
  /** Drafted from existing material and awaiting sign-off. Never shown as a
      marker on the public site; surfaced in the admin panel. */
  draft?: boolean;
  body: SectionBody;
}

/* --- Pages ---------------------------------------------------------------- */

export interface Seo {
  title: string;
  description: string;
  ogImage?: ImageRef;
  noindex?: boolean;
}

export interface Page {
  /** URL path without a leading slash. The home page is "". */
  slug: string;
  /** Shown in the admin listing and in breadcrumbs. */
  name: string;
  seo: Seo;
  /** Shows the pillar sub-navigation under the header. */
  showSubnav: boolean;
  accent: Accent;
  sections: Section[];
  updatedAt?: string;
  updatedBy?: string;
}

/* --- Site-wide settings --------------------------------------------------- */

export interface NavItem {
  id: string;
  label: string;
  href: string;
  children?: NavItem[];
}

export interface SiteSettings {
  organization: string;
  legalName: string;
  /** The call to action wording, used in every position. */
  ctaLabel: string;
  ctaHref: string;
  nav: NavItem[];
  subnav: NavItem[];
  footer: {
    line: string;
    columns: { id: string; title: string; links: NavItem[] }[];
    address: string[];
    email: string;
    phone: string;
    linkedin: string;
    copyright: string;
    closingLine: string;
  };
  contact: {
    /** Where form submissions are emailed. Stored in Firestore regardless. */
    notifyEmail: string;
  };
  seo: {
    titleTemplate: string;
    defaultDescription: string;
    siteUrl: string;
  };
}

/* --- Contact submissions -------------------------------------------------- */

export interface ContactSubmission {
  id: string;
  name: string;
  organization: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
  archived: boolean;
  /** Set when the notification email could not be sent. */
  mailError?: string;
  userAgent?: string;
}
