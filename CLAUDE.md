# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a Turborepo monorepo containing a fullstack authentication system with:
- **apps/nestjs-backend**: NestJS backend with JWT auth, MikroORM + PostgreSQL, email templating
- **apps/nextjs-frontend**: Next.js frontend with App Router, TypeScript, Tailwind CSS, PrimeReact
- **packages/shared**: Shared TypeScript types and DTOs between frontend and backend

## Development Commands

### Root Level (run from `/home/green/project/titan`)
- `npm run start:dev` - Start both frontend and backend in development mode
- `npm run build` - Build all apps and packages
- `npm run lint` - Run linting across all apps
- `npm run lint:fix` - Fix linting issues across all apps
- `npm run test:unit` - Run unit tests for all apps
- `npm run test:e2e` - Run E2E tests for all apps
- `npm run format` - Format code with Prettier

### Backend Specific (apps/nestjs-backend)
- `npm run start:dev` - Start backend in watch mode
- `npm run start:dev:infra` - Start Docker infrastructure (PostgreSQL)
- `npm run migration:create` - Create new database migration
- `npm run migration:up` - Run pending migrations
- `npm run migration:down` - Rollback last migration
- `npm run test:unit` - Run Jest unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run lint` - Run XO linting
- `npm run lint:fix` - Fix XO linting issues

### Frontend Specific (apps/nextjs-frontend)
- `npm run start:dev` - Start Next.js in development mode
- `npm run build` - Build Next.js app
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:debug` - Debug Playwright tests
- `npm run lint` - Run XO linting
- `npm run lint:fix` - Fix XO linting issues

### Shared Package (packages/shared)
- `npm run build` - Build shared TypeScript package (required before running apps)
- `npm run start:dev` - Build in watch mode
- `npm run lint` - Run XO linting

## Setup Requirements

1. Build shared package first: `cd packages/shared && npm run build`
2. Install dependencies: `npm install` (at root)
3. Set up environment variables from `.env.example` files in both apps
4. Start backend infrastructure: `cd apps/nestjs-backend && npm run start:dev:infra`
5. Run database migrations: `npm run migration:create && npm run migration:up`
6. Start development: `npm run start:dev` (from root)

## Architecture Notes

### Backend Architecture
- **Module-based structure**: Each feature (auth, users, email, etc.) is a separate NestJS module
- **Global guards**: JWT authentication and throttling applied globally via APP_GUARD
- **Database**: MikroORM with PostgreSQL, migration-based schema management
- **Email**: Templated email service with Handlebars templates for multiple languages
- **Validation**: class-validator for DTOs, Joi for environment config validation

### Frontend Architecture
- **App Router**: Next.js 15 with App Router and TypeScript
- **State Management**: Zustand for global state, React Query for server state
- **Styling**: Tailwind CSS with PrimeReact components
- **Internationalization**: next-intl for multi-language support
- **Authentication**: JWT-based with refresh tokens, stored in Zustand

### Shared Package
- Contains shared TypeScript types and DTOs
- Must be built before running apps
- Used by both frontend and backend for type safety

## Testing

- **Backend**: Jest for unit tests, E2E tests with Jest
- **Frontend**: Playwright for E2E tests
- **Linting**: XO (ESLint-based) for both apps
- **Formatting**: Prettier for consistent code formatting

## Key Dependencies

- **Backend**: NestJS, MikroORM, class-validator, JWT, bcrypt, nodemailer
- **Frontend**: Next.js, React Query, Zustand, Zod, React Hook Form, PrimeReact
- **Shared**: class-validator, class-transformer for validation and serialization