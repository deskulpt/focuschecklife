

## Migrate from Tailwind CSS to UnoCSS

### Overview
Replace Tailwind CSS with UnoCSS using `presetWind` for Tailwind-compatible utility classes. This means all existing class names continue to work — no rewrite of every component. UnoCSS adds faster builds (~1ms vs 600ms), smaller bundles, and unlocks features like `presetIcons` (inline icons from any icon set), `presetAttributify` (write utilities as HTML attributes), and custom rules/shortcuts.

### Why This Works Without Rewriting Everything
UnoCSS's `presetWind` is a drop-in Tailwind-compatible preset. All existing `className="flex items-center gap-2 bg-primary text-sm"` syntax works unchanged. The shadcn/ui components, CSS variables, and Radix primitives all continue working.

---

### Technical Steps

**1. Install UnoCSS packages**
- `@unocss/vite`, `unocss`, `@unocss/preset-wind`, `@unocss/preset-icons`, `@unocss/preset-attributify`, `@unocss/transformer-directives`
- Remove: `tailwindcss`, `tailwindcss-animate`, `postcss`, `autoprefixer`

**2. Create `uno.config.ts`**
- Use `presetWind()` for Tailwind compatibility
- Use `presetIcons()` for icon utilities (e.g. `i-lucide-brain` directly in classes)
- Use `presetAttributify()` for optional attribute-based styling
- Migrate theme extensions (custom colors, border-radius, animations) from `tailwind.config.ts`
- Add custom shortcuts for common patterns (glass cards, gradient buttons)
- Define animation keyframes (`accordion-down`, `accordion-up`, `fade-in-up`, `scale-in`)

**3. Update `vite.config.ts`**
- Add `UnocssPlugin()` import
- Remove any PostCSS/Tailwind references

**4. Update `src/index.css`**
- Replace `@tailwind base/components/utilities` with `@unocss` directives (or `import 'virtual:uno.css'` in `main.tsx`)
- Keep all CSS custom properties (design tokens) as-is — they're plain CSS
- Convert `@apply` usages (if any) to UnoCSS `@apply` via transformer-directives

**5. Update `src/main.tsx`**
- Add `import 'virtual:uno.css'` and `import '@unocss/reset/tailwind.css'`

**6. Remove Tailwind files**
- Delete `tailwind.config.ts`, `postcss.config.js`
- Update `components.json` to remove Tailwind references

**7. Add UnoCSS-exclusive enhancements**
- Custom shortcuts in config for reusable patterns:
  - `glass: 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20'`
  - `btn-gradient: 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--medical-teal))]'`
- Icon preset lets you use `<div class="i-lucide-brain text-2xl" />` without importing icon components
- Attributify mode allows: `<div flex items-center gap-2>` as an alternative syntax

**8. Add dark mode + high-contrast + accessibility**
- Configure `dark:` variant via class-based dark mode in UnoCSS config
- Add `.high-contrast` variant via custom variant
- Create `ThemeContext.tsx` and `AccessibilityToolbar.tsx` (as previously planned)

### Files Created
- `uno.config.ts`
- `src/contexts/ThemeContext.tsx`
- `src/components/AccessibilityToolbar.tsx`

### Files Modified
- `vite.config.ts` — add UnoCSS plugin
- `src/main.tsx` — import virtual:uno.css
- `src/index.css` — remove @tailwind directives, keep CSS variables
- `package.json` — swap dependencies

### Files Deleted
- `tailwind.config.ts`
- `postcss.config.js`

### What Stays the Same
- All component `className` strings (presetWind is compatible)
- All CSS custom properties / design tokens
- All shadcn/ui components and Radix primitives
- All existing functionality

