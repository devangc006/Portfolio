# React + Tailwind CSS + React Bits

A minimal, high-performance starter configured with **Vite**, **Tailwind CSS v4**, and **React Bits** animated backgrounds.

---

## 🚀 Getting Started

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Build for Production
```bash
npm run build
```

### 3. Lint Code
```bash
npm run lint
```

---

## 📁 Project Structure

```
Portfolio/
├── src/
│   ├── components/
│   │   └── Backgrounds/
│   │       ├── Aurora.jsx        # Ethereal swirling gradient mesh (WebGL / OGL)
│   │       └── GhostFibers.jsx   # Flowing fiber optic waves (WebGL / OGL)
│   ├── App.jsx                   # Full-screen background view with switcher
│   ├── index.css                 # Tailwind CSS v4 styling & dark theme defaults
│   └── main.jsx                  # React application root
├── public/
│   └── favicon.svg               # Site icon
├── jsconfig.json                 # Path aliases (@/* -> ./src/*)
├── vite.config.js                # Vite config with @ alias & Tailwind v4
└── package.json
```

---

## 🛠️ Installed Dependencies & Configuration

- **Tailwind CSS v4** (`@tailwindcss/vite` + `tailwindcss`)
- **WebGL Rendering** (`ogl`, `three`)
- **Animation Engines** (`framer-motion`, `gsap`)
- **Path Alias**: `@/` maps directly to `src/` (configured in [vite.config.js](file:///home/kali/Projects/Portfolio/vite.config.js) and [jsconfig.json](file:///home/kali/Projects/Portfolio/jsconfig.json))
