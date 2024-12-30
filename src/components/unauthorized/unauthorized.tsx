import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const UnauthorizedPage = () => {
  const handleBackToHome = () => {
    // In a real app, you would use your router's navigation here
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You don&apos;t have permission to access this page.
          </p>
        </div>

        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTitle className="text-yellow-800">
            Unauthorized Access Attempt
          </AlertTitle>
          <AlertDescription className="text-yellow-700">
            If you believe this is a mistake, please contact your system administrator
            or try signing in with different credentials.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Button 
            onClick={handleBackToHome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Back to Home
          </Button>
          
          <p className="text-center text-sm text-gray-500">
            Need help? Contact{' '}
            <a href="mailto:support@example.com" className="font-medium text-blue-600 hover:text-blue-500">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;