# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Package Manager:** Use `pnpm` (not npm or yarn)

```bash
# Install dependencies
pnpm install

# Start development server with Turbopack
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start

# Lint code
pnpm run lint
```

## Architecture Overview

This is a **Next.js 15 App Router** fanfiction platform that provides enhanced reading experiences for AO3 content with Kindle delivery and AI translation features.

### Tech Stack
- **Framework:** Next.js 15 with App Router (Turbopack for dev)
- **Database:** PostgreSQL via Neon Serverless with Drizzle ORM
- **Auth:** NextAuth v5 (beta) with Google provider
- **UI:** Tailwind CSS + Radix UI (Shadcn components)
- **Deployment:** Vercel

### Key Directory Structure
```
app/
├── api/                    # API routes (auth, cron jobs)
├── components/
│   ├── base/              # Custom base components
│   └── ui/                # Shadcn UI components
├── db/                    # Database schema, queries, and types
├── lib/                   # Core utilities (AO3 client, parsers)
├── explore/               # AO3 content discovery and search
├── library/               # Personal library management
│   └── sections/          # Nested section management
├── settings/              # User preferences and Kindle config
└── auth.ts               # NextAuth configuration
```

### Database Schema
Uses Drizzle ORM with PostgreSQL schema named `fanfiction`. Key entities:
- **users** - NextAuth user management
- **sections** - Hierarchical library organization
- **fanfics** - AO3 story metadata
- **sectionFanfics** - User's personal story tracking (kudos, reading progress)
- **credentials** - Encrypted AO3 session storage
- **savedSearches** - User's saved AO3 search filters

### Core Architecture Patterns

**Server Actions:** Most data mutations use Next.js server actions in `(server)/` directories
**AO3 Integration:** `app/lib/ao3Client.ts` handles authenticated AO3 requests with cookie persistence
**Database Access:** All DB operations go through `app/db/` modules, never direct queries in components
**Type Safety:** Extensive TypeScript usage with Drizzle-generated types

### Development Workflow

1. **Database Changes:** Modify `app/db/schema.ts` → run `pnpm drizzle-kit generate` → apply migrations
2. **New Components:** Follow existing patterns in `app/components/base/` for custom components
3. **AO3 Features:** Extend `ao3Client.ts` class for new AO3 API interactions
4. **Authentication:** User sessions are managed via NextAuth, access via `auth()` server function

### Important Notes

- **Path Alias:** `@/` maps to `app/` directory
- **Runtime:** Uses Node.js runtime (not Edge) due to epub-gen and AO3 scraping dependencies
- **External Packages:** epub, epub-gen, tough-cookie, and axios-cookiejar-support are externalized
- **Environment:** Requires Google OAuth credentials and Neon database URL
- **Security:** AO3 credentials are encrypted and stored in database, never in environment variables