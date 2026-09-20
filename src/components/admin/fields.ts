import type { SectionType } from "@/lib/types";

/* ============================================================================
   Field schema.

   One descriptor list per section type. The editor renders from these, so
   every string the public site can show has an input here, and adding a field
   to the content schema means adding one line rather than writing a form.
   ========================================================================= */

export type FieldDef =
  | { k: string; label: string; type: "text"; hint?: string; max?: number }
  | { k: string; label: string; type: "textarea"; hint?: string; max?: number }
  | { k: string; label: string; type: "number"; hint?: string }
  | { k: string; label: string; type: "bool"; hint?: string }
  | { k: string; label: string; type: "select"; options: { v: string; l: string }[]; hint?: string }
  | { k: string; label: string; type: "strings"; hint?: string; itemLabel?: string }
  | { k: string; label: string; type: "image"; hint?: string }
  | { k: string; label: string; type: "cta"; hint?: string }
  | {
      k: string;
      label: string;
      type: "list";
      itemLabel: string;
      titleKey: string;
      fields: FieldDef[];
      newItem: () => Record<string, unknown>;
      hint?: string;
    };

const ACCENTS = [
  { v: "naples", l: "Naples — building record" },
  { v: "cassiopeia", l: "Cassiopeia — assessments" },
  { v: "apricot", l: "Apricot — design and capital" },
  { v: "naples-light", l: "Naples light — managed services" },
  { v: "billabong", l: "Billabong — reporting" },
  { v: "none", l: "No accent" },
];

const rid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const imageField = (k: string, label: string): FieldDef => ({
  k,
  label,
  type: "image",
  hint: "Leave the address empty to draw the module grammar instead. Alt text is required whenever there is an image.",
});

const accentField: FieldDef = { k: "accent", label: "Accent", type: "select", options: ACCENTS };

const statFields: FieldDef[] = [
  { k: "value", label: "Figure", type: "text", hint: "As it should read, e.g. $11.8M or 74%." },
  { k: "label", label: "What it measures", type: "textarea" },
  {
    k: "source",
    label: "Source",
    type: "text",
    hint: "Required. No figure is published without the record it came from.",
  },
];

export const SECTION_FIELDS: Record<SectionType, FieldDef[]> = {
  homeHero: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    {
      k: "title",
      label: "Heading (the page's only h1)",
      type: "textarea",
      hint: "Fixed across slides. One h1 per page is a hard rule.",
    },
    { k: "lede", label: "Lede", type: "textarea" },
    { k: "primaryCta", label: "Primary call to action", type: "cta" },
    {
      k: "primaryStyle",
      label: "Primary button treatment",
      type: "select",
      options: [
        { v: "primary", l: "Naples — the hero is the page's single yellow" },
        { v: "oncard", l: "Card — the yellow is spent on a band instead" },
      ],
    },
    { k: "secondaryCta", label: "Secondary call to action", type: "cta" },
    {
      k: "autoplayMs",
      label: "Seconds between slides (milliseconds)",
      type: "number",
      hint: "0 turns autoplay off. Autoplay always stops under reduced-motion.",
    },
    {
      k: "slides",
      label: "Slides",
      type: "list",
      itemLabel: "Slide",
      titleKey: "eyebrow",
      newItem: () => ({
        id: rid("slide"),
        eyebrow: "",
        asideTitle: "",
        asideBody: "",
        image: { src: "", alt: "", credit: "" },
        accent: "naples",
        href: "",
      }),
      fields: [
        { k: "eyebrow", label: "Service line", type: "text" },
        { k: "asideTitle", label: "Panel heading", type: "text" },
        { k: "asideBody", label: "Panel text", type: "textarea" },
        imageField("image", "Photograph"),
        accentField,
        { k: "href", label: "Links to", type: "text" },
      ],
    },
  ],

  pageHero: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading (h1)", type: "textarea" },
    { k: "lede", label: "Lede", type: "textarea" },
    accentField,
    { k: "showModules", label: "Draw the module grammar", type: "bool" },
    imageField("image", "Photograph (replaces the modules)"),
  ],

  prose: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading", type: "textarea" },
    { k: "duotoneTail", label: "Heading continuation, shown at secondary", type: "textarea" },
    { k: "paras", label: "Paragraphs", type: "strings", itemLabel: "Paragraph" },
  ],

  splitProse: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading", type: "textarea" },
    { k: "paras", label: "Paragraphs", type: "strings", itemLabel: "Paragraph" },
    { k: "asideTitle", label: "Aside heading", type: "text" },
    { k: "asideParas", label: "Aside paragraphs", type: "strings", itemLabel: "Paragraph" },
  ],

  cardGrid: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading", type: "textarea" },
    { k: "intro", label: "Introduction", type: "textarea" },
    { k: "accentKeyline", label: "Draw the accent keyline on each tile", type: "bool" },
    {
      k: "cards",
      label: "Tiles",
      type: "list",
      itemLabel: "Tile",
      titleKey: "title",
      newItem: () => ({ id: rid("card"), title: "", body: "", tag: "", href: "", accent: "none" }),
      fields: [
        { k: "title", label: "Title", type: "text" },
        { k: "body", label: "Body", type: "textarea" },
        { k: "tag", label: "Tag", type: "text" },
        { k: "href", label: "Links to", type: "text" },
        accentField,
        imageField("image", "Figure (turns the tile into a story card)"),
      ],
    },
  ],

  areaList: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading", type: "textarea" },
    { k: "intro", label: "Introduction paragraphs", type: "strings", itemLabel: "Paragraph" },
    {
      k: "areas",
      label: "Areas",
      type: "list",
      itemLabel: "Area",
      titleKey: "name",
      newItem: () => ({ id: rid("area"), name: "", lead: "", body: "", tag: "", href: "", accent: "naples" }),
      fields: [
        { k: "name", label: "Name", type: "text" },
        { k: "lead", label: "Lead line", type: "textarea" },
        { k: "body", label: "Body", type: "textarea" },
        { k: "tag", label: "Services tag", type: "text" },
        { k: "href", label: "Links to", type: "text" },
        accentField,
      ],
    },
  ],

  serviceBlocks: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading", type: "textarea" },
    accentField,
    {
      k: "services",
      label: "Services",
      type: "list",
      itemLabel: "Service",
      titleKey: "name",
      newItem: () => ({ id: rid("svc"), name: "", lead: "", application: [], outcome: [] }),
      fields: [
        { k: "name", label: "Name", type: "text" },
        { k: "lead", label: "Lead line", type: "textarea" },
        { k: "application", label: "Application", type: "strings", itemLabel: "Item" },
        { k: "outcome", label: "Outcome", type: "strings", itemLabel: "Item" },
      ],
    },
  ],

  steps: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading", type: "textarea" },
    accentField,
    {
      k: "steps",
      label: "Principles",
      type: "list",
      itemLabel: "Principle",
      titleKey: "title",
      newItem: () => ({ id: rid("step"), title: "", body: "" }),
      fields: [
        { k: "title", label: "Title", type: "text" },
        { k: "body", label: "Body", type: "textarea" },
      ],
    },
  ],

  list: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading", type: "textarea" },
    { k: "intro", label: "Introduction", type: "textarea" },
    accentField,
    {
      k: "groups",
      label: "Groups",
      type: "list",
      itemLabel: "Group",
      titleKey: "title",
      newItem: () => ({ id: rid("grp"), title: "", items: [] }),
      fields: [
        { k: "title", label: "Group heading (optional)", type: "text" },
        { k: "items", label: "Items", type: "strings", itemLabel: "Item" },
      ],
    },
  ],

  caseStudies: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading", type: "textarea" },
    { k: "intro", label: "Introduction", type: "textarea" },
    accentField,
    { k: "showGapSlot", label: "Show the empty case study slot", type: "bool" },
    { k: "gapSlotNote", label: "Text in the empty slot", type: "textarea" },
    {
      k: "cases",
      label: "Case studies",
      type: "list",
      itemLabel: "Case study",
      titleKey: "client",
      newItem: () => ({
        id: rid("case"),
        client: "",
        lead: "",
        challenge: "",
        approach: "",
        results: "",
        stats: [],
        tags: [],
        image: { src: "", alt: "" },
      }),
      fields: [
        { k: "client", label: "Client", type: "text", hint: "Clients are named. Their buildings are not." },
        { k: "lead", label: "Lead line", type: "textarea" },
        { k: "challenge", label: "Challenge", type: "textarea" },
        { k: "approach", label: "Approach", type: "textarea" },
        { k: "results", label: "Results", type: "textarea" },
        {
          k: "stats",
          label: "Result figures",
          type: "list",
          itemLabel: "Figure",
          titleKey: "value",
          newItem: () => ({ id: rid("stat"), value: "", label: "", source: "" }),
          fields: statFields,
        },
        { k: "tags", label: "Service tags", type: "strings", itemLabel: "Tag" },
        imageField("image", "Figure"),
      ],
    },
  ],

  serviceIndex: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading", type: "text" },
    { k: "intro", label: "Introduction", type: "textarea" },
    {
      k: "items",
      label: "Services",
      type: "list",
      itemLabel: "Service",
      titleKey: "title",
      newItem: () => ({ id: rid("si"), title: "", lead: "", href: "", accent: "naples" }),
      fields: [
        { k: "title", label: "Name", type: "text" },
        { k: "lead", label: "One line", type: "textarea" },
        { k: "href", label: "Links to", type: "text" },
        accentField,
      ],
    },
  ],

  imagePattern: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading", type: "textarea" },
    { k: "paras", label: "Paragraphs", type: "strings", itemLabel: "Paragraph" },
    imageField("imageA", "Upper figure"),
    imageField("imageB", "Lower figure, offset"),
    accentField,
    {
      k: "items",
      label: "List",
      type: "list",
      itemLabel: "Item",
      titleKey: "text",
      newItem: () => ({ id: rid("ip"), text: "" }),
      fields: [{ k: "text", label: "Text", type: "textarea" }],
    },
    { k: "link", label: "Link", type: "cta" },
  ],

  quote: [
    { k: "text", label: "Quotation", type: "textarea" },
    { k: "attribution", label: "Attribution", type: "text" },
    accentField,
  ],

  band: [
    { k: "title", label: "Claim line", type: "textarea" },
    { k: "support", label: "Supporting line", type: "textarea" },
    {
      k: "variant",
      label: "Treatment",
      type: "select",
      options: [
        { v: "plain", l: "Plain — takes the section ground" },
        { v: "naples", l: "Naples — spends the page's single yellow here" },
      ],
      hint: "A Naples band is a yellow at real area. A page using one must not also use a Naples button.",
    },
    { k: "cta", label: "Button inside the band", type: "cta" },
  ],

  founderNote: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Lead sentence", type: "textarea" },
    { k: "titleTail", label: "Continuation, shown at secondary", type: "textarea" },
    { k: "left", label: "Left column", type: "strings", itemLabel: "Paragraph" },
    { k: "right", label: "Right column", type: "strings", itemLabel: "Paragraph" },
    { k: "name", label: "Name", type: "text" },
    { k: "role", label: "Role", type: "text" },
    imageField("signature", "Signature"),
  ],

  team: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading", type: "text" },
    { k: "titleTail", label: "Heading continuation, at secondary", type: "text" },
    { k: "intro", label: "Introduction", type: "textarea" },
    {
      k: "members",
      label: "Profiles",
      type: "list",
      itemLabel: "Profile",
      titleKey: "name",
      newItem: () => ({
        id: rid("tm"),
        name: "",
        role: "",
        credentials: [],
        bio: "",
        photo: { src: "", alt: "" },
        accent: "naples",
        placeholder: true,
      }),
      fields: [
        { k: "name", label: "Name", type: "text" },
        { k: "role", label: "Role", type: "text" },
        { k: "credentials", label: "Credentials", type: "strings", itemLabel: "Credential" },
        { k: "bio", label: "Background", type: "textarea" },
        imageField("photo", "Photograph"),
        accentField,
        {
          k: "placeholder",
          label: "Still a placeholder",
          type: "bool",
          hint: "Draws the profile dashed at full size and flags it before launch.",
        },
      ],
    },
  ],

  impact: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading", type: "text" },
    { k: "lede", label: "Lede", type: "textarea" },
    { k: "paras", label: "Paragraphs", type: "strings", itemLabel: "Paragraph" },
    {
      k: "stats",
      label: "Figures",
      type: "list",
      itemLabel: "Figure",
      titleKey: "value",
      hint: "Aggregate impact statistics were dropped from the company profile. Every figure here needs the engagement record it came from.",
      newItem: () => ({ id: rid("stat"), value: "", label: "", source: "" }),
      fields: statFields,
    },
    {
      k: "clients",
      label: "Clients",
      type: "list",
      itemLabel: "Client",
      titleKey: "name",
      newItem: () => ({ id: rid("cl"), name: "" }),
      fields: [{ k: "name", label: "Name", type: "text" }],
    },
    { k: "clientsNote", label: "Note above the client list", type: "text" },
  ],

  lifecycle: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading", type: "textarea" },
    {
      k: "items",
      label: "Stages",
      type: "list",
      itemLabel: "Stage",
      titleKey: "title",
      newItem: () => ({ id: rid("lc"), title: "", body: "" }),
      fields: [
        { k: "title", label: "Title", type: "text" },
        { k: "body", label: "Body", type: "textarea" },
      ],
    },
  ],

  contactForm: [
    { k: "eyebrow", label: "Eyebrow", type: "text" },
    { k: "title", label: "Heading", type: "text" },
    { k: "intro", label: "Introduction", type: "textarea" },
    { k: "submitLabel", label: "Submit button", type: "text" },
    { k: "successMessage", label: "Message shown after sending", type: "textarea" },
    { k: "privacyNote", label: "Privacy note", type: "textarea" },
    {
      k: "subjectOptions",
      label: "Subject choices",
      type: "list",
      itemLabel: "Choice",
      titleKey: "label",
      newItem: () => ({ id: rid("opt"), label: "" }),
      fields: [{ k: "label", label: "Label", type: "text" }],
    },
  ],

  contactDetails: [
    { k: "title", label: "Heading", type: "text" },
    { k: "lines", label: "Address lines", type: "strings", itemLabel: "Line" },
    { k: "email", label: "Email", type: "text" },
    { k: "phone", label: "Telephone", type: "text" },
    { k: "website", label: "Website", type: "text" },
    { k: "linkedin", label: "LinkedIn", type: "text" },
  ],

  cta: [
    { k: "title", label: "Heading", type: "textarea" },
    { k: "body", label: "Body", type: "textarea" },
    { k: "cta", label: "Button", type: "cta" },
    {
      k: "style",
      label: "Button treatment",
      type: "select",
      options: [
        { v: "primary", l: "Naples — this is the page's single yellow" },
        { v: "ink", l: "Ink — for a light ground where the yellow is spent" },
        { v: "oncard", l: "Card — for a dark ground where the yellow is spent" },
      ],
    },
  ],
};

/* --- Labels for the section picker ----------------------------------------- */

export const SECTION_LABELS: Record<SectionType, string> = {
  homeHero: "Home hero, with carousel",
  pageHero: "Page hero",
  prose: "Prose",
  splitProse: "Prose, split with an aside",
  cardGrid: "Card grid",
  areaList: "Area blocks",
  serviceBlocks: "Service blocks, application and outcome",
  serviceIndex: "Service index panel",
  imagePattern: "Image pattern, offset figures and a list",
  steps: "Numbered principles",
  list: "What we provide",
  caseStudies: "Case studies",
  quote: "Pull quote",
  band: "Statement band",
  founderNote: "Founder's note",
  team: "Team",
  impact: "Team impact",
  lifecycle: "Lifecycle stages",
  contactForm: "Contact form",
  contactDetails: "Contact details",
  cta: "Closing call to action",
};

export const GROUND_OPTIONS = [
  { v: "ink", l: "Ink — the site's dark ground", swatch: "#33332C" },
  { v: "card", l: "Card — the light ground", swatch: "#FFFDF9" },
  { v: "page", l: "Page — the light inset", swatch: "#FCFBFA" },
  { v: "halite", l: "Halite — footer only", swatch: "#09324A" },
];
