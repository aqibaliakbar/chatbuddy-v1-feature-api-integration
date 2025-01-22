"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CirclePlus, Loader2, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import useChatbotStore from "@/store/useChatbotStore";

export default function LinksPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showInput, setShowInput] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [currentScrappingId, setCurrentScrappingId] = useState("");

  const {
    selectedChatbotId,
    scrapeProgress,
    streamStatus,
    scrapUrl,
    trainChatbot,
    scannedUrls,
    getChatbots,
    error,
    isLoading,
    removeUrl,
  } = useChatbotStore();

  // Handle errors from store
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);

  const validateUrl = (urlString: string) => {
    try {
      const url = new URL(urlString.trim());
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAddUrl = () => {
    if (showInput) {
      if (!newUrl.trim()) return;

      if (!selectedChatbotId) {
        toast({
          variant: "destructive",
          description: "Please select a chatbot first",
        });
        return;
      }

      if (!validateUrl(newUrl)) {
        toast({
          variant: "destructive",
          description: "Please enter a valid URL with http:// or https://",
        });
        return;
      }

      handleScrapUrl(newUrl.trim());
      setNewUrl("");
      setShowInput(false);
    } else {
      setShowInput(true);
    }
  };

  const handleScrapUrl = async (url: string) => {
    if (!selectedChatbotId) return;

    try {
      const scrappingId = await scrapUrl(selectedChatbotId, url);
      setCurrentScrappingId(scrappingId);
    } catch (error) {
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Failed to scrape URL",
      });
    }
  };

  const handleTrainBot = async () => {
    if (!selectedChatbotId || !currentScrappingId) {
      toast({
        variant: "destructive",
        description: "Please select a chatbot and scrape URLs first",
      });
      return;
    }

    if (scannedUrls.length === 0) {
      toast({
        variant: "destructive",
        description: "Please add at least one URL to train",
      });
      return;
    }

    setIsTraining(true);
    try {
      await trainChatbot(selectedChatbotId, currentScrappingId);

      toast({
        title: "Success",
        description: "Training has started successfully",
      });

      await getChatbots();

      setTimeout(() => {
        router.push("/knowledge");
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Failed to train bot",
      });
    } finally {
      setIsTraining(false);
    }
  };

  const handleRemoveLink = (url: string) => {
    removeUrl(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-[72%]">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold">Add New Sources</h2>
        <Badge variant="secondary">Links</Badge>
      </div>

      <div className="space-y-2">
        {scannedUrls.map((url) => (
          <div
            key={url}
            className="flex items-center justify-between rounded-md border bg-background px-4 py-2 w-auto"
          >
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm truncate">{url}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleRemoveLink(url)}
              disabled={isTraining}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {showInput && (
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newUrl.trim()) {
                handleAddUrl();
              }
            }}
            placeholder="Enter URL (e.g., https://example.com)"
            className="text-sm"
            autoFocus
            disabled={isLoading}
          />
        )}

        {isLoading && (
          <div className="space-y-2">
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${scrapeProgress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{streamStatus}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleAddUrl}
          disabled={isLoading || isTraining}
        >
          <CirclePlus className="h-4 w-4" />
          Add URL
        </Button>
        {scannedUrls.length > 0 && (
          <Button
            onClick={handleTrainBot}
            size="sm"
            disabled={isTraining || isLoading}
          >
            {isTraining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Training...
              </>
            ) : (
              `Train bot with ${scannedUrls.length} URL${
                scannedUrls.length !== 1 ? "s" : ""
              }`
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
