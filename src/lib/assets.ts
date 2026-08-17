/* ══════════════════════════════════════════════════════════
   ASSET PATHS
   ──────────────────────────────────────────────────────────
   The site deploys to GitHub Pages under a basePath. Next only
   rewrites basePath for *routed* URLs and statically-imported
   images — a raw string handed to <Image unoptimized> or <img>
   is emitted verbatim and 404s in production.

   Anything that lives in /public and is referenced by string
   must go through `asset()`. Prefer a static import where the
   file is known at build time (see data/projectImages.ts).
   ══════════════════════════════════════════════════════════ */

export const BASE_PATH =
  process.env.NODE_ENV === "production" ? "/Portfolio-Website" : "";

/** Prefix a /public path with the deployment basePath. */
export function asset(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${clean}`;
}
