<div align="center">

#  StylU

### Style You With STYLU

A retro-futuristic arcade courtroom for AI outfit critique, fashion verdicts, and a daily dress code randomizer.

![Status](https://img.shields.io/badge/status-prototype-0284c7?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Designed with Stitch](https://img.shields.io/badge/Designed%20with-Stitch-38bdf8?style=for-the-badge)

[Overview](#-overview) · [Features](#-features) · [Screens](#-screens) · [Design System](#-design-system-aether-arcade) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [Roadmap](#-roadmap)

</div>

---

## 📖 Overview

**StylU: Outfit Court** reimagines fashion advice as a retro arcade courtroom. Step in as the defendant, present your outfit, and let the AI stylist deliver a verdict. When you don't know what to wear, spin the **Lucky Wheel** and let fate set your dress code for the day.

The interface blends **ethereal retro-futurism** with **neo-arcade** aesthetics: CRT phosphor glows, vintage computer chassis tones, and pixel-art characters, all built to make style feedback feel playful instead of intimidating.

> This project was designed in **Stitch** and exported as static HTML screens, so it runs in any modern browser with no build step.

---

## ✨ Features

| Feature | Description |
| --- | --- |
| 🎡 **Lucky Wheel** | Interactive wheel that randomizes your daily dress code |
| 📅 **7-Day Dress Code** | A full week of outfit themes planned in one view |
| ⚖️ **Outfit Court** | Courtroom-style critique and fashion judgments from an AI stylist |
| 🧑‍⚖️ **Pixel-Art Defendant** | 16-bit avatar that represents you in court |
| 📺 **Multiple Themes** | Six screen variants: Retro TV, Sky Blue, Retro Beige, Live Broadcast, and more |
| 🕹️ **Arcade Typography** | Pixel and monospace type for an authentic retro feel |

---

## 🖼️ Screens

Six screen variants are included, each with its own atmosphere.

| Screen | File | Theme |
| --- | --- | --- |
| **Lucky Wheel Studio Pro** *(primary)* | `screens/01_lucky_wheel_studio_pro.html` | Full studio with interactive Lucky Wheel and 7-day dress code |
| **Lucky Wheel Studio** | `screens/02_lucky_wheel_studio.html` | Streamlined Lucky Wheel edition |
| **Retro TV Studio** | `screens/03_retro_tv_studio.html` | Vintage CRT TV courtroom |
| **Sky Blue Studio** | `screens/04_sky_blue_studio.html` | Sky blue phosphor broadcast theme |
| **Retro Beige Studio** | `screens/05_retro_beige_studio.html` | Warm beige and toasted cream arcade look |
| **Retro TV Broadcast** | `screens/06_retro_tv_broadcast.html` | Live TV broadcast feed edition |

<!-- Add screenshots here, for example:
![Lucky Wheel Studio Pro](assets/screenshot_lucky_wheel.png)
-->

---

## 🎨 Design System: "Aether Arcade"

Full specifications live in [`DESIGN.md`](./DESIGN.md).

**Design movement:** Ethereal Retro-Futurism and Neo-Arcade

### Color Palette

| Role | Name | Hex |
| --- | --- | --- |
| Primary | Beam Blue | `#006194` / `#0284c7` |
| Accent | Stratosphere Cyan | `#38bdf8` |
| Glow | CRT Phosphor Halo | `#7dd3fc` |
| Surface | Vintage Computer Chassis | `#eadeca` / `#dfd0bc` / `#cfbfa9` |
| Text | Vacuum Midnight | `#131b2e` / `#0f172a` |

### Typography

| Usage | Typeface |
| --- | --- |
| Headings and display | **Space Grotesk** |
| Arcade and data | **VT323**, **Press Start 2P**, **Space Mono** |

---

## 🚀 Getting Started

No installation or build tools required.

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/stylu.git

# 2. Enter the project folder
cd stylu
```

Then open **`index.html`** in your browser (double-click it or drag it into a browser window) to launch the full interactive experience.

### Optional: Run a Local Server

```bash
# Python
python -m http.server 8000

# or Node.js
npx serve .
```

Visit `http://localhost:8000` in your browser.

> **Tip:** The screens load Google Fonts, so an internet connection is needed to see the intended typography.

---

## 📁 Project Structure

```text
Stylu/
├── index.html                          # Primary screen (Lucky Wheel Studio Pro)
├── DESIGN.md                           # Aether Arcade design system specification
├── stitch_project.json                 # Stitch project metadata and configuration
├── screens/                            # All generated screens from the Stitch canvas
│   ├── 01_lucky_wheel_studio_pro.html
│   ├── 02_lucky_wheel_studio.html
│   ├── 03_retro_tv_studio.html
│   ├── 04_sky_blue_studio.html
│   ├── 05_retro_beige_studio.html
│   └── 06_retro_tv_broadcast.html
└── assets/                             # Exported images and assets
    ├── pixel_art_defendant_avatar.png
    ├── reference_screenshot_2026-10-23.png
    └── reference_image.png
```

---

## 🗺️ Roadmap

- [x] Design system and six screen variants
- [x] Interactive Lucky Wheel and 7-day dress code
- [ ] Connect AI model for live outfit critique
- [ ] Outfit photo upload for court trials
- [ ] Save and share verdicts
- [ ] Mobile-responsive polish across all themes

---

## 🤝 Contributing

Contributions, ideas, and feedback are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Built with 💙 and a little arcade nostalgia**

*Designed in Stitch · StylU: Outfit Court*

</div>
