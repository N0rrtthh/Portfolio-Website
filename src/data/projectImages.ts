import type { StaticImageData } from "next/image";

import resumakerImg from "@/../public/projects/resumaker.png";
import jasfocusImg from "@/../public/projects/jasfocus.png";
import wavelengthImg from "@/../public/projects/wavelength.png";

/* ══════════════════════════════════════════════════════════
   PROJECT IMAGES — one shared, build-verified source
   ──────────────────────────────────────────────────────────
   Why static imports and not the `image: "/projects/x.png"`
   strings that used to live in lib/data.ts:

   · `images.unoptimized` + a raw string src means Next emits the
     path verbatim. Under the GitHub Pages basePath the browser
     then requests /projects/x.png instead of
     /Portfolio-Website/projects/x.png → 404 → broken image.
     That is exactly why EVA (static imports) worked and Classic
     (strings) did not.
   · A static import is resolved by the bundler, so the basePath is
     baked in *and* a missing file becomes a build error instead of
     a silent 404 in production.

   Keyed by Project.id so both layouts read the same map — no
   duplicated asset lists to drift apart.
   ══════════════════════════════════════════════════════════ */

export const PROJECT_IMAGES: Record<string, StaticImageData> = {
  resumaker: resumakerImg,
  jasfocus: jasfocusImg,
  wavelength: wavelengthImg,
};

export function getProjectImage(id: string): StaticImageData | undefined {
  return PROJECT_IMAGES[id];
}
