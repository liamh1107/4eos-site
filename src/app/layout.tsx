import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema } from "@/lib/schema";
import { site, addressLine } from "@/lib/site";
import { ChapterRail } from "@/components/layout/ChapterRail";
import { Trail } from "@/components/layout/Trail";
import { GlassGlow } from "@/components/layout/GlassGlow";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Beacon } from "@/components/analytics/Beacon";
import { SignalClient } from "@/components/signal/SignalClient";
import "./globals.css";

/* Archivo carries a width axis, so one family covers both the condensed
   display setting and the airier wide setting. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Managed IT, cybersecurity, and compliance in Fort Wayne`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | Managed IT, cybersecurity, and compliance in Fort Wayne`,
    description: site.description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: {
    icon: "/brand/4eos-icon.svg",
    apple: "/brand/4eos-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${instrument.variable} ${geistMono.variable}`}
    >
      <body>
        <JsonLd data={organizationSchema()} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-gold focus:px-4 focus:py-2 focus:text-ink focus:micro"
        >
          Skip to content
        </a>
        <Beacon />
        <SmoothScroll />
        <Trail />
        <SignalClient />
        <GlassGlow />
        <ChapterRail />
        <div aria-hidden="true" className="film-grain" />
        {children}
        <span className="sr-only">{addressLine}</span>
      </body>
    </html>
  );
}
