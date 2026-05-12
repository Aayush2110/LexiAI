# Remaining UI Cleanup Tasks

## Files that still need gradient-bg and shadow removal:

### src/routes/dashboard.tsx
- Line 57: Remove `gradient-bg` and shadows from "New chat" button
- Line 63: Remove `glass` from "Upload" button  
- Line 79: Remove `glass` from stat cards
- Line 96: Remove `glass` from activity chart
- Line 113: Remove `gradient-bg` from chart bars
- Line 119: Remove `glass` from quick actions
- Line 129: Remove `glass` from action items
- Line 144: Remove `glass` from recent uploads

### src/routes/index.tsx
- Line 39: Remove `glass-strong` from header
- Line 42: Remove `gradient-bg` and shadows from logo
- Line 61: Remove `gradient-bg` and shadows from "Get started" button
- Line 74: Remove `glass` from badge
- Line 108: Remove `gradient-bg` and shadows from CTA button
- Line 114: Remove `glass` from secondary button
- Line 128: Remove `gradient-border` and shadows
- Line 136: Remove `gradient-bg` from demo message
- Line 139: Remove `glass` from demo response
- Line 176: Remove `glass` from feature cards
- Line 192: Remove `glass` from steps
- Line 215: Remove `gradient-bg` from pricing CTA

### src/routes/chat.tsx
- Line 231: Remove `glass-strong` from mobile header
- Line 238: Remove `glass` from upload toggle button

## Replace with:
- `gradient-bg` → `bg-primary`
- `glass` → `card`
- `glass-strong` → `card-elevated`
- Remove all `shadow-*` classes
- Remove all `group-hover:shadow-*` classes
- Remove `gradient-border` (just use `card` with `border-primary`)

## Clean button styles:
```tsx
// Primary button
className="bg-primary text-white hover:bg-primary/90 transition-colors duration-150"

// Secondary button  
className="card hover:border-primary/50 transition-colors duration-150"

// Icon button
className="h-8 w-8 rounded-lg hover:bg-accent transition-colors duration-150"
```

## Clean card styles:
```tsx
// Regular card
className="card p-4"

// Elevated card
className="card-elevated p-4"

// Hover card
className="card p-4 hover:border-primary/30 transition-colors duration-150"
```
