"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const notifications = [
  {
    id: "communication",
    title: "Communication emails",
    description: "Receive emails about your account activity.",
    enabled: true,
  },
  {
    id: "marketing",
    title: "Marketing emails",
    description: "Receive emails about new products, features, and more.",
    enabled: false,
  },
  {
    id: "social",
    title: "Social emails",
    description: "Receive emails for friend requests, follows, and more.",
    enabled: true,
  },
  {
    id: "security",
    title: "Security emails",
    description: "Receive emails about your account activity and security.",
    enabled: true,
  },
];

export default function NotificationsSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(notifications);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (id: string) => {
    setSettings(
      settings.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
    setHasChanges(true);
  };

  const handleUpdateNotifications = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Preferences Updated",
        description:
          "Your notification preferences have been saved successfully.",
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          "Failed to save notification preferences. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-1">Email Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Manage your email notification preferences.
        </p>
      </div>
      <div className="space-y-6">
        {settings.map((setting) => (
          <Card key={setting.id} className="shadow-sm">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <h3 className="font-medium leading-none">{setting.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              </div>
              <Switch
                checked={setting.enabled}
                onCheckedChange={() => handleToggle(setting.id)}
                className="ml-4"
              />
            </CardContent>
          </Card>
        ))}
        <Button
          onClick={handleUpdateNotifications}
          disabled={isSaving || !hasChanges}
          className="bg-primary hover:bg-primary/90 disabled:bg-primary/70"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes
            </>
          ) : (
            "Update notifications"
          )}
        </Button>
      </div>
    </div>
  );
}
