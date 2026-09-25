# 11 - UI/UX Guidelines

## Design Philosophy
The HoneyBee Learning interface should feel:
- Warm and inviting (not cold/corporate)
- Trustworthy and professional (not childish/toy-like)
- Clean and focused (not cluttered)
- Mobile-first (designed for phone, scales to desktop)
- Accessible (WCAG AA minimum)

Parents are the users. The interface is for adults managing their child's learning.

## Brand Identity

### Colours
Primary: Honey amber (#F59E0B / amber-500)
Secondary: Warm orange (#F97316 / orange-500)
Accent: Soft golden (#FDE68A / amber-200)
Background (light): #FFFBEB (amber-50)
Background (dark): #1C1917 (stone-950)
Surface: White / stone-50
Text primary: #1C1917 (stone-950)
Text secondary: #78716C (stone-500)
Success: #10B981 (emerald-500)
Warning: #F59E0B (amber-500)
Error: #EF4444 (red-500)

### Typography
Heading: Nunito (rounded, friendly, readable)
Body: Inter (clean, professional)
Both available via Google Fonts

### Logo
Bee motif with "HoneyBee Learning" wordmark.
Warm amber and orange colour palette.

## Components

### Cards
- Rounded corners (rounded-2xl)
- Subtle shadow (shadow-sm)
- Hover: slight lift + shadow increase
- Child cards: show avatar, name, age, progress bar

### Progress Bars
- Rounded
- Amber fill on light background
- Animate on load
- Show percentage label

### Buttons
Primary: Amber background, white text, rounded-full
Secondary: White background, amber border, amber text
Destructive: Red-500 background, white text
Ghost: Transparent, text only

### Navigation (mobile)
Bottom tab bar with 5 items:
Home, Children, Coach, Products, Profile
Active: amber icon + label
Inactive: stone-400

### Forms
- Clear labels above inputs
- Validation errors inline below field
- Success state shown after save
- Auto-focus first field on modal open

## Patterns

### Empty States
Always show a helpful empty state, never a blank page.
Example: "No children yet. Add your first child to get started."

### Loading States
Use skeleton loaders, not spinners where possible.
Spinners for button actions only.

### Error States
Inline errors for forms.
Toast notifications for async operation results.
Full page error for critical failures.

### Child Switching
Quick child selector in the top header.
Shows child avatar + name.
Dropdown to switch.

## Mobile First
Design for 375px width first.
Use Tailwind responsive prefixes (sm:, md:, lg:) to scale up.
Touch targets minimum 44x44px.
Bottom navigation on mobile.
Sidebar navigation on desktop.

## Accessibility
- All interactive elements are keyboard-navigable
- Focus indicators visible
- Colour is not the only indicator (use icons + text)
- Images have alt text
- Form inputs have associated labels
- ARIA labels where needed

## Animations
- Subtle page transitions
- Progress bar fill animation on load
- Card hover lift
- Toast slide-in
- No excessive animation that distracts from content
