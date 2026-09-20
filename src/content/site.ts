import type { SiteSettings } from "@/lib/types";

/* ============================================================================
   Site-wide settings.

   This is the seed. Firestore holds the live values and the admin panel edits
   them; if Firestore is unreachable the site falls back to exactly this, so a
   database outage degrades to the last-known-good copy rather than to nothing.

   The call to action reads "Get in touch" in every position. It replaced
   "Let's chat" on 15 September and is not to be varied per placement.
   ========================================================================= */

export const siteSeed: SiteSettings = {
  organization: "Adaptis",
  legalName: "Adaptis Systems Inc.",
  ctaLabel: "Get in touch",
  ctaHref: "/contact",

  nav: [
    { id: "nav-what", label: "What we do", href: "/what-we-do" },
    { id: "nav-who", label: "Who we serve", href: "/who-we-serve" },
    { id: "nav-stories", label: "Customer stories", href: "/customer-stories" },
    { id: "nav-about", label: "About", href: "/about" },
  ],

  subnav: [
    { id: "sub-record", label: "Building record", href: "/what-we-do/building-record" },
    { id: "sub-assess", label: "Assessments and audits", href: "/what-we-do/assessments" },
    { id: "sub-capital", label: "Design and capital planning", href: "/what-we-do/capital" },
    { id: "sub-managed", label: "Managed services", href: "/what-we-do/managed-services" },
    { id: "sub-reporting", label: "Reporting and disclosure", href: "/what-we-do/reporting" },
  ],

  footer: {
    line: "Asset performance advisory for owners, developers, investors, asset managers and their consultants.",
    columns: [
      {
        id: "col-what",
        title: "What we do",
        links: [
          { id: "f-record", label: "Building record", href: "/what-we-do/building-record" },
          { id: "f-assess", label: "Assessments and audits", href: "/what-we-do/assessments" },
          { id: "f-capital", label: "Design and capital planning", href: "/what-we-do/capital" },
          { id: "f-managed", label: "Managed services", href: "/what-we-do/managed-services" },
          { id: "f-reporting", label: "Reporting and disclosure", href: "/what-we-do/reporting" },
        ],
      },
      {
        id: "col-firm",
        title: "The firm",
        links: [
          { id: "f-who", label: "Who we serve", href: "/who-we-serve" },
          { id: "f-stories", label: "Customer stories", href: "/customer-stories" },
          { id: "f-about", label: "About", href: "/about" },
          { id: "f-contact", label: "Contact", href: "/contact" },
        ],
      },
    ],
    address: [
      "10 Dundas Street East, Suite 600",
      "Toronto, ON, Canada M5B 2G9",
    ],
    email: "sheida@adaptis.ca",
    phone: "+1 647 867 6260",
    linkedin: "https://www.linkedin.com/company/adaptis-ai",
    copyright: "© 2026 Adaptis Systems Inc.",
    closingLine: "Asset performance advisory, from design to exit.",
  },

  contact: {
    notifyEmail: "connect@adaptis.ca",
  },

  seo: {
    titleTemplate: "%s · Adaptis",
    defaultDescription:
      "Adaptis is an asset performance advisory firm. Condition, carbon, cost and compliance assessed together and reconciled into one position on the asset.",
    siteUrl: "https://www.adaptis.ca",
  },
};
