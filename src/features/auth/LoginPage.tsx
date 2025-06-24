// src/features/auth/LoginPage.tsx - Enhanced with remember me and email verification
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Alert } from '../../components/ui';
import { ROUTES } from '../../constants/routes';

// ENHANCED: Validation schema with remember me
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(), // NEW: Remember me option
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { 
    login, 
    isLoading, 
    error, 
    clearError, 
    requiresVerification, 
    user, 
    resendVerificationEmail 
  } = useAuth(); // ENHANCED: Get new state and functions
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false, // NEW: Default remember me to false
    },
  });

  const watchedEmail = watch('email');

  // Clear errors when component mounts or when user starts typing
  useEffect(() => {
    clearError();
  }, []);

  // NEW: Handle verification required state
  useEffect(() => {
    if (requiresVerification && user) {
      toast.success('Registration successful! Please check your email to verify your account.');
    }
  }, [requiresVerification, user]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password, data.rememberMe); // ENHANCED: Pass remember me
      
      // Only navigate if login was successful (no verification required)
      if (!requiresVerification) {
        const redirectTo = (location.state as any)?.from?.pathname || ROUTES.BUDGETS;
        toast.success('Welcome back! Login successful.');
        navigate(redirectTo, { replace: true });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  // NEW: Handle resend verification email
  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    try {
      await resendVerificationEmail(user.email);
      toast.success('Verification email sent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email');
    }
  };

  // NEW: If verification is required, show verification message
  if (requiresVerification && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">R</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Check your email</h2>
            <p className="mt-2 text-gray-600">
              We've sent a verification link to <strong>{user.email}</strong>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              
              <p className="text-sm text-gray-600">
                Click the link in your email to verify your account and start using RYNXPENSE.
              </p>
              
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or request a new one below.
              </p>
            </div>

            <div className="mt-6 flex flex-col space-y-3">
              <Button
                onClick={handleResendVerification}
                variant="secondary"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Resend verification email
              </Button>
              
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium text-center"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">R</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-gray-600">
              Sign in to your account to continue managing your budgets
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <Alert type="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email address"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* NEW: Remember me and forgot password section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  {...register('rememberMe')}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me for 30 days
                </label>
              </div>

              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting || isLoading}
            >
              Sign in
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to={ROUTES.REGISTER}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Hero section */}
      {/* <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Take control of your finances with RYNXPENSE
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            The smart way to budget, track expenses, and achieve your financial goals.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-blue-100">Easy budget creation and management</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-blue-100">Real-time expense tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-blue-100">Insightful financial reports</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-blue-100">Secure and reliable platform</span>
            </div>
          </div>
        </div>
        
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/2 right-20 w-12 h-12 bg-white/10 rounded-full"></div>
      </div> */}

      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center bg-gradient-to-br from-blue-600 to-purple-700 text-white p-12">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-6">RYNXPENSE</h1>
          <p className="text-xl mb-8 text-blue-100">
            Take control of your finances with intelligent budget management
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Smart Analytics</h3>
                <p className="text-blue-100 text-sm">Get insights into your spending patterns</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Budget Planning</h3>
                <p className="text-blue-100 text-sm">Create and manage multiple budgets</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Goal Tracking</h3>
                <p className="text-blue-100 text-sm">Track progress towards financial goals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;