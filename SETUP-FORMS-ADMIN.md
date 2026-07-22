# Forms → Email + Admin Panel Setup

Guest aur Contact page ke forms pehle se **Netlify Forms** pe wired hain.
Submissions Netlify pe save hote hain. Ab 2 cheezein enable karni hain:

---

## 1) Email pe submissions aana (5 min, no code)

Ye Netlify dashboard ki setting hai:

1. Netlify dashboard → apni site kholo
2. **Forms** tab → pehla submission aane ke baad teeno forms dikhenge:
   `contact`, `guest-contact`, `guest-application`
3. **Site configuration → Notifications → Form submission notifications**
   → **Add notification → Email notification**
4. Event: *New form submission* · Form: (ek-ek karke teeno) ·
   Email: `info@mindovermatterpodcast.com` (ya jo chahiye)
5. Har form ke liye repeat karo — bas. Ab har submission ka email aayega.

> Note: Forms sirf **deployed Netlify site** pe kaam karte hain,
> `localhost` pe submit karne se 404 aayega — ye normal hai.

---

## 2) Admin Panel (`/panel`) — submissions dekhna + PDF/Sheet export

Panel ready hai: `https://aapki-site.com/panel`

Pehle 3 environment variables set karo —
**Netlify → Site configuration → Environment variables → Add variable:**

| Variable | Value kahan se milegi |
|---|---|
| `NETLIFY_AUTH_TOKEN` | Netlify → apna avatar → **User settings → Applications → Personal access tokens → New access token** (token copy karo) |
| `NETLIFY_SITE_ID` | **Site configuration → Site details → Site ID** (API ID) |
| `ADMIN_PANEL_PASSWORD` | Koi bhi strong password — yehi `/panel` pe login ke liye lagega |

Variables add karne ke baad **site redeploy** karo (Deploys → Trigger deploy).

### Panel me kya hai
- Password login (session me yaad rehta hai, "Log out" se clear)
- Teeno forms ke tabs, entry count ke saath
- Search box — kisi bhi field me text dhundo
- **⬇ Export Sheet (CSV)** — file download hogi jo Excel / Google Sheets
  me seedha khulti hai (UTF-8, formulas-safe)
- **⬇ Export PDF** — print-ready report khulta hai, print dialog me
  "Save as PDF" choose karo
- ↻ Refresh — latest submissions turant

### Security
- Password **server pe** check hota hai; Netlify token kabhi browser me
  nahi jaata (API route proxy karta hai)
- `/panel` search engines ke liye `noindex` hai

---

## Troubleshooting

- **"No forms found yet"** → deployed site pe ek test submission bhejo,
  phir Refresh karo. (Netlify forms tabhi register hote hain.)
- **"env vars are missing"** → upar wale 3 variables set karke redeploy.
- **"Wrong password"** → `ADMIN_PANEL_PASSWORD` se match karo.
- **PDF popup nahi khula** → browser me is site ke liye pop-ups allow karo.
