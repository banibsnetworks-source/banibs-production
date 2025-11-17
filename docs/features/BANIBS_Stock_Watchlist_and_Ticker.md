# 📘 BANIBS Stock Watchlist & Ticker — Feature Specification

**Feature Name**: BANIBS Stock Watchlist & Ticker  
**Module**: Business Mode (BANIBS Connect – Business)  
**Phase Target**: Phase 8.5 (Business Tools Upgrade)  
**Type**: Read-only market data (no trading)

---

## 1. 🎯 Purpose

Provide BANIBS users with a personal stock watchlist and live/near-live ticker inside Business Mode, so they can:

- Track their own set of ticker symbols (e.g., 10–20)
- See price, change, and percentage change at a glance
- Quickly check market sentiment while using BANIBS for business activities

This is a **utility + retention feature**: a reason to open BANIBS daily.

---

## 2. 🧠 Core Principles

### Read-Only
- Display quotes and charts only.
- No trading, no orders, no brokerage integration.

### User-Customizable
- Each user can configure their own watchlist.

### Lightweight & Fast
- Small, cached requests to external data provider.
- No heavy charts or streaming in MVP.

### Non-Regulated
- No investment advice.
- Clear disclaimer: informational only.

---

## 3. 👥 Target Users

- Business owners using BANIBS daily
- Side-hustlers and investors watching a handful of stocks
- Users who want a one-stop "business dashboard" that includes financial awareness

---

## 4. 🧱 Feature Set (MVP)

### 4.1 Personal Watchlist

Each user can track up to **20 symbols**.

**Symbols**: US stock tickers (e.g., AAPL, MSFT, TSLA).

**Stored and loaded per user**.

For each symbol show:
- Ticker (e.g., AAPL)
- Company name (optional)
- Last price
- Daily change (absolute)
- Daily change (%)
- Color-coded change:
  - **Green** for positive
  - **Red** for negative
  - **Gray** for flat / unavailable

### 4.2 Business Home Widget

On `/portal/business` (Business Home):

Add a **"My Market Watch"** widget:
- Shows top 5–8 symbols from user's watchlist.
- Compact format:
  - Ticker
  - Price
  - % change
  - Tiny sparkline (optional, Phase 2)
- "View full watchlist" link that goes to `/portal/business/stocks`.

### 4.3 Dedicated Stock Watch Page

**Route**: `/portal/business/stocks`

**Page sections**:

#### Header
- Title: "My Stock Watchlist"
- Subtext: "Track the stocks you care about while you work."

#### Watchlist Table
Columns:
- Ticker
- Company (if available)
- Last price
- Change
- % change
- Last updated
- Remove button

#### Add Symbol UI
- Input: Ticker symbol
- Optional: search API for name autocomplete
- Validate symbol using API call before adding
- Error states: "Invalid symbol", "Symbol already in watchlist", "Max 20 symbols."

#### Optional Detail Drawer (Phase 2)
Click a row to open a panel with:
- Small chart (1D / 5D / 1M)
- Day high/low
- 52-week high/low
- Market cap

### 4.4 Mini-Ticker (Phase 2 / Optional)

A horizontal scrolling ticker across the top of Business Mode pages:
- Shows 5–10 symbols from the user's watchlist cycling.
- Format: `AAPL 189.45 (+1.23%) • TSLA 210.12 (-2.15%) • ...`
- Toggle on/off in Business Settings.

**This can be deferred to Phase 2 of the feature.**

---

## 5. 📊 Data Source (Abstracted)

We do NOT hard-code a specific vendor in the spec; we define an abstraction layer instead.

### 5.1 Market Data Service (Backend)

Create a backend service module, e.g.:
```
/app/backend/services/market_data_service.py
```

With an interface like:
```python
def get_quotes(symbols: List[str]) -> Dict[str, Quote]:
    # Quote includes last price, change, change_percent, timestamp, etc.
```

The implementation can later plug into:
- Yahoo Finance-like API
- Alpha Vantage
- Polygon.io
- Or any other vendor

**MVP can use free/delayed data.**

---

## 6. 🗂️ Data Model (Mongo)

### Collection: `stock_watchlists`

Per-user watchlist:
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "symbols": ["AAPL", "MSFT", "TSLA"],
  "created_at": ISODate,
  "updated_at": ISODate
}
```

**Notes**:
- Enforce symbol count ≤ 20.
- Optionally, store per-symbol display order.
- No need to store price history in Mongo for MVP — fetch on demand.

---

## 7. 🧵 API Endpoints

**Base path**: `/api/stocks`

### 7.1 Watchlist Management

#### GET /watchlist
Returns current user's symbols array.

#### POST /watchlist
Body: `{ "symbols": ["AAPL", "MSFT"] }`  
Replaces entire list (or use granular endpoints below).

#### POST /watchlist/add
Body: `{ "symbol": "AAPL" }`  
Adds a single symbol (if valid and under limit).

#### POST /watchlist/remove
Body: `{ "symbol": "AAPL" }`  
Removes symbol from list.

### 7.2 Quote Retrieval

#### GET /quotes?symbols=AAPL,MSFT,TSLA

Response:
```json
{
  "AAPL": {
    "symbol": "AAPL",
    "price": 189.45,
    "change": 1.23,
    "change_percent": 0.65,
    "updated_at": "2025-11-17T14:30:00Z"
  },
  "MSFT": { ... }
}
```

Frontend uses this for both:
- Business Home widget
- Full watchlist page

---

## 8. 🎨 Frontend Implementation

### 8.1 Components

Create under:
```
/app/frontend/src/components/stocks/
```

- `StockWatchWidget.jsx` - For Business Home (shows top few symbols)
- `StockWatchTable.jsx` - For full `/portal/business/stocks` page
- `AddStockSymbolForm.jsx` - Input + button + validation
- `MiniTicker.jsx` (Phase 2) - For scrolling ticker strip

### 8.2 Pages

`BusinessStocksPage.jsx`

Use BusinessLayout and render:
- `<StockWatchHeader />`
- `<AddStockSymbolForm />`
- `<StockWatchTable />`

### 8.3 UI Behavior

- Show skeleton loaders while fetching quotes.
- Handle error states: API unavailable / rate-limited.
- Respect BANIBS theme (light/dark) and brand yellow/gold accents.

---

## 9. ⚖️ Disclaimers & Safety

Display a disclaimer in the widget and main page footer:

> "Market data is for informational purposes only and may be delayed. BANIBS does not provide investment advice or brokerage services."

- No recommendations. No "Buy/Sell" language. No buttons that imply trading.

---

## 10. 🚀 Rollout Plan

### Phase 8.5 – MVP
- Personal watchlist (max 20 symbols)
- Business Home widget
- `/portal/business/stocks` page with table
- Basic price/change/% change
- Manual refresh or auto-refresh every 60–120 seconds

### Phase 8.6 – Enhancements
- Mini-ticker across Business Mode
- Basic chart panel per symbol (using cached or on-demand chart data)
- Grouped watchlists (e.g., "My Long-Term," "My Watch," etc.)

### Phase 9.x – Deeper Integrations
- Circles-based shared watchlists (e.g., Investment Circles sharing lists)
- Alerts (price crossing threshold) – long-term

---

## 11. ✅ Success Criteria

This feature is considered successful when:

- Users can add/remove symbols to a personal watchlist
- Business Home widget shows live data without breaking layout
- `/portal/business/stocks` reliably shows current prices + % change
- API remains responsive and doesn't cause major performance issues
- Disclaimers and non-advisory positioning are clear

---

**Status**: Planned for Phase 8.5  
**Last Updated**: November 17, 2025
