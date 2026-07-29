import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Clear any legacy local mock user storage (runs once)
  useEffect(() => {
    try { localStorage.removeItem('mosszip_local_users'); } catch (e) {}
  }, []);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mosszip_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('mosszip_auth_token') || null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [intendedAction, setIntendedAction] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // ── Toast with proper cleanup to prevent memory leaks ───────────────────────
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg, isError = false) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage({ text: msg, isError });
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  // ── Stable callbacks — never recreated, so context consumers don't re-render ─
  const openAuthModal = useCallback((action = null, initialMode = 'login') => {
    if (action) setIntendedAction(() => action);
    setAuthModalMode(initialMode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setIntendedAction(null);
  }, []);

  const login = useCallback((authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('mosszip_auth_token', authToken);
    localStorage.setItem('mosszip_user', JSON.stringify(userData));
    showToast(`Welcome back, ${userData.full_name}!`);
    setIsAuthModalOpen(false);
    setIntendedAction(prev => {
      if (prev && typeof prev === 'function') {
        setTimeout(prev, 300);
      }
      return null;
    });
  }, [showToast]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mosszip_auth_token');
    localStorage.removeItem('mosszip_user');
    showToast('Logged out successfully.');
  }, [showToast]);

  const requireAuth = useCallback((callback) => {
    if (user && token) {
      callback();
    } else {
      openAuthModal(callback, 'login');
    }
  }, [user, token, openAuthModal]);

  // ── Stable context value — only changes when actual auth state changes ───────
  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!(user && token),
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    logout,
    requireAuth,
    showToast,
    toastMessage,
  }), [
    user, token, isAuthModalOpen, authModalMode,
    openAuthModal, closeAuthModal, login, logout, requireAuth,
    showToast, toastMessage,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-2xl shadow-2xl font-display text-xs font-bold flex items-center gap-3 animate-fade-in border gpu-layer ${
            toastMessage.isError
              ? 'bg-rose-900/90 text-rose-100 border-rose-500/50 backdrop-blur-md'
              : 'bg-[#121A13]/95 text-emerald-300 border-primary/40 backdrop-blur-md'
          }`}
        >
          <span>{toastMessage.isError ? '⚠️' : '✅'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
