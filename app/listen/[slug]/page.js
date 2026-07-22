import Link from "next/link";
import { notFound } from "next/navigation";
import s from "../../detail.module.css";
import { platforms, getPlatform } from "@/data/platforms";

export function generateStaticParams() {
  return platforms.map((p) => ({ slug: p.slug }));
}
export function generateMetadata({ params }) {
  const p = getPlatform(params.slug);
  return { title: p ? `Listen on ${p.name} — Mind Over Matter` : "Listen" };
}

export default function PlatformDetail({ params }) {
  const p = getPlatform(params.slug);
  if (!p) return notFound();
  return (
    <div className={s.page}>
      <div className={s.inner}>
        <Link href="/listen" className={s.back}>← All Platforms</Link>
        <div className={s.plHead}>
          <img src={p.logo} alt={p.name} />
          <div className={s.ph}>{p.name}</div>
        </div>
        <p className={s.bio}>{p.blurb}</p>
        <div className={s.cta}>
          <a href={p.href} target="_blank" rel="noopener" className="pill">Open in {p.name}</a>
          <Link href="/episodes" className="pill ghost">Browse Episodes</Link>
        </div>
      </div>
    </div>
  );
}
