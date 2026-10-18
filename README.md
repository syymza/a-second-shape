# A second shape

A quiet, browser-only study in sculpture and shadow. Turn an abstract object until an animal comes into the light. Slide the little dial beneath the scene to discover another sculpture; the collection loops in both directions.

## Interaction

- Drag the sculpture horizontally to rotate it through as many turns as you like in either direction. Release close to any equivalent alignment to settle gently into place.
- Slide the dial horizontally to change sculptures. Each deliberate step selects another; either direction wraps endlessly.
- Keyboard: focus the sculpture and use Left/Right to rotate, Home to reset, Escape to release. Focus the dial and use arrow keys to browse. Previous/next buttons are also available to assistive technology and appear on keyboard focus.

## Run locally

Requires Node.js 22 or later. All runtime assets are bundled; the artwork makes no external requests.

```sh
npm ci
npm run build
npm start
```

Open http://localhost:4176. Serve the built `dist/` at any path, including a GitHub Pages project subdirectory. No server application, API keys, accounts, analytics, or database is involved.

## Verify

```sh
npx playwright install --with-deps chromium
npm test
```

Tests check physical geometry, ray-cast silhouette coverage, browser interaction, unlimited rotation, circular navigation, interrupted gestures, canvas capture, reduced motion, resize, fallback, and a project subpath. Screenshots and results go to `test-results/`. Set `TEST_ENGINES=chromium,webkit` for an additional installed WebKit browser. `CHROME_CHANNEL=chrome` selects installed Chrome; otherwise Playwright Chromium is used.

The production build fingerprints the complete JavaScript dependency graph and stylesheet so a new page cannot reuse an incompatible older controller. Startup errors show a recovery message instead of a blank scene.

CI tests each pull request. Only a successful main-branch test run can deploy the allowlisted static build to GitHub Pages.

## Making the shadow

Ten original animal silhouettes are formed by thin connected curved shells and slender joins on a spindle. One spotlight projects actual geometry onto the wall; a fixed orthographic camera keeps the composition still. The shadow uses filtered WebGL shadow mapping, not an image mask or a painted reveal. The lamp remains fixed while the sculpture turns. Rendering stops after interaction settles, with capped resolution and reduced-motion support. Portrait framing protects a small margin around the lamp using CSS screen dimensions and aspect ratio; device pixel ratio changes render resolution without changing composition.

This beta is an artistic approximation, not a physically accurate simulation of light scattering. Some rotations can send part of a shadow beyond the frame. WebGL is required; a recovery message appears if it cannot start or the context is lost. Phone-sized browser emulation has been tested; physical phone performance remains to be verified.

## License

MIT. Three.js 0.180.0 is vendored under its MIT license in `vendor/THREE-LICENSE.txt`. Playwright is used only for development and testing.
