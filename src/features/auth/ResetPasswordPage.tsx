// rynxpense/src/features/auth/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';
import { authAPI } from '../../services/api';
import { Button, Input } from '../../components/ui';

// Validation schema
const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('newPassword');

  // Get token from URL on component mount
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Invalid or missing reset token. Please request a new password reset.');
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) {
      setError('Reset token is missing. Please request a new password reset.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Reset password
      const response = await authAPI.resetPassword({
        token,
        newPassword: data.newPassword,
      });

      // Extract user and tokens from response
      const { user, tokens } = response.data.data;

      // Store tokens in localStorage (user is automatically logged in)
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      setIsSuccess(true);

      // Auto-redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }, 3000);

    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('This reset link has expired or is invalid. Please request a new password reset.');
      } else {
        setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) return { score, text: 'Weak', color: 'text-red-600' };
    if (score <= 3) return { score, text: 'Fair', color: 'text-yellow-600' };
    if (score <= 4) return { score, text: 'Good', color: 'text-blue-600' };
    return { score, text: 'Strong', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength(password || '');

  if (!token && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Login Link */}
        <div className="mb-6">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {!isSuccess ? (
              <>
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Reset Your Password
                </h1>
                <p className="text-gray-600">
                  Enter your new password below. Make sure it's strong and secure.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Password Reset Successful!
                </h1>
                <p className="text-gray-600">
                  Your password has been updated and you're now logged in.
                </p>
              </>
            )}
          </div>

          {error ? (
            /* Error State */
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Request New Reset Link
                </Link>
                
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : !isSuccess ? (
            /* Reset Password Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* New Password Input */}
              <div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    error={errors.newPassword?.message}
                    {...register('newPassword')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Password strength:</span>
                      <span className={passwordStrength.color}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score <= 2 ? 'bg-red-500' :
                          passwordStrength.score <= 3 ? 'bg-yellow-500' :
                          passwordStrength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Password requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <span className={password?.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                      {password?.length >= 8 ? '✓' : '○'}
                    </span>
                    <span className="ml-2">At least 8 characters</span>
                  </li>
                  <li className="flex items-center">
                    <span className={/[A-Z]/.test(password || '') ? 'text-green-600' : 'text-gray-400'}>
                      {/[A-Z]/.test(password || '') ? '✓' : '○'}
                    </span>
                    <span className="ml-2">One uppercase letter</span>
                  </li>
                  <li className="flex items-center">
                    <span className={/[a-z]/.test(password || '') ? 'text-green-600' : 'text-gray-400'}>
                      {/[a-z]/.test(password || '') ? '✓' : '○'}
                    </span>
                    <span className="ml-2">One lowercase letter</span>
                  </li>
                  <li className="flex items-center">
                    <span className={/[0-9]/.test(password || '') ? 'text-green-600' : 'text-gray-400'}>
                      {/[0-9]/.test(password || '') ? '✓' : '○'}
                    </span>
                    <span className="ml-2">One number</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
              >
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          ) : (
            /* Success State */
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">You're all set! 🎉</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Your password has been successfully updated</li>
                  <li>• You are now securely logged in</li>
                  <li>• Redirecting to your dashboard...</li>
                </ul>
              </div>

              {/* Manual Navigation */}
              <div className="text-center">
                <Button
                  onClick={() => navigate(ROUTES.DASHBOARD)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Remember your password?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;