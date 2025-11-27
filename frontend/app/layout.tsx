import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xeno Analytics - Shopify Insights",
  description: "Multi-tenant Shopify data ingestion and insights platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
