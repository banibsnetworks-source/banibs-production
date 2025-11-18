# BANIBS – Manage Businesses Dashboard

**Spec v1.0**

---

## 1. Purpose

The **Manage Businesses** dashboard is the control center for users who own or manage one or more business profiles on BANIBS.

### Goals:

- Show a clear list of all businesses tied to the user.
- Let users quickly:
  - **View**
  - **Edit**
  - **Add a new business**
- Surface whether each business is **Black-Owned (self-confirmed)**.
- Lay the foundation for membership-based limits in future phases (e.g., number of businesses per tier).

---

## 2. Entry Points & Routes

### 2.1 Route

- **Path:** `/portal/biz/manage`
- **Name:** Manage Businesses

### 2.2 Entry Points

**From Business Mode / Biz Portal:**
- In the left sidebar (if present):
  - **My Businesses**
- Or in the Biz dashboard:
  - Button: **"Manage Businesses"**

**From the top-right user/business menu in Biz mode:**
- Under a section like:
  - "Business Tools" → "Manage Businesses"

**After creating a business:**
- Success screen can include:
  - Button: **"Manage All My Businesses"** → `/portal/biz/manage`

---

## 3. Page Layout (Desktop)

High-level layout for `/portal/biz/manage`:

1. **Header / Summary**
2. **Businesses List** (cards or table)
3. **Add New Business** block/button
4. **(Future) Membership & Limits Info**

### 3.1 Header / Summary

**Component:** `ManageBusinessesHeader`

- **Title:** My Businesses
- **Subline (example):**
  - "These are the businesses you manage on BANIBS. You can view, edit, or add new businesses from here."
- **Optional status text:**
  - *You currently manage 2 businesses.*
  - **Future:** *You are on the Free Plan. You can create 1 more business.*

### 3.2 Businesses List

**Component:** `BusinessList`

Shows each business in a card or row.  
For v1, a simple responsive card grid is enough.

**Each card includes:**

- Business Name
- Category (e.g. Restaurant, Salon, Consulting)
- City, State
- **Status badges:**
  - **Black-Owned (self-confirmed)** if `is_black_owned_confirmed = true`
  - **(Future)** Verified, Premium, etc.
- **Primary actions:**
  - **View Profile**
  - **Edit**
- **Secondary actions (optional v1 or v2):**
  - Set as Featured (future)
  - Deactivate or Hide (future)

**Example card layout:**

```
[Logo or Initials]   [Business Name]
Category · City, State

[Badge: Black-Owned (self-confirmed)]

[ View Profile ]  [ Edit ]
```

### 3.3 Empty State

If user has no businesses yet:

Show an empty state card with:

- **Message:**
  - "You don't have any businesses yet."
- **Button:**
  - **[+ Create Your First Business]** → `/portal/biz/profile/create`

---

## 4. "Add New Business" Behavior

### 4.1 Button

At top-right of the page (and/or bottom):

**[+ Add New Business]**

**Behavior:**

- Navigates to business create form:
  - `/portal/biz/profile/create`
- Does **not** block based on count in v1 (limits come later).

---

## 5. Membership & Limits (Future-Ready, Light v1)

We don't need full membership logic yet, but the structure should anticipate it.

### 5.1 Backend Concept (Future)

Add fields to User:

- `business_limit: int` (e.g., 1, 3, 5, 10, etc.)
- Or derive from `membership_tier` (Free, Bronze, Silver, Gold, Platinum).

### 5.2 UI Placeholder v1

On Manage Businesses page, optionally show:

```
You currently manage X businesses.

(Future)
Your plan allows up to Y businesses.
Upgrade to manage more businesses.
```

**For now, Neo doesn't need to enforce a limit — just display count.**

---

## 6. Data & API Design

### 6.1 Business Model (Simplified v1)

For each business in the list, we need:

```json
{
  "id": "business_id_string",
  "name": "My Business Name",
  "category": "Restaurant",
  "city": "Atlanta",
  "state": "GA",
  "is_black_owned_confirmed": true,
  "logo_url": null,       // or string
  "created_at": "2025-11-17T12:34:56Z",
  "is_active": true       // for future deactivation controls
}
```

### 6.2 Endpoint: Get Businesses Owned by Current User

**GET `/api/business/my-businesses`**

Returns list of business profiles where `owner_user_id == current_user`.

Sorted by `created_at desc` (newest first).

**Response example:**

```json
{
  "businesses": [
    {
      "id": "biz123",
      "name": "T-Rex Electrical & Repair",
      "category": "Home Services",
      "city": "Atlanta",
      "state": "GA",
      "is_black_owned_confirmed": true,
      "logo_url": null,
      "created_at": "2025-11-10T10:00:00Z",
      "is_active": true
    },
    {
      "id": "biz456",
      "name": "BANIBS Media Group",
      "category": "Media & Entertainment",
      "city": "Stone Mountain",
      "state": "GA",
      "is_black_owned_confirmed": true,
      "logo_url": null,
      "created_at": "2025-11-15T14:30:00Z",
      "is_active": true
    }
  ]
}
```

### 6.3 Frontend Usage

On `/portal/biz/manage`, call `GET /api/business/my-businesses` on mount.

- Render each item as a card in the list.
- Show loading state and empty state gracefully.

---

## 7. Navigation from Each Business

Each card needs:

**View Profile**
- `navigate("/portal/business/" + business.id)`
- Or whatever route you already use for public business profiles.

**Edit**
- `navigate("/portal/biz/profile/edit/" + business.id)`
- If edit route not yet created:
  - For now, can point to `/portal/biz/profile/{id}` with edit options on that page.

---

## 8. Permissions & Ownership

- Only the **owner** (or authorized managers in future) can see businesses on `/portal/biz/manage`.
- No one else should see another user's manage dashboard.

**A future enhancement:**
- "Add Manager" / "Invite collaborator," etc.
- Not needed in v1.

---

## 9. Mobile Behavior

- Cards stack vertically.
- "Add New Business" button pinned near top.
- Minimal text, emphasize primary actions (View, Edit).

---

## 10. Implementation Phasing for Neo

When you hand this to Neo, you can tell him:

### Phase 1 (MVP):

- Implement `GET /api/business/my-businesses`.
- Implement `/portal/biz/manage` page.
- Show list of business cards with:
  - name, category, city/state, Black-owned badge.
  - **View Profile** and **Edit** buttons.
- Show **+ Add New Business** button.
- Basic **empty state**.

### Phase 2 (Later):

- Integrate membership tiers & business count limits.
- Add search/filter (by city, category).
- Add status toggles (Active/Inactive).
- Add "Set as Featured" for front-end Biz search, etc.

---

**End of Specification v1.0**
