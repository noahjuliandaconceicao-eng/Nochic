# NoChic

Website for NoChic, a premium brand for men's hair and beard grooming. It's a static site with no build step. Every page is its own HTML file, so a change to the header or footer has to be made in each file.

| Path | What it is |
| --- | --- |
| `index.html` | Homepage with the scroll animations (`css/styles.css`, `js/main.js`) |
| `*.html`, `producten/`, `blog/` | All other pages, which also load `css/pages.css` and `js/pages.js` |
| `js/products.js` | Product list, prices and search index |

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

`assets/images/` holds web-optimised versions of the photos in `foto's/`. To change an image, replace it under the same file name and the site picks it up automatically. Keep the original photos out of the published site, because they're around 33 MB.

| File | Where it's used | Notes |
| --- | --- | --- |
| `assets/logo.png` | Header, footer | Transparent PNG, trimmed to the logo's edges. |
| `assets/RoyalSignage-Rg.otf` | Large headings | Licensed font. Check that the licence covers use on a website. |
| `assets/images/producten_bg2.png` | Hero | Full product line-up on wood. Landscape, at least 2400px wide. Keep the products on the right half, because the text sits on the left. |
| `assets/images/product-hybrid-pomade.jpg` | Product grid | Packshot on a sand background, 4:5 |
| `assets/images/product-slick-pomade.jpg` | Product grid | 4:5 |
| `assets/images/product-xplosive-curls.jpg` | Product grid | 4:5 |
| `assets/images/product-face-beard-oil.jpg` | Product grid | 4:5 |
| `assets/images/product-dirty-dust.jpg` | Product grid | 4:5 |
| `assets/images/product-heavy-duty-clay-wax.jpg` | Product grid | 4:5 |
| `assets/images/product-*-alt.jpg` | Product grid, on hover | Optional second image (texture, open jar or product in use) that wipes in from below on hover. If the file is missing, the image just zooms slightly. |
| `assets/images/story-hybrid-pomade.jpg` | Brand story, large image | 4:5 |
| `assets/images/story-detail.jpg` | Brand story, small image | 4:5, a detail or close-up. It overlaps the large image. |
| `assets/images/face-beard-oil-cutout.png` | Face & Beard Oil campaign | **Transparent PNG** of the bottle with its pipette, portrait. It sits in front of the large type. |
| `assets/images/closing-workshop.jpg` | "Inspired by nature" banner | Landscape, at least 2400px wide |

## Content still to fill in

- Prices: every price shows `€ [prijs]` until you set it in `js/products.js`. Replace `null` with a number and it appears on every page and in the cart total.
- Other details in square brackets: search the HTML files for `[` to find company details, contact details, delivery times, costs and ingredients.
- Legal pages: `algemene-voorwaarden.html` and `privacy.html` are drafts and need a legal check.
- No backend yet: checkout, login, the contact form, order tracking and the newsletter don't send anything. The cart is saved in the visitor's browser.
- Contents: Dirty Dust and Heavy Duty Clay Wax show `[inhoud]` until their sizes are known.
- Reviews: there's one placeholder review from the design. Add real reviews as extra `<li>` items. The arrow navigation appears automatically once there's more than one.