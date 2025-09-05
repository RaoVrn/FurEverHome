import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, User, Users, PlusCircle, Settings, LogOut, Moon, Sun, Home, Star, HelpCircle, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Button from './ui/Button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const isActivePath = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Heart, publicOnly: true },
    { path: '/dashboard', label: 'Dashboard', icon: User, authRequired: true },
    { path: '/groups', label: 'Groups', icon: Users, authRequired: true },
    { path: '/favorites', label: 'Favorites', icon: Heart, authRequired: true },
    { path: '/post-pet', label: 'Post Pet', icon: PlusCircle, authRequired: true },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Settings }] : [])
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2">
              <div className="relative">
                <Heart className="h-8 w-8 text-primary-600 animate-pulse" />
                <Heart className="h-8 w-8 text-primary-500 absolute top-0 left-0 transform scale-90 opacity-50" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary-500 to-blue-600 bg-clip-text text-transparent">
                FurEverHome
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8 ml-10">
              {navLinks.map(({ path, label, icon: Icon, authRequired, publicOnly }) => {
                if (authRequired && !isAuthenticated) return null;
                if (publicOnly && isAuthenticated) return null;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActivePath(path)
                        ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              icon={isDark ? <Sun size={16} /> : <Moon size={16} />}
              className="p-2"
            />

            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2"
                >
                  <User size={16} />
                  <span className="text-sm">{user?.name}</span>
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <Home size={16} />
                        <span>Dashboard</span>
                      </div>
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <User size={16} />
                        <span>Profile</span>
                      </div>
                    </Link>
                    <Link
                      to="/favorites"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <Star size={16} />
                        <span>Favorites</span>
                      </div>
                    </Link>
                    <Link
                      to="/post-pet"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <PlusCircle size={16} />
                        <span>Post Pet</span>
                      </div>
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Add notification toggle logic here
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center space-x-2">
                        <Bell size={16} />
                        <span>Notifications</span>
                      </div>
                    </button>
                    <Link
                      to="/help"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <HelpCircle size={16} />
                        <span>Help & Support</span>
                      </div>
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                    <Link
                      to="/account-settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <Settings size={16} />
                        <span>Account Settings</span>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center space-x-2">
                        <LogOut size={16} />
                        <span>Logout</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              icon={isDark ? <Sun size={16} /> : <Moon size={16} />}
              className="p-2"
            />
            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              icon={isOpen ? <X size={20} /> : <Menu size={20} />}
              className="p-2"
            />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {navLinks.map(({ path, label, icon: Icon, authRequired, publicOnly }) => {
              if (authRequired && !isAuthenticated) return null;
              if (publicOnly && isAuthenticated) return null;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath(path)
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsOpen(false)}
                  >
                    <Home size={18} />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsOpen(false)}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsOpen(false)}
                  >
                    <Star size={18} />
                    <span>Favorites</span>
                  </Link>
                  <Link
                    to="/post-pet"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsOpen(false)}
                  >
                    <PlusCircle size={18} />
                    <span>Post Pet</span>
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      // Add notification toggle logic here
                    }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Bell size={18} />
                    <span>Notifications</span>
                  </button>
                  <Link
                    to="/help"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsOpen(false)}
                  >
                    <HelpCircle size={18} />
                    <span>Help & Support</span>
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                  <Link
                    to="/account-settings"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings size={18} />
                    <span>Account Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
