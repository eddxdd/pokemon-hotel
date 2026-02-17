# Master Ball ⚪🔴

A Pokemon-themed Wordle game where trainers guess Pokemon based on attributes and collect TCG cards. Built with modern full-stack development practices featuring React 19, Express.js, Prisma ORM, and PostgreSQL.

---

## 🚀 Overview

**Master Ball** is a daily Pokemon guessing game with TCG card collection mechanics. Players choose a biome, guess Pokemon based on attributes (type, evolution stage, color, generation), and collect rare Pokemon Trading Card Game cards as rewards.

### Game Features

- 🎮 **Pokemon Wordle** - Guess Pokemon based on 6 attributes:
  - Biome habitat
  - Type 1 & Type 2
  - Evolution stage (baby, basic, stage 1, stage 2)
  - Fully evolved status
  - Pokemon color
  - Generation (Gen I - Gen IX)

- 🗺️ **Biome Selection** - Choose from 9 unique biomes:
  - Grassland, Forest, Beach, Sea, Cave, Mountain, City, Volcano, Cemetery
  - Day/Night cycle affects spawn rates

- 🃏 **TCG Card Collection** - Collect Pokemon Trading Card Game cards:
  - **Tier-based rewards** (1-6 tries = Tier 1-6)
  - **12 Rarity Types**: Common, Uncommon, Rare, Double Rare, Illustration Rare, Super Rare, Special Illustration Rare, Immersive, Shiny Rare, Shiny Super Rare, Ultra Rare, Hyper Rare
  - **Pity System** - Guaranteed rare cards after consecutive poor performances
  - **Pokedex Tracker** - Track your collection of 151 original Kanto Pokemon

- 👤 **User Profiles** - Customizable avatars and banners with type-themed designs

---

## 🧱 Tech Stack

### 🖥️ Frontend
- **React 19** – Modern component-based UI library
- **TypeScript** – Type-safe frontend development
- **Vite** – Fast build tool and dev server
- **Custom CSS** – Dark theme with neon accents and Pokemon-inspired design
- **react-easy-crop** – Avatar/banner cropping

### 🧠 Backend
- **Node.js** (v22+) – JavaScript runtime
- **Express.js** (v5) – Web framework for REST APIs
- **TypeScript** – Type-safe backend development
- **JWT Authentication** – Secure user sessions
- **Bcrypt** – Password hashing

### 🗄️ Database & ORM
- **PostgreSQL** – Relational database
- **Prisma ORM** – Type-safe database access with migrations
- **@prisma/adapter-pg** – PostgreSQL adapter for Prisma 7
- **Prisma Studio** – Visual database management

### 🃏 External APIs
- **TCGdex API** – Pokemon Trading Card Game data
- **PokeAPI** – Pokemon attributes and sprites

### 🔒 Security & Middleware
- **Helmet** – Security HTTP headers
- **CORS** – Cross-origin resource sharing
- **express-rate-limit** – Rate limiting protection
- **Error handling** – Centralized error middleware

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v22 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

---

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd master-ball
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

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/master_ball?schema=public

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

### 4. Database Setup

1. Create a PostgreSQL database:
```bash
createdb master_ball
```

2. Run migrations:
```bash
npm run prisma:migrate
```

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

4. (Optional) Seed the database with Pokemon data:
```bash
tsx src/scripts/seedWordle.ts
```

### 5. Add Card Images (Optional)

If you have Pokemon TCG card images in zip format:

1. Place zip files in `frontend/public/images/cards/`
2. Run the local card image script:
```bash
npm run cards:use-local
```

### 6. Start Development Servers

Run both backend and frontend concurrently:

```bash
npm run dev
```

This will start:
- **Backend API** at `http://localhost:4000`
- **Frontend** at `http://localhost:5173` (default Vite port)

Alternatively, run them separately:

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### 7. Prisma Studio (Optional)

To view and manage your database visually:

```bash
npm run prisma:studio
```

Open at `http://localhost:5555`

---

## 📁 Project Structure

```
master-ball/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── frontend/               # React + Vite frontend
│   ├── public/
│   │   └── images/         # Avatar, banner, card, and UI assets
│   ├── src/
│   │   ├── components/     # React components (Wordle, Pokedex, etc.)
│   │   ├── App.tsx         # Main application component
│   │   ├── App.css         # Component styles (dark theme)
│   │   ├── api.ts          # API client functions
│   │   └── main.tsx        # React entry point
│   ├── package.json
│   └── vite.config.ts
├── prisma/
│   ├── migrations/         # Database migrations
│   └── schema.prisma       # Database schema
├── src/
│   ├── lib/
│   │   └── prisma.ts       # Prisma client setup
│   ├── middleware/
│   │   ├── auth.ts         # JWT authentication middleware
│   │   └── errorHandler.ts # Global error handler
│   ├── routes/
│   │   ├── auth.ts         # Authentication routes
│   │   ├── games.ts        # Wordle game routes
│   │   ├── biomes.ts       # Biome selection routes
│   │   ├── pokedex.ts      # Pokedex/collection routes
│   │   ├── users.ts        # User management routes
│   │   └── health.ts       # Health check endpoint
│   ├── services/
│   │   ├── wordleLogic.ts  # Wordle comparison logic
│   │   ├── cardGenerator.ts # Card offer generation with pity
│   │   ├── tcgdex.ts       # TCGdex API integration
│   │   └── pokeapi.ts      # PokeAPI integration
│   ├── scripts/
│   │   ├── seedWordle.ts   # Seed Pokemon and biome data
│   │   ├── seedCardsEnhanced.ts # Seed TCG cards
│   │   └── useLocalCardImages.ts # Load local card images
│   ├── utils/
│   │   └── auth.ts         # Password hashing & JWT utilities
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Server entry point
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Local development with Docker
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

### Core Models

- **User** - Player accounts with customizable avatars/banners
- **Biome** - 9 game biomes (Grassland, Forest, Beach, etc.)
- **Pokemon** - 151 Kanto Pokemon with attributes
- **PokemonSpawn** - Spawn rates for Pokemon in biomes (day/night)
- **Card** - Pokemon TCG cards with rarity tiers
- **Game** - Individual Wordle game sessions
- **Guess** - Player guesses with feedback
- **UserCard** - Cards captured by players
- **PokedexEntry** - User's collection tracker
- **PityTracker** - Pity system state

### Enums

- **UserRole**: USER, ADMIN
- **TimeOfDay**: day, night, both
- **EvolutionStage**: baby, basic, stage1, stage2
- **CardRarity**: Common, Uncommon, Rare, Double Rare, Illustration Rare, Super Rare, Special Illustration Rare, Immersive, Shiny Rare, Shiny Super Rare, Ultra Rare, Hyper Rare

---

## 🚀 Available Scripts

```bash
# Development (runs both backend and frontend)
npm run dev              # Start both servers concurrently
npm run dev:backend      # Start backend only with hot reload
npm run dev:frontend     # Start frontend only (Vite dev server)

# Build
npm run build            # Build TypeScript to JavaScript (backend)
npm run start            # Start production server

# Frontend (from frontend/ directory)
cd frontend
npm run dev              # Start Vite dev server
npm run build            # Build frontend for production
npm run preview          # Preview production build

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations (dev)
npm run prisma:migrate:deploy  # Deploy migrations (production)
npm run prisma:studio    # Open Prisma Studio

# Card Management
npm run cards:use-local  # Load local TCG card images from zips

# Quality
npm run type-check       # TypeScript type checking
```

---

## 🎮 How to Play

1. **Register/Login** - Create an account or log in
2. **Choose a Biome** - Select from 9 biomes (affects Pokemon pool)
3. **Toggle Day/Night** - Some Pokemon only appear at certain times
4. **Make Guesses** - You have 6 attempts to guess the correct Pokemon
5. **Attribute Feedback**:
   - 🟢 **Master Ball** - Correct attribute
   - 🟡 **Great Ball** - Correct but wrong position (types only)
   - 🔴 **Poke Ball** - Wrong attribute
   - ⚪ **X** - Pokemon has no Type 2 (monotype)
6. **Collect Cards** - After winning, choose 1 of 3 TCG cards
   - First card is always the guessed Pokemon
   - Card rarity depends on number of tries (Tier 1-6)
7. **Complete Pokedex** - Track your collection of all 151 Kanto Pokemon cards

---

## 📝 API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /auth/register` - Register a new account
- `POST /auth/login` - Login and receive JWT token

### Game Flow
- `GET /biomes` - List all biomes with day/night spawn counts
- `POST /games` - Start a new Wordle game (choose biome & time)
- `GET /games/:id` - Get game state
- `POST /games/:id/guess` - Submit a guess
- `POST /games/:id/capture` - Capture a card after winning

### Collection
- `GET /pokedex` - Get user's Pokedex with all cards
- `GET /cards/:id` - Get specific card details

### User Management
- `GET /users` - List all users (admin only)
- `PATCH /users/:id/role` - Update user role (admin only)

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth with configurable expiration
- **Bcrypt Password Hashing** - Secure password storage
- **Helmet** - Sets security HTTP headers
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - Protects against brute force attacks
- **Error Handling** - Centralized error handling middleware
- **Environment Variables** - Sensitive data stored securely

---

## 🎨 UI/UX Features

- **Dark Theme** - Sleek dark mode with neon accents
- **Animated Background** - Floating neon triangles on navbar
- **Responsive Design** - Mobile-first approach with tablet/desktop optimization
- **Visual Feedback** - Hover effects, active states, and smooth transitions
- **Card Viewer** - Zoom and pan TCG cards
- **Autocomplete Search** - Quick Pokemon lookup
- **Filters** - Search by rarity, capture status
- **Profile Customization** - 40 avatars and 20 banners across 5 Pokemon types

---

## 🗺️ Roadmap

### ✅ Completed Features
- Full Wordle game logic with 6 attribute comparisons
- Biome selection with day/night mechanics
- TCG card collection with 12 rarity tiers
- Tier-based reward system (1-6 tries)
- Pity system for guaranteed rare cards
- Pokedex tracker for all 151 Kanto Pokemon
- User authentication and profiles
- Admin user management
- Avatar and banner customization
- Card viewer with zoom/pan
- Local card image support
- Mobile-responsive design

### 🔜 Future Enhancements
- [ ] Daily challenge mode
- [ ] Leaderboards and statistics
- [ ] Trading system
- [ ] More generations (beyond Gen I)
- [ ] Shiny variants
- [ ] Achievement system
- [ ] Card favoriting
- [ ] Export/share Pokedex progress
- [ ] Sound effects and animations
- [ ] Push notifications for daily challenges

---

## 📄 License

ISC

---

## 👤 Author

Built as a learning project to master modern full-stack development practices.

---

## 🙏 Acknowledgments

- Pokemon is a trademark of Nintendo/Creatures Inc./GAME FREAK inc.
- Pokemon TCG is a trademark of The Pokemon Company
- This project is for educational purposes only
- Card data provided by [TCGdex](https://www.tcgdex.net/)
- Pokemon data provided by [PokeAPI](https://pokeapi.co/)
