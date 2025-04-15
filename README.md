# Fanfic Reader Platform

A modern web application that enhances your fanfiction reading experience by providing alternative access to Archive of Our Own (AO3) content, with features for e-reader delivery and AI translation.

## Features

- Browse and access AO3 stories through a clean, modern interface
- Send stories directly to your Kindle or other e-readers
- Smart chapter tracking - only send unread chapters
- AI-powered translation capabilities
- Google authentication via NextAuth
- Responsive design for both desktop and mobile

## Tech Stack

- TypeScript
- Tailwind CSS + Radix/Shadcn
- Framework: React + Next.js 15 App Router
- State management: Zustand
- Auth: Next-Auth
- ORM: Drizzle
- DB Provider: Neon Serverless
- Hosting: Vercel

## Project Structure

```
├── migrations/       # Drizzle-based DB migration files
├── app/              # Next.js app router pages
├── app/components/   # Reusable UI components
├── app/lib/          # Utility functions and helpers
├── app/db/           # Database schema and migrations
├── app/library/      # Personal library management
├── app/home/         # Landing page
├── app/explore/      # Story discovery and search interface for AO3 content
└── public/           # Static assets

```

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application

## TODO

### High Priority

- Refactor AI translation service
  - Currently using Gemini free Development API which has stability issues
  - Investigate alternative translation providers

### Future Enhancements

- Add support for fanfiction.net content
- Implement reading suggestions based on user preferences and history

## Legal Note

This application is designed to enhance the reading experience of publicly available content and respects the terms of service of the source platforms.
