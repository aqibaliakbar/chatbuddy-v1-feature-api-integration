"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link2, Link2Off, Loader2, Plug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useWordPressStore from "@/store/useWordPressStore";
import useChatbotStore from "@/store/useChatbotStore";

export default function WordPressPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const { selectedChatbotId } = useChatbotStore();
  const { isLoading, connection, connectToSite, disconnectSite } =
    useWordPressStore();

  const handleConnect = async () => {
    if (!selectedChatbotId) {
      toast({
        variant: "destructive",
        description: "Please select a chatbot first",
      });
      return;
    }

    if (!url.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter your website URL",
      });
      return;
    }

    try {
      await connectToSite(selectedChatbotId, url.trim());
      toast({
        description: "Successfully connected to WordPress",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Failed to connect to WordPress",
      });
    }
  };

  const handleDisconnect = async () => {
    if (!selectedChatbotId) return;

    try {
      await disconnectSite(selectedChatbotId);
      setUrl("");
      toast({
        description: "Disconnected from WordPress",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to disconnect from WordPress",
      });
    }
  };

  if (!selectedChatbotId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No Chatbot Selected</h2>
          <p className="text-muted-foreground">
            Please select a chatbot from the header to manage WordPress
            integration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="xl:mr-96 p-6">
      <div className="flex items-center space-x-2 mb-8">
        <h2 className="text-xl font-semibold">Add New Sources</h2>
        <Badge
          variant="secondary"
          className="rounded-md bg-blue-50 text-blue-600 hover:bg-blue-50"
        >
          WordPress
        </Badge>
      </div>

      {!connection ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-gray-700">
              Enter your website URL:
            </label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="max-w-xl"
              placeholder="https://www.example-shop.com"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            variant="default"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Plug className="h-4 w-4" />
                Connect to WordPress
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-start space-x-2">
            <div className="text-sm text-muted-foreground bg-cmuted p-2 px-6 rounded-lg italic">
              {connection.url}
            </div>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <Link2Off className="h-4 w-4" />
                  Disconnect
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500 italic">
            Last Trained: {connection.lastTrained}
          </p>
        </div>
      )}
    </div>
  );
}
