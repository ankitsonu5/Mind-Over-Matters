// =====================================================================
//  FORMS — render admin-built forms (HTML + CSS from the Form builder)
//  into working <form> elements that POST to /api/submit.
//  Embed anywhere with the shortcode  [form slug]  inside post/page body.
// =====================================================================
import { getAll } from "./store";
export { DEFAULT_FORM_HTML, DEFAULT_FORM_CSS } from "./form-defaults";

export function renderFormHtml(form) {
  if (!form || form.active === false) return "";
  const css = form.css
    ? `<style>${String(form.css).replace(/<\/style>/gi, "")}</style>`
    : "";
  const success = (form.successMessage || "Thanks! Your message was sent.").replace(/"/g, "&quot;");
  return `
${css}
<form class="mom-form mom-form--${form.slug}" data-mom-form="${form.slug}" data-success="${success}">
${form.html || ""}
<div class="mom-form-status" aria-live="polite"></div>
</form>`;
}

// Converts <section class="mom-faq"> h3/p pairs into an accessible
// <details>/<summary> accordion (numbered, plus-icon — styled in globals.css).
export function renderFaqAccordions(html = "") {
  if (!html.includes("mom-faq")) return html;
  return html.replace(
    /<section class="mom-faq">([\s\S]*?)<\/section>/gi,
    (m, inner) => {
      const items = [];
      const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*((?:(?!<h3)[\s\S])*?)(?=<h3|$)/gi;
      let match;
      let rest = inner;
      const headMatch = inner.match(/^([\s\S]*?)(?=<h3|$)/i);
      const head = headMatch ? headMatch[1] : "";
      while ((match = re.exec(inner))) {
        items.push(
          `<details class="mom-faq-item"><summary>${match[1].trim()}</summary><div class="mom-faq-a">${match[2].trim()}</div></details>`
        );
      }
      if (items.length === 0) return m;
      return `<section class="mom-faq">${head}${items.join("")}</section>`;
    }
  );
}

export async function replaceFormShortcodes(html = "") {
  if (!html.includes("[form")) return html;
  const forms = await getAll("forms");
  return html.replace(/\[form\s+([a-z0-9-]+)\]/gi, (m, slug) => {
    const f = forms.find((x) => x.slug === slug);
    return f ? renderFormHtml(f) : `<!-- form "${slug}" not found -->`;
  });
}

