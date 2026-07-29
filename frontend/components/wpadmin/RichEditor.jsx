"use client";

// WordPress-style WYSIWYG — Visual + HTML modes, zero dependencies.
import { useEffect, useRef, useState } from "react";
import { uploadMedia } from "./uploadMedia";
import MediaPicker from "./MediaPicker";

function ytEmbedHtml(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([^?&\s]+)/);
  if (!m) return null;
  return `<div style="position:relative;aspect-ratio:16/9;border-radius:10px;overflow:hidden"><iframe src="https://www.youtube.com/embed/${m[1]}" style="position:absolute;inset:0;width:100%;height:100%;border:0" allowfullscreen loading="lazy"></iframe></div><p><br/></p>`;
}

export default function RichEditor({ value, onChange, placeholder = "Start writing here…", minHeight = 340 }) {
  const ref = useRef(null);
  const wrapRef = useRef(null);
  const imgFileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [plusTop, setPlusTop] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const savedRange = useRef(null);

  function openPicker() {
    try {
      const sel = window.getSelection();
      if (sel.rangeCount && ref.current?.contains(sel.getRangeAt(0).startContainer)) {
        savedRange.current = sel.getRangeAt(0).cloneRange();
      }
    } catch {}
    setMenuOpen(false);
    setPickerOpen(true);
  }

  function insertPicked({ url, alt }) {
    ref.current?.focus();
    try {
      if (savedRange.current) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedRange.current);
      }
    } catch {}
    ins(`<img src="${url}" alt="${(alt || "").replace(/"/g, "&quot;")}" /><p><br/></p>`);
  }
  const [mode, setMode] = useState("visual");
  const [html, setHtml] = useState(value || "");
  const [words, setWords] = useState(0);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
      countWords(value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function countWords(h) {
    const t = h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    setWords(t ? t.split(" ").length : 0);
  }
  function updatePlus() {
    try {
      const sel = window.getSelection();
      if (!sel.rangeCount || !ref.current || mode !== "visual") return setPlusTop(null);
      const range = sel.getRangeAt(0);
      let node = range.startContainer;
      if (!ref.current.contains(node)) return setPlusTop(null);
      let rect = range.getBoundingClientRect();
      if (!rect || (rect.top === 0 && rect.height === 0)) {
        const el = node.nodeType === 1 ? node : node.parentElement;
        if (!el) return setPlusTop(null);
        rect = el.getBoundingClientRect();
      }
      const wrapRect = wrapRef.current.getBoundingClientRect();
      setPlusTop(Math.max(4, rect.top - wrapRect.top - 3));
    } catch {
      setPlusTop(null);
    }
  }

  // Clean pasted HTML: keep structure, drop inline styles/classes/ids so
  // content copied from other sites stays readable on the dark theme.
  function sanitizeHtml(dirty) {
    const doc = new DOMParser().parseFromString(dirty, "text/html");
    const ALLOWED = new Set(["P","H1","H2","H3","H4","BR","HR","A","STRONG","B","EM","I","U","UL","OL","LI","BLOCKQUOTE","IMG","FIGURE","FIGCAPTION","SECTION","DETAILS","SUMMARY","DIV","SPAN","IFRAME","CODE","PRE","TABLE","THEAD","TBODY","TR","TH","TD"]);
    const KEEP_ATTRS = { A: ["href","target","rel"], IMG: ["src","alt"], IFRAME: ["src","allowfullscreen","loading"], SECTION: ["class"], DETAILS: ["class"], DIV: ["class","data-mom-form"] };
    const walk = (node) => {
      [...node.children].forEach((el) => {
        walk(el);
        if (el.tagName === "SCRIPT" || el.tagName === "STYLE") { el.remove(); return; }
        if (!ALLOWED.has(el.tagName)) {
          // unwrap unknown tags, keep their children
          while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
          el.remove();
          return;
        }
        const keep = KEEP_ATTRS[el.tagName] || [];
        [...el.attributes].forEach((a) => { if (!keep.includes(a.name)) el.removeAttribute(a.name); });
        if (el.tagName === "SPAN" && el.attributes.length === 0) {
          while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
          el.remove();
        }
      });
    };
    walk(doc.body);
    return doc.body.innerHTML;
  }

  function onPaste(e) {
    const html = e.clipboardData?.getData("text/html");
    if (!html) return; // plain text — let the browser handle it
    e.preventDefault();
    ins(sanitizeHtml(html));
  }

  function emit() {
    const next = ref.current?.innerHTML || "";
    setHtml(next);
    countWords(next);
    onChange?.(next);
    updatePlus();
  }
  function isInsideBlock(tag) {
    const sel = window.getSelection();
    if (!sel.rangeCount || !ref.current) return false;
    let node = sel.getRangeAt(0).startContainer;
    while (node && node !== ref.current) {
      if (node.nodeType === 1 && node.tagName === tag.toUpperCase()) return true;
      node = node.parentNode;
    }
    return false;
  }

  function toggleBlock(tag) {
    if (isInsideBlock(tag)) cmd("formatBlock", "<p>");
    else cmd("formatBlock", `<${tag}>`);
  }

  function cmd(c, a = null) {
    ref.current?.focus();
    document.execCommand(c, false, a);
    emit();
  }
  function ins(frag) {
    ref.current?.focus();
    document.execCommand("insertHTML", false, frag);
    emit();
  }
  function addLink() {
    const url = window.prompt("Link URL:", "https://");
    if (url) cmd("createLink", url);
  }
  function addImageUrl() {
    const url = window.prompt("Image URL (use Copy URL from the Media Library, or any link):", "");
    if (!url) return;
    const alt = window.prompt("Alt text for the image (include your focus keyword for SEO):", "") || "";
    ins(`<img src="${url}" alt="${alt.replace(/"/g, "&quot;")}" /><p><br/></p>`);
  }
  async function onImageFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      const alt = window.prompt("Alt text for the image (include your focus keyword for SEO):", "") || "";
      ins(`<img src="${url}" alt="${alt.replace(/"/g, "&quot;")}" /><p><br/></p>`);
    } catch (err) {
      window.alert(err.message);
    } finally {
      setUploading(false);
    }
  }
  function addFaq() {
    const n = Math.min(10, Math.max(1, parseInt(window.prompt("How many questions?", "3") || "0", 10) || 0));
    if (!n) return;
    let block = '<section class="mom-faq"><h2>Frequently Asked Questions</h2>';
    for (let i = 1; i <= n; i++) {
      block += `<h3>Question ${i}?</h3><p>Write the answer here.</p>`;
    }
    block += "</section><p><br/></p>";
    ins(block);
  }

  function addVideo() {
    const url = window.prompt("YouTube URL:", "https://");
    if (!url) return;
    const f = ytEmbedHtml(url);
    if (f) ins(f);
    else window.alert("That doesn't look like a valid YouTube link.");
  }
  function onAreaClick(e) {
    if (e.target?.tagName === "IMG") {
      const current = e.target.getAttribute("alt") || "";
      const alt = window.prompt("Alt text for this image (include the focus keyword for SEO):", current);
      if (alt !== null) {
        e.target.setAttribute("alt", alt);
        emit();
      }
    }
  }

  function menuInsert(action) {
    setMenuOpen(false);
    ref.current?.focus();
    action();
  }

  const BLOCKS = [
    { ic: "¶", label: "Paragraph", run: () => cmd("formatBlock", "<p>") },
    { ic: "H2", label: "Heading 2", run: () => toggleBlock("h2") },
    { ic: "H3", label: "Heading 3", run: () => toggleBlock("h3") },
    { ic: "🖼", label: "Image", run: () => openPicker() },
    { ic: "▶", label: "YouTube", run: () => addVideo() },
    { ic: "❝", label: "Quote", run: () => toggleBlock("blockquote") },
    { ic: "•", label: "List", run: () => cmd("insertUnorderedList") },
    { ic: "1.", label: "Numbered", run: () => cmd("insertOrderedList") },
    { ic: "？", label: "FAQ Block", run: () => addFaq() },
    { ic: "▦", label: "Form", run: () => { const slug = window.prompt("Form slug to embed:", "contact"); if (slug) ins(`<p>[form ${slug}]</p>`); } },
    { ic: "—", label: "Separator", run: () => ins("<hr/><p><br/></p>") },
  ];

  function switchMode(next) {
    if (next === mode) return;
    if (next === "html") setHtml(ref.current?.innerHTML || "");
    else if (ref.current) {
      ref.current.innerHTML = html;
      onChange?.(html);
      countWords(html);
    }
    setMode(next);
  }

  return (
    <div className="rte">
      <div className="rte-bar">
        <button type="button" onClick={() => toggleBlock("h2")}>H2</button>
        <button type="button" onClick={() => toggleBlock("h3")}>H3</button>
        <button type="button" onClick={() => cmd("formatBlock", "<p>")}>¶</button>
        <span className="sep" />
        <button type="button" style={{ fontWeight: 800 }} onClick={() => cmd("bold")}>B</button>
        <button type="button" style={{ fontStyle: "italic" }} onClick={() => cmd("italic")}>I</button>
        <button type="button" style={{ textDecoration: "underline" }} onClick={() => cmd("underline")}>U</button>
        <span className="sep" />
        <button type="button" onClick={() => toggleBlock("blockquote")}>❝ Quote</button>
        <button type="button" onClick={() => cmd("insertUnorderedList")}>• List</button>
        <button type="button" onClick={() => cmd("insertOrderedList")}>1. List</button>
        <span className="sep" />
        <button type="button" onClick={addLink}>🔗 Link</button>
        <button type="button" onClick={openPicker}>🖼 Image</button>
        <button type="button" onClick={addVideo}>▶ YouTube</button>
        <button type="button" onClick={addFaq}>？ FAQ</button>
        <button type="button" onClick={() => ins("<hr/><p><br/></p>")}>—</button>
        <span className="sep" />
        <button type="button" onClick={() => cmd("removeFormat")}>✕ Fmt</button>
        <div className="rte-modes">
          <button type="button" className={mode === "visual" ? "on" : ""} onClick={() => switchMode("visual")}>Visual</button>
          <button type="button" className={mode === "html" ? "on" : ""} onClick={() => switchMode("html")}>HTML</button>
        </div>
      </div>

      <input ref={imgFileRef} type="file" accept="image/*" hidden onChange={onImageFile} />
      <div ref={wrapRef} className="rte-wrap" style={{ display: mode === "visual" ? "block" : "none" }}>
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          onPaste={onPaste}
          onClick={(e) => { onAreaClick(e); updatePlus(); }}
          onKeyUp={updatePlus}
          onFocus={updatePlus}
          className="rte-area"
          style={{ minHeight }}
          data-ph={placeholder}
        />
        {plusTop !== null && (
          <button
            type="button"
            className="rte-plus"
            style={{ top: plusTop }}
            title="Add block"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setMenuOpen((v) => !v)}
          >
            +
          </button>
        )}
        {menuOpen && plusTop !== null && (
          <div className="rte-pop" style={{ top: plusTop + 34 }}>
            {BLOCKS.map((b) => (
              <button
                key={b.label}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => menuInsert(b.run)}
              >
                <span className="ic">{b.ic}</span>
                <span>{b.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {mode === "html" && (
        <textarea
          className="rte-html"
          style={{ minHeight }}
          value={html}
          spellCheck={false}
          onChange={(e) => {
            setHtml(e.target.value);
            onChange?.(e.target.value);
            countWords(e.target.value);
          }}
        />
      )}
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={insertPicked} />
      <div className="rte-count">Words: {words} · Tip: click any image to edit its alt text · type [form slug] to embed a form</div>
    </div>
  );
}
