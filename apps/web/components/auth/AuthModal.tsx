import { useState, useEffect } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup' | 'verify' | 'forgot';

interface ValidationState {
  hasMinLength: boolean;
  hasNumber: boolean;
  hasLowerCase: boolean;
  hasUpperCase: boolean;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signup, signin, verifyEmail, requestPasswordReset, connectWallet, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [validation, setValidation] = useState<ValidationState>({
    hasMinLength: false,
    hasNumber: false,
    hasLowerCase: false,
    hasUpperCase: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    // Password validation
    setValidation({
      hasMinLength: password.length >= 10,
      hasNumber: /\d/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
    });
  }, [password]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        if (!Object.values(validation).every(Boolean)) {
          setError('Please meet all password requirements');
          return;
        }

        await signup(email, password);
        setSuccessMessage('Account created! Please check your email for verification.');
        setMode('verify');
      } else if (mode === 'signin') {
        await signin(email, password);
        onClose();
      } else if (mode === 'verify') {
        await verifyEmail(email, verificationCode);
        setSuccessMessage('Email verified successfully!');
        setTimeout(() => {
          setMode('signin');
        }, 2000);
      } else if (mode === 'forgot') {
        await requestPasswordReset(email);
        setSuccessMessage('Password reset instructions sent to your email.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  const renderValidationIndicator = (isValid: boolean, text: string) => (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-gray-300'}`} />
      <span className={isValid ? 'text-green-600' : 'text-gray-600'}>{text}</span>
    </div>
  );

  const renderForm = () => {
    switch (mode) {
      case 'signin':
        return (
          <>
            <h2 className="text-2xl font-display bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent text-center mb-2">
              Welcome back!
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Sign in to your account.{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-pink-600 hover:underline"
              >
                Need an account? Sign up
              </button>
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-sm text-pink-600 hover:underline"
              >
                Forgot your password?
              </button>
            </div>
          </>
        );

      case 'signup':
        return (
          <>
            <h2 className="text-2xl font-display bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent text-center mb-2">
              Welcome to MONNIVERSE!
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Create an account.{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-pink-600 hover:underline"
              >
                Already have an account? Sign in
              </button>
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {renderValidationIndicator(validation.hasMinLength, 'Minimum of 10 characters')}
                {renderValidationIndicator(validation.hasNumber, 'One number')}
                {renderValidationIndicator(validation.hasLowerCase, 'One lowercase letter')}
                {renderValidationIndicator(validation.hasUpperCase, 'One uppercase letter')}
              </div>
            </div>
          </>
        );

      case 'verify':
        return (
          <>
            <h2 className="text-2xl font-display bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent text-center mb-2">
              Verify Your Email
            </h2>
            <p className="text-center text-gray-600 mb-6">
              We've sent a verification code to {email}
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => signup(email, password)}
                className="text-sm text-pink-600 hover:underline"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </>
        );

      case 'forgot':
        return (
          <>
            <h2 className="text-2xl font-display bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent text-center mb-2">
              Reset Password
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Enter your email to receive reset instructions.{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-pink-600 hover:underline"
              >
                Remember your password? Sign in
              </button>
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
              {successMessage}
            </div>
          )}

          {renderForm()}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Please wait...' :
             mode === 'signin' ? 'Sign In' :
             mode === 'signup' ? 'Create Account' :
             mode === 'verify' ? 'Verify Email' :
             'Reset Password'}
          </button>
        </form>

        {(mode === 'signin' || mode === 'signup') && (
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  or {mode === 'signin' ? 'sign in' : 'sign up'} using
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button
                type="button"
                onClick={handleWalletConnect}
                disabled={isLoading}
                className="p-2 border rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="relative w-6 h-6">
                  <Image
                    src="/metamask-icon.svg"
                    alt="MetaMask"
                    fill
                    sizes="24px"
                    className="object-contain"
                  />
                </div>
              </button>
              <button
                type="button"
                onClick={handleWalletConnect}
                disabled={isLoading}
                className="p-2 border rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="relative w-6 h-6">
                  <Image
                    src="/walletconnect-icon.svg"
                    alt="WalletConnect"
                    fill
                    sizes="24px"
                    className="object-contain"
                  />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 