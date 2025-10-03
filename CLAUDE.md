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

**Dual theme approach using next-themes:**
- Light mode (default): Guest interface with pastel purple/lavender + lime accents
- Dark mode: Staff interface with dark bg, lime-green and orange accents
- Theme switching via `next-themes` ThemeProvider in `components/providers.tsx`
- CSS variables in `app/globals.css` with proper light/dark mode support
- All components use CSS variables (`bg-card`, `text-foreground`, etc.) for theme consistency
- Staff header is sticky with `sticky top-0 z-50` for persistent navigation

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

## Recent Updates (October 2025)

### Order Status System Fix
- Fixed order workflow to use correct Prisma enum: `PENDING` → `ACCEPTED` → `IN_PROGRESS` → `COMPLETED`
- Updated staff and guest order pages to use `COMPLETED` instead of incorrect `DELIVERED` status
- Fixed field mapping: `specialInstructions` → `notes`, removed non-existent `deliveredAt` field

### Invoice System Fixes
- Corrected invoice schema field names: `items` → `invoiceItems`, `totalAmount/taxAmount/finalAmount` → `subtotal/tax/total`
- Fixed invoice API routes (`/api/invoices`, `/api/invoices/[id]`) to match Prisma schema
- Updated invoice download route to use correct field names
- Updated staff invoices page interface and display logic

### Guest Profile Page (NEW)
- Created complete guest profile page at `/guest/profile`
- Features include:
  - Personal information display (email, phone, room details)
  - Stay information (check-in, check-out, days stayed/remaining)
  - Activity statistics (orders, spending, messages, invoices)
  - Quick actions (view orders, chat, services)
  - Logout functionality with confirmation
- Components created:
  - `profile-header.tsx` - Avatar and back navigation
  - `profile-info.tsx` - Personal details with icons
  - `stay-info.tsx` - Check-in/out and duration tracking
  - `activity-stats.tsx` - Statistics with color-coded cards
  - `profile-actions.tsx` - Quick actions and logout

### Navigation Updates
- Added all required pages to staff sidebar (Food Menu, Services, Guests, Invoices, Staff Management)
- Implemented role-based visibility (Staff Management admin-only)
- Guest profile now accessible via bottom navigation

### Theme System Overhaul (October 2025)
- **Replaced custom theme provider** with `next-themes` for proper light/dark mode switching
- **Staff header improvements**:
  - Removed all hardcoded dark colors (`bg-[#0a0a0a]`, `text-gray-400`, etc.)
  - Now uses CSS variables (`bg-card`, `text-foreground`, `border-border`)
  - Added sticky positioning (`sticky top-0 z-50`) - header stays fixed when scrolling
  - Properly adapts to both light and dark themes
- **Improved light mode readability**:
  - Status badges (orders): increased opacity `/10` → `/20`, darker text colors for better contrast
  - Available/Unavailable badges (food menu, services): stronger backgrounds with `font-medium`
  - All status indicators now clearly readable in light mode

### Food Menu & Services Management (October 2025)
- **Added missing CRUD operations**:
  - POST `/api/food-menu` - Create new food items
  - PUT `/api/food-menu/[id]` - Update existing items
  - DELETE `/api/food-menu/[id]` - Delete items
  - POST `/api/services` - Create new services
  - PUT `/api/services/[id]` - Update services
  - DELETE `/api/services/[id]` - Delete services
- All endpoints include staff/admin authorization checks

### Staff Management Fixes (October 2025)
- **Fixed React Hooks violation** - moved all hooks before conditional return to prevent "Rendered more hooks than during the previous render" error
- **Corrected Prisma model usage** - changed `prisma.staff` to `prisma.user` throughout API routes
- **Fixed relation name** - changed `messages` count to `assignedChats` count
- **Separate deactivate vs delete**:
  - PATCH `/api/staff/[id]` - Soft delete (toggle `isActive` status)
  - DELETE `/api/staff/[id]` - Hard delete (permanent removal)
  - UI now has two separate buttons for each action

### WiFi Settings Management (October 2025)
- **New API routes created**:
  - GET/POST `/api/wifi` - List and create WiFi credentials
  - PUT/DELETE `/api/wifi/[id]` - Update and delete credentials
- **Settings page updated** with full CRUD interface:
  - Fetch credentials from database instead of local state
  - Create new WiFi networks with SSID, password, description
  - Edit existing credentials inline
  - Delete with confirmation
  - Uses React Query for optimistic updates

### Logout Functionality (October 2025)
- **Added logout button** to staff sidebar (`components/staff/sidebar.tsx`)
- Includes confirmation dialog before logout
- Uses `signOut()` from NextAuth with redirect to `/login`
- Toast notifications for success/error feedback

### Functional Header Quick Stats (October 2025)
- **Replaced placeholder buttons** in staff header with functional quick stats
- **Three real-time stat pills**:
  - Pending Orders - Shows count with orange badge, links to filtered orders view
  - Messages - Shows unread message count with blue badge (shows only unread messages FROM guests)
  - Active Guests - Shows checked-in guest count with green badge
- **Optimized polling**: Auto-refetch every 5 seconds with refetchOnFocus and refetchOnReconnect
- Each pill highlights when on that page (active state)
- Added query params to APIs: `?unread=true` for messages, `?active=true` for guests
- Cache invalidation when order status changes or messages are read

### Real-time Messaging Implementation (October 2025)
- **Replaced Socket.io with polling approach** (Socket.io incompatible with Next.js 15 + Turbopack without custom server)
- **Aggressive polling configuration**:
  - `refetchInterval: 2000` - Poll every 2 seconds for near-real-time updates
  - `refetchOnFocus: true` - Fetch when tab gains focus
  - `refetchOnReconnect: true` - Fetch on network reconnect
- **Fixed Next.js 15 params issue**:
  - Used `React.use()` to unwrap params Promise in dynamic routes
  - Changed type from `{ params: { id: string } }` to `{ params: Promise<{ id: string }> }`
- **Staff chat enhancements**:
  - Shows staff member name and role on messages (e.g., "John Doe (ADMIN)")
  - Guest name shown on guest messages
- **Applies to both**:
  - Staff chat: `/app/(staff)/staff/messages/[guestId]/page.tsx`
  - Guest chat: `/app/(guest)/guest/chat/page.tsx`
- Messages appear within 2 seconds without manual refresh

### Order Placement Fix (October 2025)
- **Fixed OrderType enum validation error** in checkout page
- Changed invalid `'SERVICE'` to correct `'ROOM_SERVICE'` enum value
- Orders now place successfully for room service items
- Location: `app/(guest)/guest/checkout/page.tsx:33`

### Message Read Status System (October 2025)
- **Fixed unread message counting** to show only relevant messages:
  - Staff/Admin: Only count unread messages FROM guests (`isFromGuest: true`)
  - Guests: Only count unread messages FROM staff (`isFromGuest: false`)
- **Added PATCH `/api/messages` endpoint** for marking messages as read:
  - Staff: Marks guest messages as read when viewing chat
  - Guests: Marks staff messages as read when viewing chat
  - Automatically updates badge counts
- **Auto-mark messages as read** using `useEffect` with conditional logic:
  - Only marks as read when there are actual unread messages
  - Prevents unnecessary API calls
  - Compatible with React Query v5 (removed deprecated `onSuccess`)
- **Guest bottom navigation badge**:
  - Added unread message count badge on Chat icon
  - Blue badge with count (shows "9+" for >9 messages)
  - Polls every 5 seconds for real-time updates
  - Auto-clears when guest opens chat
- Badge counters now work correctly: show count when away from chat, stay at 0 when actively viewing

### Clear Chat Functionality (October 2025)
- **Added admin-only chat clearing** in staff chat interface
- **DELETE `/api/messages` endpoint** (admin authorization required)
- **Clear Chat button** in staff chat header:
  - Red trash icon (Trash2 from lucide-react)
  - Only visible to admins (`role === 'ADMIN'`)
  - Confirmation dialog before deletion
  - Deletes all messages for specific guest
  - Updates badge counts immediately
- Location: Staff chat page header with confirmation prompt

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
