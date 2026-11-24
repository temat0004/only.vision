import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Footer, Header } from './components/Layout'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Checkout from './pages/Checkout'
import Track, { OrderDone } from './pages/Track'
import Admin from './pages/admin/Admin'
import { Page } from './components/ui'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <Page><div className="center">
      <h1 className="h1">404</h1>
      <p className="lead">Такой страницы нет.</p>
      <Link className="btn btn-light" to="/">На главную</Link>
    </div></Page>
  )
}

export default function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) return <Admin />

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Header />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:number" element={<OrderDone />} />
          <Route path="/track" element={<Track />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <Footer />
      <CartDrawer />
    </>
  )
}
