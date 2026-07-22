"use client";
// /guest — Become a Guest. Mirrors the approved layout:
// hero (pitch left / quick form right) -> FAQ accordion -> full application.
// Scroll animations use the global AOS utility:
// fade-down-right, fade-down-left, fade-up-right, fade-up-left.
import { useState } from "react";
import s from "@/app/guest/guest.module.css";

const FAQS = [
  {
    q: "Who can apply as a guest?",
    a: "Founders, artists, athletes, authors, scientists, creators — anyone with a real story and a point of view. We care about depth, not follower counts.",
  },
  {
    q: "Is the interview live or recorded?",
    a: "Episodes are recorded, then edited for pacing only — your words are never re-cut out of context. Select episodes premiere live on YouTube.",
  },
  {
    q: "How long is the recording session?",
    a: "Plan for 60–90 minutes of conversation plus a 15-minute setup. In-studio sessions in Detroit run slightly longer with photo and reel capture.",
  },
  {
    q: "Do I need professional equipment?",
    a: "For remote sessions a quiet room, wired headphones and a decent mic are enough — we provide a full tech check before the recording. In-studio guests need nothing at all.",
  },
  {
    q: "When will my episode go live?",
    a: "Most episodes publish within 2–4 weeks of recording. You'll get the premiere date, promotional assets and clips for your own channels before launch.",
  },
  {
    q: "Does it cost anything to appear?",
    a: "No. Appearing on Mind Over Matter is free — including tech support, editing and promotional assets, all provided at no charge to the guest.",
  },
];


function useNetlifyForm(formName) {
  const [state, setState] = useState("idle"); // idle | sending | ok | err
  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = { "form-name": formName };
    new FormData(form).forEach((v, k) => (data[k] = v));
    setState("sending");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setState("ok");
      form.reset();
    } catch {
      setState("err");
    }
  };
  return [state, onSubmit];
}

export default function GuestPageClient() {
  const [open, setOpen] = useState(0);
  const [quickState, quickSubmit] = useNetlifyForm("guest-contact");
  const [appState, appSubmit] = useNetlifyForm("guest-application");

  return (
    <main className={s.page}>
      {/* ============ HERO: photo panel + application panel ============ */}
      <section className={s.hero} id="apply">
        <div className={s.heroPhoto} data-aos="fade-down-right">
          <div className={s.heroCopy}>
            <span className={s.badge}>
              <i /> Now Accepting Global Guests
            </span>
            <h1 className={s.h1}>
              Share Your Story <br />
              with a <em>World-Class</em> <br />
              Audience
            </h1>
            <p className={s.lead}>
              Raw, unfiltered conversations with Ashwin Gane — in studio in
              Detroit, or remote from anywhere on Earth.
            </p>
          </div>
        </div>

        <div className={s.heroPanel} data-aos="fade-down-left" data-aos-delay="120">
          <div className={s.formCard}>
            <h2 className={s.formTitle}>Guest Application</h2>
            <p className={s.formSub}>Complete the form — our team reviews within 48 hours.</p>
            <form name="guest-contact" onSubmit={quickSubmit} className={s.form}>
              <input type="hidden" name="form-name" value="guest-contact" />
              <div className={s.row2}>
                <label className={s.field}>
                  <span>Full Name *</span>
                  <input name="name" required placeholder="John Doe" autoComplete="name" />
                </label>
                <label className={s.field}>
                  <span>Email *</span>
                  <input name="email" type="email" required placeholder="john@example.com" autoComplete="email" />
                </label>
              </div>
              <label className={s.field}>
                <span>Phone Number</span>
                <input name="phone" type="tel" placeholder="+1 (555) 000-0000" autoComplete="tel" />
              </label>
              <label className={s.field}>
                <span>Subject *</span>
                <input name="subject" required placeholder="What's this about?" />
              </label>
              <label className={s.field}>
                <span>Message *</span>
                <textarea name="message" required rows={4} placeholder="Tell us more about your inquiry…" />
              </label>
              <button className={s.submit} type="submit" disabled={quickState === "sending"}>
                {quickState === "sending" ? "Sending…" : "Send Message"}
              </button>
              {quickState === "ok" && (
                <p className={s.ok}>Message received — we&apos;ll get back to you within 48 hours.</p>
              )}
              {quickState === "err" && (
                <p className={s.err}>
                  Something went wrong. Email us directly at{" "}
                  <a href="mailto:guests@mindovermatterpodcast.com">guests@mindovermatterpodcast.com</a>.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className={s.faq} id="faq">
        <div className={s.faqHead} data-aos="fade-up">
          <span className={s.eyebrow}>Questions</span>
          <h2 className={s.h2}>Frequently Asked</h2>
          <p className={s.faqSub}>Everything you need to know before applying.</p>
        </div>
        <div className={s.faqList}>
          {FAQS.map((f, i) => (
            <div
              key={i}
              className={`${s.faqItem} ${open === i ? s.faqOpen : ""}`}
              data-aos={i % 2 === 0 ? "fade-up-right" : "fade-up-left"}
              data-aos-delay={String((i % 3) * 90)}
            >
              <button
                className={s.faqQ}
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                <span>{f.q}</span>
                <i className={s.faqIcon} aria-hidden="true" />
              </button>
              <div className={s.faqA}>
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FULL APPLICATION ============ */}
      <section className={s.journey}>
        <div className={s.journeyInner}>
          <div className={s.journeyCopy} data-aos="fade-up-right">
            <span className={s.eyebrow}>Apply Anytime</span>
            <h2 className={s.h2Left}>
              Share Your <br /> Journey?
            </h2>
            <p className={s.journeyLead}>
              If you scrolled past the hero, you can still apply here and become a
              guest on the Mind Over Matter Podcast.
            </p>
            <blockquote className={s.quote}>
              &ldquo;I don&apos;t want polished. I want true. There&apos;s a
              difference — and most people never find it.&rdquo;
              <cite>— Ashwin Gane, Host</cite>
            </blockquote>
          </div>

          <div className={s.formCard} data-aos="fade-up-left" data-aos-delay="120">
            <h2 className={s.formTitle}>Guest Application</h2>
            <p className={s.formSub}>Complete the form — our team reviews within 48 hours.</p>
            <form name="guest-application" onSubmit={appSubmit} className={s.form}>
              <input type="hidden" name="form-name" value="guest-application" />
              <div className={s.row2}>
                <label className={s.field}>
                  <span>Full Name</span>
                  <input name="name" required placeholder="Your full name" autoComplete="name" />
                </label>
                <label className={s.field}>
                  <span>Email</span>
                  <input name="email" type="email" required placeholder="your@email.com" autoComplete="email" />
                </label>
              </div>
              <div className={s.row2}>
                <label className={s.field}>
                  <span>Country / Timezone</span>
                  <input name="timezone" placeholder="e.g. USA / EST" />
                </label>
                <label className={s.field}>
                  <span>Profession</span>
                  <input name="profession" placeholder="Coach, Author, Founder…" />
                </label>
              </div>
              <div className={s.row2}>
                <label className={s.field}>
                  <span>Website</span>
                  <input name="website" type="url" placeholder="https://yourwebsite.com" />
                </label>
                <label className={s.field}>
                  <span>Social Profile</span>
                  <input name="social" placeholder="Instagram / LinkedIn" />
                </label>
              </div>
              <label className={s.field}>
                <span>Short Bio</span>
                <textarea name="bio" rows={3} placeholder="Tell us about yourself in 2–3 sentences…" />
              </label>
              <label className={s.field}>
                <span>Episode Topics</span>
                <textarea name="topics" rows={3} placeholder="What would you like to talk about? (3 topic ideas)" />
              </label>
              <label className={s.field}>
                <span>Recording Format</span>
                <select name="format" defaultValue="">
                  <option value="" disabled>Select preferred format</option>
                  <option>Remote (video call)</option>
                  <option>In studio — Detroit</option>
                  <option>Either works</option>
                </select>
              </label>
              <button className={s.submit} type="submit" disabled={appState === "sending"}>
                {appState === "sending" ? "Submitting…" : "Submit My Application →"}
              </button>
              <p className={s.fine}>
                ✓ No cost to apply &nbsp;·&nbsp; ✓ 48h response &nbsp;·&nbsp; ✓ Full tech support provided
              </p>
              {appState === "ok" && (
                <p className={s.ok}>Application received — check your inbox within 48 hours.</p>
              )}
              {appState === "err" && (
                <p className={s.err}>
                  Something went wrong. Email us at{" "}
                  <a href="mailto:guests@mindovermatterpodcast.com">guests@mindovermatterpodcast.com</a>.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
