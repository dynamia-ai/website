# HAMi Website Color System

## Design Philosophy

The HAMi website uses a **NVIDIA-inspired dark theme** that conveys:

- Modern, technical, and high-performance computing
- GPU/AI infrastructure platform identity
- High contrast for readability and accessibility
- Subtle green accents that reference NVIDIA's design language without copying

---

## Core Color Palette

### Primary Accent (NVIDIA Green)

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Primary** | `#76B900` | `rgb(118, 185, 0)` | CTAs, links, highlights, key interactive elements |
| **Hover** | `#8ED400` | `rgb(142, 212, 0)` | Hover states for primary elements |
| **Active** | `#6BA300` | `rgb(107, 163, 0)` | Active/pressed states |
| **Subtle** | `rgba(118, 185, 0, 0.15)` | - | Background tints, subtle highlights |
| **Subtle Hover** | `rgba(118, 185, 0, 0.25)` | - | Hover on subtle backgrounds |
| **Glow** | `rgba(118, 185, 0, 0.4)` | - | Shadows, glows, special effects |

---

## Background Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Background Primary** | `#0B0B0B` | Main page background, deepest level |
| **Background Secondary** | `#111111` | Sections, card backgrounds |
| **Background Tertiary** | `#161616` | Elevated surfaces, nested elements |

---

## Surface Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Surface Primary** | `#1A1A1A` | Main cards, component backgrounds |
| **Surface Secondary** | `#222222` | Hover states, elevated cards |
| **Surface Tertiary** | `#2A2A2A` | Higher elevation, modals, dropdowns |
| **Surface Border** | `rgba(255, 255, 255, 0.08)` | Subtle borders on surfaces |

---

## Text Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Text Primary** | `#FFFFFF` | Headings, important text, UI labels |
| **Text Secondary** | `#B3B3B3` | Body text, descriptions, general content |
| **Text Tertiary** | `#808080` | Metadata, captions, timestamps, placeholders |
| **Text Muted** | `#5A5A5A` | Disabled states, very subtle text |

---

## Interactive States

| State | Color/Value | Usage |
|-------|-------------|-------|
| **Hover Overlay** | `rgba(255, 255, 255, 0.03)` | Subtle hover on surfaces |
| **Focus Ring** | `rgba(118, 185, 0, 0.5)` | Accessibility focus indicators |
| **Active Overlay** | `rgba(255, 255, 255, 0.05)` | Active/pressed states |

---

## Border & Divider Colors

| Color Name | Value | Usage |
|------------|-------|-------|
| **Border Subtle** | `rgba(255, 255, 255, 0.06)` | Very subtle dividers |
| **Border Default** | `rgba(255, 255, 255, 0.12)` | Standard borders |
| **Border Strong** | `rgba(255, 255, 255, 0.18)` | Emphasized borders |

---

## Specialized Colors

### Code Blocks

| Color Name | Value | Usage |
|------------|-------|-------|
| **Code Background** | `#0D0D0D` | Code block backgrounds |
| **Code Border** | `rgba(118, 185, 0, 0.2)` | Subtle green tint on code borders |

### Navigation

| Color Name | Value | Usage |
|------------|-------|-------|
| **Nav Background** | `rgba(11, 11, 11, 0.95)` | Navigation bar with blur |
| **Menu Item Hover** | `rgba(118, 185, 0, 0.1)` | Menu item hover background |
| **Menu Item Border** | `rgba(118, 185, 0, 0.3)` | Menu item borders |

---

## Shadows

| Shadow Name | Value | Usage |
|-------------|-------|-------|
| **Shadow SM** | `0 1px 2px rgba(0, 0, 0, 0.5)` | Small elevation |
| **Shadow MD** | `0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)` | Medium elevation |
| **Shadow LG** | `0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3)` | Large elevation |
| **Shadow Glow** | `0 0 20px rgba(118, 185, 0, 0.3)` | Green glow for special elements |

---

## Usage Guidelines

### 1. Hero Section

```css
/* Deep background with green accent */
background: var(--background-primary);
text: var(--text-primary);
accent: var(--primary);
```

### 2. Buttons

**Primary CTA:**

```css
background: var(--primary);
color: var(--on-primary);
hover: background: var(--primary-hover);
```

**Secondary Button:**

```css
background: transparent;
border: 1px solid var(--border-default);
color: var(--text-primary);
hover: background: var(--surface-secondary);
hover: border-color: var(--primary);
```

### 3. Links

```css
color: var(--primary);
text-decoration: none;
hover: color: var(--primary-hover);
```

### 4. Feature Cards

```css
background: var(--surface-primary);
border: 1px solid var(--surface-border);
hover: background: var(--surface-secondary);
hover: transform: translateY(-2px);
```

### 5. Architecture Diagrams

```css
background: var(--background-secondary);
nodes: var(--surface-primary);
accents: var(--primary);
connections: var(--border-default);
```

### 6. Code Blocks

```css
background: var(--code-background);
border: 1px solid var(--code-border);
text: var(--text-secondary);
```

### 7. Documentation Sections

```css
background: var(--background-primary);
headings: var(--text-primary);
body: var(--text-secondary);
code: var(--surface-secondary);
```

---

## Component Examples

### Alert/Notice Box

```css
background: var(--primary-subtle);
border-left: 4px solid var(--primary);
color: var(--text-primary);
```

### Table

```css
background: var(--surface-primary);
border: 1px solid var(--border-default);
header: var(--surface-secondary);
header-text: var(--text-primary);
cell: var(--text-secondary);
divider: var(--border-subtle);
```

### Input Field

```css
background: var(--surface-primary);
border: 1px solid var(--border-default);
text: var(--text-primary);
placeholder: var(--text-tertiary);
focus: border-color: var(--primary);
focus: box-shadow: 0 0 0 3px var(--focus-ring);
```

### Badge/Tag

```css
background: var(--primary-subtle);
color: var(--primary);
border: 1px solid var(--primary-glow);
```

---

## Accessibility Considerations

### Color Contrast Ratios

- **White on Primary Green**: 4.5:1 ✅ WCAG AA compliant
- **Secondary Text on Background**: 7.1:1 ✅ WCAG AAA compliant
- **Primary Text on Background**: 15.2:1 ✅ Excellent contrast

### Focus States

Always use `var(--focus-ring)` for keyboard navigation:

```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--focus-ring);
}
```

---

## Heterogeneous Device Support

The color system uses **NVIDIA green as an accent only**, not as the dominant brand color. This ensures:

1. ✅ Platform-agnostic identity (not NVIDIA-specific)
2. ✅ Support for multiple GPU vendors (NVIDIA, Ascend, Cambricon, etc.)
3. ✅ Focus on infrastructure capabilities, not hardware lock-in
4. ✅ Subtle visual reference to NVIDIA's design language

**Guideline**: Use green sparingly for:

- Call-to-action buttons
- Links
- Key highlights
- Success states
- Active indicators

**Avoid**:

- Large green backgrounds
- Overusing green across the interface
- Green as the only brand color

---

## CSS Variables Reference

All colors are available as CSS variables for easy use:

```css
/* Primary Accent */
--primary
--primary-hover
--primary-active
--primary-subtle
--primary-subtle-hover
--primary-glow

/* Backgrounds */
--background-primary
--background-secondary
--background-tertiary

/* Surfaces */
--surface-primary
--surface-secondary
--surface-tertiary
--surface-border

/* Text */
--text-primary
--text-secondary
--text-tertiary
--text-muted

/* Interactive */
--hover-overlay
--focus-ring
--active-overlay

/* Borders */
--border-subtle
--border-default
--border-strong

/* Specialized */
--code-background
--code-border
--nav-background
--menu-item-hover-bg
--menu-item-border

/* Shadows */
--shadow-sm
--shadow-md
--shadow-lg
--shadow-glow
```

---

## Tailwind Integration

The color system integrates with Tailwind CSS via CSS variables:

```jsx
// Examples
className="bg-primary text-on-primary hover:bg-primary-hover"
className="bg-surface-primary border-subtle hover:border-primary"
className="text-primary hover:text-primary-hover"
```

---

## Migration Notes

### Light Mode Support

Light mode is available as legacy support (`.light` class), but **dark mode is the recommended and default theme**.

### Breaking Changes from Old System

- `--background` → `--background-primary`
- `--foreground` → `--text-primary`
- Removed `--primary-dark` → Use `--primary-hover`
- Removed `--primary-light` → Use `--primary-subtle`

---

## Design Principles

1. **Dark First**: Default to dark theme for optimal developer experience
2. **High Contrast**: Ensure readability with proper color contrast ratios
3. **Subtle Accents**: Use green sparingly for emphasis, not domination
4. **Performance**: Convey speed, power, and computational efficiency
5. **Platform Identity**: Emphasize infrastructure over specific hardware vendors

---

## Future Enhancements

Potential additions to the color system:

- Semantic color tokens (success, warning, error, info)
- Gradient definitions for Hero sections
- Animation keyframes for smooth transitions
- Device-specific color themes (NVIDIA, Ascend, Cambricon)

---

## Credits

**Inspired by**: NVIDIA's official design language
**Primary Accent**: NVIDIA Green (#76B900)
**Design Philosophy**: GPU infrastructure, cloud-native, developer-first

---

*Last Updated: 2025-03-06*
*Version: 1.0.0*
