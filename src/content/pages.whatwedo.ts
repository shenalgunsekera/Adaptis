import type { Page } from "@/lib/types";

/* ============================================================================
   What we do, and the five pillar pages beneath it.

   Depth is calibrated against Longevity Partners and is not to be expanded:
   one What we do page and five pillar pages. The ten services are sections
   within those five pages, never pages of their own.

   These five are cool-voice pages in the brand system. On a dark ground the
   cool devices that survive are the accent keyline and the Cassiopeia and
   Billabong module colourways; Billabong is barred as type on Ink (2.20:1),
   so nothing here sets Billabong as text.
   ========================================================================= */

export const whatWeDoPage: Page = {
  slug: "what-we-do",
  name: "What we do",
  showSubnav: true,
  accent: "naples",
  seo: {
    title: "What we do",
    description:
      "Five areas of work run as one engagement, drawing on one record of your asset and reconciled into a single position you can act on.",
  },
  sections: [
    {
      id: "wwd-hero",
      ground: "ink",
      visible: true,
      body: {
        type: "pageHero",
        eyebrow: "What we do",
        title: "Five areas of work, run as one engagement.",
        lede: "Most buildings are assessed piece by piece, by different firms, on different timelines. We run the five areas below as one engagement drawing on one record of your asset, and reconcile them into a single position you can act on.",
        accent: "naples",
        showModules: false,
        image: {
          src: "/images/hero-what-we-do.jpg",
          alt: "A warm stone and concrete office building seen from below.",
          credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
        },
      },
    },
    {
      id: "wwd-record",
      ground: "ink",
      visible: true,
      body: {
        type: "prose",
        eyebrow: "One record",
        title: "One record, several deliverables.",
        paras: [
          "Every building already has a documentation trail: drawings, service records, utility bills and previous studies. What rarely survives is a single version of it that outlasts the consultant who produced it, so the same assessment gets commissioned twice and the line between measured values and assumptions disappears.",
          "We collect what is missing, parse what already exists, and hold it as one structured record of your building. Every figure carries its source, its version and its date. Work can start from partial data, and the record improves as more arrives rather than being rebuilt.",
          "Because all five areas draw on that record, one site visit supports several deliverables, a re-issued report reflects current data, and the outputs stay consistent with one another.",
        ],
      },
    },
    {
      id: "wwd-areas",
      ground: "ink",
      visible: true,
      body: {
        type: "areaList",
        areas: [
          {
            id: "a-record",
            name: "Building record",
            lead: "One record of all building data, kept continuously up to date.",
            body: "We collect on site and remotely, ingest what you already hold, and process it into one structured record: systems inventory, condition, remaining service life of equipment, and utility data mapped and monitored. We then benchmark your asset against comparable buildings and against the standards or targets that apply to it, at asset and at portfolio level. You can begin with a full collection exercise or feed in partial data, and we always state the completeness of the record and what that means for the accuracy of anything built on it.",
            tag: "Benchmarking",
            href: "/what-we-do/building-record",
            accent: "naples",
          },
          {
            id: "a-assess",
            name: "Assessments and audits",
            lead: "The assessments and reports an end-to-end decision requires.",
            body: "Condition assessments for due diligence and capital allocation, including BCAs, FCAs, reserve fund studies and depreciation reports. Compliance exposure review, setting out which requirements apply to the asset, on what timeline, and what falling short of them costs. Energy and emissions audits at ASHRAE Level 1 and Level 2, scoped to the decision the resulting number has to carry. Run as one engagement, the four dimensions are reconciled into a single position, and every figure carries a stated accuracy band.",
            tag: "Performance Audit · Condition Assessment",
            href: "/what-we-do/assessments",
            accent: "cassiopeia",
          },
          {
            id: "a-capital",
            name: "Design and capital planning",
            lead: "High performance design and long-term capital planning for new construction, deep retrofits and buildings in operation.",
            body: "At concept and schematic stage we compare structural, envelope and mechanical options while they still determine your building's cost, carbon and compliance standing. On a retrofit we define what is kept, replaced or upgraded, tested against cost, carbon and code before the scope is fixed. In operation we build capital plans over 5 to 30 year horizons, sequenced around budget ceilings, hold period, equipment end of life and compliance dates. Whole building life cycle assessment underpins all three, so a reduction in operational carbon is not paid for by an increase in embodied carbon.",
            tag: "Design Optimization · Capital Planning",
            href: "/what-we-do/capital",
            accent: "apricot",
          },
          {
            id: "a-managed",
            name: "Managed services",
            lead: "Retained professional advisory, shaped to each asset and the decision at hand.",
            body: "We act as your sustainability function where you do not have one. Across the hold we handle annual data refresh and plan updates, budget cycle support and re-forecasting, climate transition and physical risk screening, portfolio strategy, and incentive and financing programs from identification through to funds received. We also coordinate the engineers, cost consultants, architects and property managers working on the same asset, and where two sources disagree on a component we record the disagreement and resolve it with a stated reason.",
            tag: "Climate Transition and Risk · Sustainability Advisory · Portfolio Strategy · Stakeholder Alignment",
            href: "/what-we-do/managed-services",
            accent: "naples-light",
          },
          {
            id: "a-reporting",
            name: "Reporting and disclosure",
            lead: "Accurate, compliant and transparent reporting, available on demand.",
            body: "One document record per asset covering reports, drawings, contracts, permits, warranties and correspondence, organized and searchable, with version control and an audit trail on every figure. From that single dataset we produce what each audience asks for: investment committee memos, board and owner packages, lender submissions, investor reporting, sustainability benchmarking submissions and statutory energy and water reporting. When an auditor or lender asks where a number came from, the answer is already in the record.",
            tag: "Reporting and Disclosures",
            href: "/what-we-do/reporting",
            accent: "billabong",
          },
        ],
      },
    },
    {
      id: "wwd-index",
      ground: "card",
      visible: true,
      body: {
        type: "serviceIndex",
        eyebrow: "The services",
        title: "Ten services across the five areas.",
        intro:
          "Each sits inside one of the five areas above and is described in full on that page. The five areas are the architecture; these are the named pieces of work within them.",
        items: [
          {
            id: "si-benchmarking",
            title: "Benchmarking",
            lead: "Where the record becomes a position you can act on.",
            href: "/what-we-do/building-record",
            accent: "naples",
          },
          {
            id: "si-perf-audit",
            title: "Performance Audit",
            lead: "Measures identified, costed and ranked, at the level the decision needs.",
            href: "/what-we-do/assessments",
            accent: "cassiopeia",
          },
          {
            id: "si-condition",
            title: "Condition Assessment",
            lead: "A defensible position on condition, deferred maintenance and remaining service life.",
            href: "/what-we-do/assessments",
            accent: "cassiopeia",
          },
          {
            id: "si-design-opt",
            title: "Design Optimization",
            lead: "Options compared while the design can still absorb the change.",
            href: "/what-we-do/capital",
            accent: "apricot",
          },
          {
            id: "si-capital-planning",
            title: "Capital Planning",
            lead: "A plan that carries through the budget cycle rather than being rebuilt each year.",
            href: "/what-we-do/capital",
            accent: "apricot",
          },
          {
            id: "si-climate",
            title: "Climate Transition and Risk Advisory",
            lead: "Exposure priced, then funded through the capital plan.",
            href: "/what-we-do/managed-services",
            accent: "naples-light",
          },
          {
            id: "si-sustainability",
            title: "Sustainability Advisory",
            lead: "Targets tested through the capital plan before they are published.",
            href: "/what-we-do/managed-services",
            accent: "naples-light",
          },
          {
            id: "si-portfolio",
            title: "Portfolio Strategy and Optimization",
            lead: "Capital allocated across assets on one defensible basis.",
            href: "/what-we-do/managed-services",
            accent: "naples-light",
          },
          {
            id: "si-stakeholder",
            title: "Stakeholder Alignment",
            lead: "One point of contact, and one consolidated position.",
            href: "/what-we-do/managed-services",
            accent: "naples-light",
          },
          {
            id: "si-reporting",
            title: "Reporting and Disclosures",
            lead: "Filed on time, in the required format, from figures that trace to source.",
            href: "/what-we-do/reporting",
            accent: "billabong",
          },
        ],
      },
    },
    {
      id: "wwd-how",
      ground: "ink",
      visible: true,
      body: {
        type: "steps",
        eyebrow: "How we work",
        title: "How we work.",
        accent: "naples",
        steps: [
          {
            id: "s1",
            title: "We start at the first decision.",
            body: "For new construction that is concept design, where structure, envelope and systems set cost and carbon for the life of the building. For a retrofit it is the definition of scope. For a building in operation it is the acquisition or the first capital question. In each case options are compared before they are committed.",
          },
          {
            id: "s2",
            title: "We build on what you already have.",
            body: "Design models, drawings, service records, utility data and previous studies are assembled into one record, and the gaps are filled through targeted collection rather than by starting again.",
          },
          {
            id: "s3",
            title: "We tell you how reliable each figure is.",
            body: "Measured values and estimates are identified separately, with the accuracy of each stated, so you know which numbers are ready for a board, council or lender and which need further work.",
          },
          {
            id: "s4",
            title: "We assess cost and carbon over the life of the building.",
            body: "Operational and embodied carbon and life cycle cost are weighed together rather than at the point of decision, so a gain in one is not quietly funded by a loss in another.",
          },
          {
            id: "s5",
            title: "We fund mandatory work first, then sequence the rest.",
            body: "Life safety and code compliance work sets the funding floor. The remaining work is ranked by cost, return and timing, including equipment end of life, compliance dates and lease expiry, so the plan carries through successive budget cycles instead of being rebuilt each year.",
          },
        ],
      },
    },
    {
      id: "wwd-endtoend",
      ground: "card",
      visible: true,
      body: {
        type: "prose",
        eyebrow: "End to end",
        title: "One engagement, from design through to certification.",
        paras: [
          "Our team combines design, sustainability and building operations expertise and includes registered professionals. Adaptis was founded by a licensed architect, and reports within that scope, including CMHC documentation and embodied carbon assessment, are signed by us.",
          "Certification is managed from assessment and modelling through documentation and submission. Sealed, filing-ready deliverables are produced wherever a statute, a lender or a program requires one. Whatever the engagement needs, you deal with one party and receive one reconciled position.",
        ],
      },
    },
    {
      id: "wwd-close",
      ground: "card",
      visible: true,
      body: {
        type: "band",
        variant: "naples",
        title: "Start with the decision you are facing.",
        support: "Tell us what has to be established, and we will tell you which of these areas it needs and what that would take."
      },
    },
    {
      id: "wwd-close-go",
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

/* --- Building record ------------------------------------------------------ */

export const buildingRecordPage: Page = {
  slug: "what-we-do/building-record",
  name: "Building record",
  showSubnav: true,
  accent: "naples",
  seo: {
    title: "Building record",
    description:
      "One record of all building data, kept continuously up to date, with every figure carrying its source, its version and its date.",
  },
  sections: [
    {
      id: "br-hero",
      ground: "ink",
      visible: true,
      body: {
        type: "pageHero",
        eyebrow: "What we do",
        title: "One record of all building data, kept continuously up to date.",
        lede: "Before anything can be assessed, defended or reported, someone has to know what is actually in the building and where each number came from.",
        accent: "naples",
        showModules: false,
        image: {
          src: "/images/hero-building-record.jpg",
          alt: "A modern commercial office building seen from below against a clear sky.",
          credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
        },
      },
    },
    {
      id: "br-problem",
      ground: "ink",
      visible: true,
      body: {
        type: "prose",
        title: "Locating, trusting and reusing what you already have.",
        paras: [
          "Building data is gathered periodically and held across several sources: a consultant's drive, a former property manager's email, a study commissioned four years ago. By the time a decision needs it, nobody can say which version is current, or which figures were measured and which were assumed. So the same assessment gets commissioned twice, and decisions get made without every dimension in view.",
          "We collect what is missing, parse what already exists, and hold it as one structured record. Every data point carries its source, its version and its date, so any number in a later report can be traced and defended. You can start from a full collection exercise or feed in partial data, and we state the completeness of the record and what that means for the accuracy of anything built on it. The record improves as more data arrives rather than being rebuilt.",
        ],
      },
    },
    {
      id: "br-provide",
      ground: "ink",
      visible: true,
      body: {
        type: "list",
        title: "What we provide.",
        accent: "naples",
        groups: [
          {
            id: "g1",
            items: [
              "On-site and remote data collection for systems inventory, condition and remaining service life of equipment",
              "Data ingestion, aggregation and processing into a single cohesive structured record",
              "Utility data intake, mapping and monitoring",
              "Performance benchmarking against comparable buildings and against the standards or targets that apply",
              "Portfolio-wide benchmarking and assessment, so assets are compared on a consistent basis",
              "A record that transfers with the asset at sale or at a change of management",
              "Sealed, filing-ready deliverables wherever a statute, lender or program requires one",
            ],
          },
        ],
      },
    },
    {
      id: "br-services",
      ground: "ink",
      visible: true,
      body: {
        type: "serviceBlocks",
        accent: "naples",
        services: [
          {
            id: "svc-benchmarking",
            name: "Benchmarking",
            lead: "Where the record becomes a position you can act on.",
            application: [
              "Establishing a baseline before an audit, retrofit or capital plan",
              "Ranking a portfolio to decide where assessment budget is best spent",
              "Screening assets at acquisition, before site work is committed",
              "Annual performance reporting to investors, lenders and boards",
              "ENERGY STAR applications, prepared and certified",
              "Ontario EWRB under O. Reg. 506/18 for buildings of 50,000 sq ft and over, and City of Toronto reporting under Municipal Code Chapter 367, which extends to buildings from 10,000 sq ft in 2027",
            ],
            outcome: [
              "Provincial and municipal reporting obligations met on time",
              "A ranked view of where energy and water cost sits across your portfolio",
              "A defensible baseline that later savings can be measured against",
              "Early sight of which assets are exposed to carbon limits and performance standards",
              "A shortlist of where deeper assessment is worth commissioning",
              "Results read alongside condition and capital data for the same asset, so a weak score can be traced to a system",
            ],
          },
        ],
      },
    },
    {
      id: "br-close",
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
      id: "br-close-go",
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

/* --- Assessments and audits ----------------------------------------------- */

export const assessmentsPage: Page = {
  slug: "what-we-do/assessments",
  name: "Assessments and audits",
  showSubnav: true,
  accent: "cassiopeia",
  seo: {
    title: "Assessments and audits",
    description:
      "Condition, energy and emissions, cost and funding adequacy, and compliance, assessed together and reconciled into one position on the asset.",
  },
  sections: [
    {
      id: "as-hero",
      ground: "ink",
      visible: true,
      body: {
        type: "pageHero",
        eyebrow: "What we do",
        title: "The assessments and reports an end-to-end decision requires.",
        lede: "Condition, energy and emissions, cost and funding adequacy, and compliance, assessed together and reconciled into one position on the asset.",
        accent: "cassiopeia",
        showModules: false,
        image: {
          src: "/images/hero-assessments.jpg",
          alt: "The curved glass curtain wall of an office tower, seen close.",
          credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
        },
      },
    },
    {
      id: "as-problem",
      ground: "ink",
      visible: true,
      body: {
        type: "prose",
        title: "Four assessments that have to agree with each other.",
        paras: [
          "An acquisition, a refinancing or a capital request cannot proceed until condition and capital exposure are established, and statutory obligations arrive on their own schedule regardless. Between those points the record of when equipment reaches end of life goes stale, and spending ends up triggered by failure rather than by plan.",
          "We carry out the assessments across all four dimensions and reconcile them into a single position. Every figure carries a stated accuracy band, so it is clear which numbers are ready for a lender or a committee and which are indicative. Remaining service life is recorded against each component rather than left in the report, so it carries straight into the capital plan. One site visit supports several deliverables, and a re-issued report reflects current data.",
          "Every deliverable arrives sealed and filing-ready where a statute, a lender or a program requires it, so nothing has to be taken elsewhere to be signed off.",
        ],
      },
    },
    {
      id: "as-provide",
      ground: "ink",
      visible: true,
      body: {
        type: "list",
        title: "What we provide.",
        accent: "cassiopeia",
        groups: [
          {
            id: "g1",
            items: [
              "Condition assessments for due diligence and capital allocation: BCAs, FCAs, reserve fund studies and depreciation reports",
              "Energy and emissions audits at ASHRAE Level 1 and Level 2, scoped to the decision the number has to carry",
              "Water use assessment alongside the energy audit, where consumption or cost warrants it",
              "Compliance exposure review: which requirements apply, on what timeline, and what falling short of them costs",
              "A component inventory with remaining service life recorded against each item, carried forward into planning",
            ],
          },
        ],
      },
    },
    {
      id: "as-services",
      ground: "ink",
      visible: true,
      body: {
        type: "serviceBlocks",
        accent: "cassiopeia",
        services: [
          {
            id: "svc-perf-audit",
            name: "Performance Audit",
            lead: "Measures identified, costed and ranked, at the audit level the decision actually needs.",
            application: [
              "ASHRAE Level 1 and Level 2 audits where measures need to be identified, costed and ranked",
              "Meeting audit requirements for incentive programs or lender conditions",
              "Identifying needs and capital requirements ahead of a retrofit",
              "Assessing condition, operating cost, emissions and compliance exposure before a capital plan",
              "Water use assessment where consumption or cost warrants it",
              "Pre-acquisition review where energy cost or carbon exposure affects price",
            ],
            outcome: [
              "An investment-grade baseline for financing, performance contracting or capital approval that a later verification can be measured against",
              "A costed set of measures with savings, payback and carbon reduction attached",
              "A clear split between what is mandatory for safety and compliance, what is economical, and what is neither",
              "Incentive and rebate eligibility identified alongside the measures rather than after the fact",
              "The audit level matched to the decision, so you are not paying for precision the decision does not need",
            ],
          },
          {
            id: "svc-condition",
            name: "Condition Assessment",
            lead: "A defensible position on condition, deferred maintenance and remaining service life.",
            application: [
              "Acquisition due diligence and financing, reported to ASTM E2018 or your lender's own requirement",
              "Reserve fund studies for Ontario condominium corporations under O. Reg. 48/01, Class 1, 2 and 3",
              "Depreciation reports for British Columbia strata corporations under the Strata Property Act",
              "Facility condition assessments for institutional and portfolio owners setting renewal budgets",
              "Establishing the component inventory and remaining service life behind a capital plan",
              "Insurance, warranty and end-of-lease condition documentation",
            ],
            outcome: [
              "A defensible position on condition, deferred maintenance and remaining service life",
              "Statutory obligations met within tight timelines and budgets",
              "Capital exposure quantified early, before price, financing and budget decisions are made",
              "A live component inventory that carries forward into future assessments rather than being rebuilt",
              "Every system reported with the method used to assess it, so it is clear where a finding rests on visual review and where on testing or records",
              "The source and accuracy band stated on every cost estimate, adjustable by your cost consultant",
            ],
          },
        ],
      },
    },
    {
      id: "as-close",
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
      id: "as-close-go",
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
