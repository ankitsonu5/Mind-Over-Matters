"use client";
// /contact — Contact Us. Hero banner over a studio still, then "Get in Touch":
// contact details on the left, message form on the right (Netlify form "contact").
import { useState } from "react";
import Link from "next/link";
import s from "@/app/contact/contact.module.css";


export default function ContactPageClient({ contacts = [], office = [] }) {
  const [state, setState] = useState("idle"); // idle | sending | ok | err

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = { "form-name": "contact" };
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

  return (
    <main className={s.page}>
      {/* ============ HERO BANNER ============ */}
      <section className={s.hero}>
        <div className={s.heroInner} data-aos="fade-down">
          <h1 className={s.h1}>Contact Us</h1>
          <p className={s.heroSub}>
            Welcome to Mind Over Matter — have a question, a collaboration idea,
            or a story worth sharing? You&apos;re one message away from the conversation.
          </p>
        </div>
      </section>

      {/* ============ GET IN TOUCH ============ */}
      <section className={s.touch}>
        <div className={s.touchInner}>
          <div className={s.info} data-aos="fade-up-right">
            <span className={s.eyebrow}>Beyond the Surface</span>
            <h2 className={s.h2}>Get in Touch</h2>
            <p className={s.lead}>
              Have a question, collaboration idea, or story worth sharing?
              Reach out and become part of the conversation beyond the surface.
            </p>

            <div className={s.blocks}>
              {contacts.map((c, i) => (
                <div className={s.block} key={i} data-aos="fade-up-right" data-aos-delay={String(120 + i * 110)}>
                  <span className={s.blockLabel}>{c.label.replace(/\.$/, "")}</span>
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                </div>
              ))}
              <div className={s.block} data-aos="fade-up-right" data-aos-delay="450">
                <span className={s.blockLabel}>Studio Address</span>
                <address>
                  {office.map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </address>
              </div>
            </div>

            <p className={s.guestNote} data-aos="fade-up-right" data-aos-delay="560">
              Want to be on the show? Skip the inbox —{" "}
              <Link href="/guest">apply on the Guest page</Link>.
            </p>
          </div>

          <div className={s.formCard} data-aos="fade-up-left" data-aos-delay="150">
            <form name="contact" onSubmit={onSubmit} className={s.form}>
              <input type="hidden" name="form-name" value="contact" />
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
                <textarea name="message" required rows={6} placeholder="Tell us more about your inquiry…" />
              </label>
              <button className={s.submit} type="submit" disabled={state === "sending"}>
                {state === "sending" ? "Sending…" : "Send Message"}
              </button>
              {state === "ok" && (
                <p className={s.ok}>Message received — we&apos;ll get back to you soon.</p>
              )}
              {state === "err" && (
                <p className={s.err}>
                  Something went wrong. Email us directly at{" "}
                  <a href={`mailto:${contacts?.[0]?.email || "info@mindovermatterpodcast.com"}`}>
                    {contacts?.[0]?.email || "info@mindovermatterpodcast.com"}
                  </a>.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
