import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google"; // Import Fonts

// 1. Configure Fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Syne({ subsets: ["latin"], weight: ["400", "700", "800"], variable: "--font-syne" });

export const metadata: Metadata = {
  title: "SARIONYX | Define Your Style",
  description: "Custom streetwear designed by you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${syne.variable} font-sans bg-black text-white antialiased`}>
        {/* We default to Black background for that "Premium" feel */}
        {children}
      </body>
    </html>
  );
}