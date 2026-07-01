import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const template = process.env["NEXT_PUBLIC_TEMPLATE"] ?? "minimal";

const themeMap: Record<string, string> = {
  minimal: "/styles/themes/minimal.css",
  "dark-premium": "/styles/themes/dark-premium.css",
  "bold-color": "/styles/themes/bold-color.css",
};

export const metadata: Metadata = {
  title: {
    default: process.env["NEXT_PUBLIC_SHOP_NAME"] ?? "Ma Boutique",
    template: `%s | ${process.env["NEXT_PUBLIC_SHOP_NAME"] ?? "Ma Boutique"}`,
  },
  description: process.env["NEXT_PUBLIC_SHOP_DESCRIPTION"] ?? "Boutique en ligne",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeHref = themeMap[template] ?? themeMap["minimal"];

  return (
    <html
      lang="fr"
      className={`${inter.variable} ${cormorant.variable} ${poppins.variable}`}
    >
      <head>
        <link rel="stylesheet" href={themeHref} />
      </head>
      <body className="min-h-screen flex flex-col bg-surface text-text-base">
        {children}
      </body>
    </html>
  );
}
