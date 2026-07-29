import ContactPageClient from "@/components/ContactPageClient";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { footer } from "@/data/site";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Mind Over Matter team — general inquiries, guest applications, collaborations and press. Reach out and become part of the conversation beyond the surface.",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: `Contact Us — ${SITE_NAME}`,
    description:
      "Get in touch with the Mind Over Matter team — inquiries, collaborations and press.",
    url: `${SITE_URL}/contact`,
    images: ["/images/host.jpg"],
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact Us — ${SITE_NAME}`,
    url: `${SITE_URL}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      email: footer.contacts?.[0]?.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: footer.office?.[0]?.replace(/,$/, ""),
        addressLocality: "Farmington Hills",
        addressRegion: "MI",
        postalCode: "48334",
        addressCountry: "US",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactPageClient contacts={footer.contacts} office={footer.office} />
    </>
  );
}
