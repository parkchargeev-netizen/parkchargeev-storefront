# ParkChargeEV Premium Architecture and UX Audit

Date: 2026-06-26

## Detected Architecture Issues

- Several files exceed the preferred maintainability budget and should be split in later low-risk passes: `src/app/globals.css`, `src/components/admin/product-form.tsx`, `src/server/admin/repository.ts`, `src/server/admin/fallback-store.ts`, `src/components/admin/dashboard/admin-dashboard-view.tsx`, `src/components/shop/checkout-page-client.tsx`, and `src/server/db/schema.ts`.
- Site-wide visual behavior was partly encoded directly in global CSS, which increases coupling between unrelated components when selectors are too broad.
- Premium motion primitives existed, but the visible ambience was too subtle at wide desktop and zoomed-out scales.
- Some visual affordances were hover-only, which made the interface feel flat in static scans and screenshots.
- Generic surface selectors risked overriding component-owned pseudo-elements; these selectors were narrowed to premium component families.
- The primary navigation active state was coupled to a hardcoded store link instead of the current route.
- Automatic reveal preparation could target structural containers, creating a risk of temporarily blank first viewport captures.

## Detected Design Inconsistencies

- Background gradients and lighting layers were not strong enough to survive large viewport or zoomed-out presentation.
- Cards had consistent structure but needed richer depth, animated media scans, and more visible energy accents.
- Section transitions needed stronger visual continuity so the site feels like one premium product system instead of separate blocks.
- Button and card micro-interactions were present but not consistently expressive across the product, store, and content sections.
- Active navigation state could misrepresent the current page, weakening orientation and trust.

## Technical Debt Items

- Continue extracting `globals.css` into smaller domain stylesheets where Next.js global CSS rules permit it.
- Split admin product editing into smaller form sections and field adapters.
- Split admin repository modules by aggregate boundary: products, orders, content, users, audit, and catalog.
- Reduce large client components by moving pure formatting, state transitions, and API orchestration into testable hooks/services.
- Add visual regression coverage for the home, store, product detail, checkout, and admin login screens.

## Implemented Improvements

- Added stronger global ambience primitives for visible lighting bands, animated rails, and energy sweeps.
- Added richer site-level circuit ribbons and pulsing nodes while preserving pointer-event safety.
- Added reusable section-level atmosphere to `PremiumSection`, keeping section motion declarative and reusable.
- Narrowed broad pseudo-element selectors to avoid clobbering unrelated component internals.
- Added performance guards with transform/opacity-only motion, `will-change`, containment, and reduced-motion fallbacks.
- Split route-aware primary navigation into a small client component and restored correct `aria-current` behavior.
- Updated the motion runtime so structural page containers remain visible while their child sections still receive reveal animation.
- Kept the existing release gates intact and verified architecture and UI/UX checks after the refactor.

## Follow-up Refactor Plan

1. Extract legacy global CSS into domain files: base, layout, commerce, admin, motion, and marketing.
2. Split large admin/server files by feature boundary and add unit coverage around the extracted services.
3. Add Playwright visual screenshots for desktop and mobile hero, store grid, product detail, checkout, and admin.
4. Gradually replace ad hoc utility class clusters with typed UI primitives where the pattern repeats across pages.

## Staff-Level Follow-up Pass

- Reduced motion runtime coupling by preparing only newly added DOM subtrees after mutations instead of rescanning the full document on every dynamic update.
- Added coarse-pointer awareness to pointer lighting so touch devices avoid unnecessary animation scheduling.
- Promoted section ambience to an explicit `PremiumSection` contract with `ambient` support and `data-motion-loop` integration.
- Replaced broad `overflow-wrap:anywhere` text behavior with safer readable wrapping and protected price, badge, and CTA labels from mobile character-level wrapping.
- Added stronger focus-ring, tap-target, form-field, hero contrast, and text-balancing rules to improve WCAG-oriented readability without changing content.
- Added section-level `content-visibility` and card containment rules to improve rendering cost for offscreen content while preserving reduced-motion fallbacks.
- Prevented transform/backdrop-filter containing-block regressions from breaking mobile fixed checkout and product purchase actions.
- Remaining technical debt: global CSS still needs modular extraction, and the largest admin/checkout/server files should be split in dedicated low-risk passes with focused tests.

## High-Density Motion and Speed Pass

- Added `src/app/premium-motion-intensity.css` as a separate override layer so stronger motion, gradients, rails, traces, and glow accents remain isolated from base design tokens.
- Increased global, shell-level, and section-level ambient density with additional rails, pulses, trace lines, compact nodes, section flares, and card energy sweeps.
- Kept the new motion GPU-friendly by using opacity and transform animations, reduced-motion fallbacks, mobile pruning rules, and `content-visibility` for offscreen page sections.
- Reduced perceived reveal latency by shortening motion completion and stagger timing while increasing pointer and scroll shift ranges for more visible parallax.
- Removed unnecessary client execution from the static charging visual so the hero keeps richer visuals without adding React client bundle cost.
- Fixed the reduced-motion loop preparation edge case so ambient loop elements can recover correctly when the user changes motion preferences.
- Reworked the home installation section color system with brighter high-contrast text, deeper engineering background tones, stronger cards, and readable CTA treatment.

## Performance Preservation Pass

- Preserved the premium motion system while removing high-cost blur/filter work from reveal, hover, ambient band, section flare, and circuit ribbon paths.
- Moved motion preparation to `requestIdleCallback` with a short timeout and kept initial viewport elements visible immediately to protect LCP and avoid first-paint flicker.
- Deduplicated root CSS variable writes for pointer lighting and scroll progress so scroll/pointer events do not trigger unnecessary style invalidation.
- Added controlled image priority to `ProductCard` and enabled it only for the first visible store product image, avoiding broad eager image loading.
- Deferred Microsoft Clarity to `lazyOnload` so analytics collection no longer competes with the first interaction path.
- Added immutable cache headers for public image, upload, and cursor assets.
- Converted ambient layer markup to data-driven part lists, reducing duplicated JSX while keeping the visual output unchanged.

## Performance Isolation Pass

- Replaced the global cart context dependency with a small `useSyncExternalStore` cart store, so cart state updates now notify only cart-aware client islands instead of a layout-wide provider tree.
- Removed the React conversion click listener and replaced it with a guarded inline DOM listener, preserving the same `data-conversion-event` API without a hydrated global component.
- Split the mobile navigation panel into a dynamic chunk, keeping the closed mobile header lean while loading panel actions, cart link, and navigation labels only when the menu opens.
- Expanded package import optimization for `@tanstack/react-table`, `react-hook-form`, and `date-fns`, reducing the risk of large admin/form utilities leaking into route chunks.
- Added explicit immutable caching for `/_next/static` assets in addition to public media folders, improving Lighthouse cache-policy coverage.
- Verified that the public site layout chunk dropped after the provider and mobile menu isolation while store/product route chunks stayed smaller and all checkout/mobile contracts remained intact.
