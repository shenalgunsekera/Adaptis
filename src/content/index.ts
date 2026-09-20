import type { Page } from "@/lib/types";

import { homePage } from "./pages.home";
import { whatWeDoPage, buildingRecordPage, assessmentsPage } from "./pages.whatwedo";
import { capitalPage, managedServicesPage, reportingPage } from "./pages.pillars";
import { whoWeServePage, customerStoriesPage } from "./pages.firm";
import { aboutPage, contactPage } from "./pages.about";

export { siteSeed } from "./site";

/* ============================================================================
   The eleven pages, in navigation order.

   Eleven is the agreed architecture, calibrated against Longevity Partners:
   home, What we do, five pillar pages beneath it, Who we serve, Customer
   stories, About, Contact. It is not to be expanded or subdivided.
   ========================================================================= */

export const pageSeeds: Page[] = [
  homePage,
  whatWeDoPage,
  buildingRecordPage,
  assessmentsPage,
  capitalPage,
  managedServicesPage,
  reportingPage,
  whoWeServePage,
  customerStoriesPage,
  aboutPage,
  contactPage,
];

export const pageSeedBySlug: Record<string, Page> = Object.fromEntries(
  pageSeeds.map((p) => [p.slug, p])
);
