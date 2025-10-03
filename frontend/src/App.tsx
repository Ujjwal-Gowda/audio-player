import './App.css'
import Login from './pages/loginpage'
import Dashboard from './pages/dashboard'
import ProtectedRoute from './component/protectedRoute'
import { AuthProvider } from './context/authcontext'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import Signup from './pages/signuppage'

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
