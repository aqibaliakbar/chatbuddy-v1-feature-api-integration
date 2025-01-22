"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import updateImage from "../../../../public/update-password.svg";
import Image from "next/image";
import { Lock, Loader2 } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";

export default function UpdatePassword() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const { updatePassword, session, isLoading, error } = useAuthStore();
  const userEmail = session?.user?.email || "";
  const router = useRouter();

  const validatePassword = () => {
    if (formData.password.length < 8) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: "Password must be at least 8 characters long.",
      });
      return false;
    }

    if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        formData.password
      )
    ) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description:
          "Password must include uppercase, lowercase, number, and special character.",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    try {
      await updatePassword(formData.password);
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });

      const userEmail = session?.user?.email;
      if (userEmail) {
        router.push(
          `/password-reset-success?email=${encodeURIComponent(userEmail)}`
        );
      } else {
        router.push("/password-reset-success");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update password. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center mb-6">
          <Image
            src={updateImage}
            alt="update-img"
            width={100}
            height={100}
            className="dark:invert"
            priority
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-center">
            Update your password
          </h1>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="email"
                value={userEmail}
                disabled
                className="bg-muted"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <Lock className="h-4 w-4 text-muted-foreground/40" />
              </span>
            </div>
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="bg-background"
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              className="bg-background"
            />
            <p className="text-sm text-muted-foreground">
              Use 8 or more characters with a mix of letters, numbers & symbols
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-[16px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
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
