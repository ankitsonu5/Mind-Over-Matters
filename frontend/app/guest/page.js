import GuestPageClient from "@/components/GuestPageClient";
import { SITE_URL, OG_IMAGE, PODCAST_NAME } from "@/lib/seo";

export const metadata = {
  title: "Become a Guest",
  description:
    "Apply to be a guest on Mind Over Matter with Ashwin Gane. Share your story with 50K+ global listeners — raw, unfiltered conversations recorded in studio or remote.",
  alternates: { canonical: `${SITE_URL}/guest` },
  openGraph: {
    title: `Become a Guest | ${PODCAST_NAME}`,
    description:
      "Apply to be a guest on Mind Over Matter with Ashwin Gane. Share your story with 50K+ global listeners.",
    url: `${SITE_URL}/guest`,
    type: "website",
    siteName: PODCAST_NAME,
    images: [{ url: OG_IMAGE, width: 1300, height: 732, alt: "Become a guest on Mind Over Matter" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Become a Guest | ${PODCAST_NAME}`,
    description:
      "Apply to be a guest on Mind Over Matter with Ashwin Gane. Share your story with 50K+ global listeners.",
    images: [OG_IMAGE],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Become a Guest — Mind Over Matter",
  url: `${SITE_URL}/guest`,
  description:
    "Apply to be a guest on the Mind Over Matter podcast hosted by Ashwin Gane.",
  isPartOf: { "@type": "WebSite", name: "Mind Over Matter", url: SITE_URL },
};

export default function GuestPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuestPageClient />
    </>
  );
}
