# Zerror Studios

Creative site for Zerror Studios, built with Next.js (JSX), Three.js, React Three Fiber, GSAP, Lenis and hand-written GLSL.

```bash
npm run dev     # http://localhost:3000
npm run build   # production build (webpack, so the GLSL loaders apply)
```

## How it fits together

- **One fixed WebGL canvas** (`src/components/gl/Scene.jsx`) sits behind the DOM. Camera units equal CSS pixels, so planes line up with DOM rects.
- **Surfaces** (`Surface.jsx`, `shaders/surface.frag`): every `[data-theme]` section (`blue`, `dark`, `light`) is painted by the shader. Seams break into pixels that scatter with scroll speed, and the cursor leaves a pixel trail (ping-pong render target, `trail.frag`).
- **Pixel logo** (`PixelLogo.jsx`, `pixelLogo.vert`): the wordmark is sampled into instanced squares. They assemble after the preloader, react to the cursor, glitch, and scatter on scroll. Used in the hero and footer.
- **Media planes** (`MediaLayer.jsx`, `media.frag`): `<GLImage>` registers a DOM slot; WebGL mirrors it with a pixel reveal, a hover pixel lens and velocity bend. The `<img>` stays for SEO and the no-WebGL fallback.
- **Service previews** (`ServicePreview.jsx`, `preview.frag`): four procedural pixel patterns follow the cursor over the services list.
- **Motion**: Lenis smooth scroll on GSAP's ticker; ScrollTrigger + CSS `position: sticky` for the manifesto, horizontal work track, Zcom scene and stacked process cards; SplitText and ScrambleText for type.

Content lives in `src/data/content.js`. Case-study images and client logos in `public/images` were taken from the Zerror business deck.

## Brand fonts

The brand uses Alt Riviera (display) and Roc Grotesk (UI). They are licensed, so the site falls back to Inter Tight and Archivo from Google Fonts. Install the brand fonts locally, or add `@font-face` rules for them, and they take over automatically through the font stacks in `src/app/globals.css`.
