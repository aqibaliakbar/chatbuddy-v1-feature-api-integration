"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import confirmImg from "../../../../public/confirm.svg";
import Image from "next/image";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SignupSuccess() {
  const router = useRouter();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRedirect = async () => {
    setIsRedirecting(true);
    try {
      toast({
        title: "Welcome!",
        description: "Redirecting you to the application...",
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
    <div className="min-h-[calc(100vh-16rem)] w-full flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center justify-center relative">
          <div className="relative">
            <Image
              src={confirmImg}
              alt="confirm-img"
              width={80}
              height={80}
              className="dark:invert animate-in zoom-in duration-700"
              priority
            />

            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-center animate-in fade-in duration-700 delay-200">
          Account Created Successfully
        </h1>

        <div className="w-full animate-in fade-in duration-700 delay-300">
          <Button
            className="w-full bg-primary hover:bg-primary/90 h-11 text-[16px]"
            onClick={handleRedirect}
            disabled={isRedirecting}
          >
            {isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              "Go To App"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
