import test from 'node:test'
import assert from 'node:assert/strict'
import { validateQuantity, calculateDelivery, reconcileCart, validateOrder } from './businessRules.js'

 test('quantity rule accepts an ordinary valid quantity', () => {
  assert.equal(validateQuantity(2, 8).valid, true)
})
test('quantity rule accepts exactly the maximum limit', () => {
  assert.equal(validateQuantity(5, 8).valid, true)
})
test('quantity rule rejects a quantity above the maximum limit', () => {
  assert.equal(validateQuantity(6, 8).valid, false)
})
test('quantity rule rejects a quantity above available stock', () => {
  assert.equal(validateQuantity(3, 2).valid, false)
})
test('delivery is free at exactly Rs. 5,000', () => {
  assert.equal(calculateDelivery(5000), 0)
})
test('delivery fee applies below Rs. 5,000', () => {
  assert.equal(calculateDelivery(4999), 250)
})
test('restored cart is reduced when current stock is lower', () => {
  const result = reconcileCart({ hh01: 4 }, [{ id: 'hh01', name: 'Binder', stock: 2 }])
  assert.deepEqual(result.cart, { hh01: 2 })
  assert.equal(result.conflicts.length, 1)
})
test('restored unavailable and removed products are flagged and removed', () => {
  const result = reconcileCart({ hh01: 2, old: 1 }, [{ id: 'hh01', name: 'Binder', stock: 0 }])
  assert.deepEqual(result.cart, {})
  assert.equal(result.conflicts.length, 2)
})
test('checkout rejects a city outside the supported list', () => {
  const errors = validateOrder({ name: 'Noor', email: 'n@example.com', phone: '03001234567', city: 'Mars', cart: [{}] })
  assert.ok(errors.city)
})
