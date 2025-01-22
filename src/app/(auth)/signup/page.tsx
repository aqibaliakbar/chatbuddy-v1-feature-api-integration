"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useAuthStore from "@/store/useAuthStore";
import logo from "../../../../public/logo.svg";
import sparkles from "../../../../public/sparkles.svg";
import hand from "../../../../public/hand.svg";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SignUp() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signInWithGoogle, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter your email address.",
      });
      return;
    }

    try {
      toast({
        title: "Proceeding to Sign Up",
        description: "Taking you to the registration form...",
      });
      router.push(`/signup-form?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to proceed. Please try again.",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Success",
        description: "Successfully signed in with Google.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: "Failed to sign in with Google. Please try again.",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
  ];

  return (
    <div className="min-h-screen flex p-4">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/signup-bg.jpg')]"></div>
        <div className="relative z-10 flex flex-col w-full h-full p-12">
          <div className="flex-grow  flex flex-col justify-center items-center leading-none text-left">
            <h1 className="text-5xl xl:text-[86px] font-extrabold relative text-white mb-4  ">
              <span className="z-20 absolute top-[-90px] left-0">
                <Image src={sparkles} alt="decoration" width={90} height={90} />
              </span>
              The ultimate
              <br />
              <span className="text-orange-500">AI solution</span> for
              <br />
              <span className="text-purple-500">businesses</span>
              <span className="z-20 absolute bottom-[-6] right-[-2]">
                <Image src={hand} alt="decoration" width={120} height={120} />
              </span>
            </h1>

            <p className="text-white mb-8 xl:ml-[-24px] xl:text-left text-center xl:text-[20px]  leading-5 ">
              Start your journey to smarter customer interactions:
              <br />
              train, customize and manage your chatbot all in one place.
            </p>
          </div>

          <div className="text-gray-400 flex items-center justify-center space-x-4 mt-auto">
            <div className="flex items-center">
              <Select defaultValue="en">
                <SelectTrigger className="w-[140px] h-9">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>© 2024 Chatbuddy. All rights reserved.</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 flex justify-end">
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-sm space-y-6">
            <div className="flex justify-start object-cover">
              <Image
                src={logo}
                alt="logo"
                width={40}
                height={40}
                className="dark:invert"
              />
            </div>

            <div className="space-y-2 text-left">
              <h1 className="text-3xl font-bold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to create your account
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-[16px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign In with Email"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading || googleLoading}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting to Google...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                  Or sign in with Google
                </>
              )}
            </Button>

            <p className="text-left text-md text-muted-foreground">
              Signing up for a Chatbuddy account means you agree to the{" "}
              <Link
                href="/terms"
                className="underline hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}