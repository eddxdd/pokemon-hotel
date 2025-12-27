# Setup Guide

## Quick Start Checklist

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
# For development without Accelerate, use direct PostgreSQL connection
# When using Accelerate, change DATABASE_URL to use prisma:// protocol
DATABASE_URL=postgresql://user:password@localhost:5432/pokemon_hotel?schema=public

# Direct database connection for migrations and introspection
# This should always use the direct postgresql:// connection
DIRECT_DATABASE_URL=postgresql://user:password@localhost:5432/pokemon_hotel?schema=public

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

#### Option A: Local PostgreSQL

```bash
# Create database
createdb pokemon_hotel

# Run migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
```

#### Option B: Docker Compose

```bash
docker-compose up -d
```

### 4. Start Development Server

```bash
npm run dev
```

## Next Steps

1. **Set up Prisma Accelerate** (optional):
   - Sign up at https://accelerate.prisma.io
   - Create a new project and enable Accelerate
   - Update `DATABASE_URL` in your `.env` file to use the `prisma://` protocol:
     ```
     DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=__API_KEY__"
     ```
   - Keep `DIRECT_DATABASE_URL` as your direct PostgreSQL connection for migrations

2. **Run Database Migrations**:
   - The schema has been expanded with all Pokemon Hotel features
   - Run `npm run prisma:migrate` to apply migrations

3. **Install New Dependencies**:
   - Run `npm install` to install the new packages (CORS, Helmet, Zod, etc.)

4. **Build the Project**:
   - Run `npm run build` to ensure everything compiles correctly

## Important Notes

- TypeScript strict mode is now enabled - you may need to fix type errors
- The Prisma schema has been significantly expanded - you'll need to create a new migration
- Security middleware (Helmet, CORS, rate limiting) has been added
- AWS deployment files are ready but need configuration

## Troubleshooting

### TypeScript Errors

If you encounter TypeScript errors after enabling strict mode:
1. Run `npm run type-check` to see all errors
2. Fix type issues one by one
3. Use `as` assertions sparingly and only when necessary

### Prisma Client Issues

If Prisma Client is not found:
```bash
npm run prisma:generate
```

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check that the database exists

