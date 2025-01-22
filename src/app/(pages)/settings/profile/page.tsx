"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Trash } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { Separator } from "@/components/ui/separator";
import ResponsibilitiesSection from "./components/ResponsibilitiesSection";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  username: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export default function ProfileSettings() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { session, isLoading, updateUser } = useAuthStore();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<Profile>({
    username: "",
    name: "",
    email: "",
    avatarUrl: "",
  });
  const [profile, setProfile] = useState<Profile>({
    username: "",
    name: "",
    email: "",
    avatarUrl: "",
  });
  const [selectedResponsibilities, setSelectedResponsibilities] = useState([
    "Customer Service",
  ]);

  const hasChanges = () => {
    return (
      profile.username !== originalProfile.username ||
      profile.name !== originalProfile.name ||
      profile.avatarUrl !== originalProfile.avatarUrl
    );
  };

  useEffect(() => {
    if (session?.user) {
      const initialProfile = {
        username: session.user.user_metadata?.username || "",
        name: session.user.user_metadata?.name || "",
        email: session.user.email || "",
        avatarUrl: session.user.user_metadata?.avatar_url || "",
      };
      setProfile(initialProfile);
      setOriginalProfile(initialProfile);
    }
  }, [session]);

  const handleRemoveResponsibility = (responsibility: string) => {
    setSelectedResponsibilities((prev) =>
      prev.filter((r) => r !== responsibility)
    );
    toast({
      title: "Responsibility Removed",
      description: `${responsibility} has been removed from your profile.`,
    });
  };

  const handleAddResponsibility = (responsibility: string) => {
    setSelectedResponsibilities((prev) => [...prev, responsibility]);
    toast({
      title: "Responsibility Added",
      description: `${responsibility} has been added to your profile.`,
    });
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({
        ...prev,
        avatarUrl: imageUrl,
      }));
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been successfully updated.",
      });
    } catch (error) {
      console.error("Error handling image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!hasChanges()) {
      toast({
        variant: "destructive",
        title: "No Changes",
        description: "Please make some changes before updating.",
      });
      return;
    }

    try {
      await updateUser({
        username: profile.username,
        name: profile.name,
      });
      setOriginalProfile(profile);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    }
  };

  const handleRemoveImage = () => {
    setProfile((prev) => ({
      ...prev,
      avatarUrl: "",
    }));
    toast({
      title: "Profile Picture Removed",
      description: "Your profile picture has been removed.",
    });
  };

  const getInitials = () => {
    if (profile.name) {
      return profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return profile.username ? profile.username[0].toUpperCase() : "U";
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-1">Profile</h1>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex items-center gap-2">
        <Avatar className="h-20 w-20 rounded-md">
          <AvatarImage
            src={profile.avatarUrl}
            alt={profile.name || "Profile picture"}
          />
          <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
        </Avatar>
        <div className="flex gap-2">
          <Input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
          <Button
            variant="outline"
            size="lg"
            disabled={uploadingImage}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadingImage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading
              </>
            ) : (
              "Change"
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleRemoveImage}
            disabled={!profile.avatarUrl}
          >
            <Trash className="h-8 w-8" />
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={profile.username}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, username: e.target.value }))
            }
            placeholder="@username"
            className="max-w-xl"
          />
          <p className="text-sm text-muted-foreground">
            This is your public display name. It can be your real name or a
            pseudonym.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Your name"
            className="max-w-xl"
          />
          <p className="text-sm text-muted-foreground">
            This is the name that will be displayed on your profile and in
            emails.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            disabled
            className="max-w-xl bg-muted"
          />
        </div>

        <div className="space-y-2">
          <ResponsibilitiesSection
            selectedResponsibilities={selectedResponsibilities}
            onRemove={handleRemoveResponsibility}
            onAdd={handleAddResponsibility}
          />
          <p className="text-sm text-muted-foreground">
            Enter keywords for your role to help route inquiries to the right
            contact.
          </p>
        </div>

        <Button
          onClick={handleUpdateProfile}
          disabled={isLoading || !hasChanges()}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Profile
            </>
          ) : (
            "Update profile"
          )}
        </Button>
      </div>
    </div>
  );
}
