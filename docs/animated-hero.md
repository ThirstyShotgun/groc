# 3D Animated Hero & Liquid Goo Architecture

The Prepr landing page features an interactive **3D-style, gooey/glassy hero section** (`src/components/hero/AnimatedHero3D.tsx`). It is built using GPU-accelerated CSS 3D transforms, SVG threshold filters, and Framer Motion spring physics.

---

## 1. How the Goo / Metaball Effect Works

The organic fluid motion is created by passing multiple animated circular gradients through an SVG filter defined in `GooeyBackground.tsx`:

```xml
<svg>
  <filter id="autumn-goo">
    <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
    <feColorMatrix
      in="blur"
      mode="matrix"
      values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -8"
      result="goo"
    />
    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
  </filter>
</svg>
```

### The Two-Stage Transformation:
1. **Gaussian Blur (`feGaussianBlur stdDeviation="16"`)**:
   Blurs the contours of the floating blobs so their alpha channels expand and overlap softly.
2. **Alpha Threshold Matrix (`feColorMatrix`)**:
   The fourth row of the matrix `[0 0 0 22 -8]` multiplies the alpha channel by 22 and subtracts 8 (`alpha_out = 22 * alpha_in - 8`). Any pixel where two blurred blobs overlap passes the alpha threshold, snapping into a sharp liquid surface that simulates surface tension and organic fluid fusion.

---

## 2. Tuning Speed, Intensity, and Colors

You can adjust the parameters directly in `src/components/hero/GooeyBackground.tsx`:

| Parameter | Location | Default | Effect |
| :--- | :--- | :--- | :--- |
| **Goo Viscosity** | `stdDeviation` in SVG filter | `16` | Higher values (e.g. `22`) create thick, viscous liquid; lower values (e.g. `10`) create tighter, bead-like droplets. |
| **Surface Threshold** | Matrix values `0 0 0 [A] [B]` | `22 -8` | Adjusting `A` sharpens/softens the liquid edge. |
| **Motion Duration** | `transition: { duration: 18 }` | `15s–25s` | Decreasing duration makes the fluid churn faster; increasing it produces a calmer, ambient breathing effect. |
| **Palette Colors** | Tailwind blob gradients | `#C1652F`, `#E0A458`, `#7A5C7E` | Customize the autumn gradient stops to adapt to new brand themes. |

---

## 3. 3D-Type Typography & Interactive Tilt

The "Prepr" title (`src/components/hero/Typography3D.tsx`) uses a multi-tier extrusion text-shadow stack:

```css
text-shadow:
  0 1px 0 rgba(224, 164, 88, 0.85),
  0 2px 0 #C1652F,
  0 4px 1px rgba(18, 15, 33, 0.7),
  0 8px 18px rgba(18, 15, 33, 0.85),
  0 0 35px rgba(224, 164, 88, 0.3);
```

- **Interactive Card Tilt**: `AnimatedHero3D.tsx` binds cursor coordinates to Framer Motion spring values (`stiffness: 150, damping: 20`). Rotating up to $\pm 5^\circ$ on `rotateX` and `rotateY` with `perspective: 1000px`.
- **Zero WebGL Overhead**: Because this uses CSS text-shadow and matrix transforms, it adds **0 KB** in external 3D libraries and maintains 60–120fps across all screens.

---

## 4. Performance & Mobile Optimization

- **CSS Transforms Only**: Blobs animate exclusively via `translate3d` and `scale`, which are handled by the compositor thread and avoid browser layout/paint cycles.
- **Backdrop Scrim**: The glassmorphic card (`rgba(59, 53, 96, 0.40)`) with `backdrop-filter: blur(12px)` guarantees text legibility against moving molten colors.
- **Graceful Touch Fallback**: On touch devices where hover is absent, the tilt listener remains idle at `(0, 0)`, preventing unnecessary recalculations.
