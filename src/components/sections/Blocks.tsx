import Link from "next/link";

import { Modules, accentVar } from "@/components/brand/Modules";
import { AreaIcon } from "@/components/brand/AreaIcon";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import type {
  AreaListSection,
  BandSection,
  CardGridSection,
  CaseStudiesSection,
  ContactDetailsSection,
  CtaSection,
  FounderNoteSection,
  ImpactSection,
  LifecycleSection,
  ListSection,
  PageHeroSection,
  ProseSection,
  QuoteSection,
  ServiceBlocksSection,
  ServiceIndexSection,
  ImagePatternSection,
  SplitProseSection,
  StepsSection,
} from "@/lib/types";

/* ============================================================================
   Section renderers.

   One component per section type in the schema. Each reads its colours from
   the surface context its wrapper declared, so a block is correct on Ink, on
   Card and on Halite without knowing which it is on.
   ========================================================================= */

/* --- Page hero ------------------------------------------------------------ */

export function PageHero({ data }: { data: PageHeroSection }) {
  const accent = accentVar[data.accent];
  const hasImage = Boolean(data.image?.src);

  return (
    <section className="pagehero" style={{ ["--accent" as string]: accent }}>
      <div className="wrap pagehero__grid">
        <Reveal kind="up" amount={0}>
          <p className="eyebrow">{data.eyebrow}</p>
          <h1 className="h1-page">{data.title}</h1>
          <p className="lede">{data.lede}</p>
        </Reveal>

        {hasImage ? (
          <div className="pagehero__art" style={{ borderRadius: "var(--radius-card)", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.image!.src} alt={data.image!.alt} loading="eager" decoding="async" />
          </div>
        ) : data.showModules ? (
          <Reveal kind="scale" delay={0.12} amount={0} className="pagehero__art">
            <Modules accent={data.accent} />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

/* --- Prose ---------------------------------------------------------------- */

export function Prose({ data }: { data: ProseSection }) {
  return (
    <section className="section">
      <div className="wrap">
        <Reveal kind="up">
          {data.eyebrow ? <p className="eyebrow">{data.eyebrow}</p> : null}
          {data.title ? (
            <h2 className="h2" style={{ marginTop: data.eyebrow ? "var(--space-4)" : 0 }}>
              {data.title}
              {data.duotoneTail ? <span className="secondary"> {data.duotoneTail}</span> : null}
            </h2>
          ) : null}
        </Reveal>
        <Reveal kind="up" delay={0.08} style={{ marginTop: "var(--space-6)" }}>
          {data.paras.map((p, i) => (
            <p key={i} className="body" style={i > 0 ? { marginTop: "var(--space-5)" } : undefined}>
              {p}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* --- Split prose: problem on one side, position on the other -------------- */

export function SplitProse({ data }: { data: SplitProseSection }) {
  return (
    <section className="section">
      <div className="wrap split--lead">
        <Reveal kind="left">
          {data.eyebrow ? <p className="eyebrow">{data.eyebrow}</p> : null}
          <h2 className="h2" style={{ marginTop: data.eyebrow ? "var(--space-4)" : 0 }}>
            {data.title}
          </h2>
          <div style={{ marginTop: "var(--space-5)" }}>
            {data.paras.map((p, i) => (
              <p key={i} className="body" style={i > 0 ? { marginTop: "var(--space-5)" } : undefined}>
                {p}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal kind="right" delay={0.1} style={{ borderTop: "1px solid var(--line-strong)", paddingTop: "var(--space-5)" }}>
          {data.asideTitle ? <h3 className="h3">{data.asideTitle}</h3> : null}
          <div style={{ marginTop: "var(--space-4)" }}>
            {data.asideParas.map((p, i) => (
              <p
                key={i}
                className="body--sm secondary"
                style={i > 0 ? { marginTop: "var(--space-4)" } : undefined}
              >
                {p}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --- Card grid ------------------------------------------------------------ */

export function CardGrid({ data }: { data: CardGridSection }) {
  return (
    <section className="section">
      <div className="wrap">
        {data.eyebrow ? <p className="eyebrow">{data.eyebrow}</p> : null}
        {data.title ? (
          <h2 className="h2 h2--wide" style={{ marginTop: data.eyebrow ? "var(--space-4)" : 0 }}>
            {data.title}
          </h2>
        ) : null}
        {data.intro ? (
          <p className="body secondary" style={{ marginTop: "var(--space-4)" }}>
            {data.intro}
          </p>
        ) : null}

        <RevealGroup
          className={`cards${data.accentKeyline ? "" : " cards--tint"}`}
          style={{ marginTop: "var(--space-7)" }}
        >
          {data.cards.map((card) => {
            const style = { ["--accent" as string]: accentVar[card.accent] };
            const className = `card${data.accentKeyline && card.accent !== "none" ? " card--accent" : ""}`;
            const inner = (
              <>
                {card.image?.src ? (
                  <span className="card__fig">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={card.image.src} alt={card.image.alt} loading="lazy" decoding="async" />
                  </span>
                ) : null}
                {data.accentKeyline && card.accent !== "none" ? (
                  <AreaIcon accent={card.accent} size={40} className="card__icon" />
                ) : null}
                <h3 className="card__title">{card.title}</h3>
                <p className="card__body">{card.body}</p>
                {card.tag ? <p className="tag card__tag">{card.tag}</p> : null}
                {card.href ? <span className="card__go" aria-hidden="true" /> : null}
              </>
            );

            return (
              <RevealItem key={card.id}>
                {card.href ? (
                  <Link href={card.href} className={className} style={style}>
                    {inner}
                  </Link>
                ) : (
                  <div className={className} style={style}>
                    {inner}
                  </div>
                )}
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}

/* --- Area list ------------------------------------------------------------ */

export function AreaList({ data }: { data: AreaListSection }) {
  return (
    <section className="section">
      <div className="wrap">
        {data.eyebrow ? <p className="eyebrow">{data.eyebrow}</p> : null}
        {data.title ? (
          <h2 className="h2" style={{ marginTop: data.eyebrow ? "var(--space-4)" : 0 }}>
            {data.title}
          </h2>
        ) : null}
        {data.intro?.map((p, i) => (
          <p key={i} className="body secondary" style={{ marginTop: "var(--space-4)" }}>
            {p}
          </p>
        ))}

        <RevealGroup stagger={0.1} style={{ marginTop: "var(--space-7)" }}>
          {data.areas.map((area) => (
            <RevealItem key={area.id} className="area" style={{ ["--accent" as string]: accentVar[area.accent] }}>
              <div>
                <AreaIcon accent={area.accent} size={40} className="area__icon" />
                <h3 className="area__name area__name--icon">{area.name}</h3>
                <p className="area__lead">{area.lead}</p>
              </div>
              <div>
                <p className="area__body">{area.body}</p>
                <div className="area__foot">
                  {area.tag ? <span className="tag">{area.tag}</span> : null}
                  {area.href ? (
                    <Link href={area.href} className="arrow-link">
                      {area.name}
                    </Link>
                  ) : null}
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* --- Service blocks: Application and Outcome ------------------------------ */

export function ServiceBlocks({ data }: { data: ServiceBlocksSection }) {
  return (
    <section className="section" style={{ ["--accent" as string]: accentVar[data.accent] }}>
      <div className="wrap">
        {data.eyebrow ? <p className="eyebrow">{data.eyebrow}</p> : null}
        {data.title ? <h2 className="h2">{data.title}</h2> : null}

        {data.services.map((svc) => (
          <article key={svc.id} className="svc">
            <header className="svc__head">
              <h2 className="svc__name">{svc.name}</h2>
              <p className="body secondary" style={{ maxWidth: "56ch" }}>
                {svc.lead}
              </p>
            </header>

            <div className="svc__cols">
              <div>
                <h3 className="svc__coltitle">Application</h3>
                <ul className="hlist">
                  {svc.application.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="svc__coltitle">Outcome</h3>
                <ul className="hlist">
                  {svc.outcome.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* --- Service index: the "Consulting Areas" panel -------------------------- */

export function ServiceIndex({ data }: { data: ServiceIndexSection }) {
  return (
    <section className="section">
      <div className="wrap">
        <Reveal kind="up">
          {data.eyebrow ? <p className="eyebrow">{data.eyebrow}</p> : null}
          <h2 className="h2 h2--wide" style={{ marginTop: data.eyebrow ? "var(--space-4)" : 0 }}>
            {data.title}
          </h2>
          {data.intro ? (
            <p className="body secondary" style={{ marginTop: "var(--space-4)" }}>
              {data.intro}
            </p>
          ) : null}
        </Reveal>

        <RevealGroup className="sindex" stagger={0.06} style={{ marginTop: "var(--space-7)" }}>
          {data.items.map((item) => (
            <RevealItem key={item.id}>
              <Link
                href={item.href}
                className="sitem"
                style={{ ["--accent" as string]: accentVar[item.accent] }}
              >
                <AreaIcon accent={item.accent} size={34} className="sitem__icon" />
                <span className="sitem__text">
                  <span className="sitem__title">{item.title}</span>
                  <span className="sitem__lead">{item.lead}</span>
                </span>
                <span className="sitem__go" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 18 18" focusable="false">
                    <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square">
                      <path d="M2 9h13" />
                      <path d="M10 4l5 5-5 5" />
                    </g>
                  </svg>
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* --- Numbered principles -------------------------------------------------- */

export function Steps({ data }: { data: StepsSection }) {
  return (
    <section className="section" style={{ ["--accent" as string]: accentVar[data.accent] }}>
      <div className="wrap">
        {data.eyebrow ? <p className="eyebrow">{data.eyebrow}</p> : null}
        {data.title ? (
          <h2 className="h2" style={{ marginTop: data.eyebrow ? "var(--space-4)" : 0 }}>
            {data.title}
          </h2>
        ) : null}

        <RevealGroup stagger={0.09} className="steps" style={{ marginTop: "var(--space-7)" }}>
          {data.steps.map((step, i) => (
            <RevealItem key={step.id} className="step">
              <div className="step__n">{String(i + 1).padStart(2, "0")}</div>
              <div>
                <h3 className="step__t">{step.title}</h3>
                <p className="step__b">{step.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* --- What we provide ------------------------------------------------------ */

export function ListBlock({ data }: { data: ListSection }) {
  const grouped = data.groups.length > 1;

  return (
    <section className="section" style={{ ["--accent" as string]: accentVar[data.accent] }}>
      <div className="wrap">
        {data.eyebrow ? <p className="eyebrow">{data.eyebrow}</p> : null}
        {data.title ? <h2 className="h2">{data.title}</h2> : null}
        {data.intro ? (
          <p className="body secondary" style={{ marginTop: "var(--space-4)" }}>
            {data.intro}
          </p>
        ) : null}

        <div
          style={{
            marginTop: "var(--space-6)",
            display: "grid",
            gap: grouped ? "var(--space-6)" : 0,
            gridTemplateColumns: grouped ? "repeat(auto-fit, minmax(300px, 1fr))" : "1fr",
          }}
        >
          {data.groups.map((group) => (
            <div key={group.id}>
              {group.title ? <h3 className="svc__coltitle">{group.title}</h3> : null}
              <ul className="hlist">
                {group.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Lifecycle ------------------------------------------------------------ */

export function Lifecycle({ data }: { data: LifecycleSection }) {
  return (
    <section className="section" style={{ background: "var(--recessed)" }}>
      <div className="wrap">
        {data.eyebrow ? <p className="eyebrow">{data.eyebrow}</p> : null}
        {data.title ? (
          <h2 className="h2 h2--wide" style={{ marginTop: data.eyebrow ? "var(--space-4)" : 0 }}>
            {data.title}
          </h2>
        ) : null}

        <RevealGroup className="cards cards--band" style={{ marginTop: "var(--space-7)" }}>
          {data.items.map((item, i) => (
            <RevealItem key={item.id} className="card">
              <span className="tag">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="card__title">{item.title}</h3>
              <p className="card__body">{item.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* --- Case studies --------------------------------------------------------- */

export function CaseStudies({ data }: { data: CaseStudiesSection }) {
  return (
    <section className="section" style={{ ["--accent" as string]: accentVar[data.accent] }}>
      <div className="wrap">
        {data.eyebrow ? <p className="eyebrow">{data.eyebrow}</p> : null}
        {data.title ? <h2 className="h2">{data.title}</h2> : null}
        {data.intro ? (
          <p className="body secondary" style={{ marginTop: "var(--space-4)" }}>
            {data.intro}
          </p>
        ) : null}

        {data.cases.map((c) => (
          <Reveal as="article" key={c.id} className="case" amount={0.12}>
            <div className="case__top">
              <div className="case__fig">
                {c.image.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image.src} alt={c.image.alt} loading="lazy" decoding="async" />
                ) : (
                  <div style={{ display: "grid", placeItems: "center", height: "100%", padding: "12%" }}>
                    <Modules accent={data.accent} />
                  </div>
                )}
              </div>

              <div>
                <h2 className="case__name">{c.client}</h2>
                <p className="case__lead">{c.lead}</p>

                {c.stats.length ? (
                  <div className="stats">
                    {c.stats.map((s) => (
                      <div key={s.id} className="stat">
                        <div className="stat__v">{s.value}</div>
                        <div className="stat__l">{s.label}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div style={{ marginTop: "var(--space-6)" }}>
              <div className="caserow">
                <div className="caserow__label">Challenge</div>
                <div>{c.challenge}</div>
              </div>
              <div className="caserow">
                <div className="caserow__label">Approach</div>
                <div>{c.approach}</div>
              </div>
              <div className="caserow">
                <div className="caserow__label">Results</div>
                <div>{c.results}</div>
              </div>
            </div>

            {c.tags.length ? (
              <div className="case__tags">
                {c.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            {c.quote ? (
              <blockquote className="quote" style={{ marginTop: "var(--space-6)" }}>
                <p className="quote__t">{c.quote.text}</p>
                <footer className="quote__a">{c.quote.attribution}</footer>
              </blockquote>
            ) : null}
          </Reveal>
        ))}

        {data.showGapSlot ? (
          <div className="gapbox" style={{ marginTop: "var(--space-7)" }}>
            {data.gapSlotNote}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* --- Image pattern -------------------------------------------------------- */

export function ImagePattern({ data }: { data: ImagePatternSection }) {
  return (
    <section className="section ipattern" style={{ ["--accent" as string]: accentVar[data.accent] }}>
      <div className="wrap ipattern__grid">
        <Reveal kind="left" className="ipattern__figs">
          <figure className="ipattern__a">
            {data.imageA.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.imageA.src} alt={data.imageA.alt} loading="lazy" decoding="async" />
            ) : (
              <Modules accent={data.accent} />
            )}
          </figure>
          <figure className="ipattern__b">
            {data.imageB.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.imageB.src} alt={data.imageB.alt} loading="lazy" decoding="async" />
            ) : (
              <Modules accent={data.accent} />
            )}
          </figure>
        </Reveal>

        <Reveal kind="right" delay={0.1}>
          {data.eyebrow ? <p className="eyebrow">{data.eyebrow}</p> : null}
          <h2 className="h2" style={{ marginTop: data.eyebrow ? "var(--space-4)" : 0 }}>
            {data.title}
          </h2>
          {data.paras.map((p, i) => (
            <p key={i} className="body--sm secondary" style={{ marginTop: "var(--space-4)" }}>
              {p}
            </p>
          ))}

          {data.items.length ? (
            <ul className="hlist" style={{ marginTop: "var(--space-6)" }}>
              {data.items.map((it) => (
                <li key={it.id}>{it.text}</li>
              ))}
            </ul>
          ) : null}

          {data.link?.href ? (
            <Link href={data.link.href} className="arrow-link" style={{ marginTop: "var(--space-5)" }}>
              {data.link.label}
            </Link>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

/* --- Pull quote ----------------------------------------------------------- */

export function Quote({ data }: { data: QuoteSection }) {
  return (
    <section className="section--tight section">
      <div className="wrap">
        <blockquote className="quote" style={{ ["--accent" as string]: accentVar[data.accent] }}>
          <p className="quote__t">{data.text}</p>
          <footer className="quote__a">{data.attribution}</footer>
        </blockquote>
      </div>
    </section>
  );
}

/* --- Statement band ------------------------------------------------------- */

export function Band({ data }: { data: BandSection }) {
  const naples = data.variant === "naples";
  return (
    <section className={`band${naples ? " band--naples" : ""}`}>
      <div className="wrap">
        <Reveal kind="up">
          <p className="band__t">{data.title}</p>
          <p className="band__s secondary">{data.support}</p>
          {data.cta?.href ? (
            <Link
              href={data.cta.href}
              className={`btn ${naples ? "btn--ink" : "btn--primary"}`}
              style={{ marginTop: "var(--space-6)" }}
            >
              {data.cta.label}
            </Link>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

/* --- Founder's note ------------------------------------------------------- */

export function FounderNote({ data }: { data: FounderNoteSection }) {
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow">{data.eyebrow}</p>
        <h2
          className="h2 duotone"
          style={{ marginTop: "var(--space-5)", maxWidth: "30ch", fontSize: "var(--type-band)" }}
        >
          {data.title} <em>{data.titleTail}</em>
        </h2>

        <div className="note__cols">
          <div>
            {data.left.map((p, i) => (
              <p key={i} style={i > 0 ? { marginTop: "var(--space-4)" } : undefined}>
                {p}
              </p>
            ))}
          </div>
          <div>
            {data.right.map((p, i) => (
              <p key={i} style={i > 0 ? { marginTop: "var(--space-4)" } : undefined}>
                {p}
              </p>
            ))}

            <div className="note__sign">
              {data.signature?.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.signature.src} alt={data.signature.alt} style={{ maxHeight: 64 }} />
              ) : null}
              <span className="note__name">{data.name}</span>
              <span className="note__role">{data.role}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- Team impact ---------------------------------------------------------- */

export function Impact({ data }: { data: ImpactSection }) {
  return (
    <section className="section" style={{ background: "var(--recessed)" }}>
      <div className="wrap">
        <div className="split--lead">
          <div>
            <p className="eyebrow">{data.eyebrow}</p>
            <h2 className="h2" style={{ marginTop: "var(--space-4)" }}>
              {data.title}
            </h2>
            <p className="body secondary" style={{ marginTop: "var(--space-4)" }}>
              {data.lede}
            </p>
          </div>
          <div>
            {data.paras.map((p, i) => (
              <p
                key={i}
                className="body--sm secondary"
                style={i > 0 ? { marginTop: "var(--space-4)" } : undefined}
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Figures as a hairline row, each carrying the record it came from.
            No figure is published here without a source. */}
        <div className="stats" style={{ marginTop: "var(--space-7)" }}>
          {data.stats.map((s) => (
            <div key={s.id} className="stat">
              <div className="stat__v">{s.value}</div>
              <div className="stat__l">{s.label}</div>
              <div className="stat__src">{s.source}</div>
            </div>
          ))}
        </div>

        {data.clients.length ? (
          <div style={{ marginTop: "var(--space-7)" }}>
            <p className="eyebrow">{data.clientsNote}</p>
            <ul
              className="row"
              style={{ marginTop: "var(--space-4)", gap: "var(--space-3) var(--space-6)" }}
            >
              {data.clients.map((c) => (
                <li key={c.id} className="body--sm secondary">
                  {c.name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* --- Contact details ------------------------------------------------------ */

export function ContactDetails({ data }: { data: ContactDetailsSection }) {
  return (
    <section className="section--tight section">
      <div className="wrap">
        <h2 className="h3">{data.title}</h2>
        <div style={{ marginTop: "var(--space-4)" }}>
          {data.lines.map((line) => (
            <p key={line} className="body--sm secondary">
              {line}
            </p>
          ))}
        </div>
        <div className="row" style={{ marginTop: "var(--space-5)", gap: "var(--space-5)" }}>
          <a className="link-inline" href={`mailto:${data.email}`}>
            {data.email}
          </a>
          <a className="link-inline" href={`tel:${data.phone.replace(/\s/g, "")}`}>
            {data.phone}
          </a>
          <a className="link-inline" href={`https://${data.website}`} target="_blank" rel="noreferrer noopener">
            {data.website}
          </a>
          <a
            className="link-inline"
            href={`https://${data.linkedin}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            {data.linkedin}
          </a>
        </div>
      </div>
    </section>
  );
}

/* --- Closing call to action ----------------------------------------------- */

export function CtaBlock({ data }: { data: CtaSection }) {
  const cls =
    data.style === "primary" ? "btn--primary" : data.style === "ink" ? "btn--ink" : "btn--oncard";

  // With no heading or body this is the quiet strip that carries the button
  // below a statement band, and it should not reserve space it does not use.
  const bare = !data.title.trim() && !data.body.trim();

  return (
    <section className={bare ? "section--tight section" : "section"}>
      <div className="wrap">
        {bare ? null : (
          <Reveal kind="up">
            <h2 className="h2">{data.title}</h2>
            {data.body.trim() ? (
              <p className="body secondary" style={{ marginTop: "var(--space-4)" }}>
                {data.body}
              </p>
            ) : null}
          </Reveal>
        )}
        <Reveal kind="up" delay={bare ? 0 : 0.1} style={bare ? undefined : { marginTop: "var(--space-6)" }}>
          <Link href={data.cta.href} className={`btn ${cls}`}>
            {data.cta.label}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
