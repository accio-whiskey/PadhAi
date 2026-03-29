import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { UserRole } from '../types';
import { BookOpen, LogIn, UserPlus, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const Auth = ({ mode }: { mode: 'login' | 'signup' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        if (mode === 'login') {
          setError("Account not found. Please sign up first.");
          await auth.signOut();
          return;
        }

        // Create new profile
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName || 'Anonymous',
          email: user.email || '',
          role: role,
          createdAt: new Date().toISOString(),
          photoURL: user.photoURL || ''
        });

        // If tutor, create empty tutor profile
        if (role === 'tutor') {
          await setDoc(doc(db, 'tutors', user.uid), {
            uid: user.uid,
            subjects: [],
            classes: [],
            pricing: 500,
            bio: '',
            qualification: '',
            experience: 0,
            isVerified: false,
            isTopTutor: false,
            rating: 0,
            reviewCount: 0,
            location: { address: '', lat: 0, lng: 0 }
          });
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="p-8 text-center">
          <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Join PadhAi'}
          </h1>
          <p className="text-gray-500 mb-8">
            {mode === 'login' ? 'Login to manage your tutors and bookings.' : 'Start your journey as a parent or tutor today.'}
          </p>

          {mode === 'signup' && (
            <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
              <button
                onClick={() => setRole('parent')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'parent' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                I'm a Parent
              </button>
              <button
                onClick={() => setRole('tutor')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'tutor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                I'm a Tutor
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-100 py-4 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all mb-6 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
            )}
            <span>{mode === 'login' ? 'Login with Google' : 'Sign up with Google'}</span>
          </button>

          <div className="flex items-center space-x-2 justify-center text-xs text-gray-400 mb-8">
            <ShieldCheck className="h-4 w-4" />
            <span>Secure, OTP-based verification coming soon.</span>
          </div>

          <div className="text-sm text-gray-500">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <Link to="/signup" className="text-indigo-600 font-bold hover:underline">Sign up</Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 font-bold hover:underline">Login</Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
