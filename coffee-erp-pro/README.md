# ☕ Coffee ERP Pro

**Professional Enterprise Resource Planning System for Coffee Businesses**

A comprehensive, modern, cloud-based ERP solution specifically designed for specialty coffee roasters, importers, and retailers. Built with React, TypeScript, Supabase, and deployed on Vercel.

---

## 🌟 Key Features

### 📊 Analytics Dashboard ⭐ NEW
- **Comprehensive Business Intelligence**: Real-time insights into revenue, expenses, profit margins
- **Interactive Charts**: Revenue trends, sales by variety, stock distribution, expense breakdown
- **Production Analytics**: Roasting efficiency tracking and batch performance comparison
- **Inventory Analytics**: Low stock alerts, turnover rate, reorder recommendations
- **KPI Tracking**: Financial metrics, operational efficiency, business health scores

### 🔐 Secure Authentication
- Supabase Auth with secure password hashing
- Role-based access control (Admin, Roaster, QC, Sales, User)
- Session management with auto-refresh
- Multi-user collaboration

### 📦 Complete Supply Chain Management
- **Purchase Orders**: Supplier management, order tracking, delivery scheduling
- **Quality Control**: SCA-standard grading, physical analysis, defect tracking
- **Warehouse**: Real-time inventory, location management, stock movement history
- **Sales**: Order processing, customer management, payment tracking

### 🔥 Production Management
- **Roasting Operations**: Detailed roast profiles, temperature tracking, time milestones
- **Cupping Sessions**: SCA scoring system, sensory evaluation, quality classification
- **Blending**: Recipe management, cost calculation, consistency tracking
- **External Roasting**: Third-party roastery management

### 💰 Financial Management
- **Expense Tracking**: Categorized spending, budget management
- **HPP Calculator**: Cost of goods sold, pricing strategy, margin analysis
- **Financial Reports**: Income statement, cash flow, profitability analysis

### ✅ Task Management
- Collaborative task assignment
- Priority and due date tracking
- Comments and activity feed
- Status workflow (To Do → In Progress → Done)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier available)
- Vercel account for deployment (optional)

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
# Create .env file with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS (via CDN)
- **Recharts** - Data visualization

### Backend & Database
- **Supabase** - PostgreSQL database, authentication, real-time subscriptions
- **Row Level Security** - Database-level security policies
- **Automatic backups** - Built-in with Supabase

### Deployment
- **Vercel** - Edge network, automatic HTTPS, CI/CD
- **GitHub Integration** - Auto-deploy on push

---

## 📁 Project Structure

```
coffee-erp-pro/
├── components/          # React components
│   ├── common/         # Reusable components
│   ├── Analytics.tsx   # ⭐ Analytics Dashboard
│   └── ...
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
├── lib/               # Utilities
│   └── supabase.ts
├── services/          # API services
│   └── supabaseService.ts
├── types.ts           # TypeScript definitions
└── ...
```

---

## 🔒 Security Features

- ✅ Secure password hashing
- ✅ JWT-based sessions
- ✅ Row Level Security (RLS)
- ✅ Role-based access control
- ✅ HTTPS only

---

## 🌍 Internationalization

- 🇬🇧 English (en)
- 🇮🇩 Indonesian (id)

---

## 🎨 User Roles

| Role | Access Level |
|------|-------------|
| Admin | Full system access |
| Roaster | Production & quality |
| QC | Quality control & grading |
| Sales | Sales & inventory view |
| User | Dashboard & tasks |

---

## 📖 Documentation

- **[Deployment Guide](../DEPLOYMENT.md)** - Complete deployment instructions
- **[Features Documentation](../FEATURES.md)** - Detailed feature list

---

## 🚀 Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed Vercel deployment instructions.

---

## 📝 License

Copyright © 2024 Coffee ERP Pro. All rights reserved.

---

**Made with ☕ for the Coffee Industry**
