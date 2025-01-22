"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link2Off, Loader2, Plug } from "lucide-react";
import useShopifyStore from "@/store/useShopifyStore";
import useChatbotStore from "@/store/useChatbotStore";
import { useSearchParams, useRouter } from "next/navigation";

export default function ShopifyPage() {
  const { toast } = useToast();
  const [storeName, setStoreName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { selectedChatbotId } = useChatbotStore();
  const {
    isLoading,
    connection,
    error,
    getAuthUrl,
    connectWithCode,
    disconnectStore,
  } = useShopifyStore();

  // Handle OAuth callback
  useEffect(() => {
    const handleShopifyCallback = async () => {
      const code = searchParams.get("code");

      if (code && selectedChatbotId) {
        try {
          await connectWithCode(
            selectedChatbotId,

            storeName || "default-store",
            code
          );

          toast({
            description: "Successfully connected to Shopify",
          });

          router.push("/add-sources/shopify");
        } catch (error) {
          toast({
            variant: "destructive",
            description:
              error instanceof Error
                ? error.message
                : "Failed to connect to Shopify",
          });
        }
      }
    };

    handleShopifyCallback();
  }, [
    searchParams,
    selectedChatbotId,
    connectWithCode,
    toast,
    router,
    storeName,
  ]);

  const handleConnect = async () => {
    if (!selectedChatbotId) {
      toast({
        variant: "destructive",
        description: "Please select a chatbot first",
      });
      return;
    }

    if (!storeName.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter your Shopify store name",
      });
      return;
    }

    try {
      const cleanStoreName = storeName
        .trim()
        .toLowerCase()
        .replace(".myshopify.com", "")
        .replace(/[^a-z0-9-]/g, "-");

      await getAuthUrl(selectedChatbotId, cleanStoreName);
    } catch (error) {
      console.error("Shopify connection error:", error);
      toast({
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Failed to connect to Shopify",
      });
    }
  };

  const handleDisconnect = async () => {
    if (!selectedChatbotId) return;

    try {
      await disconnectStore(selectedChatbotId);
      setStoreName("");
      toast({
        description: "Disconnected from Shopify",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to disconnect from Shopify",
      });
    }
  };

  if (!selectedChatbotId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No Chatbot Selected</h2>
          <p className="text-muted-foreground">
            Please select a chatbot from the header to manage Shopify
            integration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="xl:mr-96 space-y-6">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold">Add New Sources</h2>
        <div className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-900 font-medium">
          Shopify
        </div>
      </div>

      {!connection ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Enter your Shopify Store Name:
            </label>
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="max-w-xl"
              placeholder="your-store-name"
              disabled={isLoading}
              title="Enter your store name without .myshopify.com"
            />
            <p className="text-sm text-muted-foreground">
              Enter only the store name without .myshopify.com
            </p>
          </div>
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            variant="default"
            size="sm"
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
                Connect to Shopify
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="rounded-md px-4 py-3 space-y-1">
          <div className="flex items-center justify-start gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground bg-cmuted p-2 px-6 rounded-sm italic">
                Store: {connection.shop}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isLoading}
                className="h-8 px-3 text-sm font-normal gap-2"
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
          </div>
          <p className="text-sm text-muted-foreground">
            Last Trained: {connection.lastTrained}
          </p>
        </div>
      )}
    </div>
  );
}
