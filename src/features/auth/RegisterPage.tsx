// src/features/auth/RegisterPage.tsx - Enhanced with email verification
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, UserPlus, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Select, Alert } from '../../components/ui';
import { CURRENCIES, DEFAULT_CURRENCY } from '../../constants/currency';
import { ROUTES } from '../../constants/routes';

// Validation schema
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  currency: z.string().optional().default('USD'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { 
    register: registerUser, 
    isLoading, 
    error, 
    requiresVerification, 
    user,
    resendVerificationEmail 
  } = useAuth(); // ENHANCED: Get verification states
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      currency: DEFAULT_CURRENCY
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        currency: data.currency,
      });
      
      // NEW: Don't navigate immediately - let verification flow handle it
      if (!requiresVerification) {
        toast.success('Account created successfully! Welcome to RYNXPENSE.');
        navigate(ROUTES.BUDGETS);
      }
      // If verification required, the login page will show verification message
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
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
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">R</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Registration Successful! 🎉</h2>
            <p className="mt-2 text-gray-600">
              Please check your email to verify your account
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  We've sent a verification link to:
                </p>
                <p className="font-semibold text-gray-900">{user.email}</p>
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
              
              <Link
                to={ROUTES.LOGIN}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium text-center"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Registration form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">R</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-gray-600">
              Join thousands of users managing their budgets with RYNXPENSE
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <Alert type="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                placeholder="Enter your first name"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last name"
                placeholder="Enter your last name"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

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
                placeholder="Create a password"
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

            <div className="relative">
              <Input
                label="Confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Select
              label="Preferred currency"
              options={CURRENCIES.slice()}
              error={errors.currency?.message}
              {...register('currency')}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting || isLoading}
            >
              Create account
              <UserPlus className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to={ROUTES.LOGIN}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Hero section */}
      {/* <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-green-600 via-blue-600 to-purple-700">
        <div className="flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Start your financial journey with RYNXPENSE
          </h1>
          <p className="text-xl text-green-100 mb-8">
            Create smart budgets, track expenses, and achieve your financial goals with ease.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-green-100">Quick and secure registration</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-green-100">Multi-currency support</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-green-100">Advanced budget templates</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-green-100">Real-time financial insights</span>
            </div>
          </div>
        </div>
        
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/2 right-20 w-12 h-12 bg-white/10 rounded-full"></div>
      </div> */}

      {/* Right side - Feature showcase */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center bg-gradient-to-br from-green-600 to-blue-700 text-white p-12">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-6">Start Your Journey</h1>
          <p className="text-xl mb-8 text-green-100">
            Join thousands of users taking control of their financial future
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Quick Setup</h3>
                <p className="text-green-100 text-sm">Get started in under 2 minutes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Secure & Private</h3>
                <p className="text-green-100 text-sm">Your data is encrypted and protected</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Works Everywhere</h3>
                <p className="text-green-100 text-sm">Access from any device, anywhere</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;