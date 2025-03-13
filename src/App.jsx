import HomePage from './components/HomePage'
import SignUp from './components/Auth/SignUp';
import Login from './components/Auth/Login';
import WelcomePage from './components/Auth/WelcomePage';
import EmailConfirmation from './components/Auth/EmailConfirmation';
import { AuthProvider, ProtectedRoute } from './components/Auth/AuthProvider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ManageProfile from './components/Account/ManageProfile';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<WelcomePage />}/>
          <Route path='/signup' element={<SignUp />}/>
          <Route path='/login' element={<Login />}/>
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          
          {/* Protected routes */}
          <Route path="/chat" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }/>
          <Route path='/account' element={
            <ProtectedRoute>
              <ManageProfile />
            </ProtectedRoute>
          }/>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App