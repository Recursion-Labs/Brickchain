"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface OTPVerifyProps {
  email: string;
  onVerify?: (otp: string) => void;
  onResend?: () => void;
  isLoading?: boolean;
  /** layout: 'full' renders a full screen card. 'panel' renders white card only. 'standalone' renders full right-side design. */
  layout?: "full" | "panel" | "standalone";
}

export default function OTPVerify({
  email,
  onVerify,
  onResend,
  isLoading = false,
  layout = "full",
}: OTPVerifyProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expiryTime, setExpiryTime] = useState(300); // 5 minutes in seconds
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (expiryTime > 0) {
      const timer = setTimeout(() => setExpiryTime(expiryTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [expiryTime]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setActiveIndex(index);

    // Auto-focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 5) return;

    setLoading(true);
    try {
      if (onVerify) {
        await onVerify(otpCode);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendCooldown(60);
    if (onResend) {
      await onResend();
    }
  };

  const isComplete = otp.every((digit) => digit);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const PanelContent = (
    <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 border border-gray-50">
      {/* Brand Logo */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-black tracking-tight">BrickChain</h1>
      </div>

      {/* Heading */}
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-black">Verify your email</h2>
        <p className="text-sm text-gray-600 mt-3">
          We&apos;ve sent a code to <span className="font-semibold text-gray-800">{email}</span>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Code expires in <span className={`font-semibold ${expiryTime <= 60 ? "text-red-500" : "text-gray-600"}`}>{formatTime(expiryTime)}</span>
        </p>
      </div>

      {/* OTP Input Fields with Animations */}
      <div className="flex justify-center gap-2 mb-8">
        {otp.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => {
              if (!digit) setActiveIndex(null);
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "h-16 w-16 text-center text-2xl font-bold rounded-xl transition-all",
              "bg-neutral-900 text-white",
              "border-2",
              activeIndex === index
                ? "border-purple-500 shadow-lg shadow-purple-500/50"
                : "border-neutral-800 hover:border-neutral-600",
              "focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/50"
            )}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || loading || isLoading}
          className="w-full h-12 bg-linear-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-purple-600 transition-all disabled:opacity-50"
        >
          {loading || isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            "Verify"
          )}
        </Button>
      </motion.div>

      {/* Resend Link */}
      <motion.div
        className="text-center text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span className="text-gray-600">Didn&apos;t receive the code? </span>
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className={`font-semibold transition-colors ${
            resendCooldown > 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-purple-600 hover:text-purple-700"
          }`}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
        </button>
      </motion.div>
    </div>
  );

  const StandaloneContent = (
    <div className="w-full">
      <div className="mb-8 animate-in fade-in duration-300">
        <h1 className="text-4xl font-bold text-white mb-2">Verify your email</h1>
        <p className="text-gray-400">
          We&apos;ve sent a code to {email}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Code expires in <span className={`font-semibold ${expiryTime <= 60 ? "text-red-400" : "text-gray-400"}`}>{formatTime(expiryTime)}</span>
        </p>
      </div>

      {/* OTP Input Fields */}
      <div className="flex justify-center gap-3 mb-8 animate-in fade-in duration-300 delay-100">
        {otp.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => {
              if (!digit) setActiveIndex(null);
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "h-16 w-16 text-center text-2xl font-bold rounded-xl transition-all",
              "bg-gray-800 text-white",
              "border-2",
              activeIndex === index
                ? "border-purple-500 shadow-lg shadow-purple-500/50"
                : "border-gray-700 hover:border-gray-600",
              "focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/50"
            )}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 animate-in fade-in duration-300 delay-150"
      >
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || loading || isLoading}
          className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {loading || isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            "Verify"
          )}
        </Button>
      </motion.div>

      {/* Resend Link */}
      <motion.div
        className="text-center text-sm animate-in fade-in duration-300 delay-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span className="text-gray-400">Didn&apos;t receive the code? </span>
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className={`font-medium transition-colors ${
            resendCooldown > 0
              ? "text-gray-500 cursor-not-allowed"
              : "text-purple-400 hover:text-purple-300"
          }`}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
        </button>
      </motion.div>
    </div>
  );

  if (layout === "panel") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {PanelContent}
      </motion.div>
    );
  }

  if (layout === "standalone") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {StandaloneContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-background p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {PanelContent}
    </motion.div>
  );
}
