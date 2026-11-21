# DEVANG.C Portfolio

The personal portfolio of Devang C — a product designer and developer building thoughtful digital experiences, experiments, and interfaces.

Built with React and Vite, the site uses a dark, editorial visual system with responsive layouts, animated navigation, smooth scrolling, interactive work showcases, and case-study modals.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run the linter:

```bash
npm run lint
```

## Current Features

- Full-screen hero with the DEVANG display title and manifesto
- Responsive sticky navigation with an animated slide-out menu
- Smooth scrolling powered by Lenis
- Adaptive gyroscope cursor and surface-aware navigation tone
- About, selected work, worked-at, and footer sections
- Horizontal selected-work gallery with desktop wheel-to-horizontal scrolling
- Interactive work gallery and case-study modals
- Sound, menu, and surface-tone state managed through React context
- Mobile landscape notice and responsive layouts
- Dark visual system with custom typography, grid lines, and motion effects

The latest update removes the React Bits preloader so the portfolio loads directly into the main experience.

## Project Structure

```text
Portfolio/
├── public/
│   └── images/                 # Portfolio and work imagery
├── src/
│   ├── components/             # Page sections, navigation, modals, and UI
│   ├── context/                # Sound, menu, and surface-tone providers
│   ├── styles/                 # Section, typography, navigation, and footer styles
│   ├── App.jsx                 # Application layout and shared interactions
│   ├── index.css               # Tailwind CSS entry point
│   └── main.jsx                # React application entry point
├── index.html                  # Document metadata and font loading
├── vite.config.js              # Vite configuration
└── package.json                # Scripts and dependencies
```

## Tech Stack

- React 19
- Vite
- Tailwind CSS 4
- GSAP
- Framer Motion
- Lenis
- Lucide React
- Three.js and OGL
