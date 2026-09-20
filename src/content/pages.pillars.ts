import type { Page } from "@/lib/types";

/* ============================================================================
   The remaining three pillar pages: design and capital planning, managed
   services, reporting and disclosure.

   Note on certification copy, carried from the handoff: certification is
   described as managed end to end, from assessment and modelling through
   documentation and submission. That is a claim about accountability for the
   engagement, not about accreditation. Every caveat was deliberately removed,
   so nothing in this copy will catch an edit that slides it toward Adaptis
   being the accredited or certifying party. Do not rewrite in that direction.
   ========================================================================= */

export const capitalPage: Page = {
  slug: "what-we-do/capital",
  name: "Design and capital planning",
  showSubnav: true,
  accent: "apricot",
  seo: {
    title: "Design and capital planning",
    description:
      "High performance design and long-term capital planning, with cost and carbon assessed over the life of the building rather than at the point of decision.",
  },
  sections: [
    {
      id: "cp-hero",
      ground: "ink",
      visible: true,
      body: {
        type: "pageHero",
        eyebrow: "What we do",
        title: "High performance design and long-term capital planning.",
        lede: "For new construction, deep retrofits and buildings in operation, with cost and carbon assessed over the life of the building rather than at the point of decision.",
        accent: "apricot",
        showModules: false,
        image: {
          src: "/images/hero-capital.jpg",
          alt: "A faceted building facade in sharp light against a dark sky.",
          credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
        },
      },
    },
    {
      id: "cp-problem",
      ground: "ink",
      visible: true,
      body: {
        type: "prose",
        title: "The decisions that cost the most are made earliest.",
        paras: [
          "Choices taken at design stage set your building's operating cost, carbon and compliance standing for decades. On a retrofit, the scope determines what the building can ever achieve. In operation, capital need runs ahead of the annual budget, equipment reaches end of life on different timelines, and the order of the work changes what it costs.",
          "We compare options against the constraints that actually apply in each case: budget ceilings, hold period, equipment end of life, compliance dates and net zero targets. Whole building life cycle assessment underpins all of it, so a reduction in one kind of carbon is not paid for by an increase in another.",
          "Mandatory life safety and code compliance work is treated as a funding floor and discretionary work is ranked separately, so each can be defended on its own terms. Costs, quantities and assumptions stay open and adjustable, by you or by your consultants, and findings are expressed in financial terms that export to your valuation model, which remains the authoritative source of value.",
        ],
      },
    },
    {
      id: "cp-provide",
      ground: "ink",
      visible: true,
      body: {
        type: "list",
        title: "What we provide.",
        accent: "apricot",
        groups: [
          {
            id: "g-new",
            title: "New construction",
            items: [
              "High performance design: structural, envelope and mechanical options compared at concept and schematic stage, when they still determine cost, carbon and compliance standing",
              "Planning and permit submissions for energy and embodied carbon",
            ],
          },
          {
            id: "g-retro",
            title: "Deep retrofits",
            items: [
              "Scope definition: what is kept, replaced or upgraded, tested against cost, carbon and code before the scope is fixed",
              "Decarbonization and net zero roadmaps for existing buildings",
              "Business cases where a low-carbon option carries a capital premium, tested against life cycle return",
            ],
          },
          {
            id: "g-ops",
            title: "Buildings in operation",
            items: [
              "Long-term capital plans over 5 to 30 year horizons, from acquisition due diligence through the hold period to exit or end of life",
              "Scenario comparison against the constraints that apply: budget ceilings, hold period, equipment end of life, compliance requirements and net zero targets",
              "Incentive and rebate identification, carried into the plan",
            ],
          },
          {
            id: "g-all",
            title: "Across all three",
            items: [
              "Whole building life cycle assessment, costing and optimization: operational and embodied carbon and life cycle cost assessed together across the life of the building",
              "Certification managed end to end, from assessment and modelling through documentation and submission: CAGBC Zero Carbon Building, LEED, ENERGY STAR and BOMA BEST. You deal with one party throughout.",
            ],
          },
        ],
      },
    },
    {
      id: "cp-services",
      ground: "ink",
      visible: true,
      body: {
        type: "serviceBlocks",
        accent: "apricot",
        services: [
          {
            id: "svc-design-opt",
            name: "Design Optimization",
            lead: "Options compared while the design can still absorb the change.",
            application: [
              "Concept and schematic design where structural, material and mechanical decisions set downstream cost and carbon",
              "Major retrofit and renovation scope definition, deciding what is kept, replaced or upgraded",
              "Municipal and planning submission requirements for energy and embodied carbon",
              "Business cases where a low-carbon option carries a capital premium",
              "Certification pathways, managed from assessment through to submission",
            ],
            outcome: [
              "A design tested against its energy, carbon and certification targets before construction commits them",
              "Planning and permit submissions supported with the evidence the authority requires",
              "Whole-life carbon quantified and reduced at the stage where the design can still absorb the change",
              "Operating cost and compliance standing established during design rather than discovered in operation",
              "A capital premium tested against life cycle return, so a low-carbon option can be defended or set aside on the numbers",
              "Design assumptions carried forward as your operating baseline and into the capital plan",
            ],
          },
          {
            id: "svc-capital-planning",
            name: "Capital Planning",
            lead: "A plan that carries through the budget cycle rather than being rebuilt each year.",
            application: [
              "Multi-year capital plans for buildings in operation, over 5 to 30 year horizons",
              "Annual budgeting and forecasting for assets and portfolios",
              "Portfolio allocation when capital need across assets exceeds the annual budget",
              "Post-acquisition planning, converting due diligence findings into a funded roadmap",
              "Business cases for board, investment committee or lender approval",
              "Replace, refurbish, defer or retire decisions on major systems",
            ],
            outcome: [
              "A capital plan that reaches your goals within budget, with the trade-offs visible",
              "A defensible basis for a capital request, with decisions and assumptions open to inspection",
              "A plan that carries through the budget cycle rather than being rebuilt each year",
              "Fewer emergency expenditures, by acting ahead of end-of-life failure",
              "Incentives and rebates captured inside the funding case rather than analyzed separately",
              "Key financial figures exported directly into your financial model",
              "Work sequenced around what changes with timing: equipment end of life, compliance dates, lease expiry, and interactions between measures",
            ],
          },
        ],
      },
    },
    {
      id: "cp-close",
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
      id: "cp-close-go",
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

/* --- Managed services ----------------------------------------------------- */

export const managedServicesPage: Page = {
  slug: "what-we-do/managed-services",
  name: "Managed services",
  showSubnav: true,
  accent: "naples-light",
  seo: {
    title: "Managed services",
    description:
      "Retained professional advisory across the hold, shaped to each asset and the decision at hand. Your sustainability function, without the permanent hire.",
  },
  sections: [
    {
      id: "ms-hero",
      ground: "ink",
      visible: true,
      body: {
        type: "pageHero",
        eyebrow: "What we do",
        title: "Your sustainability function, without the permanent hire.",
        lede: "Retained professional advisory across the hold, shaped to each asset and the decision at hand.",
        accent: "naples-light",
        showModules: false,
        image: {
          src: "/images/hero-managed.jpg",
          alt: "A tall office tower photographed looking upward on an overcast day.",
          credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
        },
      },
    },
    {
      id: "ms-problem",
      ground: "ink",
      visible: true,
      body: {
        type: "prose",
        title: "Continuous work that does not fill a full-time role.",
        paras: [
          "Several consultants work the same asset from different assumptions and nobody holds the reconciled position. Regulatory, reporting and funding deadlines arrive across the year and have to be tracked asset by asset. Fund-level strategy has to be translated into what each building does next. All of it is continuous, and at most organizations none of it fills a full-time role.",
          "We work as retained advisors across the hold, and where you have no sustainability function we act as it. That covers annual plan updates, budget cycle support and re-forecasting as conditions change, and the coordination of the engineers, cost consultants, architects and property managers working on the same asset. Where two sources disagree on a component, we record the disagreement and resolve it with a stated reason.",
          "Work scales up for a transaction or a compliance year and back down between them. The record stays current in between, so the next question is answered from what is already held.",
        ],
      },
    },
    {
      id: "ms-provide",
      ground: "ink",
      visible: true,
      body: {
        type: "list",
        title: "What we provide.",
        accent: "naples-light",
        groups: [
          {
            id: "g1",
            items: [
              "Annual data refresh and plan updates, budget cycle support and re-forecasting for each funding cycle",
              "Climate risk exposure screening, and climate transition and physical risk advisory, including regulatory exposure and its effect on asset value",
              "Sustainability and portfolio strategy advisory, including target setting and pathway planning",
              "Project management, consultant coordination and property management advisory",
              "Incentive and financing program management, from identification and assessment through application to funds received",
            ],
          },
        ],
      },
    },
    {
      id: "ms-services",
      ground: "ink",
      visible: true,
      body: {
        type: "serviceBlocks",
        accent: "naples-light",
        services: [
          {
            id: "svc-climate",
            name: "Climate Transition and Risk Advisory",
            lead: "Exposure priced, then funded through the capital plan.",
            application: [
              "Establishing where a portfolio sits against science-based decarbonization pathways",
              "Identifying which assets face transition risk, and on what timeline",
              "Physical hazard exposure screening at asset and portfolio level",
              "Climate value at risk assessment at asset and portfolio level",
              "Investor, lender and fund-level climate risk reporting",
              "Sustainable finance advisory for lenders and investors, coordinated with specialist partners",
              "Acquisition screening where carbon or hazard exposure affects price",
            ],
            outcome: [
              "A clear position on which assets are exposed, to what, and when",
              "CRREM pathways applied to your building's actual consumption and area data rather than portfolio averages",
              "Risk expressed in financial terms: capital required, exposure to carbon pricing, effect on value at exit",
              "A decarbonization pathway with capital cost, sequence and interim milestones attached",
              "Assumptions and scenarios kept open, so a result can be tested rather than accepted",
              "A transition response funded through the capital plan rather than stated in a report",
            ],
          },
          {
            id: "svc-sustainability",
            name: "Sustainability Advisory",
            lead: "Targets tested through the capital plan before they are published.",
            application: [
              "Setting portfolio sustainability targets and the policy behind them",
              "GHG inventories and carbon accounting",
              "Decarbonization roadmaps at asset and portfolio level",
              "Tenant and stakeholder engagement, including green lease provisions",
              "Grant, incentive and rebate program management, from application through to funds received",
              "Certification managed end to end, from assessment and modelling through documentation and submission: CAGBC Zero Carbon Building, LEED, ENERGY STAR and BOMA BEST. You deal with one party throughout.",
              "Acting as your sustainability function where you do not have one",
            ],
            outcome: [
              "Targets that hold up when questioned by an investor, lender or board",
              "A decarbonization roadmap tied to a funded capital plan",
              "Available funding captured rather than missed",
              "One consistent position across the portfolio instead of asset-by-asset responses",
              "Certification achieved from evidence assembled once, rather than a separate exercise for each standard",
              "Sustainability commitments met without a permanent internal hire",
            ],
          },
          {
            id: "svc-portfolio",
            name: "Portfolio Strategy and Optimization",
            lead: "Capital allocated across assets on one defensible basis.",
            application: [
              "Directing capital across a portfolio with more need than budget",
              "Identifying condition, compliance and carbon hotspots across assets",
              "Hold, invest, reposition or dispose decisions on individual assets",
              "Planning procurement and delivery across assets rather than building by building",
              "Setting the assessment program, deciding which assets warrant deeper work",
              "Reporting portfolio position to an investment committee, board or lender",
            ],
            outcome: [
              "A ranked view of where risk and capital need are concentrated",
              "Assets compared on a consistent basis, so ranking reflects condition and risk rather than which reports happen to be recent",
              "Physical condition, compliance exposure and carbon risk read together, so a hotspot is understood in full",
              "Lower delivery cost and management burden by grouping common work into fewer procurements",
              "Assessment budget directed to the assets where it changes a decision",
              "A portfolio position that can be presented and defended without reassembly each time it is asked for",
            ],
          },
          {
            id: "svc-stakeholder",
            name: "Stakeholder Alignment",
            lead: "One point of contact, and one consolidated position.",
            application: [
              "Projects requiring several disciplines where you want one point of contact",
              "Assembling and managing the consultant team for a retrofit or capital project",
              "Consolidating technical output from several firms into one decision-ready position",
              "Owner's representation through design and construction",
              "Reconciling conflicting findings between consultants",
              "Programs spanning multiple assets, phases or funding sources",
            ],
            outcome: [
              "One consolidated position rather than a set of separate reports",
              "Specialist expertise engaged where it is needed, without the procurement burden falling on you",
              "Conflicting findings resolved before they reach a board or committee",
              "Decisions taken from something you can act on rather than technical output you have to interpret",
              "Internal time returned to the work only your team can do",
              "A project record that carries into operation and into the capital plan",
            ],
          },
        ],
      },
    },
    {
      id: "ms-close",
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
      id: "ms-close-go",
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

/* --- Reporting and disclosure --------------------------------------------- */

export const reportingPage: Page = {
  slug: "what-we-do/reporting",
  name: "Reporting and disclosure",
  showSubnav: true,
  accent: "billabong",
  seo: {
    title: "Reporting and disclosure",
    description:
      "One document record per asset, and the reporting each audience asks for produced from a single dataset, with every figure traceable to its source.",
  },
  sections: [
    {
      id: "rp-hero",
      ground: "ink",
      visible: true,
      body: {
        type: "pageHero",
        eyebrow: "What we do",
        title: "Accurate, compliant and transparent reporting, available on demand.",
        lede: "One document record per asset, and the reporting each audience asks for produced from a single dataset.",
        accent: "billabong",
        showModules: false,
        image: {
          src: "/images/hero-reporting.jpg",
          alt: "A stepped tower facade receding into cloud.",
          credit: "Unsplash, free licence — placeholder until Adaptis licenses its own photography.",
        },
      },
    },
    {
      id: "rp-problem",
      ground: "ink",
      visible: true,
      body: {
        type: "prose",
        title: "The same figures, asked for five different ways.",
        paras: [
          "Building records sit across email, drives and former consultants, and are incomplete by the time they are needed. The same information then has to be reformatted for boards, lenders, investors and tenants, and records are lost at each change of property manager, consultant or ownership. When an auditor asks where a number came from, assembling the answer takes days.",
          "We hold one document record per asset and produce the reporting each audience requires from a single dataset. Every figure traces to its source document, version and date, with estimated values marked separately from metered ones. Coverage gaps, anomalies and year-on-year variances are identified before submission rather than after.",
          "Documentation gaps that would otherwise surface during due diligence at sale are visible well before then, and the record transfers with the asset.",
        ],
      },
    },
    {
      id: "rp-provide",
      ground: "ink",
      visible: true,
      body: {
        type: "list",
        title: "What we provide.",
        accent: "billabong",
        groups: [
          {
            id: "g1",
            items: [
              "One document record per asset: reports, drawings, contracts, permits, warranties and correspondence, organized and searchable",
              "Version control and an audit trail on every figure, recording source, date and change history",
              "Stakeholder reporting drawn from one dataset: investment committee memos, board and owner packages, lender submissions and investor reporting",
              "Handover documentation at sale or at change of management",
              "Reporting prepared in the format the receiving party requires, aligned to the frameworks and internal standards you already use",
              "Deadlines held in the record and tracked across the portfolio",
            ],
          },
        ],
      },
    },
    {
      id: "rp-services",
      ground: "ink",
      visible: true,
      body: {
        type: "serviceBlocks",
        accent: "billabong",
        services: [
          {
            id: "svc-reporting",
            name: "Reporting and Disclosures",
            lead: "Filed on time, in the required format, from figures that trace back to their source.",
            application: [
              "Investor and fund-level sustainability benchmarking submissions, prepared and filed",
              "Energy and water reporting: Ontario EWRB under O. Reg. 506/18 for buildings of 50,000 sq ft and over, and City of Toronto reporting under Municipal Code Chapter 367, which extends to buildings from 10,000 sq ft in 2027",
              "Climate-related disclosure prepared under CSDS 2, ISSB or TCFD-aligned frameworks",
              "Investor, fund and LP reporting against mandate-specific requests",
              "Lender reporting and green finance conditions",
              "Board and owner reporting on portfolio performance",
              "Tenant and customer sustainability questionnaires",
            ],
            outcome: [
              "Submissions filed on time and in the required format",
              "One consistent set of figures across every audience asking",
              "Every figure traceable to source, date and version, with estimated values marked separately from metered",
              "Coverage gaps, anomalies and year-on-year variances caught before submission rather than after",
              "Less internal time spent assembling data each cycle",
              "A reporting record that carries forward year on year rather than restarting",
            ],
          },
        ],
      },
    },
    {
      id: "rp-close",
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
      id: "rp-close-go",
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
