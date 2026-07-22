"use client";
// /panel — Submissions admin. Password-gated (checked server-side), shows
// every Netlify form's entries with search, CSV ("sheet") export and a
// print-ready PDF export. No extra npm dependencies.
import { useEffect, useMemo, useState } from "react";
import s from "@/app/panel/panel.module.css";

// internal keys Netlify mixes into submission data that aren't form fields
const SKIP = new Set(["ip", "user_agent", "referrer", "bot-field", "form-name"]);

const fmtDate = (iso) =>
  new Date(iso).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const prettyForm = (n) =>
  ({ contact: "Contact Messages", "guest-contact": "Guest — Quick Form", "guest-application": "Guest Applications" }[n] ||
  n.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));

// ordered union of field keys across a form's submissions
function fieldKeys(subs) {
  const keys = [];
  subs.forEach((x) =>
    Object.keys(x.data || {}).forEach((k) => {
      if (!SKIP.has(k) && !keys.includes(k)) keys.push(k);
    })
  );
  return keys;
}

const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function AdminPanel() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [state, setState] = useState("idle"); // idle | loading | ok | err
  const [error, setError] = useState("");
  const [forms, setForms] = useState([]);
  const [active, setActive] = useState(0);
  const [q, setQ] = useState("");

  const load = async (k) => {
    setState("loading"); setError("");
    try {
      const res = await fetch("/api/admin/submissions", { headers: { "x-admin-key": k } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
      setForms(json.forms || []);
      setAuthed(true);
      setState("ok");
      sessionStorage.setItem("mom-admin-key", k);
    } catch (e) {
      setState("err"); setError(e.message);
      if (/password/i.test(e.message)) { setAuthed(false); sessionStorage.removeItem("mom-admin-key"); }
    }
  };

  // restore session on reload
  useEffect(() => {
    const saved = sessionStorage.getItem("mom-admin-key");
    if (saved) { setKey(saved); load(saved); }
  }, []);

  const form = forms[active];
  const keys = useMemo(() => (form ? fieldKeys(form.submissions) : []), [form]);

  const rows = useMemo(() => {
    if (!form) return [];
    const list = [...form.submissions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (!q.trim()) return list;
    const n = q.toLowerCase();
    return list.filter((x) =>
      Object.values(x.data || {}).some((v) => String(v).toLowerCase().includes(n))
    );
  }, [form, q]);

  // ---------- EXPORT: CSV (opens in Excel / Google Sheets) ----------
  const exportCSV = () => {
    if (!form) return;
    const head = ["#", "Date", ...keys];
    const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [head.map(cell).join(",")];
    rows.forEach((x, i) =>
      lines.push([i + 1, fmtDate(x.created_at), ...keys.map((k) => x.data[k])].map(cell).join(","))
    );
    const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${form.name}-submissions.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ---------- EXPORT: PDF (print-ready report → Save as PDF) ----------
  const exportPDF = () => {
    if (!form) return;
    const w = window.open("", "_blank");
    if (!w) return alert("Allow pop-ups to export the PDF.");
    const head = ["#", "Date", ...keys].map((k) => `<th>${esc(k)}</th>`).join("");
    const body = rows
      .map((x, i) =>
        `<tr><td>${i + 1}</td><td>${esc(fmtDate(x.created_at))}</td>` +
        keys.map((k) => `<td>${esc(x.data[k])}</td>`).join("") + "</tr>"
      )
      .join("");
    w.document.write(`<!DOCTYPE html><html><head><title>${esc(prettyForm(form.name))}</title><style>
      body{font-family:Georgia,'Times New Roman',serif;color:#1c1814;margin:34px;}
      h1{font-size:21px;letter-spacing:.04em;margin:0;}
      .sub{font-size:11px;color:#8a7a5c;margin:6px 0 20px;letter-spacing:.08em;text-transform:uppercase;}
      table{width:100%;border-collapse:collapse;font-size:11px;}
      th{background:#f3ead6;color:#5d4a26;text-align:left;padding:7px 8px;border:1px solid #d9c9a4;
         text-transform:uppercase;letter-spacing:.06em;font-size:9.5px;}
      td{padding:7px 8px;border:1px solid #e3d7ba;vertical-align:top;word-break:break-word;}
      tr:nth-child(even) td{background:#faf6ec;}
      @page{margin:14mm;}
    </style></head><body>
      <h1>Mind Over Matter — ${esc(prettyForm(form.name))}</h1>
      <div class="sub">${rows.length} entries · exported ${esc(new Date().toLocaleString())}</div>
      <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
      <script>window.onload=function(){window.print();}</script>
    </body></html>`);
    w.document.close();
  };

  // ---------------- LOGIN VIEW ----------------
  if (!authed) {
    return (
      <div className={s.page}>
        <div className={s.loginCard}>
          <span className={s.eyebrow}>Mind Over Matter</span>
          <h1 className={s.title}>Submissions Panel</h1>
          <p className={s.loginSub}>Enter the admin password to view form entries.</p>
          <form onSubmit={(e) => { e.preventDefault(); load(key); }}>
            <input
              className={s.passInput} type="password" value={key} autoFocus
              placeholder="Admin password" onChange={(e) => setKey(e.target.value)}
            />
            <button className={s.btn} type="submit" disabled={state === "loading" || !key}>
              {state === "loading" ? "Checking…" : "Open Panel"}
            </button>
          </form>
          {state === "err" && <p className={s.err}>{error}</p>}
        </div>
      </div>
    );
  }

  // ---------------- PANEL VIEW ----------------
  return (
    <div className={s.page}>
      <div className={s.inner}>
        <div className={s.head}>
          <div>
            <span className={s.eyebrow}>Admin</span>
            <h1 className={s.title}>Form Submissions</h1>
          </div>
          <div className={s.headActions}>
            <button className={s.btnGhost} onClick={() => load(key)} disabled={state === "loading"}>
              {state === "loading" ? "Refreshing…" : "↻ Refresh"}
            </button>
            <button className={s.btnGhost} onClick={() => { sessionStorage.removeItem("mom-admin-key"); setAuthed(false); }}>
              Log out
            </button>
          </div>
        </div>

        {forms.length === 0 ? (
          <p className={s.empty}>
            No forms found yet. Entries appear here after the first real
            submission on the deployed site.
          </p>
        ) : (
          <>
            <div className={s.tabs}>
              {forms.map((f, i) => (
                <button key={f.id}
                  className={i === active ? s.tabOn : s.tab}
                  onClick={() => { setActive(i); setQ(""); }}>
                  {prettyForm(f.name)} <em>{f.submissions.length}</em>
                </button>
              ))}
            </div>

            <div className={s.bar}>
              <input className={s.search} placeholder="Search entries…" value={q}
                onChange={(e) => setQ(e.target.value)} />
              <div className={s.barBtns}>
                <button className={s.btn} onClick={exportCSV} disabled={!rows.length}>⬇ Export Sheet (CSV)</button>
                <button className={s.btn} onClick={exportPDF} disabled={!rows.length}>⬇ Export PDF</button>
              </div>
            </div>

            {rows.length === 0 ? (
              <p className={s.empty}>No entries{q ? " match this search" : " yet for this form"}.</p>
            ) : (
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>#</th><th>Date</th>
                      {keys.map((k) => <th key={k}>{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((x, i) => (
                      <tr key={x.id}>
                        <td>{i + 1}</td>
                        <td className={s.nowrap}>{fmtDate(x.created_at)}</td>
                        {keys.map((k) => <td key={k}>{String(x.data[k] ?? "—")}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
