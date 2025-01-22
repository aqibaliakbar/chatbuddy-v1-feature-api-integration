"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/badge";
import useChatbotStore from "@/store/useChatbotStore";

interface AudioFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

export default function AudioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [transcript, setTranscript] = useState("");

  const {
    trainChatbot,
    selectedChatbotId,
    generateTranscript,
    isTranscribing,
    transcriptionError,
  } = useChatbotStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setAudioFile({
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
        });

        try {
          const transcription = await generateTranscript(file);
          setTranscript(transcription);
          toast({
            description: "Transcript generated successfully",
          });
        } catch (error) {
          toast({
            variant: "destructive",
            description: `Failed to generate transcript: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          });
        }
      }
    },
    [generateTranscript, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".wav", ".mp3", ".m4a", ".aac", ".ogg"],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB as per API specification
  });

  const handleTrainBot = async () => {
    if (!transcript) {
      toast({
        variant: "destructive",
        description: "Please upload an audio file and generate transcript",
      });
      return;
    }

    if (!selectedChatbotId) {
      toast({
        variant: "destructive",
        description: "No chatbot selected",
      });
      return;
    }

    try {
      await trainChatbot(
        selectedChatbotId,
        "",
        undefined, // No formData needed
        {
          title: audioFile?.name || "Audio Transcript",
          content: transcript,
        }
      );

      toast({
        description: "Bot training has begun",
      });

      setTimeout(() => {
        router.push("/knowledge");
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        description: `Training failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  };

  return (
    <div className="xl:mr-96 space-y-6">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold">Add New Sources</h2>
        <Badge
          variant="secondary"
          className="rounded-md bg-[#D0E5E4] text-black hover:bg-[#D0E5E4] hover:text-black"
        >
          Audio
        </Badge>
      </div>

      {audioFile ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Source</label>
            <div className="flex gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-sm">
                {audioFile.name}
                <button
                  onClick={() => setAudioFile(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Transcript</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder={
                isTranscribing
                  ? "Generating transcript..."
                  : "Edit transcript here..."
              }
              disabled={isTranscribing}
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              Supports{" "}
              <span
                className="underline cursor-pointer"
                onClick={() =>
                  window.open(
                    "https://www.markdownguide.org/basic-syntax/",
                    "_blank"
                  )
                }
              >
                markdown
              </span>
              .
            </p>
          </div>

          <Button
            onClick={handleTrainBot}
            size="sm"
            disabled={isTranscribing || !selectedChatbotId}
          >
            Train bot
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            rounded-lg border-2 border-dashed p-12
            text-center cursor-pointer
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted"}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Click to browse or
            <br />
            drag and drop your audio file (max 100MB)
          </p>
        </div>
      )}
    </div>
  );
}
