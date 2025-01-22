"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import confirmImg from "../../../../public/confirm.svg";
import Image from "next/image";
import { Lock, Loader2 } from "lucide-react";
import { useState, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";

function PasswordResetSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const email = searchParams.get("email") || "";

  const handleRedirect = async () => {
    setIsRedirecting(true);
    try {
      toast({
        title: "Welcome Back!",
        description: "Taking you to Chatbuddy...",
      });
      await router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: "Failed to redirect. Please try again.",
      });
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center justify-center">
          <div className="relative">
            <Image
              src={confirmImg}
              alt="confirm-img"
              width={100}
              height={100}
              className="dark:invert animate-in zoom-in duration-700"
              priority
            />
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-center animate-in fade-in duration-700 delay-200">
          You&apos;re in!
        </h1>
        <div className="w-full animate-in fade-in duration-700 delay-300">
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="email"
                value={email}
                disabled
                className="bg-muted text-center"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <Lock className="h-4 w-4 text-muted-foreground/40" />
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center animate-in fade-in duration-700 delay-400">
          Password Reset Successfully
        </p>
        <Button
          className="w-full bg-primary hover:bg-primary/90 h-11 text-[16px] animate-in fade-in duration-700 delay-500"
          onClick={handleRedirect}
          disabled={isRedirecting}
        >
          {isRedirecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            "Go to Chatbuddy"
          )}
        </Button>
      </div>
    </div>
  );
}

export default function PasswordResetSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <PasswordResetSuccessContent />
    </Suspense>
  );
}
