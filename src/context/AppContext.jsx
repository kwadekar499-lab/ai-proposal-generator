import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { proposalService } from '../services/proposalService';
import { loginLogService } from '../services/loginLogService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]                 = useState(null);
  const [profile, setProfile]           = useState(null);
  const [history, setHistory]           = useState([]);
  const [toast, setToast]               = useState(null);

  // Loading states
  const [authLoading, setAuthLoading]   = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [proposalsLoading, setProposalsLoading] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Check initial authentication session from InsForge
  useEffect(() => {
    async function initAuth() {
      setAuthLoading(true);
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser && (currentUser.id || currentUser.email)) {
          setUser(currentUser);
          if (currentUser.id) {
            loginLogService.recordLogin(currentUser.id);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    initAuth();
  }, []);

  // Fetch user profile from InsForge when authenticated
  useEffect(() => {
    if (!user || !user.id) {
      setProfile(null);
      return;
    }
    async function loadProfile() {
      setProfileLoading(true);
      try {
        const userProfile = await profileService.getProfile(user.id);
        setProfile(userProfile);
      } catch (err) {
        showToast(err.message || 'Failed to load user profile', 'error');
      } finally {
        setProfileLoading(false);
      }
    }
    loadProfile();
  }, [user, showToast]);

  // Fetch proposal history ordered by created_at descending when authenticated
  useEffect(() => {
    if (!user || !user.id) {
      setHistory([]);
      return;
    }
    async function loadProposals() {
      setProposalsLoading(true);
      try {
        const proposals = await proposalService.getProposals(user.id);
        setHistory(proposals);
      } catch (err) {
        showToast(err.message || 'Failed to load proposal history', 'error');
      } finally {
        setProposalsLoading(false);
      }
    }
    loadProposals();
  }, [user, showToast]);

  // Authentication actions
  const loginWithEmail = async (email, password) => {
    setAuthLoading(true);
    try {
      const data = await authService.signIn(email, password);
      const currentUser = data?.user || data;
      if (currentUser && (currentUser.id || currentUser.email)) {
        setUser(currentUser);
        if (currentUser.id) {
          loginLogService.recordLogin(currentUser.id);
        }
        showToast('Signed in successfully!');
        return { success: true, user: currentUser };
      }
      throw new Error('Sign in succeeded but user context was empty.');
    } catch (err) {
      const msg = err.message || 'Login failed';
      showToast(msg, 'error');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signUpWithEmail = async (email, password, name) => {
    setAuthLoading(true);
    try {
      const data = await authService.signUp(email, password, name);
      const currentUser = data?.user;

      if (data?.requireEmailVerification || (!data?.accessToken && !currentUser)) {
        setUser(null);
        showToast('Account created! Please enter the 6-digit verification code.', 'info');
        return { success: true, requireVerification: true };
      }

      if (currentUser && currentUser.id) {
        setUser(currentUser);
        loginLogService.recordLogin(currentUser.id);
        showToast('Account created successfully!');
        return { success: true, user: currentUser };
      }

      return { success: true, requireVerification: true };
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const verifyEmailCode = async (email, otp) => {
    setAuthLoading(true);
    try {
      const data = await authService.verifyEmail(email, otp);
      const verifiedUser = data?.user;

      if (verifiedUser && verifiedUser.id) {
        setUser(verifiedUser);
        loginLogService.recordLogin(verifiedUser.id);
        showToast('Email verified successfully!');
        return { success: true, user: verifiedUser };
      }

      const currentUser = await authService.getCurrentUser();
      if (currentUser && currentUser.id) {
        setUser(currentUser);
        loginLogService.recordLogin(currentUser.id);
        showToast('Email verified successfully!');
        return { success: true, user: currentUser };
      }

      return { success: true };
    } catch (err) {
      showToast(err.message || 'Invalid or expired verification code', 'error');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setAuthLoading(true);
    try {
      await authService.signInWithGoogle();
    } catch (err) {
      showToast(err.message || 'Google authentication failed', 'error');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const resendVerification = async (email) => {
    try {
      await authService.resendVerificationEmail(email);
      showToast('Verification code resent! Check your inbox.');
    } catch (err) {
      showToast(err.message || 'Failed to resend verification code', 'error');
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setHistory([]);
      showToast('Logged out');
    } catch (err) {
      showToast(err.message || 'Failed to log out', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Profile actions
  const saveProfile = async (profileData) => {
    if (!user || !user.id) {
      showToast('Authentication required to save profile', 'error');
      throw new Error('Authentication required');
    }
    setProfileLoading(true);
    try {
      const updated = await profileService.saveProfile(user.id, profileData);
      setProfile(updated);
      showToast('Profile saved successfully!');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to save profile', 'error');
      throw err;
    } finally {
      setProfileLoading(false);
    }
  };

  // Proposal actions
  const addProposal = useCallback(async (proposalData) => {
    if (!user || !user.id) {
      showToast('User must be logged in to create proposals', 'error');
      throw new Error('User authentication required');
    }
    setProposalsLoading(true);
    try {
      const created = await proposalService.createProposal(user.id, proposalData);
      setHistory(prev => [created, ...prev]);
      showToast('Proposal saved to backend!');
      return created;
    } catch (err) {
      showToast(err.message || 'Failed to save proposal to InsForge database', 'error');
      throw err;
    } finally {
      setProposalsLoading(false);
    }
  }, [user, showToast]);

  const updateProposal = useCallback(async (id, content) => {
    try {
      await proposalService.updateProposal(id, content);
      setHistory(prev => prev.map(p => p.id === id ? { ...p, content } : p));
      showToast('Proposal updated successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to update proposal', 'error');
      throw err;
    }
  }, [showToast]);

  const deleteProposal = useCallback(async (id) => {
    try {
      await proposalService.deleteProposal(id);
      setHistory(prev => prev.filter(p => p.id !== id));
      showToast('Proposal deleted.', 'error');
    } catch (err) {
      showToast(err.message || 'Failed to delete proposal', 'error');
      throw err;
    }
  }, [showToast]);

  const isAuth = Boolean(user && user.id);

  return (
    <AppContext.Provider value={{
      isAuth, user, authLoading,
      loginWithEmail, signUpWithEmail, verifyEmailCode, signInWithGoogle, resendVerification, logout,
      profile, profileLoading, saveProfile,
      history, proposalsLoading, addProposal, updateProposal, deleteProposal,
      toast, showToast
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
