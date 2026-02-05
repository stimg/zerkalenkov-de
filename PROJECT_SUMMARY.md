# Portfolio Website - Project Summary

## Overview

A contemporary, professional portfolio website for a Senior Fullstack AI Engineer with 20+ years of experience. Built with modern web technologies and featuring AI-powered interactive elements.

## 🎯 Features Implemented

### Core Features
- ✅ Dual-theme system (light/dark) with system preference detection
- ✅ Fully responsive design (mobile, tablet, desktop, wide)
- ✅ 3D animated neural network hero background using Three.js
- ✅ Smooth scroll navigation between sections
- ✅ Accessible (WCAG 2.1 AA+ compliant structure)
- ✅ Performance optimized with code splitting

### Sections
1. **Hero** - Full-viewport with 3D neural network background, CTA buttons
2. **Tech Stack** - Infinite horizontal scrolling marquee
3. **About** - Professional summary with service cards
4. **Skills** - Categorized skill badges (accordion on mobile)
5. **Projects** - Featured work with modal details
6. **Contact** - Clean contact methods (no form, direct links)

### AI Features
1. **Resume Chat Assistant** - Floating panel for Q&A about experience
2. **JD Match Analyzer** - Tool for recruiters to check candidate fit

## 🛠 Tech Stack

- **Runtime**: Bun
- **Build Tool**: Vite 7
- **Framework**: React 19 with TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **3D Graphics**: Three.js + React Three Fiber + Drei
- **State Management**: TanStack Query
- **Icons**: Lucide React
- **AI**: OpenAI GPT-4o

## 📁 Project Structure

```
├── api/
│   └── server.ts              # Bun API server for AI features
├── src/
│   ├── components/
│   │   ├── ai/                # ChatPanel, JDMatcher
│   │   ├── layout/            # Header, Footer
│   │   ├── sections/          # Hero, About, Skills, Projects, Contact
│   │   ├── three/             # 3D neural network scene
│   │   └── ui/                # Reusable components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and constants
│   ├── styles/                # Global CSS
│   ├── data/
│   │   └── resume.json        # Resume data
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- OpenAI API key

### Installation

1. Install dependencies:
```bash
bun install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```
VITE_OPENAI_API_KEY=your_key_here
```

### Running the Application

**Option 1: Frontend only (without AI features)**
```bash
bun run dev
```
Visit http://localhost:3000

**Option 2: Full stack (with AI features)**

Terminal 1:
```bash
bun run dev
```

Terminal 2:
```bash
bun run dev:api
```

Or use the combined command:
```bash
bun run dev:all
```

### Building for Production

```bash
bun run build
```

Preview the build:
```bash
bun run preview
```

## 🎨 Customization

### Updating Content

Edit `src/data/resume.json` with your:
- Personal information
- Skills
- Projects
- Experience
- Services

### Changing Colors

Edit `tailwind.config.js` to customize the color palette:
```javascript
colors: {
  primary: {
    // Your color scale here
  }
}
```

### Modifying Sections

Each section is a standalone component in `src/components/sections/`.
Edit or reorder them in `src/App.tsx`.

## 📝 Key Features Explained

### 3D Neural Network
- Uses Three.js for WebGL rendering
- Adapts particle count based on device (mobile/tablet/desktop)
- Mouse parallax effect on desktop
- Performance-optimized with fallback gradient

### Theme System
- Uses localStorage to persist preference
- Respects system dark mode setting
- Smooth transitions between themes
- CSS variables for easy customization

### Responsive Design
- Mobile-first approach
- Hamburger menu on mobile/tablet
- Stacked layouts on small screens
- Grid layouts scale with breakpoints

### AI Features
- Chat uses OpenAI GPT-4o with resume context
- JD Matcher analyzes job descriptions positively
- Graceful error handling
- Works without API key (shows demo data)

## 🔧 Configuration Files

- `vite.config.ts` - Build configuration, path aliases, code splitting
- `tailwind.config.js` - Tailwind CSS theme and plugins
- `postcss.config.js` - PostCSS configuration
- `tsconfig.json` - TypeScript compiler options

## 🌐 Deployment

The site can be deployed to:
- **Vercel** - `vercel deploy`
- **Netlify** - Drag & drop `dist` folder
- **GitHub Pages** - Push `dist` to gh-pages branch
- **Any static hosting** - Upload `dist` folder

For AI features, deploy the API server separately:
- **Vercel Serverless Functions**
- **Netlify Functions**
- **Railway** / **Render**

## 🐛 Known Issues & Limitations

1. Three.js bundle is large (~1MB) - Consider lazy loading
2. AI features require OpenAI API key (costs apply)
3. No backend database (all data in JSON)
4. No contact form (by design - uses direct links)

## 🔜 Potential Enhancements

- [ ] Add blog section
- [ ] Implement Intersection Observer for section highlighting
- [ ] Add project filtering by technology
- [ ] Add analytics (Plausible, Fathom)
- [ ] Implement PWA with offline support
- [ ] Add testimonials section
- [ ] Create admin panel for content management
- [ ] Add more 3D animations/effects

## 📊 Performance

Current build output:
- Main bundle: ~71 KB (gzipped: 21 KB)
- Three.js vendor: ~1.07 MB (gzipped: 296 KB)
- CSS: ~11 KB (gzipped: 2.7 KB)

Lighthouse scores (estimated):
- Performance: 85-95
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

## 📄 License

MIT License - Feel free to use as a template!

## 🙏 Acknowledgments

- Design inspiration: runware.ai, oscarhernandez.vercel.app
- Icons: Lucide React
- 3D library: Three.js
- AI: OpenAI GPT-4o

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, and Bun**
