// Client-safe defaults for the Form builder (no server imports).
export const DEFAULT_FORM_HTML = `<div class="mom-field">
  <label>Name *</label>
  <input type="text" name="name" required placeholder="Your name" />
</div>
<div class="mom-field">
  <label>Email *</label>
  <input type="email" name="email" required placeholder="you@example.com" />
</div>
<div class="mom-field">
  <label>Message *</label>
  <textarea name="message" rows="5" required placeholder="Write your message…"></textarea>
</div>
<button type="submit" class="mom-submit">Send Message</button>`;

export const DEFAULT_FORM_CSS = `.mom-form { max-width: 560px; display: grid; gap: 14px; }
.mom-form .mom-field { display: grid; gap: 6px; }
.mom-form label { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: #9fb1d1; }
.mom-form input, .mom-form textarea, .mom-form select {
  background: #0a1120; border: 1px solid #16233c; border-radius: 8px;
  color: #eef2fa; padding: 12px 14px; font: inherit; width: 100%;
}
.mom-form input:focus, .mom-form textarea:focus { outline: none; border-color: #61dafb; }
.mom-form .mom-submit {
  background: #0a4aaa; color: #fff; border: 0; border-radius: 8px;
  padding: 13px 22px; font-weight: 600; letter-spacing: .08em; cursor: pointer;
}
.mom-form .mom-submit:hover { background: #0d5ed6; }
.mom-form-status { font-size: 14px; color: #7ee2a8; }`;
