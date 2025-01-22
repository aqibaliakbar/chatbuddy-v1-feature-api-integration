"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plug } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import useChatbotStore from "@/store/useChatbotStore";
import useNotionStore from "@/store/useNotionStore";
import NotionLoadingScreen from "./components/notion-loading-screen";
import { useSearchParams, useRouter } from "next/navigation";

export default function NotionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedChatbotId } = useChatbotStore();
  const {
    isLoading,
    accessCode,
    selectedPages,
    getAuthUrl,
    fetchWithCode,
    setAccessCode,
    togglePageSelection,
    trainPages,
    reset,
  } = useNotionStore();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [loadingStep, setLoadingStep] = useState<
    "connecting" | "authorizing" | "fetching" | "training"
  >("connecting");

 useEffect(() => {
   const code = searchParams.get("code");
   const error = searchParams.get("error");

   const handleNotionCallback = async () => {
     if (code && selectedChatbotId && !accessCode) {
       setIsConnecting(true);
       setLoadingStep("fetching");
       try {
         setAccessCode(code);
         await fetchWithCode(selectedChatbotId, code);
         toast({
           description: "Successfully connected to Notion",
         });
         router.push("/add-sources/notion");
       } catch (error) {
         toast({
           variant: "destructive",
           description: "Failed to connect to Notion",
         });
       } finally {
         setIsConnecting(false);
       }
     } else if (error) {
       toast({
         variant: "destructive",
         description: "Failed to connect to Notion: " + error,
       });
     }
   };

   handleNotionCallback();
 }, [
   searchParams,
   selectedChatbotId,
   accessCode,
   fetchWithCode,
   setAccessCode,
   toast,
   router,
 ]);

const handleConnect = async () => {
  if (!selectedChatbotId) {
    toast({
      variant: "destructive",
      description: "Please select a chatbot first",
    });
    return;
  }

  setIsConnecting(true);
  setLoadingStep("connecting");
  try {
    await getAuthUrl(selectedChatbotId);
    setLoadingStep("authorizing");
  } catch (error) {
    toast({
      variant: "destructive",
      description: "Failed to start Notion connection",
    });
    setIsConnecting(false);
  }
};
 const handleTrain = async () => {
   if (!selectedChatbotId) {
     toast({
       variant: "destructive",
       description: "Please select a chatbot first",
     });
     return;
   }

   if (!accessCode) {
     toast({
       variant: "destructive",
       description: "Notion access not completed",
     });
     return;
   }

   const selectedPagesCount = selectedPages.filter((p) => p.selected).length;
   if (selectedPagesCount === 0) {
     toast({
       variant: "destructive",
       description: "Please select at least one page to train",
     });
     return;
   }

   setIsTraining(true);
   setLoadingStep("training");
   try {
     await trainPages(selectedChatbotId);
     toast({
       description: "Training started successfully",
     });
     reset();
     router.push("/Knowledge");
   } catch (error) {
     toast({
       variant: "destructive",
       description: "Failed to start training",
     });
   } finally {
     setIsTraining(false);
   }
 };

  const selectedCount = selectedPages.filter((p) => p.selected).length;

  return (
    <>
      <NotionLoadingScreen
        isVisible={isConnecting || isLoading || isTraining}
        step={loadingStep}
      />

      <div className="space-y-6 max-w-[72%]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Add New Sources</h2>
            <div className="rounded-md bg-background border px-2 py-1 text-xs font-medium">
              Notion
            </div>
          </div>
          {selectedPages.length > 0 && accessCode && (
            <Button
              onClick={handleTrain}
              className="gap-2"
              variant="default"
              disabled={isTraining || selectedCount === 0}
            >
              {isTraining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Training...
                </>
              ) : (
                <>Train Selected Pages ({selectedCount})</>
              )}
            </Button>
          )}
        </div>

        {!accessCode ? (
          <Button
            onClick={handleConnect}
            variant="default"
            size="sm"
            className="gap-2"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Plug className="h-4 w-4" />
                Connect Notion
              </>
            )}
          </Button>
        ) : (
          <div className="border rounded-md ">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Page Name</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>
                      <Checkbox
                        checked={page.selected}
                        onCheckedChange={() => togglePageSelection(page.id)}
                        disabled={isTraining}
                      />
                    </TableCell>
                    <TableCell>{page.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {page.id}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
