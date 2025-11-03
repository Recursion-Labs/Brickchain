"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { AnimatedInput } from "@/components/ui/animated-input";
import { cn } from "@/lib/utils";

export default function ContactUsPage() {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [agreeToPolicy, setAgreeToPolicy] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formSuccess, setFormSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
      setFormError("Please fill in all required fields before sending your message.");
      setFormSuccess(null);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setFormError("Please enter a valid email address.");
      setFormSuccess(null);
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    const envApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
    const fallbackBase =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "http://localhost:3000";
    const apiBaseUrl = envApiBase && envApiBase.length ? envApiBase : fallbackBase;
    const endpoint = `${apiBaseUrl}/v1/public/contact`;

    const payload = {
      name: `${trimmedFirstName} ${trimmedLastName}`.trim(),
      subject: trimmedSubject,
      email: trimmedEmail,
      message: trimmedMessage,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Unable to send your message right now.");
      }

      setFormSuccess("Thanks for reaching out! We\'ll get back to you soon.");

      // Clear form
      setFirstName("");
      setLastName("");
      setSubject("");
      setEmail("");
      setMessage("");
      setAgreeToPolicy(false);
    } catch (err) {
      console.error("Failed to submit contact form", err);
      setFormError(
        err instanceof Error ? err.message : "Something went wrong while sending your message. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 py-16">
      <div className="mx-auto flex max-w-7xl items-start gap-12">
        {/* Left info card */}
        <div className="hidden w-full max-w-md flex-col gap-5 rounded-3xl bg-linear-to-b from-blue-400 to-blue-200 p-12 text-white lg:flex" style={{ minHeight: '600px' }}>
          <h3 className="text-2xl font-bold">Get in touch</h3>

          <div className="space-y-1">
            <p className="text-sm font-semibold">Visit us</p>
            <p className="text-sm leading-relaxed">
              Come say hello at our office HQ.
            </p>
            <p className="text-sm">
              67 Wisteria Way Croydon South VIC 3136 AU
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold">Chat to us</p>
            <p className="text-sm">
              Our friendly team is here to help.
            </p>
            <p className="text-sm">hello@paysphere.com</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold">Call us</p>
            <p className="text-sm">Mon-Fri from 8am to 5pm</p>
            <p className="text-sm">(+995) 555-55-55-55</p>
          </div>

          <div>
            <p className="text-sm font-semibold">Social media</p>
            <div className="mt-3 flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center text-white transition hover:text-white/80"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center text-white transition hover:text-white/80"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center text-white transition hover:text-white/80"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center text-white transition hover:text-white/80"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="flex-1">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Contact us</h2>
            <p className="mt-3 text-neutral-400">
              Send us a message and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <LabelInputContainer>
                <Label htmlFor="firstname" className="text-white">
                  First Name
                </Label>
                <AnimatedInput
                  id="firstname"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="lastname" className="text-white">
                  Last Name
                </Label>
                <AnimatedInput
                  id="lastname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                />
              </LabelInputContainer>
            </div>

            <LabelInputContainer>
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <AnimatedInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Random@gmail.com"
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="subject" className="text-white">
                Subject
              </Label>
              <AnimatedInput
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="message" className="text-white">
                Message
              </Label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what we can help you with"
                rows={5}
                className={cn(
                  "w-full resize-none rounded-md border border-neutral-700 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none",
                )}
              />
            </LabelInputContainer>

            <div className="flex items-start gap-3">
              <input
                id="policy"
                type="checkbox"
                checked={agreeToPolicy}
                onChange={(e) => setAgreeToPolicy(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-600 bg-zinc-900 text-blue-500 focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="policy" className="text-sm text-neutral-400">
                I&apos;d like to receive more information about company. I understand and agree to the{" "}
                <a href="/privacy" className="text-blue-400 underline">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {formError && (
              <p className="text-sm text-red-400" role="alert">
                {formError}
              </p>
            )}

            {formSuccess && (
              <p className="text-sm text-emerald-400" role="status">
                {formSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function LabelInputContainer({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}
