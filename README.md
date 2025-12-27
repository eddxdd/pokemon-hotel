# Pokemon Hotel 🏨✨

A full-stack hotel booking application with Pokemon encounters, built to emulate modern professional development workflows. Trainers can book rooms in different biomes (beach, mountain, forest, etc.) and encounter Pokemon cards with varying rarity tiers based on their trainer level.

---

## 🚀 Overview

**Pokemon Hotel** is a game-inspired hotel and encounter platform that demonstrates real-world backend architecture, REST API design, and relational database modeling. The platform allows trainers to:

- Book rooms in hotels across different biomes (beach, mountain, forest, desert, ocean, etc.)
- Encounter Pokemon cards with biome-specific spawn rates
- Collect cards with different rarity tiers (Common, Uncommon, Rare, Epic, Legendary)
- Level up trainers to unlock rarer card encounters
- Trade cards with other trainers (coming soon)

---

## 🧱 Tech Stack

### 🖥️ Frontend
- **React** – Component-based UI library (to be implemented)
- **TypeScript** – Type-safe frontend development

### 🧠 Backend
- **Node.js** (v18+) – JavaScript runtime
- **Express.js** (v5) – Web framework for building REST APIs
- **TypeScript** – Type-safe backend development
- **REST API** – Stateless API architecture

### 🗄️ Database & ORM
- **PostgreSQL** – Relational database
- **Prisma ORM** – Type-safe database access and migrations
- **Prisma Accelerate** – Connection pooling and caching for better performance

### 🔒 Security & Middleware
- **Helmet** – Security HTTP headers
- **CORS** – Cross-origin resource sharing
- **express-rate-limit** – Rate limiting protection
- **Zod** – Schema validation

### ☁️ Infrastructure
- **AWS ECS/Fargate** – Container orchestration
- **AWS ECR** – Container registry
- **Docker** – Containerization
- **GitHub Actions** – CI/CD pipeline

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher) - for local development
- **Docker** (optional, for containerized development)
- **AWS CLI** (for deployment)
- **Git**

---

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd pokemon-hotel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```bash
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

### 4. Database Setup

#### Option A: Local PostgreSQL

1. Create a PostgreSQL database:
```bash
createdb pokemon_hotel
```

2. Run migrations:
```bash
npm run prisma:migrate
```

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

#### Option B: Docker Compose

```bash
docker-compose up -d
```

This will start PostgreSQL and run migrations automatically.

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:4000`

### 6. Prisma Studio (Optional)

To view and manage your database visually:

```bash
npm run prisma:studio
```

---

## 📁 Project Structure

```
pokemon-hotel/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── .aws/                   # AWS deployment configs
├── prisma/
│   ├── migrations/         # Database migrations
│   └── schema.prisma       # Database schema
├── scripts/                # Deployment scripts
├── src/
│   ├── db/
│   │   └── prisma.ts       # Prisma client setup
│   ├── generated/          # Generated Prisma client
│   ├── middleware/
│   │   └── errorHandler.ts # Global error handler
│   ├── routes/
│   │   ├── health.ts       # Health check endpoint
│   │   └── hotels.ts       # Hotel routes
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Server entry point
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Local development with Docker
└── package.json
```

---

## 🗄️ Database Schema

### Core Models

- **Trainer** - User accounts with level and experience
- **Hotel** - Hotels in different biomes
- **Room** - Individual rooms in hotels
- **Booking** - Reservations made by trainers
- **PokemonCard** - Pokemon cards with rarity tiers
- **TrainerCard** - Cards owned by trainers
- **BiomeSpawnRate** - Spawn rates for Pokemon in different biomes
- **PokemonEncounter** - Tracks encounters during bookings
- **Trade** - Trading system (future feature)

### Enums

- **BiomeType**: BEACH, MOUNTAIN, FOREST, DESERT, OCEAN, GRASSLAND, CAVE, URBAN
- **CardRarity**: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY

---

## 🚀 Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Build
npm run build            # Build TypeScript to JavaScript
npm run start            # Start production server

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations (dev)
npm run prisma:migrate:deploy  # Deploy migrations (production)
npm run prisma:studio    # Open Prisma Studio

# Quality
npm run lint             # Type check without emitting files
npm run type-check       # TypeScript type checking
```

---

## 🐳 Docker Development

### Using Docker Compose

```bash
# Start all services (PostgreSQL + API)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Building Docker Image

```bash
docker build -t pokemon-hotel-api .
docker run -p 4000:4000 --env-file .env pokemon-hotel-api
```

---

## ☁️ AWS Deployment

### Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI configured
3. ECR repository created
4. ECS cluster and service configured
5. RDS PostgreSQL database (or use Prisma Accelerate)
6. Secrets stored in AWS Secrets Manager

### Initial Setup

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run initial AWS infrastructure setup
./scripts/setup-aws.sh
```

### Manual Deployment

```bash
# Deploy to AWS ECS
./scripts/deploy-aws.sh
```

### Environment Variables in AWS

Store the following secrets in AWS Secrets Manager:

- `pokemon-hotel/database-url` - PostgreSQL connection string
- `pokemon-hotel/prisma-accelerate-url` - Prisma Accelerate URL

### CI/CD Deployment

The project includes GitHub Actions workflows that automatically:

1. **Test** - Run type checking and build on every push/PR
2. **Deploy** - Automatically deploy to AWS ECS on pushes to `main` branch

Configure the following GitHub Secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

---

## 🔐 Security Features

- **Helmet** - Sets security HTTP headers
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - Protects against brute force attacks
- **Input Validation** - Type-safe validation with Zod (to be implemented)
- **Error Handling** - Centralized error handling middleware
- **Environment Variables** - Sensitive data stored securely

---

## 📝 API Endpoints

### Health Check
- `GET /health` - Server health status

### Hotels
- `GET /hotels` - List all hotels
- `GET /hotels/:id` - Get hotel by ID
- `POST /hotels` - Create a new hotel

### Future Endpoints
- Trainer management
- Booking system
- Pokemon encounters
- Card collection
- Trading system

---

## 🧪 Testing

Testing setup is recommended for professional development. Consider adding:

- **Jest** or **Vitest** - Testing framework
- **Supertest** - API endpoint testing
- **Prisma Mock** - Database mocking

---

## 🤝 Contributing

This is a learning project, but professional practices are encouraged:

1. Create feature branches from `develop`
2. Write clear commit messages
3. Ensure code passes type checking
4. Update documentation as needed
5. Test locally before pushing

---

## 📚 Learning Resources

### Technologies Used

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Accelerate](https://www.prisma.io/docs/accelerate)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)

---

## 🗺️ Roadmap

### Current Features
- ✅ Basic hotel CRUD operations
- ✅ Database schema for Pokemon Hotel features
- ✅ Professional development setup
- ✅ AWS deployment configuration
- ✅ CI/CD pipeline

### Planned Features
- [ ] Trainer authentication and management
- [ ] Booking system with date validation
- [ ] Pokemon encounter system based on biomes
- [ ] Card collection and rarity system
- [ ] Trainer leveling system
- [ ] Trading system
- [ ] React frontend
- [ ] Real-time notifications
- [ ] Admin dashboard

---

## 📄 License

ISC

---

## 👤 Author

Built as a learning project to master modern full-stack development practices.

---

## 🙏 Acknowledgments

- Pokemon is a trademark of Nintendo/Creatures Inc./GAME FREAK inc.
- This project is for educational purposes only
