# LexiAI Frontend

React + Vite frontend for the LexiAI legal assistant.

## Setup

1. Install dependencies:
```bash
npm install
# or
bun install
```

2. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` and set:
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000)
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

3. Run development server:
```bash
npm run dev
# or
bun dev
```

4. Build for production:
```bash
npm run build
# or
bun run build
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **TanStack Router** - File-based routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Axios** - HTTP client
- **Sonner** - Toast notifications

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   │   ├── lexi/      # App-specific components
│   │   └── ui/        # Reusable UI components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom hooks
│   ├── layouts/       # Page layouts
│   ├── lib/           # Utilities
│   ├── routes/        # Page routes
│   ├── services/      # API services
│   └── styles.css     # Global styles
├── public/            # Static assets
└── ...config files
```

## Available Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```
