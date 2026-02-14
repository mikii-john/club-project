import { supabase } from './supabaseClient';
import { User } from '../types';
import { ADMIN_PASSWORD } from '../constants';

export const getStoredUser = async (): Promise<User | null> => {

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;
  
  return {
    id: session.user.id,
    username: session.user.user_metadata.username || session.user.email?.split('@')[0],
    email: session.user.email || '',
  };
};

export const login = async (email: string, password?: string): Promise<User> => {
  console.log(`[AuthService] Attempting login for: ${email}`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: password || ADMIN_PASSWORD,
  });

  if (error) {
    console.error('[AuthService] Login error:', error.message);
    throw error;
  }
  
  if (!data.user) {
    console.error('[AuthService] Login failed: No user returned');
    throw new Error('Login failed');
  }

  console.log('[AuthService] Login successful');
  return {
    id: data.user.id,
    username: data.user.user_metadata.username || data.user.email?.split('@')[0],
    email: data.user.email || '',
  };
};

export const signup = async (username: string, email: string, password?: string): Promise<User> => {
  console.log(`[AuthService] Attempting signup for: ${email}`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: password || ADMIN_PASSWORD,
    options: {
      data: {
        username: username,
      },
    },
  });

  if (error) {
    console.error('[AuthService] Signup error:', error.message);
    throw error;
  }
  
  if (!data.user) {
    console.error('[AuthService] Signup failed: No user returned');
    throw new Error('Registration failed');
  }

  // Check if session is null - this happens if email confirmation is required
  if (!data.session) {
    console.warn('[AuthService] Signup successful but no session returned. Email confirmation might be required.');
    throw new Error('CONFIRMATION_REQUIRED');
  }

  console.log('[AuthService] Signup successful');
  return {
    id: data.user.id,
    username: data.user.user_metadata.username || data.user.email?.split('@')[0],
    email: data.user.email || '',
  };
};

export const logout = async (): Promise<void> => {
  console.log('[AuthService] Logging out...');
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[AuthService] Logout error:', error.message);
    throw error;
  }
  console.log('[AuthService] Logout successful');
};

// OAuth Authentication
export const signInWithGoogle = async (): Promise<void> => {
  console.log('[AuthService] Initiating Google OAuth...');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    console.error('[AuthService] Google OAuth error:', error.message);
    throw error;
  }
};

export const signInWithFacebook = async (): Promise<void> => {
  console.log('[AuthService] Initiating Facebook OAuth...');
  console.log('[AuthService] Current origin:', window.location.origin);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: window.location.origin,
      scopes: 'email public_profile',
    },
  });

  if (error) {
    console.error('[AuthService] Facebook OAuth error:', error);
    console.error('[AuthService] Error details:', {
      message: error.message,
      status: error.status,
      name: error.name,
    });
    throw error;
  }
  
  console.log('[AuthService] Facebook OAuth initiated successfully', data);
};

export const updatePassword = async (newPassword: string): Promise<void> => {
  console.log('[AuthService] Attempting to update password...');
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('[AuthService] Update password error:', error.message);
    throw error;
  }
  
  console.log('[AuthService] Password updated successfully');
};
