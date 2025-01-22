"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, Plug, File, FileSpreadsheet } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import useGoogleDocStore from "@/store/useGoogleDocStore";
import useChatbotStore from "@/store/useChatbotStore";
import { useSearchParams, useRouter } from "next/navigation";
import GoogleLoadingScreen from "./components/google-loading-screen";


// Helper function to get file icon based on mimetype
const getFileIcon = (mimeType: string) => {
  switch (mimeType) {
    case "application/vnd.google-apps.document":
      return <FileText className="h-4 w-4 text-blue-500" />;
    case "application/vnd.google-apps.spreadsheet":
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
    case "application/pdf":
      return <File className="h-4 w-4 text-red-500" />;
    default:
      return <File className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function GoogleDocsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasExecuted = useRef(false);
  const { selectedChatbotId } = useChatbotStore();
  const {
    isLoading,
    accessCode,
    selectedFiles,
    getAuthUrl,
    fetchWithCode,
    setAccessCode,
    toggleFileSelection,
    trainFiles,
    reset,
  } = useGoogleDocStore();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [loadingStep, setLoadingStep] = useState<
    "connecting" | "authorizing" | "fetching" | "training"
  >("connecting");

  // Filter for supported file types
  const supportedMimeTypes = [
    "application/vnd.google-apps.document",
    "application/vnd.google-apps.spreadsheet",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

const filteredFiles = selectedFiles.filter(
  (file) => supportedMimeTypes.includes(file.mimetype) // This might be file.mimeType
);
  console.log("sss", filteredFiles);

useEffect(() => {
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  console.log("Effect running with:", {
    code,
    selectedChatbotId,
    accessCode,
    hasExecuted: hasExecuted.current,
  });

  const handleGoogleCallback = async () => {
    if (code && selectedChatbotId && !accessCode && !hasExecuted.current) {
      console.log("Starting fetch process");
      hasExecuted.current = true;
      setIsConnecting(true);
      setLoadingStep("fetching");
      try {
        console.log("Setting access code:", code);
        setAccessCode(code);
        console.log("Fetching files...");
        const result = await fetchWithCode(selectedChatbotId, code);
        console.log("Fetch result:", result);
        toast({
          description: "Successfully connected to Google Docs",
        });
      } catch (error) {
        console.error("Fetch error:", error);
        toast({
          variant: "destructive",
          description: "Failed to connect to Google Docs",
        });
      } finally {
        setIsConnecting(false);
      }
    }
  };

  handleGoogleCallback();
}, [
  accessCode,
  selectedChatbotId,
  fetchWithCode,
  setAccessCode,
  toast,
  router,
  searchParams,
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
        description: "Failed to start Google Docs connection",
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

    const selectedCount = filteredFiles.filter((f) => f.selected).length;
    if (selectedCount === 0) {
      toast({
        variant: "destructive",
        description: "Please select at least one file to train",
      });
      return;
    }

    setIsTraining(true);
    setLoadingStep("training");
    try {
      await trainFiles(selectedChatbotId);
      toast({
        description: "Training started successfully",
      });
      reset();
      router.push("/knowledge");
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to start training",
      });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <>
      <GoogleLoadingScreen
        isVisible={isConnecting || isLoading || isTraining}
        step={loadingStep}
      />

      <div className="space-y-6 2xl:max-w-[72%]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Add New Sources</h2>
            <div className="rounded-md bg-background border px-2 py-1 text-xs font-medium">
              Google Docs
            </div>
          </div>
          {filteredFiles.length > 0 && accessCode && (
            <Button
              onClick={handleTrain}
              className="gap-2"
              variant="default"
              disabled={
                isTraining ||
                filteredFiles.filter((f) => f.selected).length === 0
              }
            >
              {isTraining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Training...
                </>
              ) : (
                <>
                  Train Selected Files (
                  {filteredFiles.filter((f) => f.selected).length})
                </>
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
                Connect Google Drive
              </>
            )}
          </Button>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <Checkbox
                        checked={file.selected}
                        onCheckedChange={() => toggleFileSelection(file.id)}
                        disabled={isTraining}
                      />
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      {getFileIcon(file.mimetype)}
                      {file.name}
                    </TableCell>
                    <TableCell>
                      {file.mimetype === "application/vnd.google-apps.document"
                        ? "Google Doc"
                        : file.mimetype ===
                          "application/vnd.google-apps.spreadsheet"
                        ? "Google Sheet"
                        : file.mimetype === "application/pdf"
                        ? "PDF"
                        : "Document"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {file.id}
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
