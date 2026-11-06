---
name: Aether Arcade
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3f4850'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#00668a'
  on-secondary: '#ffffff'
  secondary-container: '#40c2fd'
  on-secondary-container: '#004d6a'
  tertiary: '#006483'
  on-tertiary: '#ffffff'
  tertiary-container: '#0f7ea3'
  on-tertiary-container: '#fbfdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#c0e8ff'
  tertiary-fixed-dim: '#7bd1fa'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d66'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  title-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  label-lg:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Space Mono
    fontSize: 10px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.1em
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  margin-tablet: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system reimagines golden-age arcade computing through an ethereal, atmospheric lens. It merges high-energy coin-op nostalgia with luminous tropospheric clarity, exchanging heavy charcoal-and-neon palettes for crystalline sky blues, cloud whites, and deep midnight vacuum accents.

### Design Movement: Ethereal Retro-Futurism & Neo-Arcade
- **Aesthetic Pillars**: Crisp CRT beamlines, tactile pixel-stepped contours, diffuse daylight glows, and airy atmospheric elevation.
- **Tone**: Playful yet pristine, technical yet luminous, dynamic, and nostalgic.
- **Audience**: Creative technologists, indie game developers, retro computing enthusiasts, and modern gamers demanding crisp usability combined with tactile 80s/90s arcade soul.
- **Sensory Metaphor**: Playing an immaculate Japanese cocktail arcade cabinet perched above an endless sea of bright cumulus clouds under direct high-altitude sunlight.

## Colors

The color palette shifts retro computing into daylight. Light modes use crisp radiant whites layered over ice-blue atmospheres, structured by midnight-navy chassis tones for authentic CRT scan-beam contrast.

### Palette Architecture
- **Primary (`#0284c7`)**: High-saturation beam blue. Utilized for high-impact interactions, prominent arcade action prompts, and primary button fills.
- **Secondary (`#38bdf8`)**: Stratosphere cyan. Used for glowing hover halos, active toggle states, scanline highlights, and illuminated borders.
- **Tertiary (`#7dd3fc`)**: Soft neon sky. Delivers subtle phosphor halo diffusion, decorative pixel bevel highlights, and interactive feedback accents.
- **Neutral Core (`#0f172a`)**: Deep vacuum midnight. Serves as high-contrast structural text, chassis boundaries, arcade frame shadows, and deep monitor recesses.
- **Surface Foundations**:
  - `surface-base`: `#ffffff` (Pure crisp white)
  - `surface-cloud`: `#f0f9ff` (Soft atmospheric ice tint for cards, trays, and secondary bays)
  - `surface-recess`: `#e0f2fe` (Sunken well for inset panels and CRT frame bezels)
  - `surface-chassis`: `#0c192c` (Deep midnight container for specialized retro-terminal moments)

## Typography

The typography unites mechanical retro data readouts with structural modernist geometry.

- **Primary Display & Headings (`Space Grotesk`)**: Provides razor-sharp, geometric punchiness. Uppercase styling is preferred for milestone cards, arcade state headings, and level score banners.
- **Technical Readouts & Micro-Data (`Space Mono`)**: Used across buttons, tabs, telemetry, inventory counts, and high-score labels. Emulates arcade ROM diagnostics and terminal broadcast telemetry.
- **Pixel Styling Rules**: When rendering retro pixel accents (e.g., retro badges, scoreboards), pair uppercase `Space Mono` with stepped pixel-bracket decorations (`[ INSERT COIN ]` or `// LVL_09`). Keep body copy in clean, proportional `Space Grotesk` to safeguard readability against bright sky-tinted surfaces.

## Layout & Spacing

The layout model is anchored by an uncompromising 12-column modular grid with mathematical, pixel-aligned spacing.

### Structural Parameters
- **Grid Hierarchy**:
  - **Desktop (≥1200px)**: 12-column fluid grid, max-width 1360px, 3rem margins, 1.5rem gutters.
  - **Tablet (768px - 1199px)**: 8-column layout, 2rem margins, 1.25rem gutters.
  - **Mobile (<768px)**: 4-column layout, 1.25rem margins, 1rem gutters.
- **Rhythm Principle**: Spacing follows 4px and 8px stepped boundaries, honoring the pixel grid of vintage arcade monitors. Gaps between game panels, utility ribbons, and monitor consoles are strictly enforced through `space-md` (16px) and `space-lg` (24px) step increments.
- **Panel Insets**: Surface cards utilize an internal pad of `space-md` or `space-lg`, ensuring pixel-corner borders do not crowd internal scan-lines and technical telemetry text.

## Elevation & Depth

Visual depth is achieved through tactile coin-op mechanical stepping combined with luminous phosphor ambient glows, replacing conventional blurred drop shadows.

### Elevation Tiers
- **Level 0 (Flat Ground)**: Base background `#ffffff` overlaid with a subtle 32px-square grid pattern in 8% opacity `#38bdf8`.
- **Level 1 (Sub-Panel / Bay)**: Surfaces in `#f0f9ff` with a crisp 1px solid border of `#bae6fd` and an offset hard drop shadow: `3px 3px 0px #0c192c`.
- **Level 2 (Active Arcade Cabinet / Card)**: Surfaces in `#ffffff` framed by a 2px stepped dual border: inner 1px `#38bdf8`, outer 2px `#0f172a`. Shadow profile: `4px 4px 0px #0f172a`, backed by a diffused sky-blue beam glow: `0px 8px 24px -4px rgba(56, 189, 248, 0.35)`.
- **Level 3 (Modal / Overdrive Overlay)**: Outer frame bounded by a 3px `#0284c7` beam outline, hard shadow `6px 6px 0px #0c192c`, and a wide ambient atmospheric back-glow: `0px 16px 40px 0px rgba(2, 132, 199, 0.25)`.
- **CRT Phosphor Glow Effect**: Interactive active elements feature an internal inset rim highlight: `inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 0 12px rgba(56, 189, 248, 0.2)`.

## Shapes

This design system uses a strict **Sharp (`0`)** shape language to honor the authentic raster-and-pixel geometry of vintage arcade hardware.

### Geometry Architecture
- **Zero Radius**: All panels, buttons, cards, tags, and inputs maintain `0px` border-radius (`roundedness: 0`).
- **Tactile Corner Notches**: Signature cards and primary interactive buttons may incorporate a 45-degree chamfered "cut-corner" (3px to 6px corner-cut via CSS clip-path) to evoke physical arcade PCB and chassis hardware modules.
- **Pixel-Stepped Framing**: Decorative dividing lines and panel borders mimic 8-bit stepped logic, utilizing hard-pixel ticks (1px–2px step increments) instead of soft curves.

## Components

### Buttons
- **Primary ("Player 1 / Insert Coin")**: Hard rectangular shape, solid `#0284c7` fill, text in `#ffffff` (`label-lg`, uppercase `Space Mono`). 2px solid `#0f172a` boundary. Hard mechanical shadow: `3px 3px 0px #0f172a`.
  - *Hover*: Shift background to `#38bdf8`, sky-blue glow: `0 0 16px rgba(56, 189, 248, 0.6)`, shadow increases to `4px 4px 0px #0f172a`.
  - *Active/Pressed*: Translate `+2px, +2px`, shadow drops to `1px 1px 0px #0f172a`.
- **Secondary**: Crisp `#ffffff` fill, text in `#0284c7`, 2px solid `#38bdf8` border, shadow `2px 2px 0px #7dd3fc`.
- **Ghost/Diagnostic**: Transparent fill, uppercase monospace text in `#0f172a`, bracketed icons (`[ START ]`).

### Cards & Arcade Frames
- Base in `#ffffff` or `#f0f9ff`.
- Border: 2px solid `#0f172a`.
- Header Strip: Deep midnight `#0c192c` title bar across card top with glowing sky-blue terminal text (`label-md`), accompanied by decorative mock pixel status lights (three 4x4px squares: white, sky-blue, midnight).
- CRT Scanline Variant: Subtle horizontal scanline overlay rendered via repeating linear gradient (`rgba(15, 23, 42, 0.03)` every 3px).

### Input Fields & Search Bars
- Background: `#f0f9ff` (Ice white recess).
- Border: 2px solid `#0f172a`.
- Text: `Space Mono`, `#0f172a`. Placeholder: `#7dd3fc`.
- Focus State: Border transitions to `#0284c7` with a glowing halo: `0 0 0 1px #0284c7, 0 0 12px rgba(56, 189, 248, 0.45)`. Caret blinks with sharp square block profile.

### Chips & Telemetry Badges
- Sharp rectangular tag with 1px border.
- Background: `#ffffff` with `#38bdf8` outline and `#0284c7` monospace text.
- High-priority state (e.g., "1P READY", "HIGH SCORE"): `#0c192c` background, `#38bdf8` text, accompanied by a pulsing 6px `#38bdf8` indicator block.

### Checkboxes & Toggle Switches
- **Checkbox**: 18x18px square box, 2px `#0f172a` border, white fill. When checked, displays a solid 8x8px `#0284c7` pixel center pip.
- **Arcade Toggle**: Rectangular channel (`#e0f2fe`) with 2px `#0f172a` border. Slider head is a solid square block that snaps with instantaneous mechanical transition from midnight `#0f172a` (off) to glowing sky-blue `#38bdf8` (on).

### Specialized Arcade Modules
- **Broadcast Marquee Header**: Top navigation resembling arcade cabinet lightboards: crisp white background with sky-blue edge glow, illuminated status badges (`CREDITS 02`, `SOUND: STEREO`).
- **Scan-Line CRT Viewport**: Containers displaying metrics, code, or game screens use subtle CRT phosphor curvature simulation, illuminated top-edge glare line (`1px solid rgba(255, 255, 255, 0.9)`), and high-contrast deep midnight recesses.
