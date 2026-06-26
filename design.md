# GitSpeak Design System

A specification for the visual language of GitSpeak — precise enough to implement from, and disciplined enough to feel inevitable rather than decorated.

---

## 1. Design Principles

GitSpeak is a tool developers live inside for hours at a time. Every decision serves that fact.

- **Quiet by default.** The interface should disappear into the work. Color, motion, and weight are spent only where they carry meaning — a selected state, a primary action, a status.
- **Depth through light, not noise.** Elevation comes from soft, directional shadow and layered surfaces, not borders alone. Nothing should look stuck on top of the page; it should look like it's resting on it.
- **One accent, used deliberately.** A single, confident accent color does more work than five competing ones. If everything is highlighted, nothing is.
- **Precision in the details.** Corner radii, spacing, and motion follow a consistent system. Nothing is eyeballed.

---

## 2. Color

A restrained, near-monochrome surface system with a single accent. Surfaces step up in lightness as elements come forward — each layer reads as physically closer to the viewer.

### Surfaces

```css
:root {
  --surface-base:      #0B0D10;  /* Application background */
  --surface-raised:     #14171C;  /* Cards, panels — one step up */
  --surface-overlay:    #1C2026;  /* Hover / active state on raised surfaces */
  --surface-glass:      rgba(15, 17, 21, 0.72); /* Floating elements over content */

  --border-hairline:    rgba(255, 255, 255, 0.08);  /* Default separators */
  --border-emphasis:    rgba(255, 255, 255, 0.16);  /* Hover, focus-adjacent */
}
```

### Accent

One accent, two states. Resist the temptation to add a second.

```css
:root {
  --accent:             #4C8DFF;  /* Primary actions, selection, focus */
  --accent-pressed:      #3A6FD9;  /* Active / pressed state */
  --accent-wash:         rgba(76, 141, 255, 0.12); /* Selected-card tint */
}
```

### Typography Colors

```css
:root {
  --text-primary:       #F2F4F7;  /* Headings, primary labels */
  --text-secondary:     #9298A2;  /* Supporting text, metadata */
  --text-tertiary:      #5C6168;  /* Timestamps, disabled, placeholder */
}
```

### Status (use sparingly — one badge or dot at a time, never a wash of color across a surface)

```css
:root {
  --status-success:     #3FB97C;
  --status-warning:     #E5A93F;
  --status-error:        #E5604D;
}
```

---

## 3. Typography

Type is the primary carrier of hierarchy in a dark, low-color interface — it has to do more work than color does.

| Role | Family | Weight | Size | Line Height |
|---|---|---|---|---|
| Display (page titles) | **Geist** or **SF Pro Display** | 600 | 28px | 1.2 |
| Section heading | Geist / SF Pro Display | 600 | 17px | 1.3 |
| Body | Geist / SF Pro Text | 400 | 14px | 1.5 |
| Caption / metadata | Geist / SF Pro Text | 400 | 12px | 1.4 |
| Code, branch names, hashes | **JetBrains Mono** | 400 | 13px | 1.5 |

**Rules:**
- Never use the system default sans-serif as a fallback signature font — pick one family and commit.
- Letter-spacing on headings: `-0.01em`. Tight, never loose.
- Monospace is reserved for things that are literally code: branches, commits, file paths. Never use it decoratively.

---

## 4. Spacing & Geometry

A single 4px base unit. Every margin, padding, and gap is a multiple of it — this is what makes a layout feel calibrated instead of approximate.

```
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64
```

| Element | Radius |
|---|---|
| Repository card | 12px |
| Buttons | 8px |
| Floating action bar | Full pill (9999px) |
| Input fields | 8px |
| Avatars / language dots | Full circle |

A slightly larger radius (12px vs. the more common 8px) on cards gives them a softer, more considered feel — closer to a native macOS panel than a web component.

---

## 5. Components

### Repository Card

The primary unit of the selection screen. Calm at rest, confident when selected.

**Default state**
- Background: `--surface-raised`
- Border: 1px solid `--border-hairline`
- Radius: 12px
- Shadow: `0 1px 2px rgba(0, 0, 0, 0.4)` — barely there; a hint of lift, not a glow.

**Hover**
- Background: `--surface-overlay`
- Border: `--border-emphasis`
- Transform: `translateY(-1px)`
- Transition: `all 0.15s ease-out`

**Selected**
- Border: 1px solid `--accent`
- Background: `--accent-wash`
- No outer glow, no extra shadow ring — the border and tint alone communicate selection. Restraint here is what separates this from a default UI-kit look.

**Anatomy**
- Title: `--text-primary`, Section-heading scale.
- Description: `--text-secondary`, Body scale, max two lines, ellipsis overflow.
- Language indicator: 8px filled circle + label in `--text-tertiary`, Caption scale. (8px, not 10px — small enough to read as a quiet signal, not a badge.)

### Floating Action Bar

Appears only when there's a decision to confirm. It should feel like it's hovering a few millimeters above the content, not pinned to the viewport.

- Position: fixed, bottom-anchored, horizontally centered, `bottom: 24px`
- Shape: full pill, `border-radius: 9999px`
- Background: `--surface-glass`
- Blur: `backdrop-filter: blur(20px) saturate(140%)` — the saturate boost keeps colors underneath from looking washed out through the blur.
- Border: 1px solid `--border-hairline`
- Shadow: `0 12px 40px rgba(0, 0, 0, 0.45)`
- Padding: `12px 12px 12px 24px` — left side roomier for text, right side tighter around the button.
- Entrance: fades and rises 8px over `0.2s ease-out` when it first appears. It should never just snap into existence.

**Layout:** label on the left (`--text-secondary`, e.g. "2 repositories selected"), primary button on the right.

### Buttons

**Primary**
- Background: `--accent`
- Text: `#FFFFFF`, 14px, weight 500
- Radius: 8px (or full pill when nested inside the floating bar)
- Padding: `10px 18px`
- Hover: background → `--accent-pressed`, `transition: background-color 0.15s ease`
- Active: scale `0.98` — a small, physical press, not a color shift alone.

**Secondary**
- Background: transparent
- Border: 1px solid `--border-hairline`
- Text: `--text-primary`
- Hover: border → `--border-emphasis`, background → `--surface-overlay`

---

## 6. Motion

Motion in GitSpeak confirms an action happened — it never performs for its own sake.

| Interaction | Duration | Easing |
|---|---|---|
| Hover (card, button) | 150ms | ease-out |
| Selection state change | 180ms | ease-out |
| Floating bar enter/exit | 200ms | ease-out, with 8px rise |
| Page transition | 250ms | ease-in-out |

Nothing in the interface should animate continuously or loop. If a user isn't actively interacting with an element, it should be still.

---

## 7. Layout

- Content sits in a centered column, `max-width: 1180px`, with `padding: 0 32px` on the surrounding viewport.
- The repository grid sits directly on `--surface-base` — no enclosing panel, no nested gray box. Cards provide their own elevation; a wrapping container would double it up and flatten the hierarchy.
- Grid: `repeat(auto-fill, minmax(280px, 1fr))`, `gap: 16px`.
- Vertical rhythm between major sections: 48px. Within a section: 24px.

---

## 8. What to Avoid

A short list, because premium is as much about subtraction as addition:

- No glow effects on selected or focused elements — a clean border and tint communicate state without theatrics.
- No more than one accent color anywhere on screen at once.
- No drop shadows heavier than `0 12px 40px` — anything bigger reads as a UI kit default, not a considered surface.
- No decorative monospace. If it's not code, it's not in JetBrains Mono.
- No animation that runs without a corresponding user action.