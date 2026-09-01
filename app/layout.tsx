import type { Metadata } from "next";
import { Poppins, Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/shared/ConditionalLayout";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-poppins",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Momo - Platform belajar online untuk anak tuna netra.",
  description: "Platform belajar online yang aksesibel dan interaktif untuk anak tuna netra.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable} ${poppins.variable}`}>
      <body className="min-h-screen flex flex-col font-[family-name:var(--font-nunito)] antialiased">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}