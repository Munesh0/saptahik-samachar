import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "साप्ताहिक समाचार - भद्रपुर, झापा",
    template: "%s | साप्ताहिक समाचार",
  },
  description:
    "झापा जिल्लाको भद्रपुरबाट प्रकाशित हुने साप्ताहिक अनलाइन समाचार पत्रिका। स्थीय समाचार, खेलकुद, शिक्षा, स्वास्थ्य र अन्तर्राष्ट्रिय समाचारको विश्वसनीय स्रोत।",
  keywords: [
    "साप्ताहिक समाचार",
    "भद्रपुर समाचार",
    "झापा समाचार",
    "नेपाल समाचार",
    "मेची समाचार",
  ],
  authors: [{ name: "साप्ताहिक समाचार" }],
  metadataBase: new URL("https://saptahiksamachar.com.np"),
  openGraph: {
    type: "website",
    locale: "ne_NP",
    url: "https://saptahiksamachar.com.np",
    siteName: "साप्ताहिक समाचार",
    title: "साप्ताहिक समाचार - भद्रपुर, झापा",
    description:
      "झापा जिल्लाको भद्रपुरबाट प्रकाशित हुने साप्ताहिक अनलाइन समाचार पत्रिका।",
  },
  twitter: {
    card: "summary_large_image",
    title: "साप्ताहिक समाचार - भद्रपुर, झापा",
    description:
      "झापा जिल्लाको भद्रपुरबाट प्रकाशित हुने साप्ताहिक अनलाइन समाचार पत्रिका।",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ne">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
