# Quick Start Guide

## 🚀 Get Running in 3 Minutes

### 1. Install Dependencies
```bash
bun install
```

### 2. Set Up Environment (Optional - for AI features)
```bash
# Create .env file
echo "VITE_OPENAI_API_KEY=your_openai_key" > .env
```

### 3. Start Development Server
```bash
# Frontend only (works without API key)
bun run dev

# With AI features (requires OpenAI key)
# Terminal 1:
bun run dev

# Terminal 2:
bun run dev:api
```

### 4. Open Browser
Visit: **http://localhost:3000**

---

## ✏️ Customize Your Portfolio

### Update Your Information
Edit `src/data/resume.json`:
- Personal details (name, email, links)
- Skills
- Projects
- Experience

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#your-color-here',
    // ... other shades
  }
}
```

### Add/Remove Sections
Edit `src/App.tsx` - reorder or remove section components

---

## 🏗️ Build for Production

```bash
# Build
bun run build

# Preview build locally
bun run preview
```

Output will be in the `dist/` folder - ready to deploy!

---

## 🌐 Deploy

### Vercel (Recommended)
```bash
npm i -g vercel
vercel deploy
```

### Netlify
Drag and drop the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)

### GitHub Pages
```bash
# Build
bun run build

# Push dist folder to gh-pages branch
git subtree push --prefix dist origin gh-pages
```

---

## ❓ Troubleshooting

**Q: Build fails with module not found**
```bash
rm -rf node_modules bun.lock
bun install
```

**Q: 3D scene not loading**
- Check browser console for WebGL errors
- Try a different browser (Chrome/Firefox recommended)

**Q: AI features not working**
- Verify `.env` file exists with valid OpenAI API key
- Check that API server is running (`bun run dev:api`)
- Ensure frontend is pointing to correct API URL

**Q: Styles not applying**
```bash
# Clear Vite cache
rm -rf .vite node_modules/.vite
bun run dev
```

---

## 📚 Next Steps

- [ ] Customize `src/data/resume.json` with your information
- [ ] Replace placeholder images in projects
- [ ] Update social links in Contact section
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit
- [ ] Deploy to production

---

**Need help?** Check `PROJECT_SUMMARY.md` for detailed documentation.
