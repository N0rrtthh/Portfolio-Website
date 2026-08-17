/**
 * Real brand marks for the tech stack.
 *
 * The cards previously rendered emoji stand-ins ("🍃" for MongoDB, "🎯" for
 * Dart), which read as decoration rather than as the actual toolchain. These
 * are the official logos from Devicon, served over jsDelivr so nothing needs
 * to be vendored into /public.
 *
 * Keys must match `TechItem.name` in `@/lib/data` exactly. Anything missing
 * from this map falls back to the emoji already on the item, so an unmapped
 * addition degrades instead of rendering a broken image.
 */
const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

export const TECH_ICON_URLS: Record<string, string> = {
  React: `${DEVICON}/react/react-original.svg`,
  "Next.js": `${DEVICON}/nextjs/nextjs-original.svg`,
  TypeScript: `${DEVICON}/typescript/typescript-original.svg`,
  "Tailwind CSS": `${DEVICON}/tailwindcss/tailwindcss-original.svg`,
  "Framer Motion": `${DEVICON}/framermotion/framermotion-original.svg`,
  // Devicon has no React Native mark; the React logo is the accepted stand-in.
  "React Native": `${DEVICON}/react/react-original.svg`,
  "Node.js": `${DEVICON}/nodejs/nodejs-original.svg`,
  Firebase: `${DEVICON}/firebase/firebase-plain.svg`,
  Supabase: `${DEVICON}/supabase/supabase-original.svg`,
  MongoDB: `${DEVICON}/mongodb/mongodb-original.svg`,
  MySQL: `${DEVICON}/mysql/mysql-original.svg`,
  Flutter: `${DEVICON}/flutter/flutter-original.svg`,
  Dart: `${DEVICON}/dart/dart-original.svg`,
  Godot: `${DEVICON}/godot/godot-original.svg`,
  Blender: `${DEVICON}/blender/blender-original.svg`,
  Figma: `${DEVICON}/figma/figma-original.svg`,
  "After Effects": `${DEVICON}/aftereffects/aftereffects-original.svg`,
  Git: `${DEVICON}/git/git-original.svg`,
  "VS Code": `${DEVICON}/vscode/vscode-original.svg`,
  Vercel: `${DEVICON}/vercel/vercel-original.svg`,
};

export function techIconUrl(name: string): string | undefined {
  return TECH_ICON_URLS[name];
}
