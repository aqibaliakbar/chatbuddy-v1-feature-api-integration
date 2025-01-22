"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, isLoading, error } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address.",
      });
      return;
    }

    try {
      await resetPassword(email);
      setIsSubmitted(true);
      toast({
        title: "Instructions Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Failed to send reset instructions. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Reset your password
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your email and we&apos;ll send you instructions on how to
            reset your password.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isSubmitted ? (
          <Alert>
            <AlertDescription className="text-sm">
              Check your email for password reset instructions.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email Address"
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
                  Sending Instructions...
                </>
              ) : (
                "Send instructions"
              )}
            </Button>
          </form>
        )}

        <div className="text-left">
          <Link href="/login" className="text-sm text-muted-foreground ">
            Go back to{" "}
            <span className="underline hover:text-primary transition-colors">
              login page
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
