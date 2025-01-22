"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import useChatbotStore from "@/store/useChatbotStore";

export default function YoutubePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [activeUrl, setActiveUrl] = useState("");

  const {
    isLoading,
    trainChatbot,
    selectedChatbotId,
    generateYoutubeTranscript,
  } = useChatbotStore();

  const handleGetTranscript = async () => {
    if (!url) {
      toast({
        variant: "destructive",
        description: "Please enter a YouTube URL",
      });
      return;
    }

    try {
      const transcription = await generateYoutubeTranscript(url);
      setTranscript(transcription);
      setActiveUrl(url);
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
  };

  const handleRemoveUrl = () => {
    setActiveUrl("");
    setTranscript("");
    setUrl("");
  };

  const handleTrainBot = async () => {
    if (!transcript) {
      toast({
        variant: "destructive",
        description: "Please generate a transcript first",
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
      await trainChatbot(selectedChatbotId, "", undefined, {
        title: `YouTube Transcript: ${activeUrl}`,
        content: transcript,
      });

      toast({
        description: "Bot Trained Successfully",
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
          className="rounded-md bg-[#FDD8D3] text-black hover:bg-[#FDD8D3] hover:text-black"
        >
          YouTube
        </Badge>
      </div>

      <div className="space-y-6">
        {!activeUrl && (
          <div className="space-y-4">
            <label className="text-sm font-medium">YouTube link</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/"
              className="max-w-xl"
            />
            <Button
              onClick={handleGetTranscript}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? "Getting Transcript..." : "Get Transcript"}
            </Button>
          </div>
        )}

        {activeUrl && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <div className="flex gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-sm">
                  {activeUrl}
                  <button
                    onClick={handleRemoveUrl}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Transcript</label>
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[200px] resize-none"
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
              disabled={isLoading || !selectedChatbotId}
            >
              Train bot
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
