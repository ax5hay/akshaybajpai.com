# Akshay Bajpai - Portfolio Website

A modern, minimalist portfolio showcasing expertise in AI architecture, technology leadership, and published research.

## Overview

This is a single-page portfolio website featuring a sophisticated dark theme with animated gradients, particle effects, and smooth scroll interactions. Built with vanilla HTML, CSS, and JavaScript for optimal performance and zero dependencies.

## Features

- **Responsive Design** - Fully optimized for desktop, tablet, and mobile devices
- **Animated Background** - Canvas-based particle system with dynamic connections
- **Custom Cursor** - Interactive cursor with hover effects (desktop only)
- **Smooth Animations** - Scroll-triggered reveal animations and parallax effects
- **Glass Morphism** - Modern UI with backdrop blur and gradient overlays
- **Performance Optimized** - Lightweight, no external dependencies, fast load times

## Sections

- **Hero** - Introduction with animated gradient text and CTA buttons
- **Stats** - Key metrics and achievements
- **About** - Professional background and core competencies
- **Experience** - Career timeline with detailed role descriptions
- **Projects** - Featured research and development work
- **Education** - Academic credentials and achievements
- **Publications** - Peer-reviewed research papers
- **Volunteering** - Community impact and leadership roles
- **Awards** - Recognition and honors
- **Contact** - Connection links and email

## Tech Stack

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox, Animations)
- Vanilla JavaScript (Canvas API, Intersection Observer)
- Google Fonts (Outfit, DM Sans, Cormorant Garamond, Source Code Pro)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ax5hay/akshaybajpai.com.git
   ```

2. Open [index.html](index.html) in your browser or serve with a local server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve
   ```

3. Visit `http://localhost:8000`

## Deployment

This site is configured for GitHub Pages with a custom domain ([akshaybajpai.com](https://akshaybajpai.com)).

To deploy your own version:

1. Update [CNAME](CNAME) file with your domain
2. Configure DNS records to point to GitHub Pages
3. Enable GitHub Pages in repository settings
4. Push changes to main branch

## Customization

### Colors

Edit CSS custom properties in the `:root` selector ([index.html:17-40](index.html#L17-L40)):

```css
--primary-dark: #0d0d12;
--accent-amber: #f5c563;
--accent-cyan: #00e5ff;
/* ... more variables */
```

### Content

All content is embedded in [index.html](index.html). Update sections directly in the HTML for:
- Personal information
- Work experience
- Projects
- Education details
- Contact links

### Animations

Adjust animation timing and effects in the JavaScript section ([index.html:1936-2124](index.html#L1936-L2124)):
- Particle count and behavior
- Scroll reveal thresholds
- Hover effects

## Performance

- **No external JavaScript libraries** - Pure vanilla JS
- **Optimized animations** - GPU-accelerated transforms and opacity
- **Lazy loading** - Scroll-triggered content reveals
- **Minimal HTTP requests** - Single HTML file with inline CSS/JS

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

© 2025 Akshay Bajpai. All rights reserved.

## Contact

- **Email**: contact@akshaybajpai.com
- **LinkedIn**: [linkedin.com/in/akshaybajpai](https://linkedin.com/in/akshaybajpai)
- **GitHub**: [github.com/ax5hay](https://github.com/ax5hay)

---

Built with precision, passion, and AI.
