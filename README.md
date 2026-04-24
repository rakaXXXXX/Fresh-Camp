# Fresh Camp - Fullstack E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.19.0-2984C5?style=flat&logo=prisma)](https://prisma.io)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://postgresql.org)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-EAEAEA?style=flat&logo=shadcnui)](https://ui.shadcn.com)

Fullstack E-Commerce website built with Next.js 14 App Router, Prisma ORM, Tailwind CSS, and modern UI components. Supports customer shopping (products, cart, checkout with Midtrans, orders, reviews) and admin dashboard for management.

## ✨ Features

### Customer Features
- Browse products by category, featured/sale items
- Product quick view modal, colors/sizes selection
- Shopping cart with persist (local/session)
- Checkout with Midtrans payment gateway (snap)
- Order tracking, status updates
- User profile, address, order history
- Wishlist management
- Product reviews & ratings
- Responsive design (desktop/mobile)

### Admin Features
- Dashboard with sidebar navigation
- CRUD Products (images via Cloudinary, categories, variants)
- CRUD Categories
- Manage Orders (view, update status, payment proof upload)
- Manage Reviews (view/delete)
- Role-based access (ADMIN)

### Auth & Security
- NextAuth.js authentication (credentials, OAuth)
- Register/Login/Forgot/Reset Password
- Email verification & reset (Resend)
- Role system (USER/ADMIN)
- Protected routes (middleware)
- Upload security (Cloudinary)

## 🛠 Tech Stack
```
Frontend: Next.js 14 (App Router), React 18, Tailwind CSS 3.4, shadcn/ui, Lucide Icons
Backend: Next.js API Routes, Prisma ORM, PostgreSQL
Auth: NextAuth.js v4 / @auth/prisma-adapter
Payment: Midtrans Client
Storage: Cloudinary
Email: Resend / Nodemailer
Utils: Zod validation, React Hook Form, Axios
Other: uuid, bcryptjs, date-fns
Dev: TypeScript, ESLint, PostCSS, yarn workspaces
```

## 🚀 Quick Start

```bash
# Clone & Install
git clone <repo> websitekik
cd websitekik
yarn install

# Database Setup
cp .env.example .env  # Fill DATABASE_URL etc.
npx prisma generate
npx prisma db push  # or migrate dev for prod
```

`.env` required vars:
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
MIDTRANS_MERCHANT_ID=...
MIDTRANS_CLIENT_KEY=...
MIDTRANS_SERVER_KEY=...
RESEND_API_KEY=...
```

```bash
# Run dev server (port 3000, all interfaces)
yarn dev
```
Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
websitekik/
├── app/                 # App Router pages & layouts
│   ├── (customer)/      # Home, category, cart, checkout, order, profile
│   ├── admin/           # Admin dashboard pages
│   ├── api/             # API routes (auth, products, orders, admin...)
│   ├── globals.css      # Tailwind base
│   └── layout.js        # Root layout w/ providers
├── components/          # UI components (Navbar, Hero, ProductShowcase...)
│   └── ui/              # shadcn/ui primitives
├── hooks/               # Custom React hooks (useCart, useToast...)
├── lib/                 # Utils (prisma, auth, cloudinary, mail, validations)
├── prisma/              # schema.prisma, migrations
├── public/              # Static assets (placeholders)
├── middleware.js        # Auth protection
└── package.json         # yarn workspaces ready
```

## 📄 Pages & Routes

### Pages
| Path | Description | Auth |
|------|-------------|------|
| `/` | Homepage w/ hero, featured, categories | Public |
| `/category/[slug]` | Category products | Public |
| `/cart` | Shopping cart | Session |
| `/checkout` | Checkout form | Cart |
| `/order` | Order history | User |
| `/order/[id]` | Order detail | Owner |
| `/profile` | User profile/orders | User |
| `/login` `/register` `/forgot-password` `/reset-password` | Auth pages | Public |
| `/admin` | Admin dashboard | Admin |

### API Routes (examples)
| Path | Method | Description |
|------|--------|-------------|
| `/api/products` | GET | List products |
| `/api/products/[id]/review` | POST | Add review |
| `/api/cart` | POST/PUT/DEL | Cart ops |
| `/api/checkout` | POST | Create order |
| `/api/payment` | POST | Midtrans snap token |
| `/api/admin/products` | CRUD | Admin products |
| `/api/admin/orders` | GET/PUT | Manage orders |
| `/api/auth/[...nextauth]` | * | Auth |

## 🗄 Database Schema

Key models (Prisma):
- **User**: id, name, email, password, role (USER/ADMIN), profile fields, resetToken
- **Product**: name, price, category, images[], colors[], sizes[], rating
- **Category**: name, slug
- **Order**: status, paymentStatus, items[], totalAmount
- **OrderItem**: product, quantity, price
- **CartItem**, **WishlistItem**, **Review**

Run `npx prisma studio` to explore.

## 👨‍💼 Admin Setup

1. Create admin user via register or DB:
```prisma
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```
2. Login `/admin`, use AdminSidebar for nav.
3. Add categories/products first, then orders management.

## 💳 Payment Integration

- **Midtrans Snap**: Checkout → snap token → redirect payment.
- Bank Transfer: Upload proof image, admin approves.
- Status webhook/API updates.

Configure Midtrans keys in `.env`.

## ☁️ Deployment

### Vercel (recommended)
```
vercel --prod
```
- Set env vars in dashboard.
- Prisma: `prisma generate` in build.

### Railway/DigitalOcean for DB
- PostgreSQL instance.
- `DATABASE_URL` connection string.

## 📸 Screenshots

Add your screenshots here:
- Homepage
- Product page
- Checkout
- Admin dashboard
- etc.

```
![Homepage](public/homepage.png)
```

## 🤝 Contributing

1. Fork & PR
2. Follow TypeScript/Prettier/ESLint
3. Update TODO.md
4. Test changes

See TODO.md for pending features.

## 📄 License

MIT - feel free to use/modify.

---

Built with ❤️ by BLACKBOXAI

**Last Updated:** $(date)

