import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { CartProvider } from './store/cart'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <CartProvider>
          <App />
        </CartProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)
