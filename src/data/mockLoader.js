import { products } from './products'

// Local asynchronous mock API: intentionally delayed to make loading states visible.
export function loadProducts({ shouldFail = false, delay = 450 } = {}) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (shouldFail) {
        reject(new Error('The Hallyu House catalogue could not be loaded. Please try again.'))
        return
      }
      resolve(products.map(product => ({ ...product })))
    }, delay)
  })
}
