"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  File,
  Upload,
  FileText,
  FileSpreadsheet,
  FileImage,
  Loader2,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useChatbotStore from "@/store/useChatbotStore";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes("pdf") || fileType.includes("docx")) return FileText;
  if (
    fileType.includes("sheet") ||
    fileType.includes("csv") ||
    fileType.includes("excel")
  )
    return FileSpreadsheet;
  if (fileType.includes("image")) return FileImage;
  if (fileType.includes("presentation")) return File;
  return File;
};

export default function FilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const chatbots = useChatbotStore((state) => state.chatbots);
  const getChatbots = useChatbotStore((state) => state.getChatbots);
  const trainChatbot = useChatbotStore((state) => state.trainChatbot);
  const selectedChatbotId = useChatbotStore((state) => state.selectedChatbotId);

  useEffect(() => {
    getChatbots();
  }, [getChatbots]);

  const selectedChatbot = chatbots.find(
    (bot) =>
      bot.chatbot.id === selectedChatbotId ||
      bot.chatbot_id === selectedChatbotId
  )?.chatbot;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
      toast({
        description: `${acceptedFiles.length} file${
          acceptedFiles.length > 1 ? "s" : ""
        } uploaded successfully`,
      });
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 10, // Increased max files limit
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "text/csv": [".csv"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    multiple: true,
  });

  const handleDelete = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
    toast({
      description: "File deleted successfully",
    });
  };

  const handleTrainBot = async () => {
    if (!selectedChatbot?.id) {
      toast({
        variant: "destructive",
        description: "No chatbot selected",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        variant: "destructive",
        description: "Please upload at least one file",
      });
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);

    try {
      // Process all files sequentially
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("files", files[i].file);

        await trainChatbot(selectedChatbot.id, "", formData);

        // Update progress
        setTrainingProgress(((i + 1) / files.length) * 100);

        toast({
          description: `Trained with file ${i + 1} of ${files.length}`,
        });
      }

      toast({
        description: "All files processed successfully",
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
      setTrainingProgress(0);
    }
  };

  return (
    <div className="xl:mr-96 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold">Add New Sources</h2>
          <Badge
            variant="secondary"
            className="rounded-md bg-[#E0D2EE] text-black hover:bg-[#E0D2EE] hover:text-black"
          >
            File
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          {files.length} file{files.length !== 1 ? "s" : ""} selected
        </span>
      </div>

      <div className="space-y-4">
        {files.map((file) => (
          <Card key={file.name} className="border shadow-none">
            <CardContent className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                {(() => {
                  const IconComponent = getFileIcon(file.type);
                  return (
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                  );
                })()}
                <span className="text-sm">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(file.name)}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}

        <Card
          {...getRootProps()}
          className={`
            border-2 border-dashed cursor-pointer
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted"}
          `}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <input {...getInputProps()} />
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Click to browse or
              <br />
              drag and drop your files (up to 10 files)
            </p>
          </CardContent>
        </Card>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <Button
            onClick={handleTrainBot}
            size="sm"
            disabled={isTraining}
            className="w-full"
          >
            {isTraining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Training... {Math.round(trainingProgress)}%
              </>
            ) : (
              `Train bot with ${files.length} file${
                files.length !== 1 ? "s" : ""
              }`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
