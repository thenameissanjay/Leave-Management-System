import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { AuthProvider } from './Context/AuthContext';
import { ToastProvider } from "./employee/ui/ToastContainer.jsx";

createRoot(document.getElementById('root')).render(
  
  <AuthProvider>
  <ToastProvider>
    <App />
  </ToastProvider>
  </AuthProvider>

)
