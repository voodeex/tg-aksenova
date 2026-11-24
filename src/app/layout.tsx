import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { education } from "@/data/education";
import { profile, site } from "@/data/profile";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: "Аксёнова Т. Г. — Цифровое портфолио",
  authors: [{ name: profile.fullName }],
  keywords: [
    "Аксёнова Татьяна Геннадьевна",
    "Колледж информатики и программирования",
    "Финансовый университет",
    "кандидат педагогических наук",
    "преподаватель высшей квалификационной категории",
    "портфолио преподавателя",
    "цифровое образование",
  ],
  openGraph: {
    type: "profile",
    locale: "ru_RU",
    title: site.title,
    description: site.description,
    siteName: site.title,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#E9E9E7",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.fullName,
  AlternateName: profile.nameLatin,
  jobTitle: profile.title,
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "degree",
    name: profile.degree,
  },
  worksFor: {
    "@type": "CollegeOrUniversity",
    name: profile.institution,
  },
  alumniOf: education.map((e) => ({
    "@type": "CollegeOrUniversity",
    name: e.institution,
  })),
  email: `mailto:${profile.email}`,
  telephone: profile.phone,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-scene="light" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-[#C5B89A]/40 selection:text-[#171717]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-[#171717] focus:px-5 focus:py-2.5 focus:font-mono focus:text-xs focus:text-[#F5F2EB]"
        >
          Перейти к основному содержанию
        </a>
        {children}
      </body>
    </html>
  );
}
