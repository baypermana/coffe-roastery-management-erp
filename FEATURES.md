# Coffee ERP Pro - Feature Documentation

## Overview

Coffee ERP Pro adalah sistem ERP profesional yang dirancang khusus untuk bisnis kopi, mulai dari procurement hingga sales dan analytics. Sistem ini menggunakan Supabase untuk backend dan Vercel untuk deployment.

## Core Features

### 1. Authentication & Authorization

**Supabase Auth Integration**
- ✅ Secure email/password authentication
- ✅ Password hashing otomatis via Supabase
- ✅ Session management dengan auto-refresh token
- ✅ Role-based access control (RBAC)

**User Roles**
- **Admin**: Full access ke semua fitur
- **Roaster**: Akses ke roasting, blending, cupping
- **QC**: Akses ke grading, cupping, warehouse
- **Sales**: Akses ke penjualan dan inventory
- **User**: Akses terbatas (dashboard, warehouse, tasks)

### 2. Dashboard

**Real-time KPIs**
- Total revenue dan expense
- Net profit margin
- Stock alerts
- Recent activities

**Quick Actions**
- Create new purchase order
- Record new sale
- Add roasting batch
- View low stock items

**Data Visualization**
- Sales trend chart
- Stock distribution
- Top-selling varieties

### 3. Analytics Dashboard ⭐ NEW

**Comprehensive Business Intelligence**

**Financial Analytics**
- Revenue trend analysis (7d, 30d, 90d, all time)
- Expense breakdown by category
- Profit margin calculation
- Average order value
- Total stock valuation

**Sales Analytics**
- Sales by coffee variety
- Transaction volume
- Customer segmentation
- Revenue forecasting

**Production Analytics**
- Roasting efficiency tracking
- Weight retention percentage
- Batch performance comparison
- Production cost analysis

**Inventory Analytics**
- Stock distribution by variety
- Low stock alerts with details
- Turnover rate
- Reorder recommendations

**Key Performance Indicators**
- Business health score
- Profitability analysis
- Operational efficiency
- Inventory optimization suggestions

**Interactive Charts**
- Line charts untuk revenue trend
- Bar charts untuk sales by variety
- Pie charts untuk stock distribution
- Performance metrics untuk roasting efficiency

### 4. Purchase Orders

**Order Management**
- Create new purchase orders
- Link to suppliers
- Multiple items per order
- Order status tracking (Pending, Approved, Rejected, Completed)

**Integration**
- Automatically updates inventory on completion
- Links to grading forms
- Supplier performance tracking

### 5. Grading Form

**Quality Control**
- Physical analysis (screen size, moisture content, density)
- Defect counting
- Water activity measurement
- Accept/Reject decision
- Notes and observations

**Traceability**
- Linked to purchase orders
- Batch ID tracking
- Complete audit trail

### 6. Warehouse Management

**Stock Management**
- Real-time inventory tracking
- Separate tracking: Green Beans vs Roasted Beans
- Location management
- Stock movement history

**Warehouse Logs**
- IN/OUT transactions
- Quantity changes with notes
- Date stamping
- Traceability to source (PO, roast batch, sale)

**Alerts**
- Low stock notifications
- Configurable thresholds per variety
- Visual indicators

### 7. Suppliers

**Supplier Database**
- Contact information
- Origin details
- Specialty varieties
- Performance history

**Supplier Analytics**
- Order frequency
- Average order size
- Quality metrics
- Reliability scores

### 8. Roasting Operations

**Internal Roasting**
- Detailed roast profiles
- Temperature tracking (charge, turnaround, drop)
- Time milestones (first crack, development time)
- Weight loss calculation
- Cost per kg tracking
- Color scoring (Agtron scale)

**External Roasting**
- Third-party roastery tracking
- Cost management
- Weight reconciliation
- Quality control

**Roasting Analytics**
- Efficiency metrics
- Consistency tracking
- Cost analysis
- Batch comparison

### 9. Cupping Sessions

**SCA Standard Scoring**
- Fragrance/Aroma (dry & break)
- Flavor
- Aftertaste
- Acidity
- Body
- Balance
- Sweetness
- Cleanliness
- Uniformity

**Defect Tracking**
- Taint identification
- Fault detection
- Cup count

**Final Score**
- Automated calculation
- Quality classification
- Historical comparison

### 10. Blending

**Blend Creation**
- Multi-component blending
- Percentage-based composition
- Cost calculation per kg
- Recipe management

**Blend Analytics**
- Cost optimization
- Flavor profile consistency
- Performance tracking

### 11. Sales Management

**Order Processing**
- Multi-item sales
- Customer information
- Shipping details
- Invoice generation

**Payment Tracking**
- Payment status (Paid, Unpaid, Partially Paid, Refunded)
- Payment history
- Outstanding balances

**Sales Analytics**
- Revenue by variety
- Customer analysis
- Sales trends
- Best sellers

### 12. HPP Calculator

**Cost of Goods Sold (COGS)**
- Green bean cost
- Roasting cost (internal/external)
- Packaging cost
- Processing cost
- Overhead allocation

**Pricing Strategy**
- Break-even analysis
- Margin calculation
- Recommended pricing
- Competitive analysis

### 13. Financial Management

**Expense Tracking**
- Categorized expenses
  - Utilities
  - Salaries
  - Rent
  - Marketing
  - Maintenance
  - Other

**Financial Reports**
- Income statement
- Expense breakdown
- Cash flow analysis
- Budget vs actual

**Integration**
- Automatic expense recording from operations
- Purchase order costs
- Roasting costs
- Sales revenue

### 14. User Management

**Admin Functions**
- Create/edit/delete users
- Role assignment
- Permission management
- Activity logs

**User Profiles**
- Personal information
- Role and permissions
- Activity history
- Password management

### 15. Task Management

**Collaborative Tasks**
- Task creation and assignment
- Status tracking (To Do, In Progress, Done)
- Priority levels (Low, Medium, High)
- Due date management

**Comments & Collaboration**
- Task comments
- User mentions
- Activity feed
- Email notifications

## Technical Features

### Database Architecture

**Supabase PostgreSQL**
- 16 comprehensive tables
- Full Row Level Security (RLS)
- Automatic timestamps
- Foreign key constraints
- Indexes for performance

**Data Persistence**
- Cloud-based storage
- Automatic backups
- Point-in-time recovery
- Horizontal scalability

### Security

**Row Level Security Policies**
- User data isolation
- Role-based access
- Secure by default
- Audit trail

**Authentication**
- JWT-based sessions
- Secure password hashing (bcrypt)
- Auto-refresh tokens
- Session timeout

**API Security**
- HTTPS only
- API key authentication
- Rate limiting
- CORS protection

### User Experience

**Responsive Design**
- Mobile-first approach
- Tablet optimization
- Desktop enhancement
- Touch-friendly controls

**Internationalization**
- English (en)
- Indonesian (id)
- Easy language switching
- Locale-aware formatting

**Performance**
- Fast initial load
- Optimized bundle size (283 KB gzipped)
- Lazy loading
- Efficient re-renders

### Data Visualization

**Recharts Integration**
- Line charts (revenue trends)
- Bar charts (sales, expenses)
- Pie charts (stock distribution)
- Custom tooltips
- Responsive sizing

## Business Value

### Operational Efficiency

1. **Centralized Data**: Single source of truth untuk semua operasi
2. **Automation**: Otomatis update inventory, calculate costs
3. **Real-time**: Live data untuk decision making
4. **Traceability**: Complete audit trail dari bean to cup

### Decision Support

1. **Analytics Dashboard**: Comprehensive business insights
2. **KPI Tracking**: Monitor key performance metrics
3. **Forecasting**: Data-driven predictions
4. **Alerts**: Proactive notifications

### Quality Management

1. **Grading System**: Standardized quality control
2. **Cupping Scores**: SCA-compliant evaluation
3. **Roasting Profiles**: Consistency and optimization
4. **Traceability**: Origin to customer tracking

### Financial Control

1. **Cost Tracking**: Detailed COGS calculation
2. **Profitability**: Margin analysis per variety
3. **Expense Management**: Categorized spending
4. **Pricing Strategy**: Data-driven pricing decisions

### Scalability

1. **Cloud Infrastructure**: Grows with your business
2. **Multi-user**: Collaborative platform
3. **API-ready**: Integration capabilities
4. **Extensible**: Easy to add features

## Future Enhancements

### Planned Features

- 📊 Advanced forecasting dengan AI/ML
- 📱 Mobile app (React Native)
- 📄 PDF report generation
- 📧 Email notifications
- 💳 Payment gateway integration
- 🌍 Multi-location support
- 📦 Shipment tracking
- 👥 Customer portal
- 📈 Real-time dashboard updates
- 🔔 Push notifications

### Integration Opportunities

- Accounting software (QuickBooks, Xero)
- E-commerce platforms (Shopify, WooCommerce)
- Shipping providers (JNE, JNT, SiCepat)
- Payment gateways (Midtrans, Xendit)
- Email marketing (Mailchimp, SendGrid)
- CRM systems

## Support

For questions or support, please refer to:
- Technical Documentation: `/docs`
- Deployment Guide: `DEPLOYMENT.md`
- User Manual: `USER_MANUAL.md` (coming soon)

---

**Built with ❤️ for the Coffee Industry**
