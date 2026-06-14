# BOM Manager - Bill of Materials Management System

A comprehensive web application for managing Bill of Materials (BOMs), inventory components, products, and production tracking. Built with Next.js, TypeScript, Tailwind CSS, and Prisma ORM.

## Features

- **Dashboard**: Overview of components, products, low-stock alerts, and recent activity
- **Components Management**: Create, edit, search, and manage inventory components with stock tracking
- **Products Management**: Build and manage product BOMs with component associations
- **Production Tracking**: Record production runs with automatic stock deductions
- **Stock Management**: 
  - Stock In/Restock tracking
  - Damage/Loss recording
  - Manual stock adjustments with audit trail
- **Audit Trail**: Complete transaction history with reversal capabilities
- **CSV Export**: Export components and transaction data
- **Responsive Design**: Desktop and tablet-friendly UI for factory floor use
- **Database Flexibility**: SQLite for development, Postgres for production (Vercel Postgres/Neon)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM (SQLite dev / PostgreSQL prod)
- **Validation**: Zod
- **UI Components**: Lucide React (icons)
- **Deployment**: Vercel

## Data Models

### Component
- Unique name, category, unit (pcs, meter, gram, etc)
- Current stock and reorder threshold
- Timestamps (createdAt, updatedAt)

### Product
- Name, description
- One-to-many relationship with BOMItems
- Timestamps

### BOMItem (Join Table)
- Product ↔ Component relationship
- Quantity per unit (how many of each component per product)

### Transaction (Audit Log)
- Types: PRODUCTION, DAMAGE, STOCK_IN, MANUAL_ADJUST, REVERSAL
- Signed quantity changes (+/-)
- Resulting balance snapshot
- Optional product and production quantity references
- Reversal support with self-relation

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development Setup

1. **Navigate to project**
   ```bash
   cd h:\Projects\bom
   ```

2. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```

3. **Environment is pre-configured**
   The `.env.local` file uses SQLite for development:
   ```
   DATABASE_URL="file:./prisma/dev.db"
   ```

4. **Initialize database**
   ```bash
   npm run db:push
   ```

5. **Seed sample data (optional)**
   ```bash
   npm run db:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Database Management

- **Push schema without migrations**: `npm run db:push`
- **Create migration**: `npm run db:migrate`
- **Seed database**: `npm run db:seed`

## Building for Production

```bash
npm run build
npm start
```

The build script automatically runs:
- Prisma code generation
- Database migrations
- Next.js build

## Deployment to Vercel

### Step 1: Prepare Repository
```bash
git init
git add .
git commit -m "Initial commit"
git push -u origin main  # or your branch
```

### Step 2: Create Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your repository
4. Vercel auto-detects Next.js configuration

### Step 3: Set Up PostgreSQL Database

**Option A: Vercel Postgres (Recommended)**
1. In Vercel Project Settings → Storage
2. Create "Postgres" database
3. Vercel automatically sets `POSTGRES_PRISMA_URL`

**Option B: Neon**
1. Create database at [Neon](https://neon.tech)
2. Copy PostgreSQL connection string

### Step 4: Configure Environment Variables
In Vercel Project Settings → Environment Variables:

For Vercel Postgres:
```
DATABASE_URL=<automatically set by Vercel>
```

For Neon or other Postgres provider:
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Step 5: Update Prisma Schema (Important!)
In `prisma/schema.prisma`, change the datasource provider:
```prisma
datasource db {
  provider = "postgresql"  # Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 6: Deploy
1. Commit the schema changes
2. Vercel automatically runs `npm run build` which includes:
   - `prisma generate`
   - `prisma migrate deploy`
   - `next build`
3. Database migrations run automatically

## Project Structure

```
h:\Projects\bom/
├── app/
│   ├── actions/           # Server Actions (mutations)
│   │   ├── components.ts
│   │   ├── products.ts
│   │   ├── dashboard.ts
│   │   ├── transactions.ts
│   │   └── history.ts
│   ├── components/        # Reusable components
│   │   ├── Sidebar.tsx
│   │   ├── ui.tsx
│   │   ├── forms/         # Form components
│   │   └── components/    # Components management UI
│   ├── page.tsx           # Dashboard /
│   ├── components/        # Components management pages
│   ├── products/          # Products management pages
│   ├── production/        # Production entry page
│   ├── damage/            # Damage recording page
│   ├── stock-in/          # Stock receipt page
│   ├── history/           # Transaction history page
│   ├── api/               # API routes
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── schemas.ts         # Zod validation schemas
│   ├── prisma.ts          # Prisma client singleton
│   ├── csv.ts             # CSV export utilities
│   └── format.ts          # Number/date formatting
├── prisma/
│   ├── schema.prisma      # Database schema (SQLite/Postgres)
│   └── seed.ts            # Sample data seeding script
├── public/                # Static assets
├── .env.local             # Local development env
├── .env.example           # Env template for reference
├── vercel.json            # Vercel build configuration
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

## Pages & Features

### Dashboard (/)
- Summary cards: total components, products, low-stock count
- Low stock alerts table
- Recent transaction activity feed

### Components (/components)
- List/search/filter components by name and category
- Add new component with stock and threshold
- Edit component details
- Manual stock adjustment with audit trail
- View products using each component
- CSV export

### Products (/products)
- List/search products
- Create/edit product with BOM builder UI
- Add/remove components with quantities
- Production capacity calculator
- CSV export

### Production (/production)
- Select product and quantity to produce
- Preview BOM items and required quantities
- Warn if stock insufficient (with override option)
- Atomic transaction for all component deductions
- Sets productId and productionQuantity in transactions

### Damage (/damage)
- Select component and quantity damaged
- Required reason/note field
- Prevent negative stock (unless confirmed)
- Creates DAMAGE transaction

### Stock In (/stock-in)
- Select component and quantity received
- Optional purchase order note
- Shows before/after stock values
- Creates STOCK_IN transaction

### History (/history)
- Table of all transactions, sortable
- Filter by type, component, date range
- Shows quantity change, resulting balance, note
- Reverse transaction action
- Prevents double-reversals
- CSV export with full audit trail

## Common Tasks

### Add a New Component Field
1. Edit `prisma/schema.prisma` - add field to Component model
2. Run: `npm run db:migrate -- --name add_component_field`
3. Update validation schema in `lib/schemas.ts`
4. Update form component in `app/components/forms/ComponentForm.tsx`

### Modify Production Logic
- Edit `recordProduction` in `app/actions/transactions.ts`
- Update capacity calculation in `app/actions/products.ts`
- All stock changes must wrap in `prisma.$transaction()`

### Switch Database to Postgres
1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL` environment variable
3. Run: `npm run db:migrate -- deploy`

### Export Data
- **Components**: Dashboard or Components page → "Export CSV"
- **Transactions**: History page → "Export CSV"
- Implementation in `lib/csv.ts` (client-side generation)

## API Routes

### GET /api/products
Returns list of products with complete BOM details.

**Query Parameters:**
- `search` (optional): Filter by product name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clu...",
      "name": "Arduino Clone",
      "description": "...",
      "bomItems": [
        {
          "id": "clu...",
          "productId": "clu...",
          "componentId": "clu...",
          "quantityPerUnit": 1,
          "component": { ... }
        }
      ]
    }
  ]
}
```

## Validation Schemas (Zod)

All forms validated with Zod schemas in `lib/schemas.ts`:

- **componentSchema**: name, category, unit, currentStock, reorderThreshold
- **productSchema**: name, description (optional)
- **bomItemSchema**: componentId, quantityPerUnit
- **productionSchema**: productId, quantity, confirmNegativeStock
- **damageSchema**: componentId, quantity, note, confirmNegativeStock
- **stockInSchema**: componentId, quantity
- **manualAdjustmentSchema**: quantityChange, note

## Performance & Architecture

### Database Transactions
All stock-changing operations use `prisma.$transaction()`:
```typescript
await prisma.$transaction(async (tx) => {
  // Multiple operations execute atomically
  await tx.component.update(...);
  await tx.transaction.create(...);
});
```

### Database Indexes
Indexes on frequently filtered columns:
- Component: category, currentStock
- Transaction: componentId, type, createdAt
- Product: name

### Pagination
Transaction history uses offset-based pagination (10 items/page)

### Lazy Loading
Relationships loaded with `.include()` for optimal queries

## Troubleshooting

### SQLite Database Error
```bash
# Reset local database
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Prisma Generate Failed
```bash
npm install
npx prisma generate
```

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

### Postgres Migration Errors
```bash
# Reset migrations (use with caution!)
npx prisma migrate reset
npm run db:seed
```

### Build Fails on Vercel
1. Check Vercel logs for errors
2. Ensure `DATABASE_URL` is set in Environment Variables
3. Verify `prisma/schema.prisma` uses correct provider
4. Run locally: `npm run build` to test

## Security

- **Prisma ORM**: Prevents SQL injection
- **Zod Validation**: Server-side form validation
- **Environment Variables**: Sensitive data stored securely
- **Next.js CSRF Protection**: Built-in mechanism
- **No Hardcoded Secrets**: All credentials via env vars

## Future Enhancements

- User authentication and role-based access
- Multi-warehouse/location support
- Supplier management and purchase orders
- Barcode/QR code scanning
- Analytics dashboard and reports
- Batch CSV import/upload
- Low stock email notifications
- API webhooks for ERP integration
- Mobile app support
- Real-time inventory sync

## Support & Documentation

- **Prisma Docs**: https://www.prisma.io/docs/
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zod Validation**: https://zod.dev

## License

Private - Factory Use Only

---

**Created**: June 2026  
**Updated**: Ready for Production Deployment
