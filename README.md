# NoChic

Homepage for NoChic, a premium brand for men's hair and beard grooming. It's a static site with no build step: `index.html`, `css/styles.css` and `js/main.js`.

```bash
npx serve .        # or: python3 -m http.server
```

## Motion

GSAP 3.12.5 with ScrollTrigger, and Lenis 1.1.13 for smooth scrolling, all loaded from a CDN. The scroll moments are:

- **Hero:** the framed photo opens to full width.
- **Assortiment:** a horizontal product track, pinned on desktop and swipeable on mobile.
- **Story:** the statement fills in word by word, and the main image is revealed with a clip.
- **Face & Beard Oil:** a pinned campaign poster that assembles as you scroll.
- **Closing:** an image window that opens up.

The magnetic buttons and the "Bekijk" cursor only switch on for a mouse or trackpad. With `prefers-reduced-motion`, or if a script fails to load, everything appears statically and stays usable.

## Assets

`assets/images/` currently holds **placeholder images**: rendered illustrations in the brand style, not real photography. Replace them with the real photos from Figma under the same file names, and the site picks them up automatically. The logo isn't included yet. Until `assets/logo.svg` exists, a dashed frame shows in its place.

| File | Where it's used | Notes |
| --- | --- | --- |
| `assets/logo.svg` | Header, footer | The original logo, unchanged. SVG is best. For a PNG, change the two `src` attributes in `index.html`. |
| `assets/images/hero.jpg` | Hero | Full product line-up on wood. Landscape, at least 2400px wide. Keep the products on the right half, because the text sits on the left. |
| `assets/images/product-hybrid-pomade.jpg` | Product grid | Packshot on a sand background, 4:5 |
| `assets/images/product-slick-pomade.jpg` | Product grid | 4:5 |
| `assets/images/product-xplosive-curls.jpg` | Product grid | 4:5 |
| `assets/images/product-face-beard-oil.jpg` | Product grid | 4:5 |
| `assets/images/product-*-alt.jpg` | Product grid, on hover | Optional second image (texture, open jar or product in use) that wipes in from below on hover. If the file is missing, the image just zooms slightly. |
| `assets/images/story-hybrid-pomade.jpg` | Brand story, large image | 4:5 |
| `assets/images/story-detail.jpg` | Brand story, small image | 4:5, a detail or close-up. It overlaps the large image. |
| `assets/images/face-beard-oil-cutout.png` | Face & Beard Oil campaign | **Transparent PNG** of the bottle with its pipette, portrait. It sits in front of the large type. |
| `assets/images/closing-workshop.jpg` | "Inspired by nature" banner | Landscape, at least 2400px wide |

## Content still to fill in

- Prices: every price shows `€ [prijs]`, as in the design.
- Reviews: there's one placeholder review from the design. Add real reviews as extra `<li>` items. The arrow navigation appears automatically once there's more than one.
- Links: most links point to `#` until the product pages, blog and so on exist.
