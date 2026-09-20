import type { Page } from "@/lib/types";

/* ============================================================================
   Who we serve, Customer stories, About, Contact.

   Anonymization rule, carried from the handoff: clients are named. Specific
   projects and project photography are not. Nothing here identifies a
   building, an address or a site.
   ========================================================================= */

export const whoWeServePage: Page = {
  slug: "who-we-serve",
  name: "Who we serve",
  showSubnav: false,
  accent: "naples",
  seo: {
    title: "Who we serve",
    description:
      "Owners, developers, investors and asset managers, and the consultants who work with them, at the points where a position on the asset has to be established or defended.",
  },
  sections: [
    {
      id: "wws-hero",
      ground: "ink",
      visible: true,
      body: {
        type: "pageHero",
        eyebrow: "Who we serve",
        title:
          "Owners, developers, investors and asset managers, and the consultants who work with them.",
        lede: "We work with the owners, developers, investors and asset managers of buildings and portfolios, and with the consultants engaged by them, at the points where a position on the asset has to be established or defended.",
        accent: "naples",
        showModules: false,
        image: {
          src: "/images/hero-who-we-serve.jpg",
          alt: "A mixed-use building with layered balconies against a bright sky.",
          credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
        },
      },
    },
    {
      id: "wws-lifecycle",
      ground: "ink",
      visible: true,
      body: {
        type: "lifecycle",
        title: "We work across the whole life of the asset.",
        items: [
          {
            id: "l-design",
            title: "In design",
            body: "While the decisions that set cost and carbon for decades are still open.",
          },
          {
            id: "l-acq",
            title: "At acquisition",
            body: "Before price, financing and budget are fixed.",
          },
          {
            id: "l-hold",
            title: "Through the hold",
            body: "Where most of the work is, and most of it is continuous.",
          },
          {
            id: "l-exit",
            title: "At exit",
            body: "Where documentation gaps turn into price and timing.",
          },
        ],
      },
    },
    {
      id: "wws-design",
      ground: "ink",
      visible: true,
      body: {
        type: "prose",
        title: "In design.",
        paras: [
          "Concept and schematic decisions set your building's operating cost, carbon and compliance standing for decades, and they are made before anyone has occupied it. We compare structural, envelope and mechanical options while they can still change, support planning and permit submissions for energy and embodied carbon, and manage certification from assessment through to submission. The assumptions behind the design are carried forward as your operating baseline and into the capital plan, so the building is not measured from scratch the first time someone asks how it performs.",
        ],
      },
    },
    {
      id: "wws-acq",
      ground: "ink",
      visible: true,
      body: {
        type: "prose",
        title: "At acquisition.",
        paras: [
          "Before you commit, you need to know what the asset is and what it will cost you. We screen assets before site work is committed, carry out due diligence to ASTM E2018 or your lender's own requirement, and quantify capital exposure while price, financing and budget are still open. Energy cost and carbon exposure are assessed alongside physical condition, so a figure that affects price is not discovered after closing. What is established at acquisition becomes the record you hold for the rest of the hold period.",
        ],
      },
    },
    {
      id: "wws-hold",
      ground: "ink",
      visible: true,
      body: {
        type: "prose",
        title: "Through the hold.",
        paras: [
          "This is where most of the work is, and most of it is continuous rather than a project. We refresh the data and update the plan annually, support your budget cycle and re-forecast as conditions change, track regulatory and reporting deadlines asset by asset, and prepare capital requests in the terms your board or investment committee decides in. Where several consultants are working the same asset, we coordinate them and hold the reconciled position, so you receive one answer rather than four reports to interpret.",
        ],
      },
    },
    {
      id: "wws-exit",
      ground: "ink",
      visible: true,
      body: {
        type: "prose",
        title: "At exit.",
        paras: [
          "Documentation gaps surface during due diligence at sale, where they affect price and timing, and by then there is rarely time to close them. We hold a single document record per asset throughout the hold, so those gaps are visible years earlier. At sale or at a change of management, handover documentation is produced from that record and transfers with the asset, which means the next owner or manager does not start again and the work you paid for keeps its value.",
        ],
      },
    },
    {
      id: "wws-audiences",
      ground: "card",
      visible: true,
      body: {
        type: "areaList",
        title: "Where you come in.",
        areas: [
          {
            id: "au-owners",
            name: "Owners",
            lead: "You hold the asset and every obligation attached to it.",
            body: "You hold the asset and every obligation attached to it: statutory reporting, reserve funds, life safety, and the capital that keeps it running. Municipalities and public sector owners included. We give you one position on the asset and the documentation to defend it.",
            accent: "naples",
          },
          {
            id: "au-dev",
            name: "Developers",
            lead: "Engaged from project inception, while the decisions that set cost and carbon are still open.",
            body: "We are engaged from project inception, while the decisions that set cost and carbon are still open. Concept and schematic optimization, permit submissions, certification, and design assumptions handed forward, so the building you deliver can be operated against what was promised.",
            accent: "apricot",
          },
          {
            id: "au-inv",
            name: "Investors and asset managers",
            lead: "Fund strategy has to become what each building does next.",
            body: "Fund strategy has to become what each building does next. We translate it, allocate capital across assets on one defensible basis, and give you a portfolio position that can be presented to an investment committee without being reassembled each time.",
            accent: "cassiopeia",
          },
          {
            id: "au-con",
            name: "Consultants",
            lead: "We work alongside your team rather than around it.",
            body: "We work alongside your engineers, cost consultants, architects and property managers rather than around them. Costs, quantities and assumptions stay open to your adjustment, and where two sources disagree on a component, the disagreement is recorded and resolved with a stated reason.",
            accent: "billabong",
          },
        ],
      },
    },
    {
      id: "wws-record",
      ground: "ink",
      visible: true,
      body: {
        type: "imagePattern",
        eyebrow: "The record",
        title: "The record outlasts the engagement.",
        accent: "naples",
        paras: [
          "Buildings change hands, managers change, and consultants finish and move on. What usually happens is that the knowledge leaves with them, and the next party starts from drawings and guesswork. We hold the record with the building rather than with the engagement, so when ownership, management or the consultant team changes, what is known about the asset stays known.",
        ],
        imageA: {
          src: "/images/case-masterplan.jpg",
          alt: "A stepped high-rise seen from street level.",
          credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
        },
        imageB: {
          src: "/images/hero-assessments.jpg",
          alt: "The curved glass curtain wall of an office tower, seen close.",
          credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
        },
        items: [
          { id: "r1", text: "Every figure carries its source, its version and its date." },
          { id: "r2", text: "Handover documentation is produced from the record and transfers with the asset." },
          { id: "r3", text: "Documentation gaps are visible years before due diligence at sale." },
          { id: "r4", text: "The next owner or manager does not start again." },
        ],
        link: { label: "See what we do", href: "/what-we-do" },
      },
    },
    {
      id: "wws-close",
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
      id: "wws-close-go",
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

/* --- Customer stories -----------------------------------------------------
   The Work page becomes Customer Stories: a framing and naming change the
   client asked for. The case studies themselves are written and unchanged.
   ------------------------------------------------------------------------ */

export const customerStoriesPage: Page = {
  slug: "customer-stories",
  name: "Customer stories",
  showSubnav: false,
  accent: "cassiopeia",
  seo: {
    title: "Customer stories",
    description:
      "Engagements across portfolio decarbonization, campus scale, whole life cycle assessment and end of life. We name our clients and not their buildings.",
  },
  sections: [
    {
      id: "cs-hero",
      ground: "ink",
      visible: true,
      body: {
        type: "pageHero",
        eyebrow: "Customer stories",
        title: "Selected work.",
        lede: "Five engagements across portfolio decarbonization, campus scale, whole life cycle assessment and end of life. We name our clients and not their buildings.",
        accent: "cassiopeia",
        showModules: false,
        image: {
          src: "/images/hero-customer-stories.jpg",
          alt: "A curved white facade seen as a sweep of horizontal bands.",
          credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
        },
      },
    },
    {
      id: "cs-intro",
      ground: "ink",
      visible: true,
      body: {
        type: "prose",
        title: "Ordered by where in the life cycle the decision falls.",
        paras: [
          "The same method applies at different points: a master plan still in design, an existing building facing conversion, a portfolio in operation, and buildings reaching end of life. In each case operational, embodied and end of life carbon are assessed on the same basis, so the pathway is chosen on cost and carbon together rather than on either alone.",
        ],
      },
    },
    {
      id: "cs-index",
      ground: "ink",
      visible: true,
      body: {
        type: "cardGrid",
        eyebrow: "Five engagements",
        title: "Where the decision fell.",
        accentKeyline: false,
        cards: [
          {
            id: "sc-forum",
            title: "Forum Asset Management",
            body: "A portfolio capital plan built to an investor-mandated target.",
            tag: "Portfolio decarbonization",
            href: "#cs-cases",
            accent: "none",
            image: {
              src: "/images/case-portfolio.jpg",
              alt: "An angular office building against a bright overcast sky.",
              credit: "Unsplash, free licence — illustrative only. Not the client's building.",
            },
          },
          {
            id: "sc-metafor",
            title: "Metafor and Triovest",
            body: "Operational and embodied carbon decided before design lock-in.",
            tag: "Campus scale",
            href: "#cs-cases",
            accent: "none",
            image: {
              src: "/images/case-campus.jpg",
              alt: "A pale glass tower rising into low cloud.",
              credit: "Unsplash, free licence — illustrative only. Not the client's building.",
            },
          },
          {
            id: "sc-northcrest",
            title: "Northcrest Developments and Hines",
            body: "A whole life cycle baseline for 44 buildings, established before the master plan was fixed.",
            tag: "Whole life cycle",
            href: "#cs-cases",
            accent: "none",
            image: {
              src: "/images/case-masterplan.jpg",
              alt: "A stepped high-rise seen from street level.",
              credit: "Unsplash, free licence — illustrative only. Not the client's building.",
            },
          },
          {
            id: "sc-peoplefirst",
            title: "Metafor and Peoplefirst Developments",
            body: "Conversion measured against demolition and new construction, in embodied carbon.",
            tag: "Conversion",
            href: "#cs-cases",
            accent: "none",
            image: {
              src: "/images/case-conversion.jpg",
              alt: "A mid-century building facade undergoing refurbishment.",
              credit: "Unsplash, free licence — illustrative only. Not the client's building.",
            },
          },
          {
            id: "sc-king",
            title: "King County",
            body: "The end of the life cycle decided on cost and carbon data rather than by default.",
            tag: "End of life",
            href: "#cs-cases",
            accent: "none",
            image: {
              src: "/images/case-endoflife.jpg",
              alt: "Two glazed office blocks meeting at an angle.",
              credit: "Unsplash, free licence — illustrative only. Not the client's building.",
            },
          },
        ],
      },
    },
    {
      id: "cs-cases",
      ground: "ink",
      visible: true,
      body: {
        type: "caseStudies",
        accent: "cassiopeia",
        showGapSlot: true,
        gapSlotNote:
          "Sixth case study: a buildings-in-operation engagement. The slot is built at full size and is waiting on copy. Remove this slot before launch or fill it in the admin panel.",
        cases: [
          {
            id: "case-forum",
            client: "Forum Asset Management",
            lead: "A portfolio capital plan built to an investor-mandated target.",
            challenge:
              "After acquiring 17 properties, Forum faced an investor-mandated target of 6 kgCO₂/m² by 2050, limited capital budgets, and consulting fees too high to plan portfolio-wide. Static reports could not support a forward-looking strategy.",
            approach:
              "All 17 assets were brought into a single record, verified baselines were established, and measures were sequenced to each asset's equipment end of life and capital plan, optimizing for maximum aggregate NPV.",
            results:
              "$11.8M added NPV. $200K per year saved against manual assessments. 74% GHG reduction by 2048, two years ahead of target. One continuously updated portfolio view.",
            stats: [
              { id: "f1", value: "$11.8M", label: "Added NPV", source: "Forum engagement record" },
              { id: "f2", value: "$200K", label: "Saved per year against manual assessments", source: "Forum engagement record" },
              { id: "f3", value: "74%", label: "GHG reduction by 2048, two years ahead of target", source: "Forum engagement record" },
            ],
            tags: [
              "Capital Planning",
              "Portfolio Strategy and Optimization",
              "Climate Transition and Risk Advisory",
            ],
            quote: {
              text: "Adaptis exceeded our expectations, providing a comprehensive analysis across the entire portfolio with impressive speed and efficiency... at a fraction of the time and cost of traditional consulting.",
              attribution: "Brendan Brooks, VP of Asset Management, Forum",
            },
            image: {
              src: "/images/case-portfolio.jpg",
              alt: "An angular office building against a bright overcast sky.",
              credit: "Unsplash, free licence — illustrative only. Not the client's building.",
            },
          },
          {
            id: "case-metafor-triovest",
            client: "Metafor and Triovest",
            lead: "Operational and embodied carbon decided before design lock-in.",
            challenge:
              "Deliver a campus expansion that eliminates rework and delays within tight budgets and timelines, improves occupant comfort and daylighting by more than 50%, and cuts operational and embodied carbon by more than 25%.",
            approach:
              "Development pathways were modelled and compared, evaluating operational and embodied carbon together and identifying the most cost-effective route to the project's climate and design goals before design lock-in.",
            results:
              "$8M in ten-year operating cost savings. 30% shorter development timeline. 5,500 tCO₂e avoided. Up to 50% embodied carbon reduction.",
            stats: [
              { id: "m1", value: "$8M", label: "Ten-year operating cost savings", source: "Metafor and Triovest engagement record" },
              { id: "m2", value: "30%", label: "Shorter development timeline", source: "Metafor and Triovest engagement record" },
              { id: "m3", value: "5,500", label: "tCO₂e avoided", source: "Metafor and Triovest engagement record" },
            ],
            tags: ["Design Optimization", "Stakeholder Alignment"],
            quote: {
              text: "With predictive analytics, we weren't guessing — we had a clear roadmap to meet climate targets, maximize financial outcomes, and compress the development cycle without compromising design.",
              attribution: "David Leonard, Managing Director, Metafor",
            },
            image: {
              src: "/images/case-campus.jpg",
              alt: "A pale glass tower rising into low cloud.",
              credit: "Unsplash, free licence — illustrative only. Not the client's building.",
            },
          },
          {
            id: "case-northcrest",
            client: "Northcrest Developments and Hines",
            lead: "A whole life cycle baseline for 44 buildings, established before the master plan was fixed.",
            challenge:
              "A mixed-use master plan of 44 buildings, spanning residential, office, light industrial, retail, community and institutional uses and parking, needed a whole life cycle carbon position across very different building forms and construction types, established early enough to inform the scheme rather than report on it.",
            approach:
              "The 44 buildings were categorized into 11 typologies by function, form and construction type, and a whole life cycle carbon assessment covering operational, embodied and end of life carbon was completed for each, alongside the existing buildings on site and the site infrastructure. Massing options were then generated within the site constraints, filtered for compliance, and carried into detailed energy and circularity assessment, at approximately 64 simulations per typology and up to 4,000 per compliant massing option.",
            results:
              "659,900 tCO₂e total life cycle carbon established as the baseline, of which 230,100 embodied and 429,800 operational. 44 buildings resolved into 11 typologies across a gross site area of 408,623 m². Site infrastructure assessed separately at 19,743 tCO₂e embodied. Operational and embodied intensity reported by typology and by block, against Canadian embodied carbon targets and the CAGBC Zero Carbon Standard.",
            stats: [
              { id: "n1", value: "659,900", label: "tCO₂e total life cycle carbon baseline", source: "Northcrest and Hines engagement record" },
              { id: "n2", value: "44", label: "Buildings resolved into 11 typologies", source: "Northcrest and Hines engagement record" },
              { id: "n3", value: "408,623", label: "m² gross site area assessed", source: "Northcrest and Hines engagement record" },
            ],
            tags: ["Design Optimization", "Benchmarking"],
            image: {
              src: "/images/case-masterplan.jpg",
              alt: "A stepped high-rise seen from street level.",
              credit: "Unsplash, free licence — illustrative only. Not the client's building.",
            },
          },
          {
            id: "case-peoplefirst",
            client: "Metafor and Peoplefirst Developments",
            lead: "Conversion measured against demolition and new construction, in embodied carbon.",
            challenge:
              "A mid-century office tower undergoing conversion to residential needed its embodied carbon established for the Zero Carbon Building Design Standard Version 3, and needed the carbon case for converting rather than demolishing and rebuilding quantified, which the standard's retrofit methodology does not capture.",
            approach:
              "The existing building and six design variations of glazing, roof and wall assemblies were assessed over a 60 year project life, covering foundations, structure, envelope, slab, roof, stairs and parking structure. The proposed design was reported against the ZCB-Design v3 methodology, and a second methodology was applied alongside it, defining a baseline of demolition plus new construction and accounting separately for demolished, retained and new elements, so the saving from reuse is captured.",
            results:
              "346 kgCO₂e/m² embodied carbon intensity for the proposed design, below the 500 kgCO₂e/m² absolute target and below the 350 kgCO₂e/m² required for Embodied Carbon Strategy 1. 221 kgCO₂e/m² for the conversion against a demolition and new construction baseline of 686 kgCO₂e/m², a 68% reduction. A further 77 kgCO₂e/m² available through recovery and reuse, bringing the total to 144 kgCO₂e/m² and the saving to more than 80%. All six variations below 500 kgCO₂e/m², four below 350.",
            stats: [
              { id: "p1", value: "346", label: "kgCO₂e/m² for the proposed design, against a 500 target", source: "Peoplefirst engagement record" },
              { id: "p2", value: "68%", label: "Reduction against a demolition and new construction baseline", source: "Peoplefirst engagement record" },
              { id: "p3", value: "80%", label: "Total saving with recovery and reuse", source: "Peoplefirst engagement record" },
            ],
            tags: ["Design Optimization", "Reporting and Disclosures"],
            image: {
              src: "/images/case-conversion.jpg",
              alt: "A mid-century building facade undergoing refurbishment.",
              credit: "Unsplash, free licence — illustrative only. Not the client's building.",
            },
          },
          {
            id: "case-king-county",
            client: "King County",
            lead: "The end of the life cycle decided on cost and carbon data rather than by default.",
            challenge:
              "The county held no data on its end of life buildings: their composition and deconstructability across very different archetypes, the financial implications of the available end of life pathways, or the environmental benefits and tradeoffs of salvage, reuse and recycling.",
            approach:
              "The end of life stages of the whole life cycle were assessed across the portfolio, including the recovery, reuse and recycling potential that sits beyond the system boundary, with the workflow automated so high-value pathways could be identified at portfolio scale, and pricing and emissions data reported for each pathway.",
            results:
              "Approximately 30% cost saving on the optimized pathway compared with traditional demolition. 1,895 tonnes of avoided material waste. 732,000 kgCO₂e of avoided carbon emissions.",
            stats: [
              { id: "k1", value: "30%", label: "Cost saving on the optimized pathway, against traditional demolition", source: "King County engagement record" },
              { id: "k2", value: "1,895", label: "Tonnes of avoided material waste", source: "King County engagement record" },
              { id: "k3", value: "732,000", label: "kgCO₂e of avoided carbon emissions", source: "King County engagement record" },
            ],
            tags: ["Portfolio Strategy and Optimization", "Design Optimization"],
            quote: {
              text: "We see buildings as already processed and manufactured materials, not a nuisance to get out of the way. Before Adaptis, we understood intuitively there was value, but we were guessing as we went. Adaptis has something unique: it predetermines with quantifiable technical data how to benefit from deconstruction and salvage",
              attribution: "Kinley Deller, Construction & Demolition Program Coordinator, King County",
            },
            image: {
              src: "/images/case-endoflife.jpg",
              alt: "Two glazed office blocks meeting at an angle.",
              credit: "Unsplash, free licence — illustrative only. Not the client's building.",
            },
          },
        ],
      },
    },
    {
      id: "cs-close",
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
      id: "cs-close-go",
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
