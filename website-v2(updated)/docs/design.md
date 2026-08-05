---
name: Alpine Thrill
colors:
  surface: '#f8f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f8f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e7e8eb'
  surface-container-highest: '#e1e2e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3c494c'
  inverse-surface: '#2e3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6c797d'
  outline-variant: '#bbc9cc'
  surface-tint: '#006878'
  primary: '#006878'
  on-primary: '#ffffff'
  primary-container: '#00b7d1'
  on-primary-container: '#00434d'
  inverse-primary: '#4ad7f2'
  secondary: '#006e25'
  on-secondary: '#ffffff'
  secondary-container: '#80f98b'
  on-secondary-container: '#007327'
  tertiary: '#835400'
  on-tertiary: '#ffffff'
  tertiary-container: '#e4960a'
  on-tertiary-container: '#553500'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a5eeff'
  primary-fixed-dim: '#4ad7f2'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e5a'
  secondary-fixed: '#83fc8e'
  secondary-fixed-dim: '#66df75'
  on-secondary-fixed: '#002106'
  on-secondary-fixed-variant: '#00531a'
  tertiary-fixed: '#ffddb5'
  tertiary-fixed-dim: '#ffb957'
  on-tertiary-fixed: '#2a1800'
  on-tertiary-fixed-variant: '#643f00'
  background: '#f8f9fc'
  on-background: '#191c1e'
  surface-variant: '#e1e2e5'
  mist-white: '#F8FAFB'
  charcoal-premium: '#1A1D1F'
  electric-pulse: '#6E00FF'
  sky-gradient-start: '#00B7D1'
  sky-gradient-end: '#00D2FF'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system reflects the high-altitude excitement of Kodaikanal's premiere indoor theme park. It balances the wonder of a family-friendly destination with a sleek, technology-driven edge suitable for a premium attraction. 

The aesthetic is **Corporate Modern with a Glassmorphic twist**. This style uses the clarity of professional SaaS interfaces but injects energy through vibrant gradients, depth-driven layers, and soft, tactile surfaces. The visual narrative should feel immersive—evoking the mist-covered mountains of the Western Ghats—while maintaining a clean, high-end digital presence that emphasizes safety and innovation.

## Colors
The palette is anchored by **Sky Blue** and **Fresh Green**, representing the sky and the lush flora of the mountains. 

- **Primary (Sky Blue):** Used for main actions, active states, and brand-heavy components.
- **Secondary (Fresh Green):** Applied to success states, pricing, and "eco-adventure" highlights.
- **Neutral (Charcoal):** A deep, dark charcoal replaces pure black for text and high-contrast containers to provide a premium, sophisticated weight.
- **Backgrounds:** Utilize "Mist White" for general surfaces, paired with subtle glassmorphic overlays (white with 70% opacity and background blur) to create a sense of depth and atmospheric layering.
- **Accent (Electric Pulse):** A vibrant violet is used sparingly for interactive cues and high-energy promotions to signify "fun" and "technology."

## Typography
The typography strategy pairs cinematic, high-impact headings with a functional, legible body typeface.

- **Montserrat** is the display choice. It is geometric, bold, and modern, providing the "cinematic" feel requested. Use it for all headlines and call-to-action buttons.
- **Work Sans** provides a neutral, accessible foundation for all body copy and technical information. Its slightly wider character set ensures readability on mobile devices while people are moving through the park.
- **Styling:** Headings should use tight letter spacing to appear more impactful, while labels and captions use increased tracking for a clean, technical appearance.

## Layout & Spacing
This design system utilizes a **Fluid Grid** with generous white space to maintain a premium feel. 

- **Desktop:** A 12-column grid with a 24px gutter. Content is centered within a 1280px container.
- **Mobile:** A 4-column grid with 16px margins. 
- **Rhythm:** An 8px base unit drives all spacing. Stacked elements (vertical spacing) should favor larger gaps (48px+) between major sections to allow the "Mist White" background to breathe, reinforcing the open, airy feeling of a mountain peak.
- **Depth Layout:** Elements are often offset or overlapping to create a dynamic, layered look that feels more like an "experience" than a static website.

## Elevation & Depth
Elevation is handled through a combination of **Tonal Layers** and **Glassmorphism**.

1.  **Base Layer:** Solid Mist White (#F8FAFB).
2.  **Mid Layer:** Cards and containers use a white background with a very soft, diffused shadow (0px 10px 30px rgba(0, 0, 0, 0.05)).
3.  **Floating Layer:** Interactive elements, navigation bars, and modal overlays use a Glassmorphic effect: `backdrop-filter: blur(12px)` with a semi-transparent white border (1px solid rgba(255, 255, 255, 0.3)).
4.  **Shadows:** Shadows are never pure gray; they are subtly tinted with the primary Sky Blue color to keep the UI looking "fresh" and illuminated rather than heavy.

## Shapes
The shape language is defined by **Rounded** geometry. 

- **Standard Elements:** Buttons and small cards use a 0.5rem (8px) radius.
- **Feature Containers:** Hero sections and large image cards use "Rounded-XL" (1.5rem/24px) to create a friendly, approachable, and modern look.
- **Curves:** Incorporate organic, wave-like SVG dividers between sections to mimic mountain ranges or park rides, breaking the rigidity of the grid.

## Components
- **Buttons:** Primary buttons should use the Sky-to-Blue gradient with a subtle inner glow. Hover states should trigger a slight scale-up (1.05x) to provide a tactile, "fun" response.
- **Cards:** Use high-quality imagery with a gradient overlay (bottom-to-top, black to transparent) to ensure white Montserrat headings are legible on top of photos.
- **Input Fields:** Minimalist design with a 1px Charcoal border that turns into a 2px Sky Blue border on focus.
- **Chips/Badges:** Use the Secondary Green for "Available Now" status or Tertiary Yellow for "Popular" attractions. These should be pill-shaped.
- **Glass Nav:** The navigation bar remains sticky, using the glassmorphic blur effect to show the vibrant park colors as the user scrolls, maintaining the "immersive" vibe.
- **Micro-interactions:** Elements should "float" slightly when hovered, and transitions between pages should use a soft "fade-and-slide" motion.