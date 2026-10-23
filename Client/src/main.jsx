import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setupFetchInterceptor } from "./utils/api";
import './index.css'
import App from './App.jsx'

setupFetchInterceptor();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
