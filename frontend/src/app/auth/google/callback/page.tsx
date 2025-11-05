"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { AuthManager } from "@/lib/auth";

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get tokens from URL parameters (redirected from backend)
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const userParam = searchParams.get('user');

        if (!accessToken || !refreshToken || !userParam) {
          throw new Error('Missing authentication data from Google OAuth');
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userParam));

        // Store the tokens and user data using AuthManager
        AuthManager.setAuthData(user, {
          accessToken,
          refreshToken,
        });

        toast.success('Successfully logged in with Google!');

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Google OAuth error:', err);

        // Redirect back to login after a delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Authenticating...</h2>
          <p className="text-gray-400">Please wait while we complete your Google login</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Failed</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return null;
}
