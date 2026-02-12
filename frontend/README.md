# Pokémon Hotel Frontend

This is a small Vite + React frontend that lets you **visually exercise the Pokémon Hotel API** while you develop new backend features.

## Pages mapped to backend routes

- **Dashboard**: Quick overview and links to each feature area.
- **Health**: Calls `GET /health` and shows the JSON response so you can confirm the server is running.
- **Auth**:
  - `POST /auth/register`
  - `POST /auth/login`
  - On success, the JWT token and trainer info are stored locally so future features can reuse them.
- **Hotels**:
  - `GET /hotels`
  - `GET /hotels/:id`
  - `POST /hotels`
  - You can list hotels, fetch one by ID, and create new ones.

Each page shows the **last API status code, error (if any), and raw JSON response** so you can see exactly what the backend returned.

## Conventions for new backend features

Whenever you add a new backend feature or route, also add a matching **frontend page or section** here so you can interact with it visually:

1. **Create a new UI surface**:
   - Either add a new page (e.g. `Bookings`, `Reviews`, `Encounters`) or extend an existing one.
2. **Wire a form or controls to the API**:
   - Call the new endpoint using the helper functions in `src/api.ts` (or add a new helper there).
3. **Show the last response**:
   - Reuse the same pattern as existing pages: show last status, error, and JSON payload so you can see the effect in real-time.

This keeps the frontend in sync with the backend and gives you a living “dev console” you can use to explore your system as it grows.

## Local development

1. Start the backend (from the project root):
   - `npm run dev`
2. Start this frontend (from `frontend/`):
   - `npm run dev`
3. Open the printed Vite URL in your browser (usually `http://localhost:5173`) to interact with the API.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
