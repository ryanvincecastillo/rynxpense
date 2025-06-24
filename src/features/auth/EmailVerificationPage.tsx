import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui';
import { ROUTES } from '../../constants/routes';

interface VerificationState {
  status: 'loading' | 'success' | 'error' | 'invalid';
  message: string;
}

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [verificationState, setVerificationState] = useState<VerificationState>({
    status: 'loading',
    message: 'Verifying your email...',
  });
  
  // FIX: Use ref to prevent infinite loops
  const hasAttemptedVerification = useRef(false);
  const { verifyEmail, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // FIX: Only run once
    if (hasAttemptedVerification.current) return;
    
    const token = searchParams.get('token');

    if (!token) {
      setVerificationState({
        status: 'invalid',
        message: 'Invalid verification link. Please check your email for the correct link.',
      });
      return;
    }

    const handleVerification = async () => {
      hasAttemptedVerification.current = true; // FIX: Mark as attempted
      
      try {
        await verifyEmail(token);
        setVerificationState({
          status: 'success',
          message: 'Your email has been successfully verified! Welcome to RYNXPENSE!',
        });
        
        toast.success('Email verified successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate(ROUTES.BUDGETS, { replace: true });
        }, 3000);
        
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Email verification failed.';
        setVerificationState({
          status: 'error',
          message: errorMessage,
        });
        toast.error(errorMessage);
      }
    };

    handleVerification();
  }, []); // FIX: Empty dependency array

  const handleResendEmail = async () => {
    const email = searchParams.get('email');
    if (!email) {
      toast.error('Email address not found. Please register again.');
      return;
    }
    
    try {
      await resendVerificationEmail(email);
      toast.success('Verification email sent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email');
    }
  };

  const renderIcon = () => {
    switch (verificationState.status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'error':
      case 'invalid':
        return <XCircle className="w-16 h-16 text-red-600" />;
    }
  };

  const renderContent = () => {
    switch (verificationState.status) {
      case 'loading':
        return (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Email Verified Successfully! 🎉</h2>
            <p className="text-gray-600">{verificationState.message}</p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                You're being redirected to your dashboard in a few seconds...
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate(ROUTES.BUDGETS)}
                className="w-full"
                size="lg"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Link
                to={ROUTES.LOGIN}
                className="block text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Back to Login
              </Link>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-gray-600">{verificationState.message}</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                The verification link may have expired or is invalid.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                variant="secondary"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Resend Verification Email
              </Button>
              
              <Link
                to={ROUTES.REGISTER}
                className="block text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Register Again
              </Link>
              
              <Link
                to={ROUTES.LOGIN}
                className="block text-sm text-gray-600 hover:text-gray-500"
              >
                Back to Login
              </Link>
            </div>
          </div>
        );

      case 'invalid':
        return (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Invalid Verification Link</h2>
            <p className="text-gray-600">{verificationState.message}</p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Please check your email for the correct verification link or request a new one.
              </p>
            </div>

            <div className="space-y-3">
              <Link to={ROUTES.REGISTER}>
                <Button className="w-full" size="lg">
                  Register Again
                </Button>
              </Link>
              
              <Link
                to={ROUTES.LOGIN}
                className="block text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Back to Login
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center space-y-6">
            {renderIcon()}
            {renderContent()}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;