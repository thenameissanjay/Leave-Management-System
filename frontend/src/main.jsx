import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { AuthProvider } from './Context/AuthContext';

createRoot(document.getElementById('root')).render(
  
  <AuthProvider>
     <App />
  </AuthProvider>

)
