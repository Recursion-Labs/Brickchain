"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import OTPVerify from "@/components/custom/otp-verify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    const loadingToast = toast.loading("Signing in...");
    
    // Call backend: POST /api/v1/auth/login
    fetch(`${apiBaseUrl}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then(() => {
        // Then send OTP
        return fetch(`${apiBaseUrl}/v1/auth/otp/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to send OTP");
        toast.success("OTP sent to your email!", { id: loadingToast });
        setShowOTP(true);
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error(error.message || "Failed to sign in. Please try again.", { id: loadingToast });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleOTPVerify = async (otp: string) => {
    const loadingToast = toast.loading("Verifying OTP...");
    try {
      const response = await fetch(`${apiBaseUrl}/v1/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        // Store tokens
        localStorage.setItem("accessToken", data.tokens.accessToken);
        localStorage.setItem("refreshToken", data.tokens.refreshToken);
        toast.success("Signed in successfully!", { id: loadingToast });
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        toast.error(data.message || "Failed to verify OTP", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to verify OTP. Please try again.", { id: loadingToast });
    }
  };

  const handleResendOTP = async () => {
    const loadingToast = toast.loading("Resending OTP...");
    try {
      const res = await fetch(`${apiBaseUrl}/v1/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to resend OTP");
      toast.success("OTP resent to your email!", { id: loadingToast });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to resend OTP. Please try again.", { id: loadingToast });
    }
  };

  // Show OTP verification screen
  if (showOTP) {
    return (
      <OTPVerify
        email={email}
        onVerify={handleOTPVerify}
        onResend={handleResendOTP}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-6">
      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-2xl p-8">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">BrickChain</h1>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Sign in to your account</h2>
          <p className="text-sm text-gray-600 mt-2">Welcome back to the secure wallet platform</p>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <div className="relative mt-2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="name@company.com"
                aria-label="Email address"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-600">Or</span>
          </div>
        </div>

        {/* Google Sign In Button - Official Branding */}
        <button
          type="button"
          className="w-full h-10 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 shadow-sm"
          aria-label="Sign in with Google"
        >
          {/* Official Google G Logo with correct colors */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Sign Up Link */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Don&apos;t have an account? </span>
          <Link href="/auth/register" className="font-medium text-black hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
