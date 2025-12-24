---
description: Generate game assets (sprites, icons, images, audio) using AI
---

# /assets - Asset Generation

**Trigger:** "generate", "sprite", "icon", "image", "audio", "asset"

## Step 1: Asset Specification
Before generating, define:
1. **Type:** sprite | icon | background | audio
2. **Style:** pixel art | kawaii | realistic | etc.
3. **Dimensions:** 64x64 | 128x128 | 256x256 | 16:9
4. **Output Path:** `public/assets/` or `src/assets/`

## Step 2: Generation Method

### For Icons/Sprites (Recommended: generate_image tool)
Use the built-in `generate_image` tool with a detailed prompt:
```
[SIZE]px game [TYPE], [STYLE DESCRIPTION], transparent background, 
centered composition, vibrant colors
```

### For Complex Assets (Vertex AI)
If using external generation scripts:
```bash
node scripts/generate-media.js [asset_id]
```

## Step 3: Optimization (CRITICAL)
Raw AI output is often 1MB+. **Must optimize before use.**

Recommended pipeline:
1. Generate at high resolution (512x512+)
2. Resize to target dimensions
3. Convert to WebP for 95%+ size reduction
4. Target sizes:
   - Icons: 3-5KB
   - Sprites: 10-20KB
   - Backgrounds: 50-100KB

## Step 4: Integration
1. Save to appropriate directory:
   - Static assets: `public/assets/`
   - Imported assets: `src/assets/`
2. Update imports in consuming components
3. Verify asset loads correctly in browser

## Step 5: Asset Inventory
Add to asset manifest or documentation:
```markdown
| Asset Name | Path | Size | Purpose |
|------------|------|------|---------|
| boss_sprite | public/assets/boss.webp | 15KB | Boss entity |
```

---

## Best Practices
- **Power of Two:** Use dimensions like 64, 128, 256 for textures
- **Transparent Backgrounds:** Always request for sprites
- **Consistent Style:** Match existing game aesthetic
- **WebP Format:** Use for all production assets
