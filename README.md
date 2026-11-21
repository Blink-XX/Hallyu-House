# Hallyu House — Your Little Corner of Seoul

**Student:** Noor Fatima  
**Roll number:** 24I2012  
**Program:** BS Cyber Security  
**Course:** CS4032 — Web Programming  
**Assignment:** 02 — Fall 2026

Hallyu House is a fictional Korean pop-culture lifestyle shop for K-pop fans and K-drama lovers. It offers original fan-inspired stationery, collecting accessories, gift bundles and watch-party kits. All products, inventory, checkout and orders are demonstration data. No real payment or order processing occurs.

## Features
- React single-page application with React Router routes: `/`, `/shop`, `/product/:id`, `/bag`, `/checkout`, `/confirmation`, `/wishlist`.
- 12 locally defined products with stable IDs.
- Search across product name, description and category; category and collection filters; price/name sorting.
- Product details with stock information and add-to-bag actions.
- Shared cart and wishlist state; cart and wishlist persist in localStorage.
- Controlled checkout form with name, email, Pakistani mobile number, city and address validation.
- Calculated subtotal, delivery fee and total.
- Three operating rules: product quantity/stock limits, free delivery threshold, and supported delivery-city selection.
- Loading/error/empty and invalid-route states: this small assignment dataset is local; a simulated async loader and explicit demo controls are described in limitations and can be extended in a later iteration.
- Responsive layout, semantic controls, labels, keyboard-operable buttons and visible browser focus.

## Business rules
1. **Availability/capacity:** A customer may order 1–5 units of a product and cannot exceed current stock. The limit is explained on product detail pages and enforced by cart actions. Boundary: exactly 5 units is accepted when stock allows; 6 is rejected.
2. **Pricing/fulfilment:** Delivery costs Rs. 250 when subtotal is below Rs. 5,000; delivery is free at or above Rs. 5,000. The threshold is shown in the announcement and bag summary. Boundary: Rs. 5,000 receives free delivery.
3. **Eligibility/compatibility:** Delivery city must be selected from Islamabad, Rawalpindi, Lahore, Karachi or Other. Checkout requires a city selection; the list is shown in the form. Boundary: a blank city is rejected.

## Setup
Requires Node.js 18 or later.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build and test
```bash
npm run build
npm test
```

## Deployment
The app can be deployed to Netlify, Vercel or GitHub Pages-compatible hosting. For Netlify, the included `public/_redirects` file supports SPA route fallback. Build command: `npm run build`; publish directory: `dist`.

Add your public GitHub repository and deployed website URLs here after deployment.

## Main routes
| Route | Purpose |
|---|---|
| `/` | Brand landing page and featured products |
| `/shop` | Search, filter, sort and browse |
| `/product/:id` | Product details and availability |
| `/bag` | Edit cart quantities and view calculated summary |
| `/checkout` | Validated simulated order form |
| `/confirmation` | Final simulated order result |
| `/wishlist` | Saved products |

## Edge-case reproduction
- Search for a term with no matches to view the empty-results state; use Clear filters to recover.
- Open `/product/not-a-real-id` to view invalid product feedback.
- Try to add an out-of-stock product (Bias Day Acrylic Keychain) to the bag.
- Increase a product quantity above 5 or above stock.
- Submit checkout with empty/invalid fields to see specific validation messages.
- Add products worth less than Rs. 5,000 and then reach Rs. 5,000 to test the delivery boundary.
- Refresh the browser after adding products to verify localStorage persistence.

## Automated rule test
The test file `src/utils/businessRules.test.js` uses Node's built-in `node:test` and `node:assert/strict` modules. Run with `npm test` or `node --test`.

## Concept map
| Concept | File | Component/function |
|---|---|---|
| Component composition / JSX | `src/App.jsx` | `Home`, `Shop`, `ProductCard`, `Bag` |
| Props and callback props | `src/App.jsx` | `ProductCard`, `add`, `change` |
| React state | `src/App.jsx` | `App`, `Shop`, `Checkout` |
| Effects and persistence | `src/App.jsx` | cart/wishlist `useEffect` |
| Derived values | `src/App.jsx` | `cartItems`, `subtotal`, `delivery` |
| Array methods and immutable updates | `src/App.jsx` | filtering, mapping, spread updates |
| Routing and URL parameters | `src/App.jsx` | `Routes`, `useParams`, `Link` |
| Business rules | `src/utils/businessRules.js` | `validateQuantity`, `calculateDelivery`, `validateOrder` |
| Automated tests | `src/utils/businessRules.test.js` | `node:test` cases |
| Local product data | `src/data/products.js` | `products` |

## Known limitations
- This is a frontend-only educational simulation. No backend, real inventory service, authentication, payment gateway, email or order database is connected.
- Product imagery is loaded from external Unsplash URLs and therefore requires an internet connection. Replace imagery with locally licensed assets if offline use is required.
- The async mock loader, forced loading-failure demonstration control, changed-availability recovery workflow, and automated end-to-end/browser accessibility tests remain to be completed before claiming full compliance with every functional requirement.
- The city list is a demonstration list, not a live courier coverage checker.
- Order confirmation is stored temporarily in sessionStorage for demonstration.

## Academic integrity and verification
Review, run, test and understand the application before submission. The student should personally verify all routes, business rules, screenshots, build and test results, add the real GitHub/deployment URLs and final commit hash, and explain the code in the individual viva.

## Final environment verification note
The source preparation environment could not resolve `registry.npmjs.org`; therefore `package-lock.json` and a production build could not be generated/verified here. Follow `PRE_SUBMISSION_CHECKLIST.md`: run `npm install` in a network-connected environment, retain the generated lockfile, run the production build, and complete browser/GitHub/deployment verification before submission.
