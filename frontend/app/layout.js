import "./globals.css";
import BgVideo from "@/components/BgVideo";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Aos from "@/components/Aos";
import PluginInjector from "@/components/PluginInjector";
import FormRuntime from "@/components/FormRuntime";

export const metadata = {
  metadataBase: new URL("https://mindovermatterpodcasts.com"),
  title: {
    default: "Mind Over Matter | Official Podcast by Ashwin Gane",
    template: "%s | Mind Over Matter",
  },
  description: "Official podcast by Ashwin Gane. A 3D audio-visual journey into the mind.",
  icons: {
    icon: "https://mindovermatterpodcasts.com/images/logo.png",
    shortcut: "https://mindovermatterpodcasts.com/images/logo.png",
    apple: "https://mindovermatterpodcasts.com/images/logo.png",
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://mindovermatterpodcasts.com/images/logo.png" type="image/png" />
        <link rel="shortcut icon" href="https://mindovermatterpodcasts.com/images/logo.png" />
        <link rel="apple-touch-icon" href="https://mindovermatterpodcasts.com/images/logo.png" />
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
