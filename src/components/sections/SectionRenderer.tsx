import type { Ground, Section } from "@/lib/types";

import { HomeHero } from "./HomeHero";
import { ContactForm } from "./ContactForm";
import { TeamGrid } from "./TeamGrid";
import {
  AreaList,
  Band,
  CardGrid,
  CaseStudies,
  ContactDetails,
  CtaBlock,
  FounderNote,
  Impact,
  Lifecycle,
  ListBlock,
  PageHero,
  Prose,
  Quote,
  ServiceBlocks,
  ServiceIndex,
  ImagePattern,
  Testimonials,
  LogoStrip,
  SplitProse,
  Steps,
} from "./Blocks";

/* ============================================================================
   Section dispatcher.

   Each section declares its ground once here, as a surface-context class.
   Everything inside then reads its text, line and call-to-action colours from
   that declaration, which is what keeps an Ink block from ever inheriting
   Halite values or the reverse.
   ========================================================================= */

const groundClass: Record<Ground, string> = {
  // The module lattice stays on the hero, where it sits over a photograph.
  // On a flat Ink ground it read as banding rather than as texture.
  ink: "on-ink",
  card: "on-card",
  page: "on-page",
  halite: "on-halite",
};

export function SectionRenderer({ section }: { section: Section }) {
  if (!section.visible) return null;

  const body = section.body;

  // The home hero owns its own ground and frame offset.
  if (body.type === "homeHero") {
    return <HomeHero data={body} />;
  }

  const inner = (() => {
    switch (body.type) {
      case "pageHero":
        return <PageHero data={body} />;
      case "prose":
        return <Prose data={body} />;
      case "splitProse":
        return <SplitProse data={body} />;
      case "cardGrid":
        return <CardGrid data={body} />;
      case "areaList":
        return <AreaList data={body} />;
      case "serviceBlocks":
        return <ServiceBlocks data={body} />;
      case "serviceIndex":
        return <ServiceIndex data={body} />;
      case "imagePattern":
        return <ImagePattern data={body} />;
      case "testimonials":
        return <Testimonials data={body} />;
      case "logoStrip":
        return <LogoStrip data={body} />;
      case "steps":
        return <Steps data={body} />;
      case "list":
        return <ListBlock data={body} />;
      case "caseStudies":
        return <CaseStudies data={body} />;
      case "quote":
        return <Quote data={body} />;
      case "band":
        return <Band data={body} />;
      case "founderNote":
        return <FounderNote data={body} />;
      case "team":
        return <TeamGrid data={body} />;
      case "impact":
        return <Impact data={body} />;
      case "lifecycle":
        return <Lifecycle data={body} />;
      case "contactForm":
        return <ContactForm data={body} />;
      case "contactDetails":
        return <ContactDetails data={body} />;
      case "cta":
        return <CtaBlock data={body} />;
      default: {
        // Exhaustiveness: a new section type must be handled here.
        const never: never = body;
        return never;
      }
    }
  })();

  return (
    <div className={groundClass[section.ground]} id={section.id}>
      {inner}
    </div>
  );
}
