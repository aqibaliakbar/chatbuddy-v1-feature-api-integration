"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuthStore from "@/store/useAuthStore";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PasswordSettings() {
  const { updatePassword, isLoading } = useAuthStore();
  const { toast } = useToast();
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleUpdatePassword = async () => {
    if (!passwords.current) {
      toast({
        variant: "destructive",
        title: "Current Password Required",
        description: "Please enter your current password.",
      });
      return;
    }

    if (passwords.new.length < 8) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: "New password must be at least 8 characters long.",
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        variant: "destructive",
        title: "Passwords Don't Match",
        description: "New password and confirmation password must match.",
      });
      return;
    }

    try {
      await updatePassword(passwords.new);
      setPasswords({ current: "", new: "", confirm: "" });
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update password. Please try again.",
      });
    }
  };

  const isValidForm = () => {
    return (
      passwords.current &&
      passwords.new &&
      passwords.confirm &&
      passwords.new.length >= 8 &&
      passwords.new === passwords.confirm
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-1">Update Password</h1>
        <p className="text-sm text-muted-foreground">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={passwords.current}
            onChange={(e) =>
              setPasswords((prev) => ({ ...prev, current: e.target.value }))
            }
            className="max-w-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={passwords.new}
            onChange={(e) =>
              setPasswords((prev) => ({ ...prev, new: e.target.value }))
            }
            className="max-w-xl"
          />
          <p className="text-sm text-muted-foreground">
            Choose a strong password with at least 8 characters
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords((prev) => ({ ...prev, confirm: e.target.value }))
            }
            className="max-w-xl"
          />
        </div>
        <Button
          onClick={handleUpdatePassword}
          disabled={isLoading || !isValidForm()}
          className="bg-primary hover:bg-primary/90 disabled:bg-primary/70"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Password
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </div>
    </div>
  );
}
