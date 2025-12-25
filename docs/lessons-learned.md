# Hyper Shards v7 - Session Lessons Learned

## Session Date: 2025-12-25

---

## 1. Vertex AI Asset Generation

### Audio Generation (~50% Block Rate)

**Problem:** Vertex AI's safety filters aggressively block game audio prompts.

**Blocked Terms:**
- Combat/explosion/weapon terms ("laser", "explosion", "shoot", "damage")
- Intense action descriptors ("intense", "aggressive", "powerful")
- Death/destruction themes ("death", "destroy", "kill")

**Result:** 11/21 audio files generated; 10 blocked by filters.

### Workarounds:
1. **Euphemistic Prompts:** 
   - "explosion" → "energy burst"
   - "weapon fire" → "electronic pulse"
   - "death cry" → "character defeat sound"

2. **Fallback Sources:** freesound.org, OpenGameArt

3. **Graceful Degradation:** Always handle missing audio files:
   ```typescript
   async loadSFX(name: string): Promise<void> {
       try {
           this.sounds[name] = new Audio(`/audio/${name}.mp3`);
       } catch {
           console.warn(`Missing SFX: ${name}`);
       }
   }
   ```

---

## 2. ESLint/TypeScript Debugging (29 Errors Fixed)

### Common `any` Type Resolutions:

| Context | Bad | Good |
|---------|-----|------|
| Event handlers | `e: any` | `e: Event` + cast: `(e as CustomEvent<T>).detail` |
| Generic pools | `any[]` | `unknown[]` with type guards |
| JSON responses | `data as any` | Define interface, use `as Interface` |
| globalThis access | `(globalThis as any)` | `(globalThis as Record<string, unknown>)` |
| Callback objects | `{ fn: any }` | Full interface with typed methods |

### React Hooks Patterns:

| Error | Bad Pattern | Good Pattern |
|-------|-------------|--------------|
| `react-hooks/set-state-in-effect` | `useEffect(() => setState(fn()), [])` | `useMemo(() => fn(), [])` |
| `react-hooks/purity` | `Math.random()` in render | Extract to utility function |

**Example Fix:**
```tsx
// ❌ BAD
useEffect(() => { setData(computeData()); }, []);

// ✅ GOOD
const data = useMemo(() => computeData(), []);
```

---

## 3. Performance Optimization

### Applied Optimizations:
1. **Deterministic Network Throttling:** Frame counter instead of `Math.random()`
2. **Cached Callbacks:** Pre-bound functions stored once, not per-frame

### Pre-existing Good Patterns Found:
- Object pooling for Bullets, Particles, FloatingText
- SpatialGrid for O(1) collision queries
- Swap-and-pop array removal

---

## 4. Security Audit Results

| Check | Status |
|-------|--------|
| `npm audit` | ✅ 0 vulnerabilities |
| `.env` in gitignore | ✅ Secured |
| `dangerouslySetInnerHTML` | ✅ None |
| `eval()` usage | ✅ None |
| Supabase credentials | ✅ Environment variables |

---

## Files Modified This Session

### Debug Fixes (15 files):
- `ChallengeModifiers.ts`, `ChallengeMode.ts`, `App.tsx`
- `RemoteShip.ts`, `Ship.ts`, `InputSystem.ts`
- `GameEngine.ts`, `MultiplayerBridge.ts`
- `AuthScreen.tsx`, `GameOverScreen.tsx`, `SettingsScreen.tsx`
- `ChallengeScreen.tsx`, `MatchmakingScreen.tsx`
- `Persistence.ts`, `I18nContext.tsx`

### Performance (1 file):
- `GameEngine.ts` - Network throttling, cached callbacks

### Documentation (2 files):
- `generate-asset.md` - Vertex AI audio lessons
- `lessons-learned.md` - This file
