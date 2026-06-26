---
name: ck:frontend-design
description: Create polished frontend interfaces from designs, screenshots, or videos. Use for web components, 3D experiences, replicating UI designs, quick prototypes, and immersive interfaces — anywhere generic "AI slop" aesthetics need to be avoided.
license: Complete terms in LICENSE.txt
metadata:
  author: openrouterkit
  version: "1.0.0"
---

This skill guides the creation of distinctive, production-grade frontend interfaces — implemented as real, working code, with exceptional attention to aesthetic detail and creative intent.

**Required reading before starting:** Design Thinking, Frontend Aesthetics Guidelines, Asset & Analysis References, and Anti-Patterns (AI Slop), all below. None of these sections are optional.

## Workflow Selection

Match the input to a workflow before doing anything else.

| Input | Workflow | Reference |
|---|---|---|
| Screenshot | Replicate exactly | `./references/workflow-screenshot.md` |
| Video | Replicate with animations | `./references/workflow-video.md` |
| Screenshot/video (describe only) | Document for developers | `./references/workflow-describe.md` |
| 3D / WebGL request | Three.js immersive | `./references/workflow-3d.md` |
| Quick task | Rapid implementation | `./references/workflow-quick.md` |
| Complex / award-quality | Full immersive | `./references/workflow-immersive.md` |
| Existing project upgrade | Redesign audit | `./references/redesign-audit-checklist.md` |
| From scratch | Design Thinking, below | — |

Every workflow starts the same way: activate `ck:ui-ux-pro-max` first for design intelligence.

**Precedence:** When the anti-slop rules below conflict with a `ck:ui-ux-pro-max` recommendation — Inter, an AI-purple palette, Lucide-only icons — defer to the alternatives in `./references/anti-slop-rules.md`, unless the user explicitly asked for the conflicting choice.

## Screenshot / Video Replication, at a Glance

1. **Analyze** with `ck:ai-multimodal` — extract colors, fonts, spacing, effects.
2. **Plan** with the `ui-ux-designer` subagent — produce a phased implementation.
3. **Implement** — match the source precisely.
4. **Verify** — compare against the original.
5. **Document** — update `./docs/design-guidelines.md` once approved.

Full detail lives in the individual workflow files above.

## Design Dials

Three parameters drive every design decision below. Set defaults at the start of a session, or let the user override them directly.

| Dial | Default | Range | Low (1–3) | High (8–10) |
|---|---|---|---|---|
| `DESIGN_VARIANCE` | 8 | 1–10 | Perfect symmetry, centered layouts, equal grids | Asymmetric, masonry, fractional CSS grid, generous empty space |
| `MOTION_INTENSITY` | 6 | 1–10 | CSS hover/active states only | Scroll reveals, spring physics, perpetual micro-animation |
| `VISUAL_DENSITY` | 4 | 1–10 | Gallery-like — large whitespace, restrained | Cockpit-like — tight padding, hairline dividers, monospace numerals throughout |

These aren't suggestions — they're rules. Above `DESIGN_VARIANCE` 4, a centered hero is overused; force a split-screen or left-aligned layout instead. Above `MOTION_INTENSITY` 5, embed perpetual micro-animation. Above `VISUAL_DENSITY` 7, drop generic cards in favor of spacing and dividers.

See `./references/bento-motion-engine.md` for the dial-driven SaaS dashboard implementation.

## Design Thinking

Before writing any code, commit to a bold aesthetic direction. Work as the design lead at a studio known for never repeating itself — this client has already turned down templated proposals.

- **Purpose** — what problem does this interface solve, and for whom?
- **Tone** — pick an extreme and commit: brutally minimal, maximalist, retro-futuristic, organic, luxury, playful, editorial, brutalist, art deco, soft/pastel, industrial. Use these as starting points, not a menu to pick from literally — the right tone is specific to the brief.
- **Constraints** — framework, performance, accessibility.
- **Differentiation** — what makes this unforgettable? What's the one thing someone remembers afterward?

Clarity of direction matters more than intensity. A precise, restrained minimalism executes the brief as fully as bold maximalism does — the requirement is intentionality, not volume.

The resulting code should be:

- Production-grade and functional
- Visually distinctive and memorable
- Cohesive, with a single clear point of view
- Refined in its details, not just its concept

## Frontend Aesthetics Guidelines

**Typography.** Choose fonts with character — never the defaults. Avoid Arial and Inter; reach for distinctive, less expected choices instead (`Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`, or a trending Google Font that supports the target language's full character set). Pair a distinctive display face with a more restrained body face.

**Color & theme.** Commit to one cohesive palette, expressed through CSS variables. A dominant color with one sharp accent beats five evenly-weighted ones.

**Motion.** Use animation for effects and micro-interactions, but choose where it actually serves the subject — a page-load sequence, a scroll-triggered reveal, a hover state, ambient atmosphere. One well-orchestrated moment (staggered reveals via `animation-delay`) lands harder than motion scattered everywhere. Prefer CSS for HTML, the Motion library for React.

**Spatial composition.** Build in asymmetry, overlap, diagonal flow, and grid-breaking elements. Pair generous negative space with controlled density rather than splitting the difference.

**Backgrounds & texture.** Create atmosphere and depth instead of defaulting to flat color: gradient meshes, noise textures, geometric patterns, layered transparency, dramatic shadow, decorative borders, custom cursors, grain overlays — chosen to match the aesthetic, not bolted on.

**Never default to:** overused font families (Inter, Roboto, Arial, system fonts), cliché color schemes (especially purple gradients on white), predictable layouts, or cookie-cutter components that ignore the brief's context.

Every design should differ from the last — vary theme, type, and aesthetic deliberately. Avoid convergence on a "safe" choice like Space Grotesk across generations.

**Match complexity to vision.** A maximalist direction needs elaborate code and layered effects. A minimal or refined direction needs restraint: precise spacing, considered type, careful detail. Elegance is the result of executing the chosen vision well — not of doing less work.

**Assets:** generate with `ck:ai-multimodal`, process with `ck:media-processing`.

## Asset & Analysis References

| Task | Reference |
|---|---|
| Generate assets | `./references/asset-generation.md` |
| Analyze quality | `./references/visual-analysis-overview.md` |
| Extract guidelines | `./references/design-extraction-overview.md` |
| Optimization | `./references/technical-overview.md` |
| Animations | `./references/animejs.md` |
| Magic UI (80+ components) | `./references/magicui-components.md` |
| Anti-slop forbidden patterns | `./references/anti-slop-rules.md` |
| Redesign audit checklist | `./references/redesign-audit-checklist.md` |
| Premium design patterns | `./references/premium-design-patterns.md` |
| Performance guardrails | `./references/performance-guardrails.md` |
| Bento motion engine (SaaS) | `./references/bento-motion-engine.md` |

Quick start: `./references/ai-multimodal-overview.md`

## Anti-Patterns (AI Slop)

The full rule set lives in `./references/anti-slop-rules.md`. The shape of it:

**Typography** — avoid Inter, Roboto, Arial. Prefer trending Google Fonts with broad character support, or `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`.

**Input fields** — always larger than 16px, to prevent unwanted zoom on mobile.

**Color** — avoid the AI purple/blue gradient look, pure `#000000`, and oversaturated accents. Use a neutral base with one considered accent.

**Layout** — avoid three-column equal-card feature rows, centered heroes at high variance, and `h-screen`. Use asymmetric grids, split-screen layouts, and `min-h-[100dvh]`. Design mobile-first, always.

**Content** — avoid "John Doe," "Acme Corp," round numbers, and AI copy clichés ("Elevate," "Seamless," "Unleash"). Use realistic names, organic data, and plain, specific language.

**Effects** — avoid neon glows, custom cursors, and gradient text on headers (unless explicitly requested). Use tinted inner shadows and spring physics instead.

**Components** — avoid unstyled shadcn defaults, Lucide-only icon sets, and generic card-border-shadow patterns at high density. Customize everything; consider Phosphor or Heroicons; favor spacing over card chrome.

Before delivering any design, run it against the "AI Tells" checklist in `./references/anti-slop-rules.md`.

**Performance:** animation and blur budgets are in `./references/performance-guardrails.md`.