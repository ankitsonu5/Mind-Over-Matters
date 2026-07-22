"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const LINKS = [
  ["/episodes", "Episodes"],
  ["/about", "About"],
  ["/blog", "Blog"],
  ["/guest", "Guest"],
  ["/contact", "Contact"],
  ["/listen", "Listen"],
];

// Global nav (matches the original design via the `nav` CSS in globals.css).
// Route-based links so it works on the homepage AND every detail page.
// On <=820px the inline menu hides and a hamburger opens a fullscreen menu.
export default function Nav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  // lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // hide header when scrolling down, reveal when scrolling up
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (open) {                       // never hide while the menu is open
          setHidden(false);
        } else if (y > last && y > 90) {  // scrolling down, past the top
          setHidden(true);
        } else if (y < last) {            // scrolling up
          setHidden(false);
        }
        last = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  return (
    <>
      <nav className={hidden ? "nav-hidden" : ""}>
        <Link href="/" className="logo" aria-label="Mind Over Matter — Home">
          <img src="/images/logo.png" alt="Mind Over Matter" />
        </Link>
        <div className="menu">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </div>
        <button
          className={"nav-burger" + (open ? " open" : "")}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <i></i><i></i><i></i>
        </button>
      </nav>

      <div className={"nav-sheet" + (open ? " open" : "")} aria-hidden={!open}>
        {LINKS.map(([href, label], i) => (
          <Link key={href} href={href} style={{ transitionDelay: open ? `${0.06 * i + 0.08}s` : "0s" }}
            onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
      </div>
    </>
  );
}
