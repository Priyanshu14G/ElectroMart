import { AuthSession, User, UserRole } from '@/lib/types';
import { signIn, signOut } from 'next-auth/react';
import { registerUser } from '@/lib/api';

const AUTH_KEY = 'electromart_auth_session';
const USER_DATA_KEY = 'electromart_user_data';

export const authUtils = {
  /* Login */
  login: async (email: string, password: string): Promise<AuthSession | null> => {
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        return null;
      }

      // Fetch user or store local session info
      const session: AuthSession = {
        userId: email,
        email,
        role: 'customer',
        token: `token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const user: User = {
        id: email,
        email,
        name: email.split('@')[0],
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

      return session;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  /* Sign Up */
  signup: async (email: string, password: string, name: string, role: UserRole): Promise<User | null> => {
    try {
      const { user: registered } = await registerUser({
        email,
        password,
        name,
        role: role === 'business_owner' ? 'business_owner' : 'customer',
      });
      
      // Auto login after signup
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      const user: User = {
        id: registered.id,
        email: registered.email,
        name: registered.name,
        role: registered.role as UserRole,
        avatar: registered.avatar,
        createdAt: registered.createdAt,
        updatedAt: registered.createdAt,
      };

      const session: AuthSession = {
        userId: user.id,
        email: user.email,
        role: user.role,
        token: `token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Signup error:', error);
      return null;
    }
  },

  /* Get Current Session */
  getSession: (): AuthSession | null => {
    if (typeof window === 'undefined') return null;
    
    const session = localStorage.getItem(AUTH_KEY);
    if (!session) return null;

    try {
      const parsed = JSON.parse(session);
      
      // Check if expired
      if (new Date(parsed.expiresAt) < new Date()) {
        authUtils.logout();
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  },

  /* Get Current User */
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;

    const session = authUtils.getSession();
    if (!session) return null;

    const userData = localStorage.getItem(USER_DATA_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  /* Logout */
  logout: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },

  /* Is Authenticated */
  isAuthenticated: (): boolean => {
    return authUtils.getSession() !== null;
  },

  /* Check Role */
  hasRole: (requiredRole: UserRole | UserRole[]): boolean => {
    const user = authUtils.getCurrentUser();
    if (!user) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }

    return user.role === requiredRole;
  },

  /* Forgot Password */
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Invalid email address' };
    }
    return {
      success: true,
      message: 'If an account exists for this email, password reset instructions have been sent.',
    };
  },

  /* Reset Password */
  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    // Mock reset password
    return {
      success: true,
      message: 'Password reset successfully',
    };
  },
};
