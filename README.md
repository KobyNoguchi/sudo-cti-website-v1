# Sudo CTI Website

A modern, production-ready cybersecurity website for sudocti.com built with Next.js 14, TypeScript, and Tailwind CSS. The design closely matches the premium aesthetic of IronNet's energy utilities page.

## Features

- **Modern Design**: Premium enterprise-grade design matching IronNet's aesthetic
- **Responsive**: Mobile-first design that works on all devices
- **Performance**: Optimized with Next.js 14 App Router
- **Animations**: Smooth animations using Framer Motion
- **Type-Safe**: Full TypeScript support
- **Accessible**: WCAG AA compliant components

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Font**: Inter (via Next.js)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── about/             # About page
│   ├── services/          # Services page
│   ├── industries/        # Industries page
│   ├── resources/         # Resources page
│   └── contact/           # Contact page
├── components/
│   ├── navigation/        # Header, MegaMenu, MobileMenu
│   ├── sections/          # Hero, Features, Stats, CTA, etc.
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
└── public/                # Static assets
    └── Assets/            # Images, logos, etc.
```

## Color Scheme

- **Primary**: Deep navy blue (#0A2540)
- **Secondary**: Bright blue accent (#0066FF)
- **Background**: Clean white (#FFFFFF)
- **Text**: Dark gray/black for body, white for dark sections

## Key Components

### Navigation
- Sticky header with transparent/solid toggle on scroll
- Mega-menu dropdowns for desktop
- Mobile hamburger menu with slide-out drawer
- Scroll progress indicator

### Sections
- **Hero**: Large headline with animated gradient background
- **Features**: Card-based grid with icons and hover effects
- **ContentBlock**: Alternating left/right image + text blocks
- **Stats**: Testimonial/stats section with icons
- **CTA**: Full-width call-to-action sections with gradients
- **Newsletter**: Email signup form

## Customization

### Colors
Edit `tailwind.config.ts` to customize the color scheme.

### Typography
Font sizes and weights are defined in `tailwind.config.ts` under `fontSize`.

### Content
Update content in:
- `app/page.tsx` - Homepage content
- `components/navigation/Header.tsx` - Navigation items
- `components/Footer.tsx` - Footer links

## Form Integration

The contact form uses Formspree. To change the endpoint, edit `app/contact/page.tsx` and update the fetch URL.

## Deployment

- **Production**: GitHub Pages via `.github/workflows/deploy.yml`. Push to `main` and the workflow builds `out/` using `npm run build` (`output: 'export'`) and publishes it automatically. Custom domain + DNS details live in `DEPLOYMENT.md`.
- **Local preview of export**:
  ```bash
  npm ci
  npm run build
  npx serve out
  ```
- Alternative hosts (Vercel, Netlify, etc.) still work if they can serve static exports. Remove `output: 'export'` if you ever need SSR again.

## Documentation

- `DEPLOYMENT.md` – complete GitHub Pages deployment + DNS guide.
- `docs/github-pages/troubleshooting.md` – common failures and fixes.
- `docs/archive/cloudflare/` – legacy Cloudflare Pages notes kept only for reference.

## Notes

- All state is managed with React hooks (no localStorage/sessionStorage)
- Images should be optimized and placed in `public/Assets/`
- The D3.js map animation from the original site can be converted to React if needed

## License

© 2024 Sudo CTI. All rights reserved.

