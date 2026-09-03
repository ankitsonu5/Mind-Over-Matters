"use client";

// Submissions inbox — entries grouped into separate titled lists per form
// (Contact List, Guest List, and one list per custom form), each with
// PDF / Excel export.
import { useEffect, useMemo, useState } from "react";
import { Alert, Head, fmtDate } from "@/components/wpadmin/ui";

import { apiFetch } from "@/lib/api";
import Icon from "@/components/Icon";
const FRIENDLY = {
  contact: "Contact List",
  "guest-application": "Guest List",
  "guest-contact": "Guest Contact List",
};

function prettyName(formName, forms) {
  if (FRIENDLY[formName]) return FRIENDLY[formName];
  const f = (forms || []).find((x) => x.slug === formName);
  return f ? `${f.name} List` : `${formName} List`;
}

function columnsFor(rows) {
  const keys = [];
  for (const r of rows) for (const k of Object.keys(r.data || {})) if (!keys.includes(k)) keys.push(k);
  return keys;
}

export default function Submissions() {
  const [items, setItems] = useState(null);
  const [forms, setForms] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [exporting, setExporting] = useState("");

  function load() {
    apiFetch("/api/admin/subs").then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setItems(d) : setErr(d.error)))
      .catch(() => setErr("Load failed"));
    apiFetch("/api/admin/forms").then((r) => (r.ok ? r.json() : [])).then((d) => Array.isArray(d) && setForms(d)).catch(() => {});
  }
  useEffect(load, []);

  const groups = useMemo(() => {
    const map = new Map();
    for (const s of items || []) {
      const key = s.formName || "contact";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    return [...map.entries()]; // [formName, rows[]]
  }, [items]);

  async function open(s) {
    setOpenId(openId === s.id ? null : s.id);
    if (!s.read) {
      await apiFetch(`/api/admin/subs/${s.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      setItems((list) => list.map((x) => (x.id === s.id ? { ...x, read: true } : x)));
    }
  }

  async function del(s, e) {
    e.stopPropagation();
    if (!window.confirm("Delete this submission?")) return;
    const res = await apiFetch(`/api/admin/subs/${s.id}`, { method: "DELETE" });
    if (res.ok) load(); else setErr((await res.json()).error);
  }

  /* ------------------------- EXPORT: Excel (.xlsx) ------------------------- */
  async function exportExcel(formName, rows, title) {
    setExporting(formName + "-xlsx"); setErr("");
    try {
      const XLSX = await import("xlsx");
      const cols = columnsFor(rows);
      const data = rows.map((r) => {
        const row = { Date: fmtDate(r.createdAt) };
        for (const c of cols) row[c] = r.data?.[c] ?? "";
        return row;
      });
      const ws = XLSX.utils.json_to_sheet(data);
      ws["!cols"] = [{ wch: 14 }, ...cols.map((c) => ({ wch: Math.min(40, Math.max(12, c.length + 6)) }))];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));
      XLSX.writeFile(wb, `${title.replace(/\s+/g, "-").toLowerCase()}.xlsx`);
      setOk(`${title} exported to Excel ✓`);
    } catch (e) { setErr("Excel export failed: " + e.message); }
    finally { setExporting(""); }
  }

  /* -------------------------- EXPORT: PDF (.pdf) --------------------------- */
  async function exportPdf(formName, rows, title) {
    setExporting(formName + "-pdf"); setErr("");
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const cols = columnsFor(rows);
      const doc = new jsPDF({ orientation: cols.length > 4 ? "landscape" : "portrait" });
      doc.setFontSize(16);
      doc.text(`Mind Over Matter — ${title}`, 14, 16);
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`${rows.length} entries · exported ${new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`, 14, 22);
      autoTable(doc, {
        startY: 27,
        head: [["Date", ...cols]],
        body: rows.map((r) => [fmtDate(r.createdAt), ...cols.map((c) => String(r.data?.[c] ?? ""))]),
        styles: { fontSize: 8.5, cellPadding: 2.5, overflow: "linebreak" },
        headStyles: { fillColor: [10, 74, 170], textColor: 255 },
        alternateRowStyles: { fillColor: [244, 247, 252] },
      });
      doc.save(`${title.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      setOk(`${title} exported to PDF ✓`);
    } catch (e) { setErr("PDF export failed: " + e.message); }
    finally { setExporting(""); }
  }

  const unread = (items || []).filter((s) => !s.read).length;

  return (
    <div>
      <Head title="Submissions" eyebrow={`Form Inbox${unread ? ` · ${unread} unread` : ""}`} />
      <Alert>{err}</Alert>
      <Alert kind="ok">{ok}</Alert>

      {items === null && <div className="empty">Loading…</div>}
      {items?.length === 0 && (
        <div className="empty">No submissions yet. Entries from the contact page, guest page and every custom form will appear here in separate lists.</div>
      )}

      {groups.map(([formName, rows]) => {
        const title = prettyName(formName, forms);
        const groupUnread = rows.filter((r) => !r.read).length;
        return (
          <div key={formName} className="box" style={{ marginBottom: 20 }}>
            <div className="box-h">
              <span>
                {title} <span style={{ color: "#4d5f80" }}>({rows.length}{groupUnread ? ` · ${groupUnread} unread` : ""})</span>
              </span>
              <span style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-g btn-sm" disabled={!!exporting} onClick={() => exportPdf(formName, rows, title)}>
                  {exporting === formName + "-pdf" ? "Exporting…" : <><Icon name="download" /> PDF</>}
                </button>
                <button className="btn btn-g btn-sm" disabled={!!exporting} onClick={() => exportExcel(formName, rows, title)}>
                  {exporting === formName + "-xlsx" ? "Exporting…" : <><Icon name="download" /> Excel</>}
                </button>
              </span>
            </div>
            {rows.map((s) => (
              <div key={s.id} className="sub-row">
                <button className="sub-head" onClick={() => open(s)}>
                  <span className="sub-dot" style={{ background: s.read ? "#26314a" : "#61dafb" }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ color: "#fff", fontWeight: s.read ? 500 : 700 }}>
                      {s.data?.name || s.data?.email || "Submission"}
                    </span>
                    <span className="t-sub" style={{ display: "block" }}>
                      {s.data?.email || ""} · {fmtDate(s.createdAt)}
                    </span>
                  </span>
                  <span className="row-acts">
                    <button className="a-d" onClick={(e) => del(s, e)}>Delete</button>
                    <span style={{ color: "#4d5f80" }}><Icon name={openId === s.id ? "chevronDown" : "chevronRight"} /></span>
                  </span>
                </button>
                {openId === s.id && (
                  <div className="sub-body">
                    <dl className="sub-kv">
                      {Object.entries(s.data || {}).map(([k, v]) => (
                        <KV key={k} k={k} v={v} />
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function KV({ k, v }) {
  return (<><dt>{k}</dt><dd>{String(v)}</dd></>);
}
