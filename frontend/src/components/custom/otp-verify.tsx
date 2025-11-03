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
}

export default function OTPVerify({
  email,
  onVerify,
  onResend,
  isLoading = false,
}: OTPVerifyProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-black p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-2xl p-8">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">BrickChain</h1>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Verify your email</h2>
          <p className="text-sm text-gray-600 mt-2">
            We&apos;ve sent a code to{" "}
            <span className="font-medium text-black">{email}</span>
          </p>
        </div>

        {/* OTP Input Fields with Animations */}
        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-4">
            {otp.map((digit, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                {/* Animated glow background */}
                <motion.div
                  className={cn(
                    "absolute inset-0 rounded-lg",
                    "border border-cyan-400"
                  )}
                  initial={{
                    opacity: 0,
                    scale: 1,
                    filter: "blur(0px)",
                  }}
                  animate={{
                    opacity: activeIndex === index ? 1 : 0,
                    scale: activeIndex === index ? 1 : 0.85,
                    filter: activeIndex === index ? "blur(0px)" : "blur(2px)",
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  style={{
                    boxShadow:
                      activeIndex === index
                        ? "inset 0 0 12px rgba(34, 211, 238, 0.6), 0 0 12px rgba(34, 211, 238, 0.4)"
                        : "inset 0 0 8px rgba(34, 211, 238, 0.3)",
                  }}
                />

                {/* Input field */}
                <input
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
                  className={cn(
                    "relative h-12 w-12 text-center text-xl font-bold rounded-lg border-2 transition-all",
                    "bg-linear-to-br from-neutral-800 to-neutral-900 text-white",
                    "focus:outline-none focus:ring-2 focus:ring-offset-0",
                    digit
                      ? "border-cyan-400 focus:border-cyan-400 focus:ring-cyan-400"
                      : "border-neutral-700 focus:border-cyan-400 focus:ring-cyan-400"
                  )}
                  aria-label={`OTP digit ${index + 1}`}
                />

                {/* Animated digit entrance */}
                {digit && (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={!isComplete || loading || isLoading}
              className="w-full h-10 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
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
        </div>

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
            className={`font-medium transition-colors ${
              resendCooldown > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-black hover:underline"
            }`}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
