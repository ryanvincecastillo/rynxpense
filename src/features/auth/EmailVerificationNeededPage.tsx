import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui';
import { ROUTES } from '../../constants/routes';

const EmailVerificationNeededPage: React.FC = () => {
  const [isResending, setIsResending] = useState(false);
  const { user, resendVerificationEmail, logout } = useAuth();

  const handleResendEmail = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    try {
      await resendVerificationEmail(user.email);
      toast.success('Verification email sent!');
    } catch (error: any) {
      toast.error('Failed to send email');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
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
          <div className="text-center space-y-6">
            <Mail className="w-16 h-16 text-blue-600 mx-auto" />
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
              <p className="text-gray-600 mt-2">
                Please check your email and click the verification link to access your account.
              </p>
              {user?.email && (
                <p className="text-sm text-gray-500 mt-1">
                  Sent to: {user.email}
                </p>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                You need to verify your email before accessing RYNXPENSE features.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Email
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="secondary"
                className="w-full"
              >
                Use Different Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationNeededPage;