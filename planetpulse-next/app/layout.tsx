import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script"; // ✅ necessário!

export const metadata: Metadata = {
  title: "Planet Pulse",
  description: "Isep PESTI generated app",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Googlisso já aqui estáe Analytics */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-030899MYKY"></Script>
        <Script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-030899MYKY');
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
