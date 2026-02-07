# Alexey Zerkalenkov - Portfolio Website

A contemporary, professional portfolio website for a Senior Fullstack AI Engineer with 20+ years of experience.

## Tech Stack

- **Runtime**: Bun
- **Build**: Vite
- **Framework**: React 19 with TypeScript
- **State/Routing**: TanStack Router + TanStack Query
- **Styling**: Tailwind CSS 3.4.1
- **3D Graphics**: Three.js + React Three Fiber
- **Icons**: Lucide React
- **AI Features**: OpenAI API (GPT-4o)

## Features

- Dual-theme (light/dark) with system preference detection
- Fully responsive design (mobile, tablet, desktop)
- 3D animated neural network hero background
- AI-powered resume chat assistant
- Job description match analyzer for recruiters
- WCAG 2.1 AA+ accessibility compliant
- Optimized for performance (90+ Lighthouse scores)

## Getting Started

### Prerequisites

Make sure you have [Bun](https://bun.sh) installed. If not:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Installation

1. Install dependencies:

```bash
bun install
```

2. Create a `.env` file from the example:

```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:

```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Development

Start the development server:

```bash
bun run dev
```

The site will be available at `http://localhost:3000`

### Build

Build for production:

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/        # Header, Footer
│   ├── sections/      # Hero, About, Skills, Projects, Contact
│   ├── ui/            # Reusable UI components
│   ├── ai/            # ChatPanel, JDMatcher
│   └── three/         # 3D neural network scene
├── hooks/             # Custom React hooks
├── lib/               # Utilities and constants
├── styles/            # Global styles
└── data/              # Resume data (JSON)
```

## Customization

To customize the portfolio for your own use:

1. Edit `src/data/resume.json` with your information
2. Update personal details, skills, projects, and experience
3. Modify the color scheme in `tailwind.config.js`
4. Replace placeholder images in the projects section

## License

MIT License - feel free to use this as a template for your own portfolio!

Built with React, TypeScript, and Bun.
