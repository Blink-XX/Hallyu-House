export const MAX_UNITS_PER_PRODUCT = 5
export const FREE_DELIVERY_THRESHOLD = 5000
export const DELIVERY_FEE = 250

export function validateQuantity(quantity, stock) {
  if (!Number.isInteger(quantity) || quantity < 1) return { valid: false, message: 'Choose at least 1 item.' }
  if (quantity > MAX_UNITS_PER_PRODUCT) return { valid: false, message: `You can order up to ${MAX_UNITS_PER_PRODUCT} units of one product.` }
  if (quantity > stock) return { valid: false, message: `Only ${stock} item(s) are currently available.` }
  return { valid: true, message: '' }
}

export function calculateDelivery(subtotal) {
  return subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
}

export function validateOrder({ name, email, phone, city, cart }) {
  const errors = {}
  if (!name.trim() || name.trim().length < 2) errors.name = 'Enter your name (at least 2 characters).'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
  if (!/^03\d{9}$/.test(phone.replace(/[\s-]/g, ''))) errors.phone = 'Use a Pakistani mobile number, e.g. 03XXXXXXXXX.'
  if (!['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Other'].includes(city)) errors.city = 'Choose one of the available delivery cities.'
  if (!cart.length) errors.cart = 'Your bag is empty.'
  return errors
}

// Re-check persisted selections against the latest catalogue before displaying or submitting them.
export function reconcileCart(savedCart, catalogue) {
  const nextCart = {}
  const conflicts = []
  for (const [id, savedQuantity] of Object.entries(savedCart || {})) {
    const product = catalogue.find(item => item.id === id)
    if (!product) {
      conflicts.push({ id, reason: 'This product is no longer in the catalogue.', previousQuantity: savedQuantity })
      continue
    }
    if (!Number.isInteger(savedQuantity) || savedQuantity < 1) {
      conflicts.push({ id, name: product.name, reason: 'The saved quantity was invalid.', previousQuantity: savedQuantity })
      continue
    }
    const allowed = Math.min(savedQuantity, MAX_UNITS_PER_PRODUCT, product.stock)
    if (allowed > 0) nextCart[id] = allowed
    if (allowed !== savedQuantity) {
      conflicts.push({ id, name: product.name, reason: allowed === 0 ? 'This item is now unavailable and was removed from your bag.' : `Quantity adjusted from ${savedQuantity} to ${allowed} to match current availability.`, previousQuantity: savedQuantity, currentQuantity: allowed })
    }
  }
  return { cart: nextCart, conflicts }
}
