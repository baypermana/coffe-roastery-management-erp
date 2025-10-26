# Coffee ERP Pro - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier available)
- Vercel account (free tier available)
- Git repository

## 1. Supabase Setup

### A. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Wait for project initialization (2-3 minutes)

### B. Apply Database Migrations

The migration has already been applied automatically. You can verify by checking:
- Go to Supabase Dashboard → SQL Editor
- Check that all tables exist: `users`, `suppliers`, `purchase_orders`, `stock_items`, etc.

### C. Create Demo User

To create your first admin user:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create New User"
3. Enter email and password
4. After user is created, go to SQL Editor and run:

```sql
INSERT INTO public.users (id, username, role)
VALUES ('<USER_ID_FROM_AUTH>', 'admin', 'Admin');
```

Replace `<USER_ID_FROM_AUTH>` with the UUID from Authentication panel.

### D. Get API Keys

1. Go to Project Settings → API
2. Copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public key (starts with `eyJhbGc...`)

## 2. Environment Variables

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 4. Vercel Deployment

### Option A: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

6. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option C: Deploy via GitHub Integration

1. Push code to GitHub
2. Go to Vercel Dashboard
3. Import repository
4. Vercel will auto-deploy on every push to main branch

## 5. Post-Deployment Setup

### Seed Demo Data (Optional)

Run this SQL in Supabase SQL Editor to add demo data:

```sql
-- Insert demo suppliers
INSERT INTO public.suppliers (id, name, contact_person, phone, email, origin, specialties) VALUES
('SP1225-0001', 'Highland Coffee Indonesia', 'John Doe', '+62-812-3456-7890', 'john@highland.co.id', 'Aceh Gayo, Indonesia', ARRAY['Arabica']),
('SP1225-0002', 'Lampung Beans Co.', 'Jane Smith', '+62-813-9876-5432', 'jane@lampung.co.id', 'Lampung, Indonesia', ARRAY['Robusta', 'Liberica']);

-- Insert demo packaging
INSERT INTO public.packaging (id, name, size_kg, cost) VALUES
('PK1225-0001', '250g Flat Bottom Pouch', 0.25, 3500),
('PK1225-0002', '1kg Side Gusset Bag', 1.0, 8000),
('PK1225-0003', '5kg Bulk Bag', 5.0, 25000);

-- Insert demo alert settings
INSERT INTO public.alert_settings (id, variety, type, threshold) VALUES
('AL1225-0001', 'Arabica', 'Roasted Bean', 50),
('AL1225-0002', 'Robusta', 'Green Bean', 100);
```

## 6. Verify Deployment

1. Visit your Vercel deployment URL
2. Register a new account or login
3. Check that all features work:
   - Dashboard loads
   - Analytics page shows charts
   - Data CRUD operations work
   - Authentication (login/logout) functions

## 7. Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

## 8. Monitoring & Analytics

### Vercel Analytics

1. Go to Project Settings → Analytics
2. Enable Vercel Analytics (free)

### Supabase Dashboard

Monitor:
- Database performance
- API usage
- Authentication logs
- Storage usage

## Troubleshooting

### Build Fails

- Check Node.js version (must be 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check environment variables are set correctly

### 404 Errors After Deploy

- Verify `vercel.json` contains:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

### Database Connection Fails

- Verify Supabase environment variables
- Check Supabase project is not paused (free tier pauses after 1 week inactivity)
- Verify Row Level Security policies are correctly set

### Authentication Issues

- Check SITE_URL in Supabase Auth settings matches your deployment URL
- Verify email confirmation is disabled for testing (or configure SMTP)

## Security Checklist

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Environment variables not committed to Git
- ✅ HTTPS enforced (Vercel automatic)
- ✅ API keys are anon keys (not service role keys)
- ✅ Password hashing handled by Supabase Auth

## Performance Optimization

### Current Bundle Size

The production build is approximately 1.1 MB (283 KB gzipped). To optimize:

1. **Code Splitting**: Consider lazy loading heavy components
2. **Image Optimization**: Use WebP format and lazy loading
3. **CDN**: Vercel Edge Network provides automatic CDN
4. **Caching**: Configure appropriate cache headers in `vercel.json`

## Support & Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)

## License

Copyright © 2024 Coffee ERP Pro
