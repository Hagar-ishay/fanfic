# Fanfic Reader Platform

A modern web application that enhances your fanfiction reading experience by providing alternative access to Archive of Our Own (AO3) content, with features for e-reader delivery and AI translation.

## Features

- Browse and access AO3 stories through a clean, modern interface
- Send stories directly to your Kindle or other e-readers
- Smart chapter tracking - only send unread chapters
- AI-powered translation capabilities
- Google authentication via Clerk
- Responsive design for both desktop and mobile

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

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Clerk for authentication (Google provider)
- Drizzle for database management
- Vercel for Continuous Deployment

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

## Deployment

This project is continuously deployed using Vercel's CD pipeline. Any changes merged to the main branch will automatically trigger a new deployment.

## TODO

### High Priority

- Refactor AI translation service
  - Currently using Gemini free Development API which has stability issues
  - Investigate alternative translation providers

### Future Enhancements

- Add support for fanfiction.net content
- Implement reading suggestions based on user preferences and history
- Replace Clerk with NextAuth

## Legal Note

This application is designed to enhance the reading experience of publicly available content and respects the terms of service of the source platforms.
