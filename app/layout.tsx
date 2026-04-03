import type { Metadata } from "next";
import { DM_Sans, IM_Fell_DW_Pica } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const imFellDWPica = IM_Fell_DW_Pica({
  variable: "--font-im-fell-dw-pica",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "José Vitola - Cantautor y compositor musical",
  description: "Cantautor y compositor musical. Artista interdisciplinario. Bienvenido a mi sitio personal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${imFellDWPica.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
