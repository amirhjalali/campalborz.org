# Frontend Architecture - Camp Alborz Member Management

## Overview

21 total pages across 3 sections: Public (KEEP), Member Portal (NEW), Admin Dashboard (NEW).
Uses existing design system: Tailwind CSS, Framer Motion, Lucide React, Cinzel/Cormorant/Inter fonts.

---

## Pages to KEEP (No Changes)

| Route | Description |
|---|---|
| `/` | Homepage |
| `/about` | About Camp Alborz |
| `/art` | Art overview |
| `/art/homa` | HOMA art car |
| `/art/damavand` | DAMAVAND art car |
| `/events` | Events listing |
| `/culture` | Persian culture |
| `/donate` | Donation form |
| `/donate/success` | Donation confirmation |
| `/search` | Site search |

---

## Pages to BUILD/REDESIGN

### 1. `/apply` - Membership Application (PUBLIC) - MODIFY

**Current state:** Has form but fakes success (catches errors, returns `{ ok: true }`). Links to Google Form.

**Changes needed:**
- Wire form submission to `applications.submit` API
- Remove Google Form link
- Add fields: playaName, referredBy, housingPreference, emergencyContact
- Proper error handling (show API errors)
- Success state: "Application received! We'll review and get back to you within 2 weeks."

**Components:** Uses existing `form-input`, `form-label`, `cta-primary` classes.
**Data:** `POST applications.submit`

### 2. `/login` - Login Page (PUBLIC) - NEW (replaces `/members` unauthenticated view)

**Design:**
- Centered `luxury-card` container on cream background
- Camp Alborz logo/name header
- Email + password inputs (existing `form-input` class)
- "Sign In" button (`cta-primary`)
- "Forgot password?" text link
- No registration link (invite-only)

**Data:** `auth.login` -> store JWT in localStorage -> redirect to `/portal`

### 3. `/forgot-password` - Password Reset Request (PUBLIC) - NEW

- Email input -> "Send Reset Link" button
- Success: "Check your email for a reset link"
- **Data:** `auth.forgotPassword`

### 4. `/reset-password` - Set New Password (PUBLIC) - NEW

- Token from URL query param
- New password + confirm password
- **Data:** `auth.resetPassword`

### 5. `/invite/[token]` - Accept Invite (PUBLIC) - NEW

- Welcome message: "You've been invited to join Camp Alborz!"
- Set password form (password + confirm)
- **Data:** `auth.acceptInvite` -> redirect to `/portal`

### 6. `/portal` - Member Dashboard (MEMBER) - NEW

**Layout:** `PortalLayout` (top nav: Dashboard, My Season, Payments, Profile, Logout)

**Content:**
- Welcome header: "Welcome back, {playaName || name}!"
- **Season Status Card** (`luxury-card`):
  - Status badge (Confirmed/Maybe/Interested)
  - Dues status: Paid / $X remaining
  - Housing: {type} {size}
  - Arrival: {date}
- **Quick Actions** (button row):
  - "Update My Info" -> `/portal/season`
  - "View Payments" -> `/portal/payments`
  - "View Schedule" -> `/portal/season#shifts`
- **Announcements** list (from `announcements.list`, sorted by priority)
- **Key Dates** card: Build start, Burn dates, Strike end

**Data:** `dashboard.getMemberDashboard`, `announcements.list`

### 7. `/portal/season` - My Season Details (MEMBER) - NEW

- Housing card: type, size, shared partner, grid position
- Editable fields: arrival date, departure date, ride details, special requests
- Build/strike assignment display
- Shift schedule list
- Equipment requests: form to request AC/mattress/cot with status display

**Data:** `seasonMembers.getMySeasonStatus`, `seasonMembers.updateArrival`, `build.getBuildDays`, `inventory.createRequest`

### 8. `/portal/payments` - My Payments (MEMBER) - NEW

- **What I Owe** card: Dues ($1,200), Grid fee (if applicable), breakdown
- **What I've Paid** table: Date, Type, Amount, Method
- **Net Balance** display (green if paid up, red if owing)
- **How to Pay** card: Zelle details, Venmo handle, PayPal email, Givebutter link

**Data:** `payments.getMyPayments`

### 9. `/portal/profile` - Edit Profile (MEMBER) - NEW

- Personal info: name (editable), email (read-only), phone, playa name, gender
- Emergency contact: name, phone
- Dietary restrictions
- Change password section
- Save button

**Data:** `members.getMyProfile`, `members.updateMyProfile`, `auth.changePassword`

### 10. `/admin` - Admin Dashboard (ADMIN) - REPLACE

**Layout:** `AdminLayout` (sidebar nav + header with season selector)

**Sidebar Nav:**
- Dashboard, Members, Season, Housing, Payments, Build, Inventory, Budget, Tickets, Applications, Announcements

**Content:**
- Season selector dropdown in header
- **Stat Cards Row** (4 cards): Total Members, Confirmed, Dues Collected %, Total Revenue
- **Status Breakdown**: progress bars for Confirmed/Maybe/Interested/Cancelled
- **Housing Breakdown**: counts by type (Tent: X, RV: X, Shiftpod: X, etc.)
- **Pending Actions** card: pending applications, unpaid dues, unreimbursed expenses
- **Recent Activity** feed (latest payments, status changes)

**Data:** `dashboard.getAdminDashboard`, `seasons.getStats`

### 11. `/admin/members` - Member Management (ADMIN) - NEW

- Search bar + filter dropdowns (status, dues paid, housing type, build/strike, role)
- **DataTable**: Name, Playa Name, Email, Status (badge), Dues (badge), Housing, Build/Strike
- Click row -> `/admin/members/[id]`
- Toolbar: "Invite New Member", "Export CSV", "Enroll in Season"
- Pagination

**Data:** `seasonMembers.list`, `members.invite`, `seasonMembers.export`

### 12. `/admin/members/[id]` - Member Detail (ADMIN) - NEW

- Profile header: name, playa name, email, phone, role badge, gender
- **Season Tabs**: one tab per season they participated in
- **Current Season Card**: status, housing, grid, arrival/departure, build/strike, special requests
- **Payment History** table for this member
- All fields editable inline or via modal
- Admin notes textarea (auto-saves)
- Danger zone: Deactivate Member, Change Role

**Data:** `members.getById`, `seasonMembers.getById`, `payments.getMemberPayments`

### 13. `/admin/season` - Season Management (ADMIN) - NEW

- Current season settings display/edit (dues, grid fees, dates)
- "Create New Season" form
- Bulk operations: "Enroll Returning Members", "Send Invites"

**Data:** `seasons.list`, `seasons.create`, `seasons.update`, `seasonMembers.bulkEnroll`

### 14. `/admin/housing` - Housing Overview (ADMIN) - NEW

- Stats row: Tent count, RV count, Shiftpod count, Dorm slots, grid power totals
- Filterable table: Member, Housing Type, Size, Shared With, Grid Power, Map Object
- Inline editing for assignments

**Data:** `seasonMembers.list` (grouped by housing)

### 15. `/admin/payments` - Payment Ledger (ADMIN) - NEW

- Summary cards: Total Collected, Dues Progress (X/Y paid), Outstanding
- Filters: type, method, member, date range
- Payment table: Date, Member, Type, Amount, Method, Paid To, Notes
- "Record Payment" button -> `RecordPaymentModal`

**Data:** `payments.list`, `payments.create`, `payments.getSummary`

### 16. `/admin/build` - Build & Strike (ADMIN) - NEW

- **Tab layout**: Build Days | Strike Crew | Early Arrivals
- Build Days: cards per day with assigned members, add/remove
- Strike: list with departure dates
- Early Arrivals: pass list with dates and IDs

**Data:** `build.getBuildDays`, `build.getStrikeCrew`, `build.getEarlyArrivals`

### 17. `/admin/inventory` - Equipment (ADMIN) - NEW

- Category tabs: Shade, Tents, AC, Mattresses, Kitchen, Bikes, Other
- Item cards with quantities and conditions
- Member requests queue with approve/deny buttons

**Data:** `inventory.list`, `inventory.getRequests`, `inventory.updateRequestStatus`

### 18. `/admin/budget` - Budget & Expenses (ADMIN) - NEW

- Budget table: Category, Estimated, Actual, Variance (color-coded)
- Expense log table (filterable, sortable)
- Reimbursement queue
- "Add Expense" button -> form

**Data:** `finance.getBudget`, `finance.getExpenses`, `finance.getBudgetSummary`

### 19. `/admin/tickets` - DGS Tickets (ADMIN, lower priority) - NEW

- Allocation table: Member, Type, Quantity, Vehicle Pass, Confirmed
- Summary stats

**Data:** `tickets.list`, `tickets.getSummary`

### 20. `/admin/applications` - Review Applications (ADMIN) - NEW

- Table: Date, Name, Email, Experience, Status
- Click -> detail view
- Accept/Reject/Waitlist buttons with notes field

**Data:** `applications.list`, `applications.review`

### 21. `/admin/announcements` - Announcements (ADMIN) - NEW

- List with edit/delete
- Create form: title, content, priority

**Data:** `announcements.list`, `announcements.create`

---

## Shared Layouts

### PortalLayout (Member Portal)
```
┌──────────────────────────────────────────┐
│ Logo    Dashboard  Season  Payments  Profile  [Logout] │
├──────────────────────────────────────────┤
│                                          │
│              Page Content                │
│                                          │
└──────────────────────────────────────────┘
```
- Top navigation bar, cream background
- Mobile: hamburger menu
- Shows user name/playa name

### AdminLayout (Admin Dashboard)
```
┌─────────┬───────────────────────────────┐
│ Sidebar │  [Season Selector]  [User ▾]  │
│         ├───────────────────────────────┤
│ Dash    │                               │
│ Members │         Page Content          │
│ Season  │                               │
│ Housing │                               │
│ Payments│                               │
│ Build   │                               │
│ Inventory│                              │
│ Budget  │                               │
│ Tickets │                               │
│ Apps    │                               │
│ Announce│                               │
└─────────┴───────────────────────────────┘
```
- Left sidebar (collapsible on mobile), sage/dark background
- Header with season selector dropdown and user menu
- Active nav item highlighted with gold accent

---

## Shared Components

| Component | Description | Used In |
|---|---|---|
| `StatusBadge` | Color pill: Confirmed=green, Maybe=yellow, Interested=blue, Waitlisted=orange, Cancelled=gray | Members table, detail, portal |
| `PaymentStatusBadge` | Paid=green, Partial=yellow, Unpaid=red | Members table, portal |
| `DataTable` | Sortable, filterable, paginated table with `luxury-card` styling | All admin list pages |
| `StatCard` | Metric card: icon, value, label. Uses `luxury-card` | Admin dashboard, summaries |
| `SeasonSelector` | Dropdown to switch seasons | Admin header |
| `RecordPaymentModal` | Modal: member selector, type, amount, method, date, notes | Admin payments |
| `ConfirmDialog` | Confirmation modal for destructive actions | Throughout admin |
| `EmptyState` | Illustration + message for empty lists | All list pages |
| `LoadingState` | Skeleton loaders | Throughout |
| `SearchInput` | Input with search icon, debounced onChange | Admin members, payments |
| `CurrencyInput` | Input with $ prefix, formats as currency | Payment forms |
| `DatePicker` | Native date input or lightweight picker | Season, build, payments |

---

## Auth Flow

```
Unauthenticated:
  /login -> auth.login -> JWT stored -> redirect /portal (member) or /admin (admin)
  /apply -> applications.submit -> success page
  /invite/[token] -> auth.acceptInvite -> JWT stored -> redirect /portal

Authenticated (MEMBER):
  /portal, /portal/season, /portal/payments, /portal/profile

Authenticated (ADMIN/MANAGER):
  All member routes + /admin/*

Route Protection:
  - Middleware checks JWT on /portal/* and /admin/* routes
  - /admin/* requires role === ADMIN or MANAGER
  - Redirect to /login if unauthenticated
  - Redirect to /portal if authenticated but insufficient role
```

---

## File Structure (New)

```
packages/web/src/
├── app/
│   ├── login/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── invite/[token]/page.tsx
│   ├── portal/
│   │   ├── layout.tsx (PortalLayout)
│   │   ├── page.tsx (dashboard)
│   │   ├── season/page.tsx
│   │   ├── payments/page.tsx
│   │   └── profile/page.tsx
│   ├── admin/
│   │   ├── layout.tsx (AdminLayout)
│   │   ├── page.tsx (dashboard)
│   │   ├── members/
│   │   │   ├── page.tsx (list)
│   │   │   └── [id]/page.tsx (detail)
│   │   ├── season/page.tsx
│   │   ├── housing/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── build/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── budget/page.tsx
│   │   ├── tickets/page.tsx
│   │   ├── applications/page.tsx
│   │   └── announcements/page.tsx
│   └── ... (existing public pages)
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── SeasonSelector.tsx
│   │   ├── RecordPaymentModal.tsx
│   │   └── DataTable.tsx
│   ├── portal/
│   │   └── PortalLayout.tsx
│   ├── shared/
│   │   ├── StatusBadge.tsx
│   │   ├── StatCard.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   ├── SearchInput.tsx
│   │   ├── CurrencyInput.tsx
│   │   └── DatePicker.tsx
│   └── ... (existing components)
├── contexts/
│   └── AuthContext.tsx (REPLACE - real JWT auth)
├── lib/
│   └── trpc.ts (NEW - tRPC client setup)
└── ... (existing files)
```
