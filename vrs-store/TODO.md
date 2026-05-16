# VRS STORE V7.0 MIDNIGHT COBALT EDITION - IMPLEMENTATION PLAN

## Phase 1: Visual Identity (Theme & Style)
- [x] Update theme.css with Midnight Cobalt palette (#020B1A, #00A3FF, #D4AF37)
- [ ] Update style.css with glassmorphism cards, smooth radius, no clipped edges
- [ ] Remove grid patterns, solid background only
- [ ] Add proper shadows: 0 10px 30px rgba(0,0,0,0.5)

## Phase 2: Search & Currency Engine
- [ ] Create searchEngine.js with real-time dropdown suggestions
- [ ] Create currencyConverter.js with IQD/USD toggle
- [ ] Add 40px thumbnail, product name, price in dropdown

## Phase 3: Discount System
- [ ] Create discountSystem.js with modular config
- [ ] Support CouponKey + Percentage logic
- [ ] Display: "~~500,000~~ → 250,000 IQD. You saved 250k!"

## Phase 4: Discord Routing (ProductCard)
- [ ] Route Cyber Hub & AI Dev products to Discord ticket
- [ ] Add ?category= parameter to URL
- [ ] Show human message on click

## Phase 5: Payment Modal Update
- [ ] Add Zain Cash, AsiaCell, Master Card icons
- [ ] Step-by-step human instructions

## Phase 6: Humanized UX Copywriting
- [ ] "Search Results" → "Found what you're looking for?"
- [ ] "Invalid Coupon" → "Ops! This code doesn't seem to work, try again?"
- [ ] Featured section with gold borders for premium items

## Featured Trio Categories
- Custom Web Design (web_services)
- Arc Raiders Premium Account (high_level_gaming_accounts)
- Rare 3-Char Username (rare_usernames)

## Implementation Priority
1. theme.css + style.css
2. searchEngine.js + currencyConverter.js
3. discountSystem.js
4. ProductCard.js (Discord routing)
5. Payment.js (modal update)
6. Navbar.js (currency toggle)
7. index.html (updates)

-----------------------------------------------


# UX/UI Refactor TODO

- [x] Analyze requirements and inspect relevant CSS files
- [ ] Refactor `vrs-store/frontend/css/theme.css` tokens for premium blue + soft UI consistency
- [ ] Refactor `vrs-store/frontend/css/style.css`:
  - remove all gold/golden accents
  - enforce magnetic blue/neutral borders with hover glow
  - add scale-up product-card hover micro-interaction
  - strengthen navbar/modal glassmorphism blur
  - enforce Action Blue for Add to Cart / Checkout CTAs
  - add subtle pulse animation for primary CTA buttons
  - improve accessibility contrast and spacing
  - optimize animation performance (transform/opacity/will-change)
- [ ] Run regex verification pass for gold residue removal
- [ ] Final review and report
