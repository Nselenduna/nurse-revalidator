import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  name: string;
  nmcNumber?: string;
  role: 'nurse' | 'admin';
  createdAt: string;
  lastLogin: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of state changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  // Update auth state
  private updateState(updates: Partial<AuthState>) {
    this.authState = { ...this.authState, ...updates };
    this.notifyListeners();
  }

  // Get current auth state
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  // Initialize auth service
  async initialize(): Promise<void> {
    try {
      this.updateState({ isLoading: true });
      
      // Check if user is already logged in
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.currentUser = user;
        this.updateState({
          isAuthenticated: true,
          user,
          isLoading: false,
        });
      } else {
        this.updateState({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth service initialization failed:', error);
      this.updateState({
        isLoading: false,
        error: 'Failed to initialize authentication',
      });
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      this.updateState({ isLoading: true, error: null });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication logic
      // In a real app, this would make an API call to your backend
      if (credentials.email === 'demo@nmc.com' && credentials.password === 'password') {
        const user: User = {
          id: '1',
          email: credentials.email,
          name: 'Demo Nurse',
          nmcNumber: '12345678',
          role: 'nurse',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };

        // Store user data
        await AsyncStorage.setItem('user', JSON.stringify(user));
        this.currentUser = user;

        this.updateState({
          isAuthenticated: true,
          user,
          isLoading: false,
        });

        return { success: true };
      } else {
        this.updateState({
          isLoading: false,
          error: 'Invalid email or password',
        });
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      this.updateState({
        isLoading: false,
        error: 'Login failed. Please try again.',
      });
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      this.updateState({ isLoading: true });

      // Clear stored user data
      await AsyncStorage.removeItem('user');
      this.currentUser = null;

      this.updateState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      this.updateState({
        isLoading: false,
        error: 'Logout failed',
      });
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'No user logged in' };
      }

      const updatedUser = { ...this.currentUser, ...updates };
      
      // Store updated user data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      this.currentUser = updatedUser;

      this.updateState({
        user: updatedUser,
      });

      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  // Reset password (mock implementation)
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock password reset logic
      // In a real app, this would send a reset email
      if (email === 'demo@nmc.com') {
        return { success: true };
      } else {
        return { success: false, error: 'Email not found' };
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      return { success: false, error: 'Password reset failed' };
    }
  }

  // Register new user (mock implementation)
  async register(userData: {
    email: string;
    password: string;
    name: string;
    nmcNumber?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock registration logic
      // In a real app, this would create a new user account
      if (userData.email && userData.password && userData.name) {
        return { success: true };
      } else {
        return { success: false, error: 'Please fill in all required fields' };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: 'Registration failed' };
    }
  }
}

export const authService = AuthService.getInstance();
export default authService;
