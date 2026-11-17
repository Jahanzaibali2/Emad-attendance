# Emad Attendance Portal — Requirements

Approved direction 2026-11-16 (brainstorm). Approach: **simple clock in/out + owner monitor + display-only earned pay**, golden visual theme.

Separate product from Blue Hawke HR. Inspired by BHHR’s “hours from a server timer” idea, but scoped to one employee and read-only owner oversight.

---

## 1. Purpose & success criteria

### Purpose

Give the owner a reliable way to **see whether Emad Khan worked**, for how long, and what portion of his **15,000 PKR monthly salary** those hours earn — without running a full HR system.

### Success criteria

- Emad can clock in and clock out from a phone or laptop in under two taps after login.
- Owner can open the portal and immediately see: live status (working / not), today’s hours, month hours vs target, and earned PKR.
- Monthly earned pay equals `min(15000, hoursWorked / monthlyTargetHours × 15000)`.
- All timestamps use Pakistan Standard Time; device clock never decides work time.
- UI looks intentional and professional under the golden theme (not a generic SaaS template).

---

## 2. Users & permissions

| Role | Who | Can do |
| --- | --- | --- |
| **Employee** | Emad Khan | Log in; clock in/out; view own today, calendar, month hours, earned pay |
| **Owner** | Employer | Log in; **monitor only** — same attendance/hours/pay views for Emad; no edits |

### Explicit non-permissions (v1)

- Owner does **not** edit sessions or day hours.
- Owner does **not** mark months as paid.
- Emad does **not** request corrections or leave through the app.
- No third roles, no multi-employee directory.

### Auth

- Email and password login for exactly two accounts: `employee` and `owner`.
- Sessions expire; owner and employee never share a login.
- Emad only sees his own data; owner only sees Emad’s data (single-tenant, single employee).

---

## 3. Functional requirements

### 3.1 Clock in / clock out

- Employee sees one primary control: **Clock in** when idle, **Clock out** when an open session exists.
- Server records `startedAt` / `endedAt` using server time converted to PKT business rules.
- Multiple sessions per calendar day are allowed (e.g. work, step away, return).
- Only one open (running) session at a time.
- No pause / break action in v1. Time between clock-out and next clock-in does not count.
- Worked seconds for a day = sum of `(endedAt − startedAt)` across that day’s closed sessions, plus live elapsed for an open session on today.

### 3.2 Attendance calendar

For each date in the selected month, compute status:

| Status | Rule |
| --- | --- |
| `weekend` | Saturday or Sunday (takes precedence over other statuses, including today) |
| `upcoming` | Future weekday |
| `present` | Past or today weekday; worked hours ≥ 8 |
| `partial` | Past or today weekday; worked hours > 0 and < 8 |
| `absent` | Past weekday; worked hours = 0 |
| `not_started` | Today weekday; worked hours = 0 |

- Late is a **flag** on the day, not a status: first session `startedAt` after `14:00 + 15 minutes` grace on that PKT date.
- Calendar shows late indicator when applicable.
- Tapping a day shows session list (start/end times and duration). Owner and employee both read-only.

### 3.3 Monthly summary

For a calendar month (PKT):

- `workedHours` — total hours across all days in the month (weekend work still counts toward hours and pay).
- `targetHours` — `8 × count of Monday–Friday dates in that month`.
- `balanceHours` — `workedHours − targetHours` (can be negative).
- `earnedPayPkr` — see pay formula below.
- Counts: present days, partial days, absent days, late days.

### 3.4 Earned pay (display only)

- Monthly salary constant: **15,000 PKR**.
- Formula: `earnedPayPkr = min(15000, (workedHours / targetHours) × 15000)`.
- If `targetHours` is 0 (should not occur for normal months), show earned pay as 0.
- Hours beyond target do **not** increase pay above 15,000.
- UI labels this as earned / accrued for the month. Copy must state that **payment is settled outside the portal**.
- No payment status, no “mark paid”, no payment history.

### 3.5 Live status (owner home)

Owner’s primary view shows:

- Emad’s name
- Live state: `working` | `not_working` (derived from open session)
- If working: clock-in time and elapsed today
- Today’s total hours and day status
- Month worked / target / earned PKR

### 3.6 Employee home

- Large clock control
- Today’s elapsed / total hours
- Expected window reminder: 14:00–23:00
- Month strip: worked vs target and earned PKR

---

## 4. Business rules

### Timezone

- All business dates and schedule rules use **Asia/Karachi (PKT, UTC+05:00)**.
- `businessDate` for a session is the PKT calendar date of `startedAt`.
- UI copy: “All times are Pakistan Standard Time.”

### Expected work window

- Expected daily window: **14:00–23:00** PKT.
- Window is guidance for “on schedule” and late detection.
- Sessions that start or end **outside** this window are valid; those hours **count fully** so Emad can compensate early or late.

### Daily and monthly targets

- Working days: **Monday–Friday**.
- Daily target: **8 hours** of tracked work (not wall-clock span of 14:00–23:00).
- The 14:00–23:00 span is a 9-hour window; the unpaid break is not auto-inserted — only clocked segments count.
- Monthly target hours: `8 × number of Mon–Fri dates in the month` (PKT).
- Weekend work increases `workedHours` and can raise earned pay up to the 15,000 cap; weekends never add to `targetHours`.

### Late

- Grace: **15 minutes** after 14:00 → late if first clock-in after **14:15** PKT.
- Late does not change pay or day status by itself; a late employee who still reaches 8h is `present` with `late = true`.

### Auto-close at midnight

- If a session is still open when PKT date rolls over, the server ends it at **00:00:00** of the new day (`auto_closed`).
- Further work requires a new clock-in on the new business date.
- Auto-closed sessions remain visible in that day’s detail.

### Session integrity

- Clock-out time cannot be before clock-in.
- Cannot clock in while another session is open.
- Employee cannot backdate or edit historical sessions in v1.
- Owner cannot edit sessions in v1. Wrong data is corrected outside the product (or a later version).

---

## 5. Screens & flows

### 5.1 Login

```
+----------------------------------+
|  Emad Attendance                 |
|  Sign in                         |
|  [ email ]                       |
|  [ password ]                    |
|  [ Sign in ]                     |
+----------------------------------+
```

Route after login: employee → Today; owner → Monitor.

### 5.2 Employee — Today

```
+----------------------------------+
| Emad Attendance          [Out]   |
|----------------------------------|
| Today · Mon 16 Nov               |
| Expected 14:00–23:00             |
|                                  |
|        3h 42m today              |
|                                  |
|     [     Clock out     ]        |
|                                  |
| -------------------------------- |
| This month                       |
| 42h / 176h target                |
| Earned Rs 3,580 of 15,000        |
+----------------------------------+
```

### 5.3 Attendance calendar (shared, read-only)

```
+----------------------------------+
| November 2026          < >       |
| Mo Tu We Th Fr Sa Su             |
|                 1  2             |
|  3  4  5  6  7  8  9             |
| ...                              |
| Legend: present · partial ·      |
| absent · weekend · late dot      |
+----------------------------------+
```

Day detail (modal or page): list of sessions with start, end, duration; late badge if set.

### 5.4 Owner — Monitor

```
+----------------------------------+
| Emad Attendance · Owner   [Out]  |
|----------------------------------|
| Emad Khan                        |
| WORKING since 14:12              |
| Today  3h 42m · partial          |
|                                  |
| November                         |
| 42h / 176h                       |
| Earned Rs 3,580                  |
| Pay settled outside this app     |
|                                  |
| [ Open calendar ]                |
+----------------------------------+
```

Owner has no edit controls on sessions or pay.

### 5.5 Primary flows

1. **Work day:** Emad Signs in → Clock in → (optional Clock out / Clock in again) → Clock out → calendar shows present/partial.
2. **Make-up hours:** Emad clocks outside 14:00–23:00; hours still add to day and month.
3. **Owner check:** Owner signs in → Monitor shows live state and month earned pay → optional calendar drill-down.
4. **Midnight still working:** Server auto-closes session; Emad clocks in again next morning if needed.

---

## 6. Visual design system — golden theme

### Subject & tone

Social-media hire attendance monitor: calm authority, “ledger of the day.” Professional gold, not casino glitter and not generic purple/cream SaaS.

### Color tokens

| Token | Hex | Use |
| --- | --- | --- |
| `ink` | `#1A1408` | Primary text |
| `parchment` | `#F7F1E3` | Page background |
| `gold` | `#C5A046` | Primary accent, CTAs, key numbers |
| `gold-deep` | `#8B6914` | Hover / pressed / emphasis |
| `slate` | `#5C5346` | Secondary text |
| `line` | `#E0D4B8` | Hairlines, calendar grid |

Status colors (restrained, not neon): present uses gold-deep; partial uses slate with gold underline; absent uses a muted warm brown derived from ink at lower opacity; weekend uses line only.

### Typography

- **Display / brand / big numbers:** Fraunces  
- **UI / body / forms:** Source Sans 3  
- Do not use Inter, Roboto, Arial, or system-ui as the design voice.
- Sentence case labels. No tracked-out ALL-CAPS eyebrows. Do not decorate every heading with meta chip rows; a single status line may use a light separator.

### Layout principles

- One composition on first viewport for owner Monitor and employee Today — not a dashboard of many cards.
- Brand / product name is visible as a strong header signal.
- Employee: Clock in/out is the only primary action.
- Prefer open sections separated by gold hairlines over identical rounded card grids and soft grey shadows.
- Background: parchment with a subtle warm radial or soft paper grain — not a flat single fill only, and not purple gradients.
- Motion: one short page-load reveal; clear press feedback on clock button; honor `prefers-reduced-motion`.

### Content voice

- Buttons: “Clock in”, “Clock out”, “Sign in”.
- Empty today: “Not started — clock in when you begin.”
- Pay: “Earned Rs X of 15,000” plus “Pay is settled outside this app.”

---

## 7. Non-functional requirements

- **Server-authoritative time** for all clock actions.
- **Mobile-usable** employee Today (thumb-friendly clock control); owner Monitor usable on desktop and phone.
- **Accessible:** visible focus, contrast meeting WCAG AA for text on parchment/gold pairings (gold on parchment for large text/buttons only; body text uses ink).
- **Performance:** Monitor and Today load primary status in one request where practical.
- **Audit:** persist sessions immutably in v1 (append-only sessions; auto-close writes an end time). No silent deletion of sessions.
- **Hosting:** single small web app + API + database is sufficient; exact stack is out of this requirements doc.

---

## 8. Out of scope (v1)

- Pause / resume breaks  
- Leave requests and holidays calendar  
- Time correction / approval workflow  
- Owner or employee editing historical hours  
- Mark month paid / payment ledger / payroll payout  
- Overtime pay above 15,000  
- Task or social-post logging  
- Geofencing, GPS, IP allowlists  
- Multi-employee, departments, roles beyond employee/owner  
- Notifications (email/push) for late or absent  
- Integration with Blue Hawke HR  

---

## 9. Data concepts (logical)

Not a schema commit — logical entities for implementation later:

**User** — `id`, `email`, `role` (`employee` | `owner`), auth fields.

**EmployeeProfile** — single row for Emad: `displayName` (“Emad Khan”), `expectedStart` `14:00`, `expectedEnd` `23:00`, `graceMinutes` `15`, `dailyTargetHours` `8`, `monthlySalaryPkr` `15000`.

**TimeSession** — `id`, `employeeId`, `workDate` (PKT date), `startedAt`, `endedAt` (null if open), `endReason` (`clock_out` | `auto_closed`).

Derived (not stored): day status, late flag, month summary, earned pay.

---

## 10. Acceptance criteria

- [ ] Emad can clock in and out; only one open session at a time.
- [ ] Multiple sessions on one day sum correctly into daily hours.
- [ ] Hours outside 14:00–23:00 count toward day and month totals.
- [ ] Weekday with ≥ 8h → `present`; > 0 and < 8h → `partial`; past weekday 0h → `absent`.
- [ ] First in after 14:15 PKT → late flag; does not alone change pay.
- [ ] Open session past midnight PKT is auto-closed at 00:00; further work needs a new clock-in.
- [ ] Monthly target = 8 × weekdays in month; earned pay = min(15000, worked/target × 15000).
- [ ] Owner sees live status, today, month hours, and earned pay with no edit or mark-paid actions.
- [ ] Employee and owner cannot access each other’s accounts; Emad cannot edit history.
- [ ] UI uses the golden token set and Fraunces + Source Sans 3 as specified.
- [ ] All user-visible times labeled or implied as Pakistan Standard Time.

---

## 11. Open decisions deferred to implementation

None that block building v1. Stack choice (e.g. reuse BHHR patterns vs greenfield) is an implementation-plan concern after this requirements doc is approved.
