# Test Suite Documentation

## Overview

This project uses **Jest** (via the `jest-expo` preset) with **`@testing-library/react-native`** for rendering components and hooks. All tests live under `__tests__/` and mirror the source tree structure.

**Current totals:** 18 test files · 282 tests · ~89% statement coverage overall.

---

## Directory Structure

```
__tests__/
├── TESTING.md                                        ← this file
├── useReadingContent.test.ts                         ← pure functions: hitTest, buildTokenSentenceMap, buildPages
├── services/
│   ├── ankiExport.test.ts
│   ├── auth.test.ts
│   ├── ocr.test.ts
│   ├── profile.test.ts
│   ├── readingCache.test.ts
│   ├── readings.test.ts
│   └── words.test.ts
├── hooks/
│   ├── useFullscreenModal.test.tsx
│   ├── useHome.test.tsx
│   ├── useOnboarding.test.tsx
│   ├── useProfile.test.tsx
│   ├── useSession.test.tsx
│   ├── useThemeColor.test.tsx
│   └── useUpload.test.tsx
└── screens/
    └── ReadingScreen/
        ├── hooks/
        │   └── useReadingContent.hook.test.tsx
        └── utils/
            ├── fontMetrics.test.tsx
            └── layoutEngine.test.ts
```

---

## Running Tests

```bash
# Run all tests once
npx jest --watchAll=false

# Run with coverage report
npx jest --coverage --watchAll=false

# Run a single file
npx jest __tests__/hooks/useHome.test.tsx --watchAll=false

# Run tests matching a pattern
npx jest --testNamePattern="isHighlighted" --watchAll=false
```

---

## Test Files

### `useReadingContent.test.ts`

Covers the three exported **pure functions** from `screens/ReadingScreen/hooks/useReadingContent.tsx`:

| Function | What is tested |
|---|---|
| `hitTest(x, y, tokenLayouts)` | Returns correct token index on hit; returns -1 on miss |
| `buildTokenSentenceMap(tokens, sentences)` | Maps every token index to its containing sentence index |
| `buildPages(tokenLayouts, containerHeight)` | Partitions token layout map into page slices by containerHeight |

Native modules (`expo-haptics`, `react-native-gesture-handler`) and hook dependencies (`useReading`, `useLoading`) are stub-mocked so the file can be imported in Node without native initialisation.

---

### `services/words.test.ts`

Covers `services/words.ts`. Tests the full public API:

- `addSavedWord`, `getSavedWords`, `getCachedWords`, `removeSavedWord`, `updateSavedWord`
- `getDefinitionAndTranslation` (calls a Supabase Edge Function)
- Serialisation helpers: `parseDefinition`, `serializeDefinition`, `parseExamples`, `serializeExamples`

**Mock strategy:** `@/utils/supabase` is replaced with a chainable builder whose `.then` resolves to `{ data, error }`. `.single()` is overridden for terminal query calls. `supabase.functions.invoke` is a plain `jest.fn()`.

---

### `services/auth.test.ts`

Covers auth service helpers (sign-in, sign-out, password reset). Supabase `auth.*` methods are mocked directly.

---

### `services/ocr.test.ts`

Covers `ocrExtract`. Tests successful extraction, error propagation, and multi-image payloads. The underlying HTTP fetch is mocked.

---

### `services/profile.test.ts`

Covers profile read/update helpers. Supabase `from().select()` / `from().update()` chains are mocked with the chainable builder pattern.

---

### `services/readings.test.ts`

Covers `fetchFeedReadings`, `fetchSavedReadings`, `uploadReading`, and `searchReadings`. Uses the same Supabase chainable builder. Verifies correct table names, filters, and error propagation.

---

### `services/readingCache.test.ts`

Covers `ReadingCacheService` — an SQLite-backed LRU reading cache.

**Mock strategy:** `expo-sqlite`'s `openDatabaseAsync` returns a fake DB object with `jest.fn()` implementations of `execAsync`, `runAsync`, `getFirstAsync`, `getAllAsync`, and `withTransactionAsync` (which calls its callback immediately).

Tests cover:
- Table initialisation on first open
- `getReading` cache hit / miss / JSON deserialisation
- `saveReading` write and LRU eviction when capacity is exceeded
- Web no-op path (`Platform.OS === 'web'` bypasses SQLite)

---

### `services/ankiExport.test.ts`

Covers `exportToAnki` from `services/ankiExport.ts`. Groups:

| Group | What is tested |
|---|---|
| Field escaping | Tabs → space, newlines → `<br>` in text, translation, definition |
| File content | Required Anki header lines; one row per word; front/back field structure |
| File naming | Default filename; title slugification |
| iOS platform | Writes to `CacheDir`; calls `RNBlobUtil.ios.openDocument` |
| Android platform | Calls `RNBlobUtil.android.actionViewIntent` with MIME type |
| Web platform | No native write; creates Blob, clicks anchor, revokes URL |

`react-native-blob-util` is fully mocked. `Platform.OS` is replaced per describe block with `jest.replaceProperty`.

---

### `hooks/useSession.test.tsx`

Covers `SessionProvider` + `useSession`.

- Initial state: `session: null`, `isLoading: true`
- After `getSession` resolves: session updates, `isLoading` becomes false
- `onAuthStateChange` callbacks update session reactively
- Subscription is unsubscribed on unmount

Uses `renderHook` with `SessionProvider` as the wrapper. The Supabase `auth` object is mocked; the `onAuthStateChange` mock captures the callback so tests can fire it manually with `act()`.

---

### `hooks/useHome.test.tsx`

Covers `HomeProvider` + `useHome`.

Tests: readings fetch on mount, segment switching (feed / saved), pull-to-refresh, card navigation (`useRouter.push`), search debounce, and error alert display.

Mocked dependencies: `fetchFeedReadings`, `fetchSavedReadings`, `searchReadings`, `useLoading`, `useReading.handleReadingChange`, `expo-router`, `react-native Alert`.

---

### `hooks/useUpload.test.tsx`

Covers `UploadProvider` + `useUpload`.

Groups:

| Group | What is tested |
|---|---|
| Initial state | Empty upload object, all modal flags false |
| `setImages` | Sets images array, clears file and text |
| `setFile` | Sets file, clears images and text |
| `clearUpload` | Resets everything to defaults |
| `processUpload` | Calls `ocrExtract`; shows/hides loading; stores extracted text; opens confirm modal; handles errors |
| Modal visibility | Each modal's show/hide pair toggles independently; `showConfirmScanModal` opens on native, shows Alert on web |

---

### `hooks/useOnboarding.test.tsx`

Covers `useOnboarding`. Tests onboarding step progression, back navigation, and completion.

---

### `hooks/useProfile.test.tsx`

Covers `useProfile`. Tests profile loading, field update, and save.

---

### `hooks/useFullscreenModal.test.tsx`

Covers `useFullscreenModal`. Tests open/close state and the modal content ref.

---

### `hooks/useThemeColor.test.tsx`

Covers `useThemeColor`. Tests light/dark theme resolution with and without a prop override, and the fallback when no colour is defined.

---

### `screens/ReadingScreen/utils/fontMetrics.test.tsx`

Covers `screens/ReadingScreen/utils/fontMetrics.tsx`.

**Important — test ordering:** Module-level variables (`_calibrated`, `charWidthRatios`, `defaultRatio`) are shared within a Jest module instance. The `isCalibrated` and `estimateTokenWidth` describe blocks are placed **before** the `FontMeasurer` block, which fires `onLayout` events that permanently flip `_calibrated = true` for the rest of the file's module instance.

| Group | What is tested |
|---|---|
| `isCalibrated()` | Returns `false` before any calibration |
| `estimateTokenWidth(surface, fontSize)` | Empty string → 0; single char uses `defaultRatio (0.55) × fontSize × KERNING_SHRINK (0.5)`; multi-char accumulates; scales linearly with fontSize |
| `FontMeasurer` | Renders without crash; does not fire `onReady` until all character layouts complete; fires `onReady` exactly once; `done.current` guard prevents a second call; `isCalibrated()` returns `true` after completion |

`FontMeasurer` renders one `<Text>` per unique character in `REFERENCE_CHARS`. Tests use `UNSAFE_getAllByType(Text)` and `fireEvent(el, 'layout', {...})` to simulate each character reporting its measured width.

---

### `screens/ReadingScreen/utils/layoutEngine.test.ts`

Covers `screens/ReadingScreen/utils/layoutEngine.ts`. Both exports are **pure functions** with no async or React dependencies.

**Mock:** `estimateTokenWidth` (from `fontMetrics`) is mocked to return `fontSize` for any input, making all pixel arithmetic deterministic.

| Group | What is tested |
|---|---|
| `computeParagraphStarts` | Empty tokens; empty blocks; single block → first-token index; multiple blocks → one index per block; no token within block range → empty set; only the *first* token per block is included |
| `computeLayout` | Empty array → empty Map; single token at origin `{x:0, y:0}`; adjacent tokens share a line without gap; character-gap tokens receive `leadingSpace`; line wrap when `cursorX + tokenWidth > containerWidth`; paragraph-start token begins a new line with `indentWidth` applied; first token with paragraph-start does not add a blank line before it; multi-paragraph end-to-end; `estimateTokenWidth` called with correct arguments |

**Layout formula (mock returning `fontSize = 16`):**
```
tokenWidth  = fontSize (16)
leadingSpace = 4  (when token.start > prevToken.end)
indent      = 32  (for paragraph-start tokens)
wrap when   cursorX + margin + tokenWidth > containerWidth  &&  cursorX > 0
```

---

### `screens/ReadingScreen/hooks/useReadingContent.hook.test.tsx`

Covers the `useReadingContent` hook body (state, effects, and callbacks). The three exported pure functions from the same file are already covered in `__tests__/useReadingContent.test.ts`.

**Mocked dependencies:**

| Dependency | Mock |
|---|---|
| `@/hooks/useReading` | `let mockReadingReturn` overridden per describe block |
| `@/hooks/useLoading` | `mockShowLoading`, `mockHideLoading` |
| `fontMetrics` | `isCalibrated: () => mockIsCalibrated`; `estimateTokenWidth` returns 16 |
| `layoutEngine` | `computeLayout` returns `new Map()`; `computeParagraphStarts` returns `new Set()` |
| `react-native-gesture-handler` | Chainable `Gesture.Pan()` stub |
| `expo-haptics` | `impactAsync` stub |

Return values of `computeLayout` / `computeParagraphStarts` are re-set in `beforeEach` because `jest.clearAllMocks()` strips `mockReturnValue` configurations.

| Group | What is tested |
|---|---|
| Initial state | Empty tokens/sentences/spans/blocks; `fontSize` from `useReading`; `needsCalibration` mirrors `isCalibrated()`; `isHighlighted` always false without selection |
| `onCalibrated` | Flips `needsCalibration` from true → false; stable callback reference across re-renders |
| `isHighlighted` | True for in-range tokens; false for out-of-range; works with unsorted `tokenIndices`; false after selection cleared |
| Layout callbacks | `onTokenLayout` does not throw; `onContainerLayout` and `onTokenContainerLayout` are wrapped in `act()` and do not crash; repeated same-value calls are safe |
| Layout effects | `computeLayout` called when both `containerWidth` and `readingContent` are set; `hideLoading` called after layout; `setTotalPages` called with page count; `showLoading` called when content is set but calibration is pending |
| Pan | Returns a defined pan gesture object |

**Uncoverable lines:** The pan gesture callbacks (lines 334–373) and `commitSelection` (lines 315–328) require native gesture handler events that cannot be dispatched in the Node/JSDOM environment. These lines remain uncovered by design.

---

## Common Patterns

### Supabase chainable builder

Many service tests need `supabase.from(...).select(...).eq(...).single()` chains to resolve predictably. The standard approach is a builder object where every method returns `this` (for chaining) and `.then` makes the chain awaitable:

```ts
function makeChain(data: any, error: any = null) {
  const chain: any = {
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    delete: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    single: () => Promise.resolve({ data, error }),
    then: (resolve: any) => Promise.resolve({ data, error }).then(resolve),
  }
  return chain
}
mockFrom.mockReturnValue(makeChain(someData))
```

### Platform branching

```ts
beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'ios')
})

it('android path', () => {
  jest.replaceProperty(Platform, 'OS', 'android')
  // ...
})
```

### Jest mock hoisting and lazy evaluation

`jest.mock()` is hoisted to the top of the file before `const`/`let` declarations execute. To avoid reading an `undefined` variable inside a factory, use the indirection pattern — read the variable at **call time**, not at factory time:

```ts
let mockIsCalibrated = true

jest.mock('@screens/ReadingScreen/utils/fontMetrics', () => ({
  // ✓ arrow function reads mockIsCalibrated when the mock is called
  isCalibrated: () => mockIsCalibrated,
  // ✓ spread args forwarded so the real jest.fn() is invoked
  estimateTokenWidth: (...args: any[]) => mockEstimateTokenWidth(...args),
}))
```

### Re-setting mock return values after `clearAllMocks`

`jest.clearAllMocks()` resets call history **and** strips `mockReturnValue` / `mockResolvedValue` configurations. Re-apply them in `beforeEach`:

```ts
beforeEach(() => {
  jest.clearAllMocks()
  mockComputeLayout.mockReturnValue(new Map())
  mockComputeParagraphStarts.mockReturnValue(new Set())
})
```

### Wrapping state updates in `act()`

Any callback that triggers a React `setState` must be wrapped in `act()` to avoid warnings and ensure state is flushed before assertions:

```ts
// ✗ bypasses act — causes React warning
expect(() => result.current.onContainerLayout(event)).not.toThrow()

// ✓ correct
act(() => { result.current.onContainerLayout(event) })
```

### Hook tests with a Provider wrapper

```ts
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SomeProvider>{children}</SomeProvider>
)

const { result } = renderHook(() => useMyHook(), { wrapper })
```

---

## Coverage Notes

| File | Statements | Notes |
|---|---|---|
| `fontMetrics.tsx` | ~100% | All branches exercised via `FontMeasurer` layout events |
| `layoutEngine.ts` | ~100% | Pure functions; deterministic mock widths |
| `useReadingContent.tsx` | ~73% | Pan callbacks and `commitSelection` require native gesture events — not unit-testable |
| Services | ~90%+ | Supabase chains cover happy path and error branches |
| Hooks | ~85%+ | Provider + renderHook pattern covers state machine branches |
