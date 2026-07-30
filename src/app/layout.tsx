import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono, Outfit, Bebas_Neue } from "next/font/google";
import "./globals.css";
import {
  NO_FLASH_THEME_SCRIPT,
  ThemeProvider,
} from "@/components/providers/ThemeProvider";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Elroni Quiñones (ron) — Software Engineer & Creative Developer",
  description:
    "Portfolio of Elroni Quiñones (ron) — a software engineer, full-stack developer, and creative technologist who builds digital experiences at the intersection of design and engineering.",
  keywords: [
    "Elroni Quiñones",
    "ron",
    "Software Engineer",
    "Full Stack Developer",
    "Creative Developer",
    "UI/UX Designer",
    "React Developer",
    "Flutter Developer",
    "Portfolio",
    "Game Developer",
  ],
  authors: [{ name: "Elroni Quiñones (ron)" }],
  creator: "Elroni Quiñones",
  icons: {
    icon: [
      {
        url: "/Favicon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: "/Favicon.png",
    apple: "/Favicon.png",
  },
  metadataBase: new URL("https://elroniquinones.dev"),
  openGraph: {
    title: "Elroni Quiñones (ron) — Software Engineer & Creative Developer",
    description:
      "I build digital experiences at the intersection of design and engineering. Explore my work.",
    url: "https://elroniquinones.dev",
    siteName: "Elroni Quiñones (ron)",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elroni Quiñones (ron) — Software Engineer & Creative Developer",
    description:
      "I build digital experiences at the intersection of design and engineering.",
    creator: "@skyl1nker390",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${outfit.variable} ${syne.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="no-flash-theme-script"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }}
        />
      </head>
      <body className="min-h-screen bg-void text-pearl antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          {/* Film grain noise overlay */}
          <div className="noise-overlay" aria-hidden="true" />
        </ThemeProvider>
      </body>
    </html>
  );
}
