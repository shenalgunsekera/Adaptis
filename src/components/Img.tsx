import NextImage from "next/image";

import blurMap from "@/content/blur.json";

/* ============================================================================
   Image.

   Every photograph on the site goes through here rather than through a raw
   <img>, so each one is served as AVIF or WebP at the size the layout
   actually needs, with a blurred placeholder standing in until it arrives.

   The placeholder matters more than it looks: the layout is reserved and
   something is painted immediately, so nothing reflows and no box sits empty
   while a photograph downloads.

   `priority` marks the one image that is the largest thing above the fold.
   It is preloaded and never lazy-loaded. Exactly one per page should carry
   it — everything else stays lazy.
   ========================================================================= */

const BLUR = blurMap as Record<string, string>;

export interface ImgProps {
  src: string;
  alt: string;
  /** Layout hint for the browser's srcset picking. */
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Renders into a positioned parent rather than carrying its own box. */
  fill?: boolean;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

const QUALITY = 70;

export function Img({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  className,
  fill = true,
  width,
  height,
  style,
}: ImgProps) {
  if (!src) return null;

  const blurDataURL = BLUR[src];
  const placeholder = blurDataURL ? ("blur" as const) : ("empty" as const);

  if (fill) {
    return (
      <NextImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        quality={QUALITY}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={className}
        style={{ objectFit: "cover", ...style }}
      />
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width ?? 1200}
      height={height ?? 800}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      quality={QUALITY}
        placeholder={placeholder}
      blurDataURL={blurDataURL}
      className={className}
      style={style}
    />
  );
}
