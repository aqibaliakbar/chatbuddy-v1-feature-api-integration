"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useAuthStore from "@/store/useAuthStore";
import signupLogo from "../../../../public/sign-up.svg";
import Image from "next/image";
import { Lock, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function LoadingState() {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading signup form...</p>
      </div>
    </div>
  );
}

function SignupFormContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { signUp, isLoading, error } = useAuthStore();

  useEffect(() => {
    const email = searchParams.get("email");
    if (!email) {
      toast({
        variant: "destructive",
        title: "Invalid Access",
        description: "Redirecting to signup page...",
      });
      router.push("/signup");
    } else {
      setFormData((prev) => ({ ...prev, email }));
    }
  }, [searchParams, router, toast]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter your name.",
      });
      return false;
    }

    if (formData.password.length < 8) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match.",
      });
      return false;
    }

    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
      });
      toast({
        title: "Account Created",
        description: "Please check your email to verify your account.",
      });
      setIsVerificationSent(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Failed to create account. Please try again.",
      });
    }
  };

  if (isVerificationSent) {
    return (
      <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-12 w-12 text-primary" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                We sent a verification link to
                <br />
                <span className="font-medium text-foreground">
                  {formData.email}
                </span>
              </p>
            </div>

            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => router.push("/login")}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="mb-4">
            <Image
              src={signupLogo}
              alt="signup-logo"
              width={100}
              height={100}
              className="dark:invert"
              priority
            />
          </div>
          <h1 className="text-2xl font-semibold">You&apos;re in!</h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-background"
            />

            <div className="relative">
              <Input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="pr-10 bg-muted"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <Lock className="h-4 w-4 text-muted-foreground/40" />
              </span>
            </div>

            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-background"
            />

            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="bg-background"
            />

            <p className="text-sm text-muted-foreground mt-2">
              Use 8 or more characters with a mix of letters, numbers & symbols
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 h-11"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function SignupForm() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SignupFormContent />
    </Suspense>
  );
}
