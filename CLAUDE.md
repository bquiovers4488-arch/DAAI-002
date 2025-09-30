# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Next.js TypeScript application called "Cash Game Keeper" for managing live poker games, staff, players, sessions, transactions, and loans. The app uses Prisma for database modeling and localStorage for client-side state persistence.

## Commands

### Development
```bash
cd app
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Database (Prisma)
```bash
npx prisma migrate dev    # Apply database migrations
npx prisma db seed       # Run database seed script
npx prisma generate      # Generate Prisma client
```

## Architecture

### Data Layer
- **Database**: PostgreSQL with Prisma ORM (`prisma/schema.prisma`)
- **State Management**: localStorage via functions in `lib/storage.ts`
- **Types**: Domain models defined in `lib/types.ts` mirroring Prisma schema

### Key Models
- `Game`: Live poker games with stakes, timing, and financial totals
- `Player`: Player profiles with profit tracking and debt management
- `Staff`: Staff members with roles, hourly rates, and earnings
- `PlayerSession`: Individual player sessions within games
- `StaffSession`: Staff work sessions with clock-in/out functionality
- `Transaction`: All financial actions (buy-ins, cashouts, rake, tips, loans)
- `Loan`: Player loans with payment tracking and status management

### Component Structure
- **Main App**: `app/app/page.tsx` with tab-based navigation
- **Feature Components**: `components/` (game-controls, dealer-clock-out-form, etc.)
- **UI Primitives**: `components/ui/` (Radix UI + Tailwind CSS)
- **Business Logic**: Centralized in `lib/storage.ts` for localStorage operations

### State Management Pattern
All business logic operates through localStorage functions:
- `getStorageData()`: Retrieve current state
- `updateStorageData()`: Batch updates
- Entity-specific functions: `addGame()`, `updatePlayer()`, etc.
- Session management: `addStaffSession()`, `getActiveStaffSessions()`, etc.

### UI Libraries
- **Styling**: Tailwind CSS with dark theme
- **Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts, Chart.js, Plotly.js

## Development Patterns

### Adding New Features
1. Define types in `lib/types.ts` if needed
2. Add localStorage functions in `lib/storage.ts`
3. Create components following existing patterns
4. Update main navigation/routing in `app/page.tsx`

### Session Management
- Staff and player sessions are tracked separately
- Use `getClockedInDealers()`, `getPlayerSessionsByGame()` for active sessions
- All sessions update both session records and transaction history

### Financial Transactions
- All money movements tracked as `Transaction` objects
- Use `TransactionType` enum for categorization
- Loans have separate payment tracking with automatic balance calculation

### TypeScript Configuration
- Path alias `@/*` maps to project root
- Strict type checking enabled
- Import from root: `import ... from '@/lib/utils'`