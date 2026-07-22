# Vercel Setup — Forms → Email + Admin Panel (MongoDB)

Site **Vercel** pe chalegi (Netlify ki zaroorat nahi). Forms ab `/api/submit`
pe POST karte hain, jahan se har submission do jagah jaata hai:

1. **Database (MongoDB Atlas)** → `/panel` admin dashboard isi se padhta hai
2. **Email (Resend)** → har submission ka email aata hai

Dono alag-alag hain: agar ek set-up nahi hai to doosra phir bhi chalega, form
kabhi silently break nahi hota.

---

## A) MongoDB Atlas database banao (free, ~5 min)

Panel mein submissions dikhne ke liye ye zaroori hai.

1. https://www.mongodb.com/atlas pe sign up / login.
2. **Create a cluster** → **M0 (Free)** plan chuno → provider/region apne users
   ke kareeb (India ke liye Mumbai `ap-south-1`) → **Create**.
3. **Database Access** → **Add New Database User** → ek username + strong password
   banao (ye connection string mein lagega). Role: **Read and write to any database**.
4. **Network Access** → **Add IP Address** → **Allow access from anywhere**
   (`0.0.0.0/0`) → Confirm.
   > Zaroori hai — Vercel ke server IPs fixed nahi hote, isliye single IP se kaam
   > nahi chalega.
5. **Database → Connect → Drivers** → connection string copy karo. Aisa dikhta hai:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Ismein `USER` aur `PASSWORD` apne step-3 waale daal do. Yehi `MONGODB_URI` hai.

Database/collection apne aap ban jaayenge — pehle submission par. (Default db naam
`mom`, collection `submissions`. Chaaho to `MONGODB_DB` env var se db naam badal
sakte ho.)

---

## B) Email banao (Resend — free, optional but recommended)

1. https://resend.com pe sign up.
2. **API Keys → Create API Key** → key copy karo (`RESEND_API_KEY`).
3. Kisko email jaaye woh address decide karo (`NOTIFY_EMAIL_TO`).
4. **Sender (`NOTIFY_EMAIL_FROM`) — dhyaan se:**
   - Test ke liye default `onboarding@resend.dev` chalega, lekin Resend free plan
     par ye sirf **aapke apne (Resend account waale) email** pe hi bhejta hai.
   - Kisi bhi address (jaise `info@mindovermatterpodcast.com`) pe bhejna ho to
     Resend mein **Domains → Add Domain** karke apna domain verify karo (free),
     phir `NOTIFY_EMAIL_FROM` ko us domain ka address banao,
     e.g. `Mind Over Matter <hello@mindovermatterpodcast.com>`.

Email skip karna ho to bas `RESEND_*` / `NOTIFY_*` vars mat daalo — sirf panel
chalega, email band rahega.

---

## C) Vercel pe deploy + env vars

1. https://vercel.com → **Add New → Project** → apni GitHub repo **Import**.
2. Framework auto-detect: **Next.js**. Build/Output default rehne do.
3. **Environment Variables** mein ye daalo (jitne applicable hain):

| Variable | Zaroori? | Value |
|---|---|---|
| `ADMIN_PANEL_PASSWORD` | **Haan** | Koi strong password — `/panel` login ke liye |
| `MONGODB_URI` | **Haan** | Atlas connection string (step A) |
| `MONGODB_DB` | Optional | Db naam (default `mom`) |
| `RESEND_API_KEY` | Email ke liye | Resend se (step B) |
| `NOTIFY_EMAIL_TO` | Email ke liye | Jahan notification chahiye |
| `NOTIFY_EMAIL_FROM` | Optional | Verified sender (default `onboarding@resend.dev`) |

4. **Deploy** dabao. (Env var baad mein badlo to dobara **Redeploy** karna.)

---

## D) Test + login

1. Live site pe Contact ya Guest form bharo aur submit karo.
2. Email set kiya hai to inbox check karo.
3. `https://aapki-site.com/panel` kholo → `ADMIN_PANEL_PASSWORD` daalo →
   submission dikhega. Tabs (Contact / Guest), search, **CSV** aur **PDF** export
   sab pehle jaise chalte hain.

> `localhost` pe test karna ho to project root mein `.env.local` bana ke wahi
> variables daal do, phir `npm run dev`. (Atlas/Resend cloud hain, isliye local
> par bhi kaam karte hain.)

---

## Form names (panel ke tabs)

- `contact` → Contact page ka message form
- `guest-contact` → Guest page ka quick form
- `guest-application` → Guest page ka full application

Naya form add karoge to bas hidden `name="form-name"` field naya naam de do —
panel mein woh apne aap ek naya tab ban kar aa jaayega.

---

## Troubleshooting

- **Panel khaali / "No forms found"** → live site pe ek submission bhejo, phir
  panel mein **↻ Refresh**.
- **"Could not read submissions" / save nahi ho raha** → `MONGODB_URI` galat,
  ya Atlas **Network Access** mein `0.0.0.0/0` allow nahi kiya, ya db user ka
  password galat. Theek karke Redeploy.
- **"Wrong password"** → `ADMIN_PANEL_PASSWORD` se match karo (case-sensitive).
- **Email nahi aaya** → `RESEND_API_KEY`/`NOTIFY_EMAIL_TO` check karo; free plan
  par sender verify waali baat (step B-4) yaad rakho. Email fail hone par bhi
  submission database mein save ho jaata hai, panel mein dikhega.
- **PDF popup nahi khula** → browser mein is site ke liye pop-ups allow karo.

---

## Netlify wali purani cheezein

- `netlify.toml` ab use nahi hota; Vercel use ignore kar deta hai. Chaaho to
  repo se hata sakte ho (zaroori nahi).
- Purane `NETLIFY_AUTH_TOKEN` / `NETLIFY_SITE_ID` env vars ki ab zaroorat nahi.
