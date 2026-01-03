# Portfolio Website

A performance-optimized, single-page portfolio built from scratch without frameworks or libraries. This project itself demonstrates full-stack web development skills, performance engineering, and modern web standards implementation.

## Project Overview

This isn't just a portfolio showcasing my work - the website itself is a technical project. It's a zero-dependency, vanilla implementation of a modern web experience with advanced animations, interactive effects, and production-grade performance optimizations.

### Technical Highlights

- **Single-file architecture**: Entire site contained in one HTML file for maximum portability and zero build complexity
- **Canvas particle system**: Custom implementation of connected particle animations with O(n²) to O(n) optimization
- **Custom cursor engine**: GPU-accelerated cursor tracking with sub-pixel smoothing and easing functions
- **Intersection Observer**: Modern, performant scroll animations replacing legacy scroll event listeners
- **CSS containment**: Layout isolation for independent section rendering
- **Strategic GPU acceleration**: Selective will-change hints to optimize composite layers without memory overhead

### Performance Engineering

Built for GitHub Pages hosting with aggressive optimization:

- Font subsetting and async loading with swap strategy
- RequestAnimationFrame throttling for all scroll handlers
- Passive event listeners for better scroll performance
- Distance-squared calculations to eliminate unnecessary sqrt operations
- Transform-based animations over layout-triggering properties
- Viewport-based particle count scaling

Initial load under 50KB (uncompressed), sub-second First Contentful Paint, 60fps animations on low-end devices.

## Architecture

### Structure

```
akshaybajpai.com/
├── index.html          # Complete site (HTML + CSS + JS)
├── logo.png            # Brand asset
├── CNAME               # Custom domain config
└── README.md           # This file
```

### Tech Stack

- **HTML5**: Semantic markup, structured data (JSON-LD), accessibility attributes
- **CSS3**: Custom properties, CSS Grid, Flexbox, backdrop-filter, CSS containment
- **Vanilla JavaScript**: Canvas API, Intersection Observer, RequestAnimationFrame, async/await
- **Google Fonts**: Subset loading with display swap

No frameworks. No preprocessors. No build tools. Just standards.

## Features

### Visual Effects

- **Particle background**: 60-120 dynamic particles with distance-based connections
- **Gradient orbs**: Parallax-enabled background elements with blur effects
- **Custom cursor**: Desktop-only interactive cursor with smooth following behavior
- **Glass morphism**: Backdrop blur effects on navigation and interactive elements
- **Scroll reveals**: Intersection Observer-based fade-in animations

### Responsive Design

- Fully responsive from 320px to 4K displays
- Mobile-first media queries
- Touch-optimized interactions
- Reduced motion support via prefers-reduced-motion

### SEO & Social

- Complete Open Graph and Twitter Card meta tags
- Structured data for Person, WebSite, and ProfilePage schemas
- Semantic HTML5 elements
- Canonical URLs and proper meta descriptions

## Development

### Local Setup

```bash
# Clone repository
git clone https://github.com/ax5hay/akshaybajpai.com.git
cd akshaybajpai.com

# Serve locally (choose one)
python -m http.server 8000
npx serve
php -S localhost:8000
```

Visit http://localhost:8000

### Customization

#### Colors and Theme

All design tokens are CSS custom properties in the `:root` selector:

```css
:root {
    --primary-dark: #0d0d12;
    --accent-amber: #f5c563;
    --accent-rose: #ff6b9d;
    --accent-cyan: #00e5ff;
    --accent-indigo: #6366f1;
    /* Gradients, shadows, and effects */
}
```

#### Content Updates

Content is in HTML sections. Key areas to update:

- Line 2146-2170: Hero section (name, title, description)
- Line 2285-2345: About section
- Line 2500-2650: Experience timeline
- Line 2700-2850: Projects
- Line 2900-2950: Contact information

#### Animation Tuning

JavaScript configuration (lines 3000-3300):

```javascript
const particleCount = window.innerWidth < 768 ? 60 : 120;  // Particle density
const speed = 0.15;                                         // Cursor easing
const revealPoint = 100;                                    // Scroll reveal offset
```

### Performance Optimization Details

#### Font Loading Strategy
- Preconnect to Google Fonts domains
- Preload font CSS with `as="style"`
- Load with `media="print"` then switch to `all` on load
- Fallback system fonts during load

#### Scroll Performance
- All scroll listeners use `{ passive: true }`
- RequestAnimationFrame throttling prevents layout thrashing
- Intersection Observer replaces getBoundingClientRect calls
- Parallax effects limited to transform operations

#### Canvas Optimization
- Particle count scales with viewport size
- Animation pauses when tab is hidden (visibilitychange API)
- Distance comparisons use squared values to avoid sqrt
- Single requestAnimationFrame loop for all animations

#### GPU Acceleration
- will-change applied only on :hover states
- Transform and opacity for animations (not top/left)
- Cursor uses translate instead of position updates
- CSS containment isolates rendering contexts

## Deployment

### GitHub Pages

Site is deployed via GitHub Pages with custom domain:

1. Push to `main` branch
2. GitHub Actions builds and deploys automatically
3. Available at https://akshaybajpai.com

### Custom Domain Setup

DNS configuration (replace with your domain):

```
Type    Name    Value
A       @       xxx.xxx.xxx.xxx
A       @       xxx.xxx.xxx.xxx
A       @       xxx.xxx.xxx.xxx
A       @       xxx.xxx.xxx.xxx
CNAME   www     xxx.github.io
```

Update CNAME file:
```bash
echo "yourdomain.com" > CNAME
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 90+)

### Graceful Degradation

- Custom cursor disabled on touch devices
- Intersection Observer fallback shows all content
- Reduced motion CSS media query disables animations
- Backdrop-filter fallback to solid backgrounds

## Performance Metrics

Lighthouse scores (Desktop):

- Performance: 98/100
- Accessibility: 100/100
- Best Practices: 100/100
- SEO: 100/100

Key metrics:
- First Contentful Paint: < 0.8s
- Time to Interactive: < 1.2s
- Cumulative Layout Shift: 0
- Total Blocking Time: < 50ms

## Known Issues

- Backdrop-filter performance on older mobile devices (fallback available)
- Custom cursor can lag on 4K+ displays with particle effects (throttled)
- Font loading flash on slow connections (mitigated with font-display: swap)

## Future Improvements

- WebP/AVIF image formats with fallbacks
- Service worker for offline support
- Lazy load below-fold sections
- Prefers-color-scheme dark/light mode toggle
- WebGL particle system for higher performance

## License

© 2025 Akshay Bajpai. All rights reserved.

Source code is proprietary. Content, design, and implementation are copyright protected.

## Contact

- Email: contact@akshaybajpai.com
- LinkedIn: linkedin.com/in/ax5hay
- GitHub: github.com/ax5hay
- Twitter: @ax5hay

---

Built with vanilla web standards. No frameworks were harmed in the making of this site XD
