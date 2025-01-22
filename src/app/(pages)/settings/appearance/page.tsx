"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import Image from "next/image";
import light from "../../../../../public/light.svg";
import dark from "../../../../../public/dark.svg";
import system from "../../../../../public/system.svg";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const themes = [
  {
    name: "System",
    id: "system",
    image: system,
  },
  {
    name: "Light",
    id: "light",
    image: light,
  },
  {
    name: "Dark",
    id: "dark",
    image: dark,
  },
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

interface Preferences {
  language: string;
  theme: string;
}

export default function AppearanceSettings() {
  const { theme, setTheme, systemTheme } = useTheme();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [originalPreferences, setOriginalPreferences] = useState<Preferences>({
    language: "en",
    theme: "system",
  });

  const [currentPreferences, setCurrentPreferences] = useState<Preferences>({
    language: "en",
    theme: "system",
  });

  useEffect(() => {
    const initialPreferences = {
      language: "en",
      theme: theme || "system",
    };
    setOriginalPreferences(initialPreferences);
    setCurrentPreferences(initialPreferences);
  }, [theme]);

  const hasChanges = () => {
    return (
      currentPreferences.language !== originalPreferences.language ||
      currentPreferences.theme !== originalPreferences.theme
    );
  };

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    setCurrentPreferences((prev) => ({ ...prev, theme: themeId }));

    const themeMessage =
      themeId === "system"
        ? `Theme has been set to system (currently ${systemTheme} mode)`
        : `Theme has been changed to ${themeId} mode`;

    toast({
      title: "Theme Updated",
      description: themeMessage,
    });
  };

  const handleLanguageChange = (value: string) => {
    setCurrentPreferences((prev) => ({ ...prev, language: value }));
    toast({
      title: "Language Selection Changed",
      description: `Selected language: ${
        languages.find((lang) => lang.value === value)?.label || value
      }.`,
    });
  };

  const updatePreferences = async () => {
    if (!hasChanges()) {
      toast({
        variant: "destructive",
        title: "No Changes",
        description: "Please make some changes before updating.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOriginalPreferences(currentPreferences);
      toast({
        title: "Preferences Saved",
        description:
          "Your appearance preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to save preferences. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-1">Appearance</h1>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of the app. Automatically switch between day
          and night themes.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Language</Label>
          <Select
            value={currentPreferences.language}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            This is the language that will be used in the dashboard.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Theme</Label>
          <p className="text-sm text-muted-foreground">
            Select the theme for the dashboard.
          </p>
          <div className="flex gap-6 mt-4">
            {themes.map((themeOption) => (
              <div
                key={themeOption.id}
                className="space-y-2 text-center"
                onClick={() => handleThemeChange(themeOption.id)}
              >
                <div
                  suppressHydrationWarning
                  className={cn(
                    "relative cursor-pointer rounded-lg border-2 transition-all p-2",
                    theme === themeOption.id
                      ? "border-ring ring-2 ring-offset-2 ring-ring"
                      : "border-border hover:border-border/80"
                  )}
                >
                  <Image
                    src={themeOption.image}
                    alt={`${themeOption.name} mode`}
                    width={200}
                    height={200}
                  />
                </div>
                <p
                  suppressHydrationWarning
                  className={cn(
                    "text-sm font-medium transition-colors",
                    theme === themeOption.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {themeOption.name}
                </p>
              </div>
            ))}
          </div>
        </div>
        <Button
          onClick={updatePreferences}
          disabled={isLoading || !hasChanges()}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Preferences
            </>
          ) : (
            "Update preferences"
          )}
        </Button>
      </div>
    </div>
  );
}
