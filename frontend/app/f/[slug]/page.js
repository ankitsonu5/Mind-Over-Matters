import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";
import s from "../../detail.module.css";

export const dynamic = "force-dynamic";

// renderedHtml is the finished <form> markup built by the backend.
async function loadForm(slug) {
  return apiGet(`/api/public/forms/${encodeURIComponent(slug)}`, null);
}

export async function generateMetadata({ params }) {
  const form = await loadForm(params.slug);
  const url = `${SITE_URL}/f/${params.slug}`;
  return { title: form ? `${form.name} — Mind Over Matter` : "Form", alternates: { canonical: url } };
}

export default async function StandaloneForm({ params }) {
  const form = await loadForm(params.slug);
  if (!form) notFound();

  return (
    <div className={s.page}>
      <div className={s.inner} style={{ maxWidth: 720 }}>
        <span className={s.eyebrow}>Mind Over Matter</span>
        <h1 className={s.h1}>{form.name}</h1>
        <div style={{ marginTop: 22 }} dangerouslySetInnerHTML={{ __html: form.renderedHtml || "" }} />
      </div>
    </div>
  );
}
