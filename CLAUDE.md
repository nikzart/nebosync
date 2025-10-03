# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NeboSync is a hotel management application with dual interfaces:
- **NeboConnect**: Mobile-first guest interface for ordering services, food, and chat
- **NeboSync**: Desktop-focused staff/admin dashboard for managing operations

**Tech Stack:**
- Next.js 15 with App Router + Turbopack
- TypeScript
- NextAuth.js v5 (beta) for authentication
- Prisma ORM with PostgreSQL
- TanStack Query (React Query) for data fetching
- Socket.io for real-time features
- Shadcn/ui + Tailwind CSS v4 for UI
- Framer Motion for animations

## Essential Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack at localhost:3000
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:seed          # Seed database with sample data
npx prisma migrate dev   # Create and apply migrations
npx prisma generate      # Generate Prisma Client
npx prisma studio        # Open Prisma Studio GUI

# PostgreSQL (Postgres.app on macOS)
# Add to PATH: export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"
createdb <dbname>        # Create new database
```

## Database Setup

The app uses PostgreSQL via Postgres.app (macOS). Connection string format:
```
DATABASE_URL="postgresql://USER@localhost:5432/nebosync?schema=public"
```

**Default test credentials** (from seed):
- Admin: `admin@nebosync.com` / `admin123`
- Staff: `staff@nebosync.com` / `staff123`
- Guest: `+919876543210` / Room `101`

## Authentication Architecture

**Dual authentication system** using NextAuth.js v5:

1. **auth.ts** (root) - Central auth configuration with two Credentials providers:
   - `staff-login`: Email/password for Admin & Staff (User model)
   - `guest-login`: Phone/room number for Guests (Guest model)

2. **Server actions** in `app/login/actions.ts` handle login logic
   - `staffLogin()` - Returns `{ error }` on failure, redirects to `/staff` on success
   - `guestLogin()` - Returns `{ error }` on failure, redirects to `/guest` on success

3. **Session handling**:
   - JWT strategy with 30-day sessions
   - Extended session with `id`, `role`, `phone`, `roomId` fields
   - Type definitions in `types/next-auth.d.ts`

4. **Protected routes**:
   - Staff/Admin: `app/(staff)/*` - Checks `session.user.role !== 'GUEST'`
   - Guest: `app/(guest)/*` - Checks `session.user.role === 'GUEST'`
   - Use `auth()` from `@/auth` in Server Components
   - Root `/` redirects based on role

## Route Groups & Layouts

**Route organization** using Next.js 15 route groups:

```
app/
├── (staff)/           # Staff/Admin routes (dark theme, desktop-first)
│   ├── layout.tsx     # Sidebar + header wrapper
│   └── staff/page.tsx # Dashboard
├── (guest)/           # Guest routes (light theme, mobile-first)
│   ├── layout.tsx     # Bottom nav wrapper
│   └── guest/page.tsx # Guest home
├── login/             # Unified login page with tabs
├── api/
│   └── auth/[...nextauth]/route.ts  # NextAuth v5 handlers
└── layout.tsx         # Root layout with Providers
```

## Data Layer

**Prisma models** (see `prisma/schema.prisma`):
- `User` - Admin/Staff with ADMIN/STAFF roles
- `Guest` - Hotel guests with phone auth
- `Room` - Room assignments (1:1 with Guest)
- `Service` - Hotel services (cleaning, laundry, etc.)
- `FoodMenu` - Food items with veg/non-veg flag
- `Order` - Guest orders with PENDING/ACCEPTED/IN_PROGRESS/COMPLETED status
- `OrderItem` - Line items (links to Service OR FoodMenu)
- `Message` - Chat messages (TEXT/IMAGE/VOICE types)
- `Invoice` - Billing with line items
- `ActivityLog` - Admin audit trail
- `WiFiCredential` - WiFi info for guests

**Key patterns:**
- Prices in rupees (₹) - Indian currency
- All IDs use `cuid()`
- Cascade deletes on guest removal
- Indexes on foreign keys and query fields

## React Query Configuration

Located in `lib/query-client.ts` with optimized settings:
- 5min stale time, 10min cache time
- Auto-refetch on window focus & reconnect
- 3 retries with exponential backoff
- SSR-safe singleton pattern

Import via `getQueryClient()` for app router compatibility.

## Theme System

**Dual theme approach:**
- Light mode (default): Guest interface with pastel purple/lavender + lime accents
- Dark mode: Staff interface with dark bg, lime-green and orange accents
- Theme toggle via `ThemeProvider` in `components/theme-provider.tsx`
- CSS variables in `app/globals.css` with `[data-theme="dark"]` selector
- Staff layouts force dark theme via `data-theme="dark"` attribute

## Component Organization

```
components/
├── ui/              # Shadcn/ui base components
├── guest/           # Guest-specific (mobile-first)
│   ├── bottom-nav.tsx    # Bottom navigation bar
│   ├── service-card.tsx  # Service/food cards with Framer Motion
│   └── quick-actions.tsx # Quick action buttons
├── staff/           # Staff-specific (desktop-first)
│   ├── sidebar.tsx       # Left sidebar navigation
│   └── header.tsx        # Top header with search
├── providers.tsx    # QueryClient + ThemeProvider + Toaster
└── theme-provider.tsx    # Theme state management
```

## Styling Notes

- **Tailwind v4** with custom theme in `app/globals.css`
- CSS variable naming: `--pastel-purple`, `--lime-accent`, `--soft-gray` (light), `--lime-green`, `--soft-orange` (dark)
- All transitions use `transition-colors 0.3s ease`
- Border radius: `1rem` default for cards
- Component variants via `class-variance-authority`

## Real-time Features (TODO)

Socket.io setup planned for:
- Live order updates
- Real-time chat (text/image/voice)
- Staff activity monitoring
- Use `socket.io` (server) and `socket.io-client` (client)

## Important Conventions

1. **Server Components by default** - Use `'use client'` only when needed
2. **Server actions** for mutations - Pattern: `'use server'` at top, return `{ error }` on failure
3. **Optimistic updates** - Use React Query mutations with `onMutate`
4. **Currency** - Always display in ₹ format: `₹{amount.toLocaleString('en-IN')}`
5. **Error handling** - Use `sonner` toast for user feedback
6. **Loading states** - Skeleton components (no spinners)
7. **Type safety** - Extend NextAuth types in `types/next-auth.d.ts`

## Known Issues

- NextAuth v5 is beta - may have edge cases
- Postgres.app path must be in shell PATH for Prisma CLI
- Hot reload may not catch auth changes - restart dev server

## Environment Variables

Required in `.env`:
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```
