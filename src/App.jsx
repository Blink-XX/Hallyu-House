import { useCallback, useEffect, useMemo, useState } from 'react'
import { Routes, Route, Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { ShoppingBag, Search, Heart, ArrowRight, ArrowLeft, Sparkles, Menu, X, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react'
import { loadProducts } from './data/mockLoader'
import { validateQuantity, calculateDelivery, validateOrder, reconcileCart, FREE_DELIVERY_THRESHOLD } from './utils/businessRules'

const money = value => `Rs. ${Number(value).toLocaleString('en-PK')}`
const readStorage = (key, fallback) => {
  try { const value = JSON.parse(window.localStorage.getItem(key) || 'null'); return value ?? fallback }
  catch { return fallback }
}

function App() {
  const [catalogue, setCatalogue] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [cart, setCart] = useState(() => readStorage('hallyu-cart', {}))
  const [wishlist, setWishlist] = useState(() => readStorage('hallyu-wishlist', []))
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [cartConflicts, setCartConflicts] = useState([])
  const [demoStockChanged, setDemoStockChanged] = useState(false)

  const loadCatalogue = useCallback(async (shouldFail = false) => {
    setLoadState('loading'); setLoadError('')
    try {
      const records = await loadProducts({ shouldFail })
      setCatalogue(records)
      const reconciled = reconcileCart(readStorage('hallyu-cart', {}), records)
      setCart(reconciled.cart)
      setCartConflicts(reconciled.conflicts)
      setLoadState('ready')
    } catch (error) {
      setLoadError(error.message || 'Something went wrong while loading the catalogue.')
      setLoadState('error')
    }
  }, [])

  useEffect(() => { loadCatalogue() }, [loadCatalogue])
  useEffect(() => {
    if (loadState === 'ready') {
      try { window.localStorage.setItem('hallyu-cart', JSON.stringify(cart)) } catch { setNotice('Browser storage is unavailable; your bag may not persist after refresh.') }
    }
  }, [cart, loadState])
  useEffect(() => {
    try { window.localStorage.setItem('hallyu-wishlist', JSON.stringify(wishlist)) } catch { /* storage is optional */ }
  }, [wishlist])

  const cartItems = useMemo(() => Object.entries(cart).map(([id, qty]) => ({ product: catalogue.find(item => item.id === id), qty })).filter(item => item.product), [cart, catalogue])
  const count = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0)
  const delivery = calculateDelivery(subtotal)

  const add = (id, quantity = 1) => {
    const product = catalogue.find(item => item.id === id)
    const result = validateQuantity((cart[id] || 0) + quantity, product?.stock ?? 0)
    if (!product || !result.valid) { setNotice(result.message || 'This item is unavailable.'); return false }
    setCart(previous => ({ ...previous, [id]: (previous[id] || 0) + quantity }))
    setNotice('Added to your bag ✨'); return true
  }
  const change = (id, quantity) => {
    const product = catalogue.find(item => item.id === id)
    if (quantity <= 0) { setCart(previous => { const next = { ...previous }; delete next[id]; return next }); return }
    const result = validateQuantity(quantity, product?.stock ?? 0)
    if (!result.valid) { setNotice(result.message); return }
    setCart(previous => ({ ...previous, [id]: quantity }))
  }
  const toggleWish = id => setWishlist(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id])

  const simulateAvailability = unavailable => {
    const targetId = 'hh01'
    const updated = catalogue.map(item => item.id === targetId ? { ...item, stock: unavailable ? 0 : 12 } : item)
    setCatalogue(updated); setDemoStockChanged(unavailable)
    const reconciled = reconcileCart(cart, updated)
    setCart(reconciled.cart)
    if (reconciled.conflicts.length) {
      setCartConflicts(reconciled.conflicts)
      setNotice(unavailable ? 'Availability changed. Your saved bag was checked and adjusted.' : 'Demo stock restored. Add the item again if you removed it.')
    } else setNotice(unavailable ? 'Demo stock is now zero for the Photocard Binder.' : 'Photocard Binder demo stock restored to 12.')
  }

  if (loadState !== 'ready') return <div className="app-shell load-screen"><div className="brand"><span className="brand-mark">ㅎ</span><span>HALLYU HOUSE<small>YOUR LITTLE CORNER OF SEOUL</small></span></div>{loadState === 'loading' ? <div className="empty-state"><RefreshCw className="spin"/><h1>Setting the scene...</h1><p>Our little Seoul shelf is getting ready.</p></div> : <div className="empty-state load-error"><AlertTriangle/><h1>We couldn't load the collection.</h1><p>{loadError}</p><button className="button button-dark" onClick={() => loadCatalogue(false)}>Retry loading <RefreshCw size={16}/></button></div>}</div>

  return <div className="app-shell">
    <div className="announcement">A LITTLE SEOUL MAGIC, DELIVERED TO YOUR DOOR <span>✦</span> Free delivery at Rs. 5,000 and above</div>
    <header className="site-header">
      <button className="icon-btn mobile-menu" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X/> : <Menu/>}</button>
      <Link to="/" className="brand"><span className="brand-mark">ㅎ</span><span>HALLYU HOUSE<small>YOUR LITTLE CORNER OF SEOUL</small></span></Link>
      <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
        <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink><NavLink to="/shop" onClick={() => setMenuOpen(false)}>The Shop</NavLink><Link to="/#story" onClick={() => setMenuOpen(false)}>Our Story</Link>
      </nav>
      <div className="header-actions"><Link to="/wishlist" className="icon-btn" aria-label={`Wishlist, ${wishlist.length} saved`}><Heart/><span className="tiny-count">{wishlist.length}</span></Link><Link to="/bag" className="bag-link"><ShoppingBag size={19}/><span>My bag</span><b>{count}</b></Link></div>
    </header>

    <details className="demo-panel"><summary>Assignment demo controls <span>· testing only</span></summary><div className="demo-controls"><div><strong>Loading failure</strong><p>Trigger a simulated catalogue failure, then use Retry on the error screen.</p><button className="small-demo-button" onClick={() => loadCatalogue(true)}>Simulate loading failure</button></div><div><strong>Changed availability</strong><p>Test recovery when a product already saved in the bag becomes unavailable.</p>{demoStockChanged ? <button className="small-demo-button" onClick={() => simulateAvailability(false)}>Restore Photocard Binder stock</button> : <button className="small-demo-button" onClick={() => simulateAvailability(true)}>Set Photocard Binder stock to 0</button>}</div></div></details>

    {notice && <button className="toast" onClick={() => setNotice('')} aria-label="Dismiss notification">{notice} <X size={14}/></button>}
    {cartConflicts.length > 0 && <div className="conflict-banner" role="status"><AlertTriangle size={18}/><div><strong>Your saved bag needed an update.</strong>{cartConflicts.map((item, index) => <p key={`${item.id}-${index}`}>{item.name || item.id}: {item.reason}</p>)}</div><button onClick={() => setCartConflicts([])} aria-label="Dismiss availability notice"><X size={16}/></button></div>}

    <Routes>
      <Route path="/" element={<Home add={add} catalogue={catalogue}/>}/>
      <Route path="/shop" element={<Shop catalogue={catalogue} add={add} wishlist={wishlist} toggleWish={toggleWish}/>}/>
      <Route path="/product/:id" element={<ProductDetail catalogue={catalogue} add={add} wishlist={wishlist} toggleWish={toggleWish}/>}/>
      <Route path="/bag" element={<Bag items={cartItems} change={change} subtotal={subtotal} delivery={delivery} count={count}/>}/>
      <Route path="/checkout" element={<Checkout items={cartItems} subtotal={subtotal} delivery={delivery} clear={() => setCart({})}/>}/>
      <Route path="/confirmation" element={<Confirmation/>}/>
      <Route path="/wishlist" element={<Wishlist catalogue={catalogue} wishlist={wishlist} toggleWish={toggleWish} add={add}/>}/>
      <Route path="*" element={<NotFound/>}/>
    </Routes>
    <Footer/>
  </div>
}

function ProductImage({ product, className = '' }) {
  return <img className={className} src={product.image} alt={product.name} loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/product-placeholder.svg' }}/> 
}
function Home({ add, catalogue }) {
  return <><section className="hero"><div className="hero-image"/><div className="hero-content"><p className="eyebrow light">A LITTLE ESCAPE TO SEOUL</p><h1>For the stories<br/>we <em>fall</em> for.</h1><p className="hero-copy">Tiny treasures for your K-pop heart, your K-drama nights and every little moment in between.</p><Link to="/shop" className="button button-light">Explore the collection <ArrowRight size={17}/></Link><div className="hero-note">CURATED WITH LOVE · PACKED IN PAKISTAN</div></div><div className="hero-stamp">SEOUL<br/><span>♡</span><br/>MOOD</div></section>
  <section className="intro section-wrap" id="story"><p className="eyebrow">ANNYEONG, FRIEND</p><h2>Your fandom, your little world.</h2><p>From collector essentials to cozy drama-night rituals, Hallyu House brings a thoughtful piece of Korean pop-culture joy into your everyday.</p></section>
  <section className="feature-grid section-wrap"><div className="feature-card feature-dark"><span>01 / THE COLLECTOR EDIT</span><h3>Keep your<br/>favourites close.</h3><Link to="/shop">Shop collecting <ArrowRight size={15}/></Link></div><div className="feature-card feature-pink"><span>02 / THE COZY EDIT</span><h3>One more episode.<br/>Always.</h3><Link to="/shop">Shop K-drama mood <ArrowRight size={15}/></Link></div></section>
  <section className="section-wrap product-section"><div className="section-heading"><div><p className="eyebrow">THE HOUSE PICKS</p><h2>Little things, big feelings.</h2></div><Link className="text-link" to="/shop">View all <ArrowRight size={16}/></Link></div><div className="product-grid">{catalogue.slice(0,4).map(product => <ProductCard key={product.id} p={product} add={add}/>)}</div></section>
  <section className="quote-band"><span>“</span><p>Some stories stay with us long after the credits roll.</p><small>— A NOTE FROM HALLYU HOUSE</small></section></>
}
function ProductCard({ p, add }) {
  return <article className="product-card"><Link to={`/product/${p.id}`} className="product-image-wrap"><ProductImage product={p}/><span className="product-tag">{p.tag}</span></Link><div className="product-info"><p>{p.category} · {p.type}</p><Link to={`/product/${p.id}`} className="product-name">{p.name}</Link><div className="product-bottom"><strong>{money(p.price)}</strong><button className="quick-add" onClick={() => add(p.id)} disabled={!p.stock} aria-label={`Add ${p.name} to bag`}>+</button></div></div></article>
}
function Shop({ catalogue, add, wishlist, toggleWish }) {
  const [query, setQuery] = useState(''), [category, setCategory] = useState('All'), [sort, setSort] = useState('featured'), [type, setType] = useState('All')
  const categories = ['All', ...new Set(catalogue.map(product => product.category))]
  const filtered = useMemo(() => catalogue.filter(product => (category === 'All' || product.category === category) && (type === 'All' || product.type === type) && (`${product.name} ${product.description} ${product.category} ${product.type} ${(product.searchTerms || []).join(' ')}`).toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : sort === 'name' ? a.name.localeCompare(b.name) : 0), [catalogue, query, category, type, sort])
  const reset = () => { setQuery(''); setCategory('All'); setType('All'); setSort('featured') }
  return <main className="page-wrap"><div className="page-title"><p className="eyebrow">THE HALLYU HOUSE EDIT</p><h1>Find your <em>little</em> something.</h1><p>Thoughtful finds for fans, collectors and story lovers.</p></div><div className="shop-toolbar"><label className="search-box"><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search in English or Korean..." aria-label="Search products"/></label><label className="visually-hidden" htmlFor="category-filter">Filter by category</label><select id="category-filter" value={category} onChange={event => setCategory(event.target.value)}>{categories.map(value => <option key={value}>{value}</option>)}</select><label className="visually-hidden" htmlFor="type-filter">Filter by collection</label><select id="type-filter" value={type} onChange={event => setType(event.target.value)}><option>All</option><option>K-pop</option><option>K-drama</option><option>Lifestyle</option></select><label className="visually-hidden" htmlFor="sort-products">Sort products</label><select id="sort-products" value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name: A to Z</option></select></div><p className="result-count" aria-live="polite">{filtered.length} little treasures found</p>{filtered.length ? <div className="product-grid">{filtered.map(product => <div className="shop-card-wrap" key={product.id}><ProductCard p={product} add={add}/><button className={wishlist.includes(product.id) ? 'wish-btn active' : 'wish-btn'} onClick={() => toggleWish(product.id)} aria-label={`${wishlist.includes(product.id) ? 'Remove' : 'Add'} ${product.name} ${wishlist.includes(product.id) ? 'from' : 'to'} wishlist`}><Heart size={17} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'}/></button></div>)}</div> : <div className="empty-state"><Sparkles/><h2>{catalogue.length ? 'No treasures found just yet.' : 'The shelves are empty.'}</h2><p>{catalogue.length ? 'Try another search or clear a filter to explore more.' : 'Please reload the collection in a moment.'}</p><button className="button button-dark" onClick={reset}>Clear search and filters</button></div>}</main>
}
function ProductDetail({ catalogue, add, wishlist, toggleWish }) {
  const { id } = useParams(), product = catalogue.find(item => item.id === id)
  if (!product) return <NotFound/>
  return <main className="page-wrap detail-page"><Link to="/shop" className="back-link"><ArrowLeft size={16}/> Back to the shop</Link><div className="detail-grid"><div className="detail-image"><ProductImage product={product}/></div><div className="detail-copy"><p className="eyebrow">{product.category} / {product.type}</p><span className="product-tag inline-tag">{product.tag}</span><h1>{product.name}</h1><div className="rating" aria-label={`${product.rating} out of 5`}>★★★★★ <span>{product.rating} / 5 · House favourite</span></div><h2 className="detail-price">{money(product.price)}</h2><p>{product.description}</p><p className={product.stock ? 'stock' : 'stock unavailable'}>{product.stock ? `${product.stock} available in this batch` : 'Currently out of stock'}</p><p className="rule-note">Limit: 1–5 units per product, subject to stock. Free delivery on orders of Rs. 5,000 or more.</p><button className="button button-dark" disabled={!product.stock} onClick={() => add(product.id)}>Add to my bag <ShoppingBag size={17}/></button><button className="text-link wishlist-detail" onClick={() => toggleWish(product.id)}><Heart size={16}/> {wishlist.includes(product.id) ? 'Saved to wishlist' : 'Save to wishlist'}</button><div className="detail-perks"><span>♡ Thoughtfully curated</span><span>✦ Simulated checkout for assignment demo</span></div></div></div></main>
}
function Bag({ items, change, subtotal, delivery, count }) {
  return <main className="page-wrap"><div className="page-title compact"><p className="eyebrow">YOUR LITTLE FINDS</p><h1>My <em>bag.</em></h1><p>{count} item(s) selected</p></div>{items.length ? <div className="bag-layout"><div className="bag-items">{items.map(({ product, qty }) => <div className="bag-item" key={product.id}><ProductImage product={product}/><div className="bag-item-info"><Link to={`/product/${product.id}`}>{product.name}</Link><small>{money(product.price)} each · {product.stock} currently available</small><div className="quantity"><button onClick={() => change(product.id, qty - 1)} aria-label={`Decrease ${product.name} quantity`}>−</button><span aria-live="polite">{qty}</span><button onClick={() => change(product.id, qty + 1)} aria-label={`Increase ${product.name} quantity`} disabled={qty >= product.stock || qty >= 5}>+</button></div></div><strong>{money(product.price * qty)}</strong><button className="remove-btn" onClick={() => change(product.id, 0)}>Remove</button></div>)}</div><aside className="summary-card"><h2>Order summary</h2><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Delivery</span><b>{delivery ? money(delivery) : 'Free'}</b></div><p className="delivery-hint">{subtotal >= FREE_DELIVERY_THRESHOLD ? 'You unlocked free delivery!' : `Add ${money(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery.`}</p><div className="summary-total"><span>Total</span><strong>{money(subtotal + delivery)}</strong></div><Link to="/checkout" className="button button-dark full">Continue to checkout <ArrowRight size={16}/></Link><Link to="/shop" className="continue-link">Continue browsing</Link></aside></div> : <div className="empty-state"><ShoppingBag/><h2>Your bag is waiting for a little magic.</h2><p>Explore the collection and find something that feels like you.</p><Link to="/shop" className="button button-dark">Explore the shop</Link></div>}</main>
}
function Checkout({ items, subtotal, delivery, clear }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: 'Islamabad', address: '', notes: '' })
  const [errors, setErrors] = useState({})
  const update = event => { const { name, value } = event.target; setForm(previous => ({ ...previous, [name]: value })); setErrors(previous => ({ ...previous, [name]: '' })) }
  const submit = event => {
    event.preventDefault()
    const nextErrors = validateOrder({ ...form, cart: items })
    if (!form.address.trim()) nextErrors.address = 'Enter your delivery address.'
    else if (form.address.trim().length < 8) nextErrors.address = 'Enter a little more detail (at least 8 characters).'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const order = { ref: `HH-${Date.now().toString().slice(-7)}`, form, items, subtotal, delivery, total: subtotal + delivery }
    try { window.sessionStorage.setItem('hallyu-order', JSON.stringify(order)) } catch { /* receipt remains a demo-only interaction */ }
    clear(); navigate('/confirmation')
  }
  return <main className="page-wrap"><div className="page-title compact"><p className="eyebrow">ALMOST YOURS</p><h1>Checkout, <em>lovely.</em></h1><p>This is a simulated order. No payment will be collected.</p></div>{items.length ? <div className="checkout-grid"><form className="checkout-form" onSubmit={submit} noValidate><h2>Delivery details</h2><Field label="Full name" name="name" value={form.name} update={update} error={errors.name} autoComplete="name"/><Field label="Email address" name="email" value={form.email} update={update} error={errors.email} type="email" autoComplete="email"/><Field label="Mobile number" name="phone" value={form.phone} update={update} error={errors.phone} placeholder="03XXXXXXXXX" autoComplete="tel"/><label className="field-label" htmlFor="delivery-city">City<select id="delivery-city" name="city" value={form.city} onChange={update}><option value="">Choose a city</option><option>Islamabad</option><option>Rawalpindi</option><option>Lahore</option><option>Karachi</option><option>Other</option></select>{errors.city && <small className="error">{errors.city}</small>}</label><Field label="Delivery address" name="address" value={form.address} update={update} error={errors.address} autoComplete="street-address"/><label className="field-label" htmlFor="order-notes">Order note (optional)<textarea id="order-notes" name="notes" value={form.notes} onChange={update} rows="3" placeholder="Any little note for our packing team?"/></label>{errors.cart && <p className="error" role="alert">{errors.cart}</p>}<button className="button button-dark full" type="submit">Place simulated order <ArrowRight size={16}/></button></form><aside className="summary-card"><h2>Your order</h2>{items.map(item => <div key={item.product.id}><span>{item.product.name} × {item.qty}</span><b>{money(item.product.price * item.qty)}</b></div>)}<div><span>Delivery</span><b>{delivery ? money(delivery) : 'Free'}</b></div><div className="summary-total"><span>Total</span><strong>{money(subtotal + delivery)}</strong></div><p className="delivery-hint">Demo only — no real payment or order processing.</p></aside></div> : <div className="empty-state"><h2>Your bag is empty.</h2><Link className="button button-dark" to="/shop">Return to the shop</Link></div>}</main>
}
function Field({ label, name, value, update, error, type = 'text', placeholder = '', autoComplete }) {
  const id = `field-${name}`
  return <label className="field-label" htmlFor={id}>{label}<input id={id} name={name} value={value} onChange={update} type={type} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}/>{error && <small id={`${id}-error`} className="error" role="alert">{error}</small>}</label>
}
function Confirmation() {
  const [order] = useState(() => { try { return JSON.parse(window.sessionStorage.getItem('hallyu-order') || 'null') } catch { return null } })
  return <main className="page-wrap"><div className="confirmation"><div className="success-icon"><CheckCircle2 size={38}/></div><p className="eyebrow">A LITTLE MOMENT TO REMEMBER</p><h1>It's a <em>date!</em></h1><p>Your simulated order has been received. Thank you for letting Hallyu House be part of your story.</p>{order && <div className="confirmation-receipt"><span>DEMO ORDER REFERENCE</span><strong>{order.ref}</strong><div><span>Order total</span><b>{money(order.total)}</b></div><div><span>Delivering to</span><b>{order.form.city}</b></div></div>}<Link to="/shop" className="button button-dark">Back to the collection</Link><p className="tiny-note">This confirmation is for demonstration only. No real order has been placed.</p></div></main>
}
function Wishlist({ catalogue, wishlist, toggleWish, add }) {
  const saved = catalogue.filter(product => wishlist.includes(product.id))
  return <main className="page-wrap"><div className="page-title compact"><p className="eyebrow">SAVED WITH LOVE</p><h1>Your <em>wishlist.</em></h1></div>{saved.length ? <div className="product-grid">{saved.map(product => <div key={product.id} className="shop-card-wrap"><ProductCard p={product} add={add}/><button className="wish-btn active" onClick={() => toggleWish(product.id)} aria-label={`Remove ${product.name} from wishlist`}><Heart fill="currentColor"/></button></div>)}</div> : <div className="empty-state"><Heart/><h2>Nothing saved just yet.</h2><p>Tap the heart on a product to keep it close.</p><Link to="/shop" className="button button-dark">Explore the shop</Link></div>}</main>
}
function NotFound() { return <main className="page-wrap empty-state"><p className="eyebrow">404 / LOST IN SEOUL?</p><h1>This page took a little detour.</h1><p>That page or product could not be found. Let's get you back to the collection.</p><Link to="/shop" className="button button-dark">Go to the shop</Link></main> }
function Footer() { return <footer className="footer"><div className="footer-brand"><span>ㅎ</span><div><strong>HALLYU HOUSE</strong><small>YOUR LITTLE CORNER OF SEOUL</small></div></div><p>For the stories we fall for, and the little things that make them ours.</p><div className="footer-bottom"><span>© 2026 Hallyu House · Fictional student project</span><span>Made with ♡ in Pakistan</span></div></footer> }
export default App
