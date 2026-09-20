import type { Page } from "@/lib/types";

/* ============================================================================
   About, and Contact.

   Two sections on this page are marked draft: true.

   The founder's note is drafted from the founding story already in the About
   copy, which the handoff explicitly sanctions. The team impact section is
   drafted from the five published case studies: every figure in it names the
   engagement record it came from, and no aggregate impact statistic has been
   revived, those having been dropped from the company profile in September.

   Both are flagged in the admin panel as awaiting sign-off. Neither carries a
   marker on the public site.
   ========================================================================= */

export const aboutPage: Page = {
  slug: "about",
  name: "About",
  showSubnav: false,
  accent: "naples",
  seo: {
    title: "About",
    description:
      "Adaptis is an asset performance advisory firm, founded to close a gap in how building decisions are made.",
  },
  sections: [
    {
      id: "ab-hero",
      ground: "ink",
      visible: true,
      body: {
        type: "pageHero",
        eyebrow: "About Adaptis",
        title: "An asset performance advisory firm.",
        lede: "Adaptis was founded to close a gap in how building decisions are made.",
        accent: "naples",
        showModules: false,
        image: {
          src: "/images/about-firm.jpg",
          alt: "A curved glass office building against a pale sky.",
          credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
        },
      },
    },
    {
      id: "ab-why",
      ground: "ink",
      visible: true,
      body: {
        type: "prose",
        eyebrow: "Why Adaptis exists",
        title: "Why Adaptis exists.",
        paras: [
          "Physical, environmental and financial performance are assessed by different consultants, from different assumptions, on different timelines. Each report is defensible on its own. Nobody holds the reconciled position, so the owner ends up doing that reconciliation in a meeting, under time pressure, without the data to settle it.",
          "Adaptis was founded by a licensed architect with direct experience of that problem from the project side: over 15 years leading more than 30 complex building projects, the majority high-performance retrofits and adaptive reuse. That experience is the foundation of the advisory practice, and the firm exists to hold the position nobody else was holding.",
          "What we sell is one defensible position on the asset, established at the first decision and held current through to exit.",
        ],
      },
    },

    {
      id: "ab-founder-note",
      ground: "ink",
      visible: true,
      draft: true,
      body: {
        type: "founderNote",
        eyebrow: "A note from the founder",
        // Two patterns are barred in this voice because they read as
        // machine-written: a short declarative followed by a negating
        // fragment, and a run of three parallel fragments. Neither appears
        // here or in the columns below.
        title: "Every report was defensible on its own.",
        titleTail: "Together they disagreed, and the reconciling was left to the owner.",
        left: [
          "I spent fifteen years on the project side, leading more than thirty complex building projects, most of them high-performance retrofits and adaptive reuse. The problem I met again and again had very little to do with the quality of the work being produced.",
          "The condition report came from one firm and the energy model from another, and the cost plan came from a third, built on assumptions neither of the others had seen. Each document was careful, and each was defensible on its own terms. Read side by side they disagreed, and the disagreement was handed to the owner to settle in a meeting, under time pressure, without the data to settle it with.",
        ],
        right: [
          "Adaptis exists to hold the position nobody else was holding. We run condition, carbon, cost and compliance as one engagement, reconcile them into a single position on the asset, and state how accurate every figure is, so you know which numbers are ready for a board or a lender and which still need work.",
          "The record stays with the building rather than with us. When ownership changes, when management changes, or when we finish and move on, what is known about the asset stays known. That is the part of this I care most about, and it is the part the industry has been worst at.",
        ],
        name: "Sheida Shahi",
        role: "Founder and CEO",
      },
    },

    {
      id: "ab-endtoend",
      ground: "ink",
      visible: true,
      body: {
        type: "cardGrid",
        eyebrow: "End to end",
        title: "One engagement, end to end.",
        accentKeyline: true,
        cards: [
          {
            id: "e2e-registered",
            title: "Registered professionals",
            body: "Our team combines design, sustainability and building operations expertise and includes registered professionals. Reports within the registered architect scope, including CMHC documentation and embodied carbon assessment, are signed by us.",
            accent: "naples",
          },
          {
            id: "e2e-first",
            title: "From the first decision to exit",
            body: "We are engaged at concept design, at acquisition, or at the first capital question, and stay with the asset through construction, operation and exit. The record stays current between engagements, so the next question is answered from what is already held.",
            accent: "apricot",
          },
          {
            id: "e2e-one",
            title: "One reconciled position",
            body: "Whatever the engagement needs, you deal with one party. Condition, carbon, cost and compliance are assessed together and reconciled, the accuracy of every figure is stated, and sealed filing-ready deliverables are produced wherever a statute, a lender or a program requires one.",
            accent: "cassiopeia",
          },
        ],
      },
    },

    {
      id: "ab-purpose",
      ground: "ink",
      visible: true,
      body: {
        type: "band",
        // One sentence in the reference build, and kept as one here. The
        // supporting line carries the label that sits beneath it rather than
        // a second half of the sentence.
        title:
          "To give owners, developers, investors and asset managers, and the consultants who work with them, one defensible position on each building, whether in design, under construction or in operation: its performance, cost, carbon and risk, established at the first decision and held current through to exit.",
        support: "Our purpose",
        variant: "plain",
      },
    },

    {
      id: "ab-team",
      ground: "ink",
      visible: true,
      body: {
        type: "team",
        eyebrow: "Leadership",
        title: "Leadership.",
        titleTail: "Our team is based in Toronto.",
        intro:
          "Design, sustainability and building operations expertise in one practice, including registered professionals.",
        members: [
          {
            id: "tm-sheida",
            name: "Sheida Shahi",
            role: "Founder and CEO",
            credentials: ["OAA", "CPHD", "PhD", "Toronto"],
            bio: "A licensed architect with a PhD and over 15 years of experience leading more than 30 complex building projects, the majority high-performance retrofits and adaptive reuse. That direct project experience is the foundation of the firm's advisory practice.",
            photo: { src: "", alt: "" },
            accent: "naples",
            placeholder: false,
          },
          {
            id: "tm-sohani",
            name: "Sohani Withanage",
            role: "To be confirmed",
            credentials: [],
            bio: "Credentials, title and two lines of background to follow.",
            photo: { src: "", alt: "" },
            accent: "cassiopeia",
            placeholder: true,
          },
          {
            id: "tm-third",
            name: "",
            role: "To be confirmed",
            credentials: [],
            bio: "One further profile, built at full size and left visibly empty. Name, credentials, title and two lines.",
            photo: { src: "", alt: "" },
            accent: "apricot",
            placeholder: true,
          },
        ],
      },
    },

    {
      id: "ab-impact",
      ground: "ink",
      visible: true,
      draft: true,
      body: {
        type: "impact",
        eyebrow: "Our team's impact",
        title: "What the team has done before.",
        lede: "Every figure below names the engagement record it came from, and each is published on this site alongside the work that produced it.",
        paras: [
          "Between them the team has taken a 17-property portfolio into a single record and sequenced its capital plan to equipment end of life, established a whole life cycle carbon baseline for a 44-building master plan early enough to shape the scheme, weighed operational carbon against embodied carbon on a campus expansion before design lock-in, quantified the carbon case for converting a mid-century tower rather than demolishing it, and assessed end of life pathways across a public portfolio so that salvage and reuse could be chosen on cost and carbon data.",
          "That span, from new construction through deep retrofit, conversion and portfolio operation to end of life, is the same span the advisory practice covers today.",
        ],
        stats: [
          {
            id: "im-npv",
            value: "$11.8M",
            label: "Added NPV on a 17-property portfolio capital plan",
            source: "Forum Asset Management engagement",
          },
          {
            id: "im-baseline",
            value: "659,900",
            label: "tCO₂e whole life cycle baseline across a 44-building master plan",
            source: "Northcrest Developments and Hines engagement",
          },
          {
            id: "im-conversion",
            value: "68%",
            label: "Embodied carbon reduction from conversion against demolition and new construction",
            source: "Metafor and Peoplefirst Developments engagement",
          },
          {
            id: "im-projects",
            value: "30+",
            label: "Complex building projects led, the majority retrofits and adaptive reuse",
            source: "Founder's project record, as stated on this page",
          },
        ],
        clients: [
          { id: "cl-forum", name: "Forum Asset Management" },
          { id: "cl-metafor", name: "Metafor" },
          { id: "cl-triovest", name: "Triovest" },
          { id: "cl-northcrest", name: "Northcrest Developments" },
          { id: "cl-hines", name: "Hines" },
          { id: "cl-peoplefirst", name: "Peoplefirst Developments" },
          { id: "cl-king", name: "King County" },
        ],
        clientsNote: "We name our clients and not their buildings.",
      },
    },

    {
      id: "ab-quote",
      ground: "ink",
      visible: true,
      body: {
        type: "quote",
        text: "Adaptis makes it easier for us and our clients to do better on every metric — human, financial, and environmental. By combining carbon, cost, and constructability analysis under one roof and allowing continuous iteration, Adaptis saves us money on every project.",
        attribution: "David Leonard, Managing Principal, Metafor",
        accent: "naples",
      },
    },

    {
      id: "ab-stories",
      ground: "card",
      visible: true,
      body: {
        type: "cta",
        title: "See the work behind the position.",
        body: "Five engagements across portfolio decarbonization, campus scale, whole life cycle assessment and end of life.",
        cta: { label: "Read customer stories", href: "/customer-stories" },
        style: "ink",
      },
    },

    {
      id: "ab-close",
      ground: "card",
      visible: true,
      body: {
        type: "band",
        variant: "naples",
        title: "Start with the decision you are facing.",
        support: "Tell us what has to be established and we will tell you what it would take to answer it."
      },
    },
    {
      id: "ab-close-go",
      ground: "card",
      visible: true,
      body: {
        type: "cta",
        title: "",
        body: "",
        cta: { label: "Get in touch", href: "/contact" },
        style: "ink",
      },
    },
  ],
};

/* --- Contact -------------------------------------------------------------- */

export const contactPage: Page = {
  slug: "contact",
  name: "Contact",
  showSubnav: false,
  accent: "naples",
  seo: {
    title: "Contact",
    description:
      "Tell us the decision you are facing and we will tell you what it would take to answer it.",
  },
  sections: [
    {
      id: "ct-hero",
      ground: "ink",
      visible: true,
      body: {
        type: "pageHero",
        eyebrow: "Contact",
        title: "Contact us to discuss an asset, a portfolio or a project in design.",
        lede: "Tell us the decision you are facing and we will tell you what it would take to answer it.",
        accent: "naples",
        showModules: false,
        image: {
          src: "/images/hero-contact.jpg",
          alt: "A contemporary office block with a pale panelled facade.",
          credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
        },
      },
    },
    {
      id: "ct-entry",
      ground: "ink",
      visible: true,
      body: {
        type: "cardGrid",
        title: "Three places to start.",
        intro: "Pick whichever is closest. It sets the first field on the form and nothing else.",
        accentKeyline: true,
        cards: [
          {
            id: "en-asset",
            title: "An asset",
            body: "A single building: its condition, its performance, a capital question, a compliance deadline.",
            href: "#form",
            accent: "naples",
          },
          {
            id: "en-portfolio",
            title: "A portfolio",
            body: "Several assets: where capital should go, which assets are exposed, how the portfolio reports.",
            href: "#form",
            accent: "cassiopeia",
          },
          {
            id: "en-project",
            title: "A project in design",
            body: "New construction or a deep retrofit, while the decisions that set cost and carbon are still open.",
            href: "#form",
            accent: "apricot",
          },
        ],
      },
    },
    {
      id: "ct-form",
      ground: "card",
      visible: true,
      body: {
        type: "contactForm",
        title: "Send us a note.",
        intro: "We reply to every enquiry. Five fields, and nothing you have to look up.",
        submitLabel: "Get in touch",
        successMessage:
          "Thank you. Your note has reached us and we will reply shortly.",
        labels: {
          name: "Name",
          organization: "Organization",
          email: "Email",
          subject: "What you are working on: an asset, a portfolio, or a project in design",
          message: "Anything you want us to know before we reply",
        },
        subjectOptions: [
          { id: "asset", label: "An asset" },
          { id: "portfolio", label: "A portfolio" },
          { id: "project", label: "A project in design" },
        ],
        privacyNote:
          "We use what you send only to reply to you. It is not added to a mailing list and is not shared.",
      },
    },
    {
      id: "ct-details",
      ground: "card",
      visible: true,
      body: {
        type: "contactDetails",
        title: "Adaptis Systems Inc.",
        lines: [
          "Toronto, headquarters.",
          "10 Dundas Street East, Suite 600, Toronto, ON, Canada M5B 2G9.",
        ],
        email: "sheida@adaptis.ca",
        phone: "+1 647 867 6260",
        website: "www.adaptis.ca",
        linkedin: "linkedin.com/company/adaptis-ai",
      },
    },
  ],
};
