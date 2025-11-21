import type { Metadata } from "next";
import localFont from "next/font/local";
import "@swapparel/shad-ui/globals.css";
import Providers from "./_components/providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Swapparel",
  description: "Swapparel is a clothes exchange service!", // TODO: make this better
};

const reactScanEnabled = false;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>{reactScanEnabled && <script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" />}</head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* TODO: use theme provider */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
