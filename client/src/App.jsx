import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Loading from './components/ui/Loading';

// Import Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import PostPet from './pages/PostPet';
import AdminDashboard from './pages/AdminDashboard';
import PetDetails from './pages/PetDetails';
import Profile from './pages/Profile';
import EditPet from './pages/EditPet';
import Favorites from './pages/Favorites';

// Protected Route Component
const ProtectedRoute = ({ element, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && role !== 'admin') return <Navigate to="/" replace />;

  return element;
};

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Navbar />
              <main className="pb-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/pets/:id" element={<PetDetails />} />
                  <Route 
                    path="/post-pet" 
                    element={<ProtectedRoute element={<PostPet />} />} 
                  />
                  <Route 
                    path="/profile" 
                    element={<ProtectedRoute element={<Profile />} />} 
                  />
                  <Route 
                    path="/favorites" 
                    element={<ProtectedRoute element={<Favorites />} />} 
                  />
                  <Route 
                    path="/edit-pet/:id" 
                    element={<ProtectedRoute element={<EditPet />} />} 
                  />
                  <Route 
                    path="/admin" 
                    element={<ProtectedRoute adminOnly={true} element={<AdminDashboard />} />} 
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              
              {/* Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg, #fff)',
                    color: 'var(--toast-color, #000)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
