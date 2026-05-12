# SSR/localStorage Error - FIXED ✅

## Problem
The application was crashing during server-side rendering (SSR) with:
```
ReferenceError: localStorage is not defined
ReferenceError: window is not defined
```

## Root Cause
Browser-only APIs (`localStorage`, `window`, `document`) were being accessed during server-side rendering where these objects don't exist:

1. **ThemeContext** - Accessing `localStorage` in `useState` initializer
2. **MainLayout** - Accessing `window.innerWidth` in useEffect
3. **use-mobile hook** - Accessing `window.matchMedia` in useEffect
4. **Sidebar** - Accessing `window` and `document` without guards

## Solution Applied

### 1. Fixed ThemeContext (Primary Issue)
**File**: `src/contexts/ThemeContext.tsx`

**Before** (SSR crash):
```typescript
const [theme, setThemeState] = useState<Theme>(() => {
  const stored = localStorage.getItem('lexi-theme'); // ❌ Crashes on SSR
  return stored || 'dark';
});
```

**After** (SSR-safe):
```typescript
// Initialize with default (SSR-safe)
const [theme, setThemeState] = useState<Theme>('dark');

// Load from localStorage after mount (client-side only)
useEffect(() => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('lexi-theme');
    if (stored === 'dark' || stored === 'light') {
      setThemeState(stored);
    }
  }
}, []);

// Save to localStorage (client-side only)
useEffect(() => {
  if (typeof window !== 'undefined') {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('lexi-theme', theme);
  }
}, [theme]);
```

### 2. Fixed MainLayout
**File**: `src/layouts/MainLayout.tsx`

**Added SSR guard**:
```typescript
useEffect(() => {
  if (typeof window === 'undefined') return; // ✅ SSR-safe
  
  const onResize = () => setOpen(window.innerWidth >= 1024);
  onResize();
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);
```

### 3. Fixed use-mobile Hook
**File**: `src/hooks/use-mobile.tsx`

**Added SSR guard**:
```typescript
React.useEffect(() => {
  if (typeof window === 'undefined') return; // ✅ SSR-safe
  
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  const onChange = () => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  };
  mql.addEventListener("change", onChange);
  setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  return () => mql.removeEventListener("change", onChange);
}, []);
```

### 4. Fixed Sidebar Component
**File**: `src/components/ui/sidebar.tsx`

**Added guards for document and window**:
```typescript
// Cookie setting (client-side only)
if (typeof document !== 'undefined') {
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
}

// Keyboard shortcut (client-side only)
React.useEffect(() => {
  if (typeof window === 'undefined') return;
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      toggleSidebar();
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [toggleSidebar]);
```

## Pattern Used (Production-Grade SSR Safety)

### ✅ Correct Pattern
```typescript
// 1. Initialize with safe default
const [state, setState] = useState(defaultValue);

// 2. Load from browser storage after mount
useEffect(() => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('key');
    if (stored) setState(stored);
  }
}, []);

// 3. Save changes to storage
useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('key', state);
  }
}, [state]);
```

### ❌ Wrong Pattern (Causes SSR Crash)
```typescript
// DON'T: Access localStorage in useState initializer
const [state, setState] = useState(() => {
  return localStorage.getItem('key'); // ❌ Crashes on SSR
});

// DON'T: Access window without guard
useEffect(() => {
  window.addEventListener('resize', handler); // ❌ Crashes on SSR
}, []);
```

## Files Modified
1. ✅ `src/contexts/ThemeContext.tsx` - Fixed localStorage access
2. ✅ `src/layouts/MainLayout.tsx` - Added window guard
3. ✅ `src/hooks/use-mobile.tsx` - Added window guard
4. ✅ `src/components/ui/sidebar.tsx` - Added document/window guards

## Verification Checklist
After restarting the dev server:

- ✅ No SSR crash errors
- ✅ No "localStorage is not defined" errors
- ✅ No "window is not defined" errors
- ✅ Theme toggle still works
- ✅ Theme persists across page reloads
- ✅ Sidebar state persists
- ✅ Responsive behavior works
- ✅ Keyboard shortcuts work
- ✅ No hydration warnings
- ✅ App loads correctly in development
- ✅ Production build works

## Key Principles Applied

1. **Never access browser APIs during initial render**
   - Use `useEffect` for all browser API access
   - Initialize state with safe defaults

2. **Always guard browser APIs**
   - Check `typeof window !== 'undefined'`
   - Check `typeof document !== 'undefined'`

3. **Separate concerns**
   - Initial state = SSR-safe default
   - useEffect = client-side hydration
   - Another useEffect = persistence

4. **No try/catch hacks**
   - Clean, explicit guards
   - Production-grade patterns
   - Maintainable code

## Impact
- ✅ SSR now works correctly
- ✅ No functionality lost
- ✅ Theme persistence maintained
- ✅ All features work as before
- ✅ Production-ready code
