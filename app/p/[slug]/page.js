import { notFound } from "next/navigation";
import { getBySlug } from "@/lib/store";
import { renderFaqAccordions, replaceFormShortcodes } from "@/lib/forms";
import s from "../../detail.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const page = await getBySlug("pages", params.slug);
  if (!page || page.status !== "published") return { title: "Page" };
  return { title: page.title };
}

export default async function CustomPage({ params }) {
  const page = await getBySlug("pages", params.slug);
  if (!page || page.status !== "published") notFound();
  const html = renderFaqAccordions(await replaceFormShortcodes(page.contentHtml || ""));
  return (
    <div className={s.page}>
      <div className={s.inner}>
        <span className={s.eyebrow}>Mind Over Matter</span>
        <h1 className={s.h1}>{page.title}</h1>
        {page.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={page.coverImage} alt="" style={{ width: "100%", borderRadius: 14, margin: "18px 0" }} />
        ) : null}
        <div className="pageBody" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
