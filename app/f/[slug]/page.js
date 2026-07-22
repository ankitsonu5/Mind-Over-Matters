import { notFound } from "next/navigation";
import { getBySlug } from "@/lib/store";
import { renderFormHtml } from "@/lib/forms";
import s from "../../detail.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const form = await getBySlug("forms", params.slug);
  return { title: form ? `${form.name} — Mind Over Matter` : "Form" };
}

export default async function StandaloneForm({ params }) {
  const form = await getBySlug("forms", params.slug);
  if (!form || form.active === false) notFound();
  return (
    <div className={s.page}>
      <div className={s.inner} style={{ maxWidth: 720 }}>
        <span className={s.eyebrow}>Mind Over Matter</span>
        <h1 className={s.h1}>{form.name}</h1>
        <div style={{ marginTop: 22 }} dangerouslySetInnerHTML={{ __html: renderFormHtml(form) }} />
      </div>
    </div>
  );
}
