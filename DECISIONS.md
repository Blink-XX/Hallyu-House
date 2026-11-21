# Frontend Decisions — Hallyu House

## Decision 1 — Keep selected items visible across browsing
- **Problem:** In shopping flows, changing filters or navigating between product and bag pages can make customers lose track of their selections.
- **Decision:** Keep cart and wishlist state at the application root and persist them in localStorage. Product cards and detail pages receive callbacks to update shared state.
- **Alternative:** Keep cart state inside the shop page only.
- **Reason:** Customers can browse multiple routes without losing their selections; the bag count stays consistent.
- **Tradeoff:** Root-level state and persistence require careful updates when product inventory changes.
- **Code location:** `src/App.jsx` — `App`, `add`, `change`, `toggleWish`; `useEffect` persistence.
- **Evidence:** [Insert screenshot: add product, navigate to bag, refresh, and show retained selection.]

## Decision 2 — Put delivery threshold beside the order total
- **Problem:** A customer may discover delivery charges too late in checkout and abandon the order.
- **Decision:** Show the Rs. 5,000 free-delivery threshold in the announcement and dynamically show the remaining amount in the bag summary.
- **Alternative:** Show the delivery fee only on the checkout page.
- **Reason:** The customer can understand the fulfilment cost while changing the bag.
- **Tradeoff:** Repeating the threshold in more than one place requires consistent wording.
- **Code location:** `src/utils/businessRules.js` — `calculateDelivery`; `src/App.jsx` — `Bag`.
- **Evidence:** [Insert screenshot: subtotal below threshold and at/above threshold.]

## Decision 3 — Use editorial hierarchy with responsive product cards
- **Problem:** Dense product listings can make product names, categories and prices difficult to scan, especially on narrow screens.
- **Decision:** Use a consistent image, category, product-name and price hierarchy; collapse the four-column desktop grid to two columns on mobile.
- **Alternative:** Use a compact text-heavy list layout.
- **Reason:** Product imagery supports discovery while key information remains grouped and readable.
- **Tradeoff:** Image-led cards occupy more vertical space and depend on image availability.
- **Code location:** `src/styles.css` — `.product-grid`, `.product-card`, responsive media queries.
- **Evidence:** [Insert desktop and 390px mobile screenshots.]
