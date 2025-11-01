"use client";

import React, { useState } from "react";

import { BackgroundLines } from "@/components/ui/background-lines";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient, type ApiResponse } from "@/lib/api";

const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ isOpen: false, type: 'success', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setPopup({
        isOpen: true,
        type: 'error',
        message: 'Please enter a valid email address'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response: ApiResponse = await apiClient.joinWaitlist(email.trim());

      if (response.success) {
        setPopup({
          isOpen: true,
          type: 'success',
          message: response.message || 'Successfully joined the waitlist!'
        });
        setEmail("");
      } else {
        setPopup({
          isOpen: true,
          type: 'error',
          message: response.message || 'Failed to join waitlist. Please try again.'
        });
      }
    } catch (error) {
      setPopup({
        isOpen: true,
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
      console.error("Waitlist submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePopup = () => {
    setPopup({ isOpen: false, type: 'success', message: '' });
  };

  return (
    <section className="flex h-full min-h-screen w-screen items-center justify-center overflow-hidden py-32 bg-white text-black">
      <BackgroundLines className="container flex w-full flex-col items-center justify-center px-4 md:h-full">
        <h2 className="relative z-20 py-2 text-center font-sans text-5xl font-semibold tracking-tighter md:py-10 lg:text-8xl">
          Join the Waitlist
        </h2>
        <p className="text-md text-muted-foreground mx-auto max-w-xl text-center lg:text-lg">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <form onSubmit={handleSubmit} className="relative z-20 mt-10 flex w-full max-w-md items-center gap-3 rounded-full p-1">
          <Input
            className="bg-muted h-10 w-full rounded-xl border-none shadow-none ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-0 active:ring-0"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <Button type="submit" className="h-10 rounded-xl" disabled={isSubmitting}>
            {isSubmitting ? "Joining..." : "Join the Waitlist"}
          </Button>
        </form>
        <div className="mt-10 flex items-center gap-2">
          <span className="inline-flex items-center -space-x-2.5">
            {Array.from({ length: 6 }).map((_, index) => (
              <Avatar key={index} className="size-8">
                <AvatarImage
                  src={`https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri3/avatar${index + 1}.png`}
                  alt="placeholder"
                />
              </Avatar>
            ))}
          </span>
          <p className="text-muted-foreground/80 tracking-tight">
            +1000 people already joined
          </p>
        </div>
      </BackgroundLines>

      {/* Popup Modal */}
      {popup.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out">
            <div className="flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full animate-in zoom-in duration-500 delay-150 ${
                popup.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {popup.type === 'success' ? (
                  <svg className="h-6 w-6 text-green-600 animate-in zoom-in duration-300 delay-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-600 animate-in zoom-in duration-300 delay-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4 animate-in slide-in-from-bottom-2 duration-300 delay-200">
              <h3 className={`text-lg font-semibold animate-in slide-in-from-bottom-1 duration-300 delay-300 ${
                popup.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {popup.type === 'success' ? 'Success!' : 'Oops!'}
              </h3>
              <p className={`mt-2 text-sm animate-in slide-in-from-bottom-1 duration-300 delay-400 ${
                popup.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {popup.message}
              </p>
            </div>
            <div className="mt-6 flex justify-end animate-in slide-in-from-bottom-2 duration-300 delay-500">
              <Button
                onClick={closePopup}
                className={`transition-all duration-200 hover:scale-105 ${
                  popup.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {popup.type === 'success' ? 'Great!' : 'Try Again'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export { Waitlist };
