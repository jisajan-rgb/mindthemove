import type { Metadata } from "next";
import { Source_Serif_4, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mind the Move",
    template: "%s · Mind the Move",
  },
  description:
    "Trust-first conveyancing directory. Reviews unlock after completion. Request a named-lawyer shortlist for Bristol.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className={`${sans.variable} ${serif.variable} font-sans min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
