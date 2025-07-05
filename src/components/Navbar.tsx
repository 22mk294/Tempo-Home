import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  User, 
  MessageSquare, 
  Plus, 
  LogOut, 
  Menu, 
  X,
  Building,
  BarChart3
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            onClick={closeMenu}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Tempo/Home
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </Link>

            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  <User className="w-4 h-4" />
                  <span>Tableau de bord</span>
                </Link>
                
                {user.type === 'owner' && (
                  <Link 
                    to="/create-property" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Créer une annonce</span>
                  </Link>
                )}

                {user.type === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Administration</span>
                  </Link>
                )}
                
                <Link 
                  to="/messages" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Messages</span>
                </Link>

                <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600">
                    Bonjour, <span className="font-medium text-gray-900">{user.name}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
                >
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors px-4 py-3 rounded-lg hover:bg-blue-50"
                onClick={closeMenu}
              >
                <Home className="w-5 h-5" />
                <span>Accueil</span>
              </Link>

              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors px-4 py-3 rounded-lg hover:bg-blue-50"
                    onClick={closeMenu}
                  >
                    <User className="w-5 h-5" />
                    <span>Tableau de bord</span>
                  </Link>
                  
                  {user.type === 'owner' && (
                    <Link 
                      to="/create-property" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors px-4 py-3 rounded-lg hover:bg-blue-50"
                      onClick={closeMenu}
                    >
                      <Plus className="w-5 h-5" />
                      <span>Créer une annonce</span>
                    </Link>
                  )}

                  {user.type === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors px-4 py-3 rounded-lg hover:bg-blue-50"
                      onClick={closeMenu}
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span>Administration</span>
                    </Link>
                  )}
                  
                  <Link 
                    to="/messages" 
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors px-4 py-3 rounded-lg hover:bg-blue-50"
                    onClick={closeMenu}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Messages</span>
                  </Link>

                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="px-4 py-2 text-sm text-gray-600">
                      Connecté en tant que <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-colors px-4 py-3 rounded-lg hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                  <Link 
                    to="/login" 
                    className="block text-center text-gray-700 hover:text-blue-600 transition-colors px-4 py-3 rounded-lg hover:bg-blue-50"
                    onClick={closeMenu}
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/register" 
                    className="block text-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
                    onClick={closeMenu}
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;