"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link2, Link2Off, Plug } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CustomWebsiteConnection {
  url: string;
  lastTrained: string;
}

export default function CustomWebsitePage() {
  const { toast } = useToast();
  const [connection, setConnection] = useState<CustomWebsiteConnection | null>(
    null
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [url, setUrl] = useState("");

  const handleConnect = async () => {
    if (!url.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter a website URL",
      });
      return;
    }

    setIsConnecting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setConnection({
        url: url,
        lastTrained: "12.08.2023 at 14:15",
      });
      toast({
        description: "Successfully connected to website",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to connect to website",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnection(null);
    setUrl("");
    toast({
      description: "Disconnected from website",
    });
  };

  return (
    <div className="xl:mr-96 space-y-6 ">
      <div className="flex items-center space-x-2 mb-6">
        <h1 className="text-xl font-semibold">Add New Sources</h1>
        <Badge
          variant="secondary"
          className="rounded-md bg-zinc-100 hover:bg-zinc-100 text-zinc-900"
        >
          Custom Website
        </Badge>
      </div>

      {!connection ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="font-medium">Connect to Custom Website</h2>
            <p className="text-sm text-muted-foreground">
              Enter the custom website URL to fetch your product data (JSON
              format):
            </p>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example-shop.com"
              className="max-w-xl"
            />
          </div>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? (
              <span className="animate-spin">⋯</span>
            ) : (
              <Plug className="w-4 h-4" />
            )}
            Connect Custom Website
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground bg-cmuted p-2 px-6 rounded-sm italic">
              {connection.url}
            </div>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="gap-2"
            >
              <Link2Off className="h-4 w-4" />
              Disconnect
            </Button>
          </div>
          <p className="text-sm text-zinc-500 italic">
            Last Trained: {connection.lastTrained}
          </p>
        </div>
      )}
    </div>
  );
}
