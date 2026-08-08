import { insforge } from '../lib/insforge';

export const authService = {
  async getCurrentUser() {
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error) throw error;
    return data?.user || data || null;
  },

  async signIn(email, password) {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email, password, name) {
    const { data, error } = await insforge.auth.signUp({ email, password, name });
    if (error) throw error;
    return data;
  },

  async verifyEmail(email, otp) {
    const { data, error } = await insforge.auth.verifyEmail({ email, otp });
    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    const { data, error } = await insforge.auth.signInWithOAuth('google', {
      redirectTo: window.location.origin + '/login'
    });
    if (error) throw error;
    return data;
  },

  async resendVerificationEmail(email) {
    const { data, error } = await insforge.auth.resendVerificationEmail({ email });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await insforge.auth.signOut();
    if (error) throw error;
  }
};
