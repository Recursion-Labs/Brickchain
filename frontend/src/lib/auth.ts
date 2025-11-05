// Auth utilities for managing user authentication state
import { useState } from 'react';
export interface User {
  id: string;
  email: string;
  username: string | null;
  profilePicture: string | null;
  bio: string | null;
  url: string | null;
  role: string;
  notificationSettingsId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthManager {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly USER_KEY = 'user';

  // Store authentication data
  static setAuthData(user: User, tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Get stored user data
  static getUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Get access token
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Get refresh token
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getUser();
  }

  // Clear all authentication data (logout)
  static clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Get authorization header for API requests
  static getAuthHeader(): { Authorization: string } | Record<string, never> {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Handle Google OAuth login
  static initiateGoogleLogin(): void {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    // Redirect to your backend Google OAuth endpoint
    window.location.href = `${apiBaseUrl}/v1/auth/google`;
  }

  // Handle logout
  static logout(): void {
    this.clearAuthData();
    // Redirect to login page
    window.location.href = '/auth/login';
  }
}

// React hook for using auth state
export function useAuth() {
  const [user, setUser] = useState<User | null>(() => AuthManager.getUser());

  const login = (userData: User, tokens: AuthTokens) => {
    AuthManager.setAuthData(userData, tokens);
    setUser(userData);
  };

  const logout = () => {
    AuthManager.logout();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: AuthManager.isAuthenticated(),
    login,
    logout,
  };
}
