import Link from "next/link";
import s from "../detail.module.css";
import { about } from "@/data/site";

export const metadata = { title: "About — Mind Over Matter" };

export default function AboutPage() {
  return (
    <div className={s.page}>
      <div className={s.inner}>
        <Link href="/" className={s.back}>← Home</Link>

        {/* ============ INTRO: About Mind Over Matter ============ */}
        <div className={s.introGrid}>
          <div className={s.introCopy}>
            <span className={s.eyebrow}>{about.introEyebrow}</span>
            <h1 className={s.introTitle}>{about.introTitle}</h1>
            {about.intro.map((p, i) => <p key={i}>{p}</p>)}
            <div className={s.cta}>
              <Link href="/episodes" className="pill">Watch Episodes</Link>
              <Link href="/listen" className="pill ghost">Follow The Show</Link>
            </div>
          </div>
          <div className={s.introPhoto}>
            <img src="/images/host.jpg" alt="Ashwin Gane — Mind Over Matter" />
            <div className={s.photoBadge}>
              <b>{about.introBadge.top}</b>
              <span>{about.introBadge.bottom}</span>
            </div>
          </div>
        </div>

        {/* ============ THE MAN BEHIND THE MIC ============ */}
        <div className={s.aboutGrid} style={{ marginTop: "clamp(56px,8vw,96px)" }}>
          <div className={s.photo}>
            <img src={about.photo} alt={about.name} />
          </div>
          <div>
            <span className={s.eyebrow}>{about.eyebrow}</span>
            <div className={s.name}>
              {about.name.split(" ")[0]} <span>{about.name.split(" ").slice(1).join(" ")}</span>
            </div>
            <div className={s.role}>{about.role}</div>
            {about.bio.map((p, i) => <p className={s.bio} key={i}>{p}</p>)}
            <blockquote className={s.quote}>“{about.quote}”</blockquote>
            <div className={s.stats}>
              {about.stats.map((st) => (
                <div className={s.stat} key={st.label}>
                  <div className={s.num}>{st.num}<em>{st.suffix}</em></div>
                  <div className={s.lab}>{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============ WHAT IT COVERS / EXPERIENCE / LISTEN ============ */}
        <div className={s.infoCards}>
          {about.cards.map((c) => (
            <div className={s.infoCard} key={c.kicker}>
              <div className={s.infoKicker}>{c.kicker}</div>
              <div className={s.infoTitle}>{c.title}</div>
              <p className={s.infoText}>{c.text}</p>
            </div>
          ))}
        </div>

        {/* ============ THE MISSION ============ */}
        <section className={s.mission}>
          <div className={s.missionKicker}>{about.mission.kicker}</div>
          <h2 className={s.missionTitle}>{about.mission.title}</h2>
          <p className={s.missionText}>{about.mission.text}</p>
        </section>
      </div>
    </div>
  );
}
