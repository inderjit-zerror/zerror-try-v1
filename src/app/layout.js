import { Inter_Tight, Archivo } from "next/font/google";
import "./globals.css";

// Stand-ins for the brand faces. If Alt Riviera / Roc Grotesk are installed
// locally they win, see the font stacks in globals.css.
const display = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const ui = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata = {
  title: "Zerror Studios | Multidisciplinary Design Studio, Mumbai",
  description:
    "Zerror is a design-led tech studio in Mumbai building websites, eCommerce, custom software and brands. Systems. Structure. Precision.",
  openGraph: {
    title: "Zerror Studios",
    description: "Design and technology as one unified system. Websites, eCommerce, software and brand, built in Mumbai.",
    url: "https://www.zerrorstudios.com",
    siteName: "Zerror Studios",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#0000ff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-ui="blue">
      <body className={`${display.variable} ${ui.variable}`}>{children}</body>
    </html>
  );
}
