import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, User, LogOut, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900 tracking-tight">PadhAi</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/search" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Find Tutors</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Dashboard</Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Hi, {profile?.name || user.displayName}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600 font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Login</Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                >
                  Become a Tutor
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-indigo-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-4">
          <Link to="/search" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Find Tutors</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <button
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="block w-full text-left text-gray-600 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="block text-indigo-600 font-bold" onClick={() => setIsMenuOpen(false)}>Become a Tutor</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
