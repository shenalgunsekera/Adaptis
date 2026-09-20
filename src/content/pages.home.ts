import type { Page } from "@/lib/types";

/* ============================================================================
   Home

   Copy is final and was settled claim by claim with the client. It is not to
   be rewritten, shortened to fit a layout, or replaced with placeholder text.

   Ground order, and why:
     hero          ink      the page's single Naples form is the hero's
                            primary call to action
     problem       ink
     five areas    ink      each area carries its own accent keyline
     lifecycle     ink      recessed band, distinguished by surface not fill
     audiences     card     the light break, in the manner of Stem
     end to end    ink
     selected work ink
     close         card     the required light buffer above the Halite footer;
                            its call to action is Card, not Naples, so the
                            page carries one yellow and not two
   ========================================================================= */

export const homePage: Page = {
  slug: "",
  name: "Home",
  showSubnav: false,
  accent: "naples",
  seo: {
    title: "Adaptis — asset performance advisory",
    description:
      "Your building's condition, carbon, cost and compliance, assessed together and reconciled into one position on the asset, held current from design through to exit.",
  },
  sections: [
    {
      id: "home-hero",
      ground: "ink",
      visible: true,
      body: {
        type: "homeHero",
        eyebrow: "Asset performance advisory",
        title:
          "Your building's condition, carbon, cost and compliance, assessed together.",
        lede: "Adaptis is an asset performance advisory firm. We reconcile all four performance parameters into one position on the asset, state how accurate every figure is, and hold the record current from design through to exit.",
        primaryCta: { label: "Get in touch", href: "/contact" },
        // The page's single Naples is the closing band, so the hero button
        // is Card. Two yellows would read as two calls to action.
        primaryStyle: "oncard",
        secondaryCta: { label: "See how we work", href: "/what-we-do" },
        autoplayMs: 7000,
        slides: [
          {
            id: "slide-record",
            eyebrow: "Building record",
            asideTitle: "Building record",
            asideBody:
              "We collect what is missing, parse what already exists, and hold it as one structured record. Work can start from partial data and improve as more arrives.",
            image: {
              src: "/images/hero-building-record.jpg",
              alt: "A modern commercial office building seen from below against a clear sky.",
              credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
            },
            accent: "naples",
            href: "/what-we-do/building-record",
          },
          {
            id: "slide-assess",
            eyebrow: "Assessments and audits",
            asideTitle: "Assessments and audits",
            asideBody:
              "Condition, energy and emissions, cost and compliance assessed together and reconciled, with the accuracy of every figure stated.",
            image: {
              src: "/images/hero-assessments.jpg",
              alt: "The curved glass curtain wall of an office tower, seen close.",
              credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
            },
            accent: "cassiopeia",
            href: "/what-we-do/assessments",
          },
          {
            id: "slide-capital",
            eyebrow: "Design and capital planning",
            asideTitle: "Design and capital planning",
            asideBody:
              "High performance design for new construction and deep retrofits, and capital plans over 5 to 30 year horizons for buildings in operation.",
            image: {
              src: "/images/hero-capital.jpg",
              alt: "A faceted building facade in sharp light against a dark sky.",
              credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
            },
            accent: "apricot",
            href: "/what-we-do/capital",
          },
          {
            id: "slide-managed",
            eyebrow: "Managed services",
            asideTitle: "Managed services",
            asideBody:
              "Retained advisory across the hold. We keep the record current, coordinate your other consultants, and scale up for a transaction or a compliance year.",
            image: {
              src: "/images/hero-managed.jpg",
              alt: "A tall office tower photographed looking upward on an overcast day.",
              credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
            },
            accent: "naples-light",
            href: "/what-we-do/managed-services",
          },
          {
            id: "slide-reporting",
            eyebrow: "Reporting and disclosure",
            asideTitle: "Reporting and disclosure",
            asideBody:
              "One document record per asset, and the reporting each audience asks for produced from a single dataset.",
            image: {
              src: "/images/hero-reporting.jpg",
              alt: "A stepped tower facade receding into cloud.",
              credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
            },
            accent: "billabong",
            href: "/what-we-do/reporting",
          },
        ],
      },
    },

    {
      id: "home-problem",
      ground: "ink",
      visible: true,
      body: {
        type: "splitProse",
        title: "Separate assessments, separate assumptions.",
        paras: [
          "Condition, energy and emissions, cost and compliance are usually assessed by different firms on different timelines. Each report is defensible on its own. Together they disagree, and nobody owns the reconciliation, so the disagreement surfaces at the worst possible moment, in front of a lender, a board or a buyer.",
        ],
        asideTitle: "One record, one position",
        asideParas: [
          "We run all four as one engagement and reconcile them into a single position on your asset. Every figure carries its source, its date and a stated accuracy band, so you know which numbers are ready for a committee and which still need work. The record stays with the building rather than with the consultant who produced it.",
        ],
      },
    },

    {
      id: "home-areas",
      ground: "ink",
      visible: true,
      body: {
        type: "cardGrid",
        eyebrow: "What we do",
        title: "Five areas of work, run as one engagement.",
        intro:
          "Each draws on the same record of your asset, so one site visit supports several deliverables and a re-issued report reflects current data.",
        accentKeyline: true,
        cards: [
          {
            id: "area-record",
            title: "Building record",
            body: "We collect what is missing, parse what already exists, and hold it as one structured record. Work can start from partial data and improve as more arrives.",
            tag: "Benchmarking",
            href: "/what-we-do/building-record",
            accent: "naples",
          },
          {
            id: "area-assess",
            title: "Assessments and audits",
            body: "Condition, energy and emissions, cost and compliance assessed together and reconciled, with the accuracy of every figure stated.",
            tag: "Performance Audit · Condition Assessment",
            href: "/what-we-do/assessments",
            accent: "cassiopeia",
          },
          {
            id: "area-capital",
            title: "Design and capital planning",
            body: "High performance design for new construction and deep retrofits, and capital plans over 5 to 30 year horizons for buildings in operation.",
            tag: "Design Optimization · Capital Planning",
            href: "/what-we-do/capital",
            accent: "apricot",
          },
          {
            id: "area-managed",
            title: "Managed services",
            body: "Retained advisory across the hold. We keep the record current, coordinate your other consultants, and scale up for a transaction or a compliance year.",
            tag: "Four services",
            href: "/what-we-do/managed-services",
            accent: "naples-light",
          },
          {
            id: "area-reporting",
            title: "Reporting and disclosure",
            body: "One document record per asset, and the reporting each audience asks for produced from a single dataset.",
            tag: "Reporting and Disclosures",
            href: "/what-we-do/reporting",
            accent: "billabong",
          },
        ],
      },
    },

    {
      id: "home-lifecycle",
      ground: "ink",
      visible: true,
      body: {
        type: "lifecycle",
        title: "We stay with the asset from design through to exit.",
        items: [
          {
            id: "lc-design",
            title: "In design",
            body: "Concept and schematic choices set your operating cost, carbon and compliance standing for decades. We test them while they can still change.",
          },
          {
            id: "lc-acq",
            title: "At acquisition",
            body: "Condition and capital exposure established before price, financing and budget are set.",
          },
          {
            id: "lc-hold",
            title: "Through the hold",
            body: "Annual plan updates, budget cycle support, compliance deadlines, and capital requests you can defend in financial terms.",
          },
          {
            id: "lc-exit",
            title: "At exit",
            body: "Handover documentation, gaps found well before due diligence, and a record that transfers with the asset.",
          },
        ],
      },
    },

    {
      id: "home-audiences",
      ground: "card",
      visible: true,
      body: {
        type: "cardGrid",
        eyebrow: "Who we serve",
        title: "Where you come in.",
        accentKeyline: false,
        cards: [
          {
            id: "aud-owners",
            title: "Owners",
            body: "Including municipalities and public sector owners. You hold the asset and every obligation attached to it.",
            href: "/who-we-serve",
            accent: "none",
          },
          {
            id: "aud-dev",
            title: "Developers",
            body: "We are engaged from project inception, while the decisions that set cost and carbon are still open.",
            href: "/who-we-serve",
            accent: "none",
          },
          {
            id: "aud-inv",
            title: "Investors and asset managers",
            body: "Fund strategy translated into what each building does next, and a portfolio position you can present without rebuilding it each time.",
            href: "/who-we-serve",
            accent: "none",
          },
          {
            id: "aud-con",
            title: "Consultants",
            body: "We work alongside your engineers, cost consultants and architects, with costs, quantities and assumptions open to their adjustment.",
            href: "/who-we-serve",
            accent: "none",
          },
        ],
      },
    },

    {
      id: "home-endtoend",
      ground: "ink",
      visible: true,
      body: {
        type: "prose",
        eyebrow: "End to end",
        title: "One engagement, from design through to certification.",
        paras: [
          "Our team combines design, sustainability and building operations expertise and includes registered professionals. Adaptis was founded by a licensed architect, and reports within that scope, including CMHC documentation and embodied carbon assessment, are signed by us.",
          "Certification is managed from assessment and modelling through documentation and submission. Sealed, filing-ready deliverables are produced wherever a statute, a lender or a program requires one.",
          "You deal with one party and receive one reconciled position, instead of assembling four firms and reconciling them yourself.",
        ],
      },
    },

    {
      id: "home-work",
      ground: "ink",
      visible: true,
      body: {
        type: "cardGrid",
        eyebrow: "Customer stories",
        title: "Selected work.",
        accentKeyline: false,
        cards: [
          {
            id: "w-forum",
            title: "Forum Asset Management",
            body: "A 17-property portfolio brought into one record, with measures sequenced to each asset's equipment end of life.",
            tag: "Portfolio decarbonization",
            href: "/customer-stories",
            accent: "none",
          },
          {
            id: "w-metafor",
            title: "Metafor and Triovest",
            body: "A campus expansion where operational and embodied carbon were weighed against each other before design lock-in.",
            tag: "Campus scale",
            href: "/customer-stories",
            accent: "none",
          },
          {
            id: "w-northcrest",
            title: "Northcrest and Hines",
            body: "A 44-building master plan given a whole life cycle carbon baseline early enough to shape the scheme rather than report on it.",
            tag: "Whole life cycle",
            href: "/customer-stories",
            accent: "none",
          },
        ],
      },
    },

    {
      id: "home-close",
      ground: "card",
      visible: true,
      body: {
        type: "band",
        variant: "naples",
        title: "Contact us to discuss an asset, a portfolio or a project in design.",
        support:
          "Tell us the decision you are facing and we will tell you what it would take to answer it."
      },
    },
    {
      id: "home-close-go",
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
