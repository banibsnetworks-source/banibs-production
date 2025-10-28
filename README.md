# BANIBS — Black America News Information & Business System

**Connecting our people to opportunity, resources, and each other.**

---

## About BANIBS

BANIBS is a digital infrastructure that informs, empowers, and connects the Black community through news, opportunity, and enterprise. It unites four pillars — **News, Business, Resources, and Social Connectivity** — within one cohesive ecosystem designed to expand access and strengthen collaboration across Black America.

### The BANIBS Ecosystem

- **📰 News & Stories** — Editorial coverage of Black business, culture, and community
- **🏢 Business Directory** — Discover and support Black-owned businesses
- **📚 Resources** — Grants, legal help, funding tools, and education for founders and students
- **💬 Social Network** — Connect with creators, founders, and community leaders

---

## Platform Overview

BANIBS provides:
- **Opportunities Feed** — Curated jobs, grants, scholarships, training programs, and events
- **Dynamic News Aggregation** — Latest stories and community highlights
- **Contributor System** — Community members can submit opportunities and content
- **Admin Moderation** — Role-based access control for content management
- **Sponsorship & Monetization** — Paid placement for featured opportunities
- **Newsletter System** — Automated digest delivery to subscribers

---

## Tech Stack

**Backend:**
- FastAPI (Python)
- MongoDB (Motor driver)
- JWT Authentication
- Stripe Integration
- Rate Limiting & Safety Controls

**Frontend:**
- React
- Tailwind CSS (Glass morphism design system)
- React Router
- Axios

---

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB
- Yarn

### Installation

1. **Backend Setup:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Frontend Setup:**
```bash
cd frontend
yarn install
```

3. **Environment Configuration:**
- Backend: Configure `backend/.env` with MongoDB URL and secrets
- Frontend: Configure `frontend/.env` with backend API URL

4. **Run Services:**
```bash
# Backend
cd backend
uvicorn server:app --reload

# Frontend
cd frontend
yarn start
```

---

## Design System

BANIBS uses a comprehensive design system documented in `BANIBS_DESIGN_SYSTEM_V1.md`.

**Key Visual Elements:**
- **Glass Cards** — `bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl`
- **Gold Accents** — `#FFD700` for brand highlights and recognition content
- **Dark Bands** — `bg-gray-900` for conversion sections
- **Responsive Grid** — Mobile-first, collapses to single column on small screens

---

## Project Structure

```
/app/
├── backend/
│   ├── db/                    # Database helpers
│   ├── middleware/            # Auth, rate limiting
│   ├── models/                # Pydantic models
│   ├── routes/                # API endpoints
│   ├── services/              # Email, JWT, uploads
│   └── server.py              # FastAPI app
├── frontend/
│   ├── src/
│   │   ├── api/               # API helpers
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # Auth contexts
│   │   ├── pages/             # Page components
│   │   └── services/          # Frontend services
│   └── public/                # Static assets
├── BANIBS_DESIGN_SYSTEM_V1.md # Design system documentation
└── README.md                   # This file
```

---

## Key Features

### Phase 2.7–2.9 (Foundation)
- ✅ Opportunity CRUD (jobs, grants, scholarships, training, events)
- ✅ Admin moderation dashboard
- ✅ Public submissions
- ✅ Contributor accounts
- ✅ Analytics dashboard

### Phase 3 (Engagement & Growth)
- ✅ Contributor profiles
- ✅ Moderation history
- ✅ Email notifications

### Phase 4 (Community & Monetization)
- ✅ Public reactions & comments
- ✅ Newsletter opt-in
- ✅ Sponsored badges
- ✅ Contributor leaderboard
- ✅ Role-Based Access Control (RBAC)

### Phase 5 (Monetization, Delivery, Safety)
- ✅ Paid sponsored placement (Stripe)
- ✅ Automated weekly digest delivery
- ✅ Abuse/safety controls (rate limiting, banned sources)
- ✅ Opportunity detail page
- ✅ Admin revenue overview

### Current (News Front Page)
- ✅ Dynamic news aggregation feed (`/api/news/latest`)
- ✅ Featured story section
- ✅ The BANIBS Network (ecosystem showcase)
- ✅ Community highlights
- ✅ Compact category navigation
- ✅ Glass morphism design system

---

## API Documentation

See `API_DOCUMENTATION.md` for detailed endpoint documentation.

**Key Endpoints:**
- `GET /api/opportunities` — List opportunities (public)
- `POST /api/opportunities/submit` — Submit opportunity (contributor)
- `GET /api/news/latest` — Latest news items (public)
- `POST /api/sponsor/checkout` — Stripe checkout (contributor)
- `POST /api/admin/newsletter/send-digest` — Send digest (admin)

---

## Contributing

BANIBS is built to serve the Black community. If you'd like to contribute:

1. Review the design system documentation
2. Follow existing patterns and conventions
3. Test responsively (mobile-first)
4. Maintain the glass card aesthetic
5. Document new features

---

## License

All rights reserved. BANIBS is proprietary software.

---

## Contact & Support

For questions, partnerships, or support, visit [banibs.com](https://banibs.com) or contact the BANIBS team.

**Tagline:** Connecting our people to opportunity, resources, and each other.
