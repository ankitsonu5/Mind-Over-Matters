import "./globals.css";
import BgVideo from "@/components/BgVideo";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Aos from "@/components/Aos";
import PluginInjector from "@/components/PluginInjector";
import FormRuntime from "@/components/FormRuntime";
import { SITE_URL } from "@/lib/seo";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mind Over Matter | Official Podcast by Ashwin Gane",
    template: "%s | Mind Over Matter",
  },
  description: "Official podcast by Ashwin Gane. A 3D audio-visual journey into the mind.",
  icons: {
    icon: `${SITE_URL}/images/logo.png`,
    shortcut: `${SITE_URL}/images/logo.png`,
    apple: `${SITE_URL}/images/logo.png`,
  },
  openGraph: {
    siteName: "Mind Over Matter",
    title: "Mind Over Matter | Official Podcast by Ashwin Gane",
    description: "Official podcast by Ashwin Gane. A 3D audio-visual journey into the mind.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mind Over Matter | Official Podcast by Ashwin Gane",
    description: "Official podcast by Ashwin Gane. A 3D audio-visual journey into the mind.",
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={`${SITE_URL}/images/logo.png`} type="image/png" />
        <link rel="shortcut icon" href={`${SITE_URL}/images/logo.png`} />
        <link rel="apple-touch-icon" href={`${SITE_URL}/images/logo.png`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;800&family=Sora:wght@300;400;500&family=Spline+Sans+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=Bebas+Neue&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <BgVideo />
        <Nav />
        {children}
        <Footer />
        <Aos />
        <FormRuntime />
        <PluginInjector />
      </body>
    </html>
  );
}
