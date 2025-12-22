import type { Metadata } from "next";
import localFont from "next/font/local";
import "@swapparel/shad-ui/globals.css";
import Providers from "./_components/providers";

const geistSans = localFont({
  src: "./_fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./_fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Swapparel - Sustainable Fashion Through Clothes Swapping",
    template: "%s | Swapparel",
  },
  description:
    "Transform your wardrobe sustainably with Swapparel. Exchange clothes with others, refresh your style, and reduce fashion waste. Join our community of eco-conscious fashion lovers today!",
  keywords: [
    "clothes exchange",
    "fashion swap",
    "sustainable fashion",
    "clothing trade",
    "eco-friendly wardrobe",
    "secondhand clothes",
    "fashion community",
  ],
  authors: [
    { name: "Swapparel" },
    { name: "Shreyas Ayyengar", url: "https://shreyasayyengar.dev" },
    { name: "Alex Lin" },
    { name: "Gerardo Juarez" },
  ],
  creator: "Swapparel",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://swapparel.app",
    title: "Swapparel - Sustainable Fashion Through Clothes Swapping",
    description:
      "Transform your wardrobe sustainably with Swapparel. Exchange clothes with others, refresh your style, and reduce fashion waste.",
    siteName: "Swapparel",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swapparel - Sustainable Fashion Through Clothes Swapping",
    description:
      "Transform your wardrobe sustainably with Swapparel. Exchange clothes with others, refresh your style, and reduce fashion waste.",
    creator: "@swapparel",
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

// const reactScanEnabled = env.NEXT_PUBLIC_NODE_ENV === "development";
const reactScanEnabled = true;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app */}
      <head>{reactScanEnabled && <script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" />}</head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
