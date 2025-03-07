import { ethers } from 'ethers';

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: {
      id: string;
      email: string;
      walletAddress?: string;
      isEmailVerified: boolean;
    };
  };
}

class AuthService {
  private token: string | null = null;
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Traditional email/password signup
  async signup(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign up');
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Traditional email/password signin
  async signin(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign in');
      }

      if (data.data?.token) {
        this.token = data.data.token;
        localStorage.setItem('auth_token', data.data.token);
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Verify email with code
  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify email');
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_URL}/auth/request-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to request password reset');
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Web3 wallet authentication
  async connectWallet(): Promise<AuthResponse> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Get nonce from backend
      const nonceResponse = await fetch(`${this.API_URL}/auth/web3/nonce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      const { nonce } = await nonceResponse.json();

      // Sign message
      const message = `Sign this message to authenticate with MONNIVERSE\nNonce: ${nonce}`;
      const signature = await signer.signMessage(message);

      // Verify signature with backend
      const authResponse = await fetch(`${this.API_URL}/auth/web3/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, signature, message }),
      });

      const data = await authResponse.json();
      if (!authResponse.ok) {
        throw new Error(data.message || 'Failed to authenticate with wallet');
      }

      if (data.data?.token) {
        this.token = data.data.token;
        localStorage.setItem('auth_token', data.data.token);
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Signout
  signout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Get current auth token
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Error handler
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }
}

export const authService = new AuthService(); 