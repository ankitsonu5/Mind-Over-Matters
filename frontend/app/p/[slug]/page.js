import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import s from "../../detail.module.css";

export const dynamic = "force-dynamic";

// The backend has already expanded [form ...] shortcodes and FAQ blocks,
// so contentHtml arrives ready to render.
async function loadPage(slug) {
  return apiGet(`/api/public/pages/${encodeURIComponent(slug)}`, null);
}

export async function generateMetadata({ params }) {
  const page = await loadPage(params.slug);
  return { title: page ? page.title : "Page" };
}

export default async function CustomPage({ params }) {
  const page = await loadPage(params.slug);
  if (!page) notFound();

  return (
    <div className={s.page}>
      <div className={s.inner}>
        <span className={s.eyebrow}>Mind Over Matter</span>
        <h1 className={s.h1}>{page.title}</h1>
        {page.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={page.coverImage} alt="" style={{ width: "100%", borderRadius: 14, margin: "18px 0" }} />
        ) : null}
        <div className="pageBody" dangerouslySetInnerHTML={{ __html: page.contentHtml || "" }} />
      </div>
    </div>
  );
}
