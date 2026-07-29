import Link from "next/link";
import s from "../detail.module.css";
import { platforms } from "@/data/platforms";

export const metadata = { title: "Listen — Mind Over Matter" };

export default function ListenPage() {
  return (
    <div className={s.page}>
      <div className={s.inner}>
        <Link href="/" className={s.back}>← Home</Link>
        <span className={s.eyebrow}>Listen On</span>
        <h1 className={s.h1}>Available <span>Everywhere</span></h1>
        <p className={s.sub}>Six platforms, one tap away. Pick where you press play.</p>
        <div className={s.grid}>
          {platforms.map((p) => (
            <Link key={p.slug} href={`/listen/${p.slug}`} className={s.platCard}>
              <img src={p.logo} alt={p.name} />
              <span className={s.pn}>{p.name}</span>
              <span className={s.pb}>{p.blurb}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
