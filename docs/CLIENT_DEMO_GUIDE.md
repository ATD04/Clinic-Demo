# ClinicFlow — Client Demo Guide

A short, practical guide for presenting the ClinicFlow prototype to a prospective clinic client. Read it once before presenting; the whole flow below takes 5–7 minutes.

## 1. Running the demo locally

```bash
npm install     # first time only
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`). That is the staff-facing application — the dashboard, patients, appointments, doctor workspace, inventory, finance, internal communication, and settings all live here.

The Patient Portal (the public booking page a patient would use) is a separate route at `/portal` (e.g. `http://localhost:5173/portal`). The sidebar's "معاينة بوابة المريض" link at the bottom opens it in a new tab.

Close the terminal (Ctrl+C) when you're done; there is nothing to deploy or tear down.

## 2. Resetting demo data

Everything you do during a demo (new patients, bookings, procedures, payments, messages) is saved locally in the browser so the app stays interactive. To put it back to a clean, repeatable starting point before — or after — a presentation:

1. Go to **الإعدادات** (Settings) in the sidebar.
2. Click **إعادة تعيين بيانات العرض التجريبي** (Reset Demo Data).
3. Confirm in the dialog.

This restores the original seeded patients, appointments, inventory, invoices, and internal requests, and switches the demo identity back to the default doctor. It does not touch anything else in the browser. Do this right before you present, every time.

## 3–5. Recommended 5–7 minute presentation flow

Run scenarios in this order. All of it uses the app's own seeded data — you don't need to prepare anything beyond a fresh reset.

### A — Management overview (≈1 min)
**Navigate:** Open the app at `/` (لوحة التحكم).
**Do:** Point out the four KPI cards (today's appointments, total patients, today's revenue, low-stock items), the revenue trend chart, department performance bars, today's appointment list, and the recent activity feed.
**Say:** This is what a clinic manager sees first thing in the morning — a single screen answering "how busy are we, how much have we made, what needs attention" without opening five different spreadsheets.

### B — Online booking (≈1.5 min)
**Navigate:** Open `/portal` (new tab, or the sidebar link).
**Do:** Click "احجز موعدك الآن" → register as a new fictional patient (any name/phone) → choose a department (e.g. الجلدية والتجميل or النسائية والتوليد) → choose a doctor → pick an available slot → confirm.
**Then:** Switch back to the internal tab (no refresh needed) and open **المواعيد** or **المرضى** — the new booking and patient are already there.
**Say:** Patients can self-book without calling reception, and the clinic sees it appear instantly — no double entry, no phone tag.

### C — Doctor workflow & automatic procedure recording (≈1.5 min)
**Navigate:** **غرفة الطبيب** (Doctor Workspace).
**Do:** Select **د. محمد السعدي** from the doctor dropdown. His only patient today, **عبدالله الطراونة**, is already marked "وصل" (arrived). Click **فتح الزيارة** → **بدء الزيارة** → choose a consumable item → **تأكيد الإجراء**.
**Say:** The doctor records the visit in one short form. This specific appointment is pre-seeded for this purpose — it hasn't been used by any other part of the demo, so it's always there in a clean "ready to see" state after a reset.

### D — What happens automatically (≈1.5 min)
**Navigate:** **المخزون** (Inventory), then **الإدارة المالية** (Finance), then back to **لوحة التحكم**.
**Do:** Show the item you just used has one fewer unit in stock. Open **الإدارة المالية** and show the invoice that was created automatically for that procedure (same amount as the service price). Open it and click **تسجيل الدفع** to simulate a payment. Go back to the dashboard and point out "إيرادات اليوم" went up by that exact amount.
**Say:** One action by the doctor — confirming a procedure — automatically updates stock and billing. Nobody has to manually create an invoice or remember to deduct inventory.

### E — Internal staff communication (≈1.5 min)
**Navigate:** **التواصل الداخلي** (Internal Communication).
**Do:** Using the demo identity switcher at the top, you're currently "a doctor". Click **طلب جديد**, give it a title (e.g. "تنسيق موعد متابعة"), assign it to **سارة عودة** (reception), optionally link a patient, and send it. Switch the identity to **سارة عودة**, open the request, reply, and mark it **مكتمل**. Switch identity to **عبدالله السالم** (the manager) and show the completed request and its full history.
**Say:** Staff coordinate inside the same system instead of over phone calls or sticky notes, and management can see what was asked, by whom, and whether it got done.

> **Note on the identity switcher:** it's explicitly labeled as a demo-only simulation in the UI. It is a convenience for showing how different roles see the system — it is **not** real login or access control.

## 6. Business value, module by module

| Module | What to emphasize |
|---|---|
| Dashboard | One screen, real-time picture of the whole clinic's day |
| Patients | Centralized patient records, searchable, no paper files |
| Appointments | Conflict-free scheduling across all doctors and departments |
| Doctor Workspace | Fast, structured visit recording — not a blank notes field |
| Inventory | Stock levels update themselves from actual usage, not manual counts |
| Finance | Invoices generate automatically; nothing is billed by hand |
| Internal Communication | Replaces ad-hoc messaging between reception, doctors, and management |
| Patient Portal | Lets patients book themselves, any time, without a phone call |

## 7. Important demo-only limitations — be upfront about these

Mention these plainly if asked, or proactively if the client seems to assume this is production-ready:

- **All patient, doctor, and appointment data is fictional** — nothing here is a real medical record.
- **Staff identity switching is simulated**, not real authentication. There is no login, no passwords, and no real access control yet.
- **All data is stored locally in your browser** (no server, no database). Clearing browser storage or using a different browser/device starts from scratch.
- **No real payments are processed.** "Recording a payment" just marks an invoice as paid in local storage.
- **This prototype should never be used for real clinic operations or real patient data.**
- **A production version requires:** a real backend and database, proper user accounts with role-based access control, medical-data security and compliance (encryption, audit logs, backups), and real database transactions instead of browser storage.
- Opening the app in two browser tabs keeps them in sync for convenience during a demo (e.g. booking in the Patient Portal tab shows up in the dashboard tab immediately) — this is a local-browser convenience, not real multi-user, multi-device synchronization, which also requires a backend.

Keep the tone of these points practical, not apologetic — they're exactly what "full development" would add.
