"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import OTPVerify from "@/components/custom/otp-verify";
import { Checkbox } from "@/components/ui/checkbox";

export default function Register() {
  const [email, setEmail] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    if (!agreeToTerms) {
      toast.error("Please agree to the Terms & Conditions");
      return;
    }

    (async () => {
      setLoading(true);
      const loadingToast = toast.loading("Creating account...");
      try {
        // Call backend: POST v1/auth/register
        const regRes = await fetch(`${apiBaseUrl}/v1/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const regData = await regRes.json().catch(() => ({}));
        if (!regRes.ok) {
          throw new Error(regData?.message || "Failed to register");
        }

        // Then send OTP
        const otpRes = await fetch(`${apiBaseUrl}/v1/auth/otp/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const otpData = await otpRes.json().catch(() => ({}));
        if (!otpRes.ok) {
          throw new Error(otpData?.message || "Failed to send OTP");
        }

        toast.success("OTP sent to your email!", { id: loadingToast });
        setShowOTP(true);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("Error:", error);
        toast.error(msg || "Failed to register. Please try again.", { id: loadingToast });
      } finally {
        setLoading(false);
      }
    })();
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
        toast.success("Account created successfully!", { id: loadingToast });
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

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-purple-900 via-purple-800 to-gray-900 relative overflow-hidden">
        {/* Background Image or Gradient */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Logo and Text */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <h2 className="text-4xl font-bold mb-2">AMU</h2>
          </div>
          <div>
            <h3 className="text-4xl font-light mb-4">
              Capturing Moments,<br />
              Creating Memories
            </h3>
            <div className="flex gap-3 mt-8">
              <div className="w-3 h-3 bg-white rounded-full opacity-40"></div>
              <div className="w-3 h-3 bg-white rounded-full opacity-100"></div>
              <div className="w-8 h-3 bg-white rounded-full opacity-40"></div>
            </div>
          </div>
        </div>

        {/* Back to website button */}
        <div className="absolute top-6 right-6 z-20">
          <button className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-md transition-all">
            Back to website
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 bg-gray-950 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Show Form or OTP */}
          {!showOTP ? (
            <>
              {/* Heading */}
              <div className="mb-8 animate-in fade-in duration-300">
                <h1 className="text-4xl font-bold text-white mb-2">Create an account</h1>
                <p className="text-gray-400">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium">
                    Log in
                  </Link>
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 mb-6 animate-in fade-in duration-300">
                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-gray-300 mb-2 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                {/* Terms & Conditions Checkbox */}
                <div className="flex items-center gap-3 my-4">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    className="border-gray-600"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-400">
                    I agree to the{" "}
                    <Link href="#" className="text-purple-400 hover:text-purple-300">
                      Terms & Conditions
                    </Link>
                  </label>
                </div>

                {/* Create Account Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors mt-6"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative mb-6 animate-in fade-in duration-300 delay-100">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-950 text-gray-500">Or register with</span>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="flex gap-4 animate-in fade-in duration-300 delay-150">
                <button className="flex-1 h-11 border border-gray-700 rounded-lg text-white font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button className="flex-1 h-11 border border-gray-700 rounded-lg text-white font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.08 2.29.74 3.08.8.905-.24 1.81-.48 2.85-.36 1.64.12 2.86.72 3.6 1.8-3.33 2.02-2.79 6.02.5 7.07-.571 1.78-1.63 2.8-3.07 3.56l-.07-.04z"/>
                  </svg>
                  Apple
                </button>
              </div>
            </>
          ) : (
            <div className="animate-in fade-in duration-300">
              <OTPVerify
                email={email}
                onVerify={handleOTPVerify}
                onResend={handleResendOTP}
                layout="standalone"
                isLoading={loading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
