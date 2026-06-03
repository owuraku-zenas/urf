---
name: URF Management System
description: Operational membership and attendance platform for a university church fellowship in Ghana.
colors:
  primary: "#3b82f6"
  primary-foreground: "#f8fafc"
  urf-navy: "#0f1829"
  signal-purple: "#7c3aed"
  background: "#ffffff"
  foreground: "#0f172a"
  muted: "#f1f5f9"
  muted-foreground: "#64748b"
  border: "#e2e8f0"
  destructive: "#ef4444"
  chart-blue: "#3b82f6"
  chart-purple: "#7c3aed"
  chart-cyan: "#06b6d4"
  chart-amber: "#f59e0b"
  chart-orange: "#f97316"
typography:
  display:
    fontFamily: "Arial, Helvetica, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Arial, Helvetica, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Arial, Helvetica, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Arial, Helvetica, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Arial, Helvetica, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "#2563eb"
    textColor: "{colors.primary-foreground}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  input-default:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "8px 12px"
  card-default:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  nav-sidebar:
    backgroundColor: "{colors.urf-navy}"
    textColor: "{colors.primary-foreground}"
  nav-sidebar-active:
    backgroundColor: "{colors.signal-purple}"
    textColor: "{colors.primary-foreground}"
---

# Design System: URF Management System

## 1. Overview

**Creative North Star: "The Field Register"**

This system is the operational equivalent of a field register kept by a community worker: every name on the page is a real person, every status reflects a real pattern of presence, every action taken here has a consequence in the community being served. The interface should feel like that register: well-organized, trustworthy, immediately readable, and free of anything that doesn't help the work. Not a product dashboard. Not a church website. An operational tool used by focused people doing a specific job.

The density is moderate. Screens hold enough information to work from without requiring constant navigation, but they don't pack data until it suffocates. Hierarchy is achieved through type weight and spatial rhythm, not color explosions or card-within-card nesting. The dark navy sidebar is the only surface that announces itself visually; everything else is calm, light, and precise.

The system rejects four things by name: the sea of identical white cards and blue buttons that defines generic SaaS products; the grey density and nested modals of legacy enterprise software; the playful gradients and bouncing animations of consumer apps; and the doves, golden gradients, and inspirational overlays of church website aesthetics. None of those belong here. This tool serves people who are tracking real attendance in real time after a Sunday service. The interface should have the confidence of something that knows exactly what it is for.

**Key Characteristics:**
- Light mode only; the dark sidebar is structural, not atmospheric
- Hierarchy through weight contrast and spacing, not color density
- Status signals (COMMITTED, AT_RISK, LEGACY) are always paired: color plus text, never color alone
- The navy-and-purple sidebar is the single most distinctive visual element; it anchors every screen
- Cards are used sparingly; most content lives in tables, lists, and form layouts

## 2. Colors: The URF Palette

One organizational blue, one dark anchor, one active-state signal. Everything else is neutral.

### Primary
- **Operational Blue** (`#3b82f6` / `oklch(59% 0.199 257°)`): The action color. Used on primary buttons, active navigation links, focus rings, and key interactive elements. Appears on roughly 5-8% of any given screen. Its rarity is what gives it weight.

### Secondary
- **Signal Purple** (`#7c3aed` / `oklch(48% 0.19 286°)`): The active-state marker in the sidebar and accent role in charts. Communicates "selected" and "currently here." Only used for the active nav item and as chart-2 in data visualizations.

### Neutral
- **URF Navy** (`#0f1829` / `oklch(18% 0.052 254°)`): The sidebar background. The single dark surface in an otherwise light system. It grounds every screen and makes the content area feel open by contrast. Never used as a content background; reserved for the navigation shell exclusively.
- **Page White** (`#ffffff`): The main content surface. Cards and the main area share this background; differentiation comes from borders and shadow, not background tinting.
- **Resting Surface** (`#f1f5f9`): Muted background for secondary areas: filter rows, table headers, empty states, disabled inputs. Barely visible; its job is differentiation, not decoration.
- **Subdued Text** (`#64748b`): Labels, helper text, table metadata, placeholder copy. Everything that supports without competing with primary content.
- **Foreground** (`#0f172a`): Primary text. Near-black with a slight navy tint so it reads as warm rather than dead-black against white.
- **Border** (`#e2e8f0`): Dividers, input strokes, card outlines. Light and consistent; used widely but never dominant.
- **Destructive** (`#ef4444`): Delete actions and error states only. Never used decoratively.

### Chart Palette
Five roles, used in sequence: Blue (`#3b82f6`), Purple (`#7c3aed`), Cyan (`#06b6d4`), Amber (`#f59e0b`), Orange (`#f97316`). Chart colors may not bleed into UI chrome; they belong to data visualization exclusively.

### Named Rules
**The One Voice Rule.** Operational Blue (`#3b82f6`) is the action color. It appears on primary buttons, active links, and focus rings. It does not appear as a background tint, a section color, a badge background for non-primary statuses, or a decorative highlight. If it appears twice on a screen for different reasons, one of those reasons is wrong.

**The Sidebar Lock Rule.** URF Navy (`#0f1829`) is used exactly one place: the navigation sidebar. It is not a valid background for content areas, modals, tooltips, or code blocks. If the impulse is to make something feel "important" by putting it on navy, use foreground weight and spacing instead.

## 3. Typography

**Display/Body Font:** Arial, Helvetica, system-ui, sans-serif (system stack; no external fonts currently loaded)

**Character:** The current typography is honest and functional but has no voice of its own. It relies entirely on weight and scale to create hierarchy. The system works within this constraint deliberately: strong 700-weight display labels, 600-weight section heads, 400-weight body. The absence of custom typefaces is documented here as current state, not as prescription; a more committed font selection (something in the geometric sans family, not on the reflex-reject list) would significantly strengthen the system's identity.

### Hierarchy
- **Display** (700, `clamp(1.5rem, 3vw, 2rem)`, line-height 1.2, letter-spacing -0.01em): Page-level headings. One per screen. Dashboard title, section names in reports.
- **Headline** (600, `1.25rem`, line-height 1.3): Card titles, section headers, modal titles. The primary level below display.
- **Title** (600, `1rem`, line-height 1.4): Table column headers, form section labels, list group headers.
- **Body** (400, `0.875rem`, line-height 1.6, max 70ch): All paragraph-length content, table cell data, form field values.
- **Label** (500, `0.75rem`, line-height 1.4, letter-spacing 0.01em): Status badges, metadata chips, helper text, timestamp fields. Never all-caps in running text.

### Named Rules
**The Weight Carries Rule.** With a single-family system, hierarchy depends entirely on weight contrast. The gap between 400 (body) and 600/700 (headings) must be preserved. Never introduce a 500 or a semibold heading at the same size as body; the distinction collapses. If a label needs to stand out from body copy at the same size, use weight 500 plus letter-spacing 0.01em, not a different color.

## 4. Elevation

The system is flat by default. Shadows serve structural roles, not decorative ones. Cards use a minimal `shadow-sm` (`0 1px 2px rgba(0,0,0,0.05)`) to lift them gently off the page background. Nothing else casts a shadow at rest. Interactive elevation (hover on a card, a dropdown appearing, a modal) is the only context where shadow increases.

**The Flat-By-Default Rule.** If a surface is not interactive and does not need to communicate that it floats above other content, it has no shadow. A tinted background (`{colors.muted}`) or a 1px border (`{colors.border}`) is always preferred over a shadow for visual separation on static surfaces.

### Shadow Vocabulary
- **Resting Card** (`box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), 0 0 0 1px #e2e8f0`): Standard card on a white background. Barely perceptible lift plus the 1px border ring that gives it clean edges.
- **Elevated Dropdown** (`box-shadow: 0 4px 16px rgba(15, 24, 41, 0.12), 0 0 0 1px #e2e8f0`): Menus, tooltips, and popovers. The navy tint in the shadow color connects it to the URF Navy anchor.
- **Modal** (`box-shadow: 0 20px 60px rgba(15, 24, 41, 0.20)`): Dialog overlays.

## 5. Components

### Buttons
Tactile and confident. Hover states are immediate, not hesitant. Focus states are visible at all times.

- **Shape:** Gently rounded (6px radius). Substantial but not pill-shaped.
- **Primary** (`#3b82f6` background, `#f8fafc` text, `8px 16px` padding, `40px` height): The one action that matters on a screen. One per view; two is a question mark, three is a design failure.
- **Hover:** `#2563eb` (one step darker). Transition: `background 150ms ease-out`. No transform, no shadow.
- **Focus-visible:** 2px ring in `#3b82f6` with 2px offset in white. Always visible, not hover-only.
- **Outline:** `1px solid #e2e8f0` border, transparent background. For secondary actions alongside a primary button.
- **Ghost:** Transparent at rest, `#f1f5f9` on hover. Used inside table rows and menus where a bordered button would be visually noisy.
- **Destructive:** `#ef4444` background. Reserved exclusively for irreversible actions (delete member, delete semester). Never used as a "cancel" or "go back" variant.

### Inputs / Fields
- **Style:** 1px `#e2e8f0` border, white background, 6px radius, 40px height, `0.875rem` text.
- **Focus:** Ring changes to `#3b82f6` 2px with 2px white offset. Background stays white; only the ring changes.
- **Error:** Border color shifts to `#ef4444`; error message appears below in `#ef4444` at label size.
- **Disabled:** 50% opacity, `cursor-not-allowed`. No special background color.
- **Placeholder:** `#64748b` (Subdued Text). Should read as a hint, not as content.

### Cards / Containers
- **Corner Style:** Gently curved (8px radius)
- **Background:** Page White (`#ffffff`)
- **Shadow:** Resting Card shadow (see Elevation)
- **Border:** 1px `#e2e8f0` integrated with the shadow ring
- **Internal Padding:** `24px` (1.5rem) for standard cards. `16px` for compact table-adjacent cards.
- **Usage limit:** Cards are for grouping distinct content regions. Never nest a card inside a card. If the impulse is a nested card, use a table row, an indented section, or a plain divider instead.

### Chips / Badges
Used for commitment status, semester type, event type, and academic level. Always paired: a background color plus a text label. Color alone is prohibited.

- **COMMITTED:** `#dcfce7` background, `#15803d` text (green tint)
- **AT_RISK:** `#fef9c3` background, `#a16207` text (amber tint)
- **UNCOMMITTED:** `#fee2e2` background, `#b91c1c` text (red tint)
- **NEW_MEMBER:** `#dbeafe` background, `#1d4ed8` text (blue tint)
- **LEGACY:** `#fef3c7` background, `#92400e` text (warm amber tint)
- **Shape:** Fully rounded (`border-radius: 9999px`), `text-xs` (0.75rem), font-weight 600, `2px 10px` padding.

### Navigation
- **Sidebar background:** URF Navy (`#0f1829`), full-height, fixed left.
- **Default nav item:** White text at 90% opacity, 14px, font-weight 500.
- **Active nav item:** Signal Purple (`#7c3aed`) background at 20% opacity, full white text, left edge marked with a 2px solid Signal Purple stripe (this is structural, not decorative; it communicates the item's bounded region, not a color-coded category).
- **Hover:** `rgba(255,255,255,0.08)` background tint.
- **Header:** Sticky, white background with 95% opacity backdrop blur, 1px bottom border at `#e2e8f0`.
- **Mobile:** Sheet-based slide-in. Same nav items, same active state, same RBAC visibility rules.

### Commitment Status Inline Display
The system's most-used custom pattern. Commitment status appears throughout: member list rows, detail pages, dashboard KPI cards. Rules:
- Always `chip + text label` together. Never chip alone.
- Text label uses the badge's text color at body size when displayed inline in a sentence.
- Admin override indicator: a small pencil icon in `#64748b` adjacent to the badge when `overrideReason` is set.

### Semester Type Indicator
Archive semesters carry an amber "Archive" chip (`#fef3c7` / `#92400e`). Regular semesters carry a subdued "Regular" text-only label in `#64748b`. The asymmetry is intentional: archive is the exception, regular needs no emphasis.

## 6. Do's and Don'ts

### Do:
- **Do** pair every status color with its text label. Color conveys category; text confirms it. This applies to commitment badges, semester type chips, and active/inactive states.
- **Do** use weight and scale to establish hierarchy before reaching for color. A `700`-weight label above a `400`-weight body creates clear structure without any color change.
- **Do** use `#64748b` (Subdued Text) for metadata, timestamps, and supporting information. It reads as context, not content.
- **Do** keep URF Navy (`#0f1829`) exclusively in the sidebar. The content area is light; the nav is dark. This structural contrast is the system's primary visual identity.
- **Do** use border + minimal shadow (`shadow-sm`) to separate cards. The combination creates a clean edge without atmospheric lift.
- **Do** show full names before IDs. In member rows, in SMS recipient lists, in attendance logs: the name comes first. The ID is for the API.
- **Do** use the ghost button variant inside tables and menus. A bordered or filled button competes with table content for weight.

### Don't:
- **Don't** use `border-left` greater than 1px as a colored accent stripe on cards, list items, or alert blocks. This includes the existing `border-left-color` patterns in the release notes HTML. Use a background tint, a full border, or a leading icon instead.
- **Don't** use gradient text (`background-clip: text` with a gradient fill). Use a solid color. Emphasis lives in weight and size.
- **Don't** put decorative blur, glass, or backdrop-filter on content surfaces. These are not in the vocabulary of this system.
- **Don't** make the interface look like a generic SaaS product: no sea of identical white cards with blue CTAs, no "startup clean" pattern of icon-heading-paragraph repeated in a 3-column grid.
- **Don't** reference church-website visual conventions: no golden gradients, no dove imagery, no stock photography of congregations, no halos or light-burst overlays.
- **Don't** design for consumer-app energy: no bouncing animations, no gamified progress bars, no bright primary colors beyond the defined Operational Blue.
- **Don't** use URF Navy as a background for content areas, modals, code blocks, or any non-navigation surface.
- **Don't** use Operational Blue (`#3b82f6`) for more than one role per screen. It is the action color. When it appears in charts, it is Chart Blue, not a UI element; treat them as the same budget.
- **Don't** use Arial as the final answer. The type system currently ships system fonts because no custom fonts have been configured. This is a known gap. Before any major surface redesign, select a geometric or humanist sans-serif from outside the reflex-reject list (not Inter, not DM Sans, not Plus Jakarta Sans).
- **Don't** nest cards. If the content inside a card needs subdivision, use a table, a divider, or indented rows — not another `rounded-lg border bg-card`.
