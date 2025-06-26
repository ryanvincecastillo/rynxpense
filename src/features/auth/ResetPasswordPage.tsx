import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import { ROUTES } from '../../constants/routes';

// Form validation schema
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // 🔧 FIX: Extract and validate token on component mount
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    
    if (!tokenFromUrl) {
      setError('Reset token is missing. Please request a new password reset.');
      return;
    }
    
    // 🔧 FIX: Validate token format (basic check)
    if (tokenFromUrl.length < 32) {
      setError('Invalid reset token format. Please request a new password reset.');
      return;
    }
    
    setToken(tokenFromUrl);
    setError(null); // Clear any previous errors
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) {
      setError('Reset token is missing. Please request a new password reset.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 🔧 FIX: Reset password with proper error handling
      const response = await authAPI.resetPassword({
        token,
        newPassword: data.newPassword,
      });

      // Extract user and tokens from response
      const { user, tokens } = response.data.data;

      // 🔧 FIX: Store tokens in localStorage (user is automatically logged in)
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      setIsSuccess(true);

      // 🔧 FIX: Auto-redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }, 3000);

    } catch (err: any) {
      console.error('Reset password error:', err);
      
      // 🔧 FIX: Better error handling with specific messages
      if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message;
        if (errorMessage?.includes('expired')) {
          setError('This reset link has expired. Please request a new password reset.');
        } else if (errorMessage?.includes('invalid')) {
          setError('This reset link is invalid. Please request a new password reset.');
        } else {
          setError('Invalid reset token. Please request a new password reset.');
        }
      } else if (err.response?.status === 404) {
        setError('Reset token not found. Please request a new password reset.');
      } else if (err.response?.status === 429) {
        setError('Too many attempts. Please wait a few minutes before trying again.');
      } else {
        setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔧 FIX: Handle back to login
  const handleBackToLogin = () => {
    navigate(ROUTES.LOGIN, { replace: true });
  };

  // 🔧 FIX: Handle request new reset
  const handleRequestNewReset = () => {
    navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
  };

  // 🔧 FIX: Show loading state while checking token
  if (!token && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Validating reset token...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error ? (
            /* Error State */
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-medium text-red-900 mb-2">Reset Failed</h3>
                <p className="text-sm text-red-800">{error}</p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleRequestNewReset}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Request New Reset Link
                </button>
                
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            /* Success State */
            <div className="space-y-6 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-medium text-green-900 mb-2">Password Reset Successful!</h3>
                <p className="text-sm text-green-800 mb-4">
                  Your password has been updated and you are now logged in.
                </p>
                <p className="text-xs text-green-700">
                  Redirecting to dashboard in 3 seconds...
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(ROUTES.DASHBOARD, { replace: true })}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Go to Dashboard Now
              </button>
            </div>
          ) : (
            /* Reset Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    {...register('newPassword')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                    placeholder="Enter your new password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                    placeholder="Confirm your new password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Password Requirements:
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains at least one uppercase letter</li>
                  <li>• Contains at least one lowercase letter</li>
                  <li>• Contains at least one number</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        {!error && !isSuccess && (
          <div className="text-center mt-8">
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;