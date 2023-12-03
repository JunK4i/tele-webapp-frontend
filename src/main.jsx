import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { TelegramProvider  } from './TelegramProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TelegramProvider>
      <App />
    </TelegramProvider>
  </React.StrictMode>,
)
