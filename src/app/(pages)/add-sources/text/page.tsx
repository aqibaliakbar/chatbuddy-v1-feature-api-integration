"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import Markdown from "@uiw/react-markdown-preview";
import { Badge } from "@/components/ui/badge";
import useChatbotStore from "@/store/useChatbotStore";

export default function TextPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const { trainChatbot, selectedChatbotId } = useChatbotStore();

  const handleTrainBot = async () => {
    if (!selectedChatbotId) {
      toast({
        variant: "destructive",
        description: "No chatbot selected",
      });
      return;
    }

    if (!title || !content.trim()) {
      toast({
        variant: "destructive",
        description: "Please provide both title and content",
      });
      return;
    }

    try {
      await trainChatbot(selectedChatbotId, "", undefined, {
        title: title,
        content: content,
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
        description:
          error instanceof Error ? error.message : "Failed to train bot",
      });
    }
  };

  return (
    <div className="xl:mr-96 space-y-6">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold">Add New Sources</h2>
        <Badge
          variant="secondary"
          className="rounded-md bg-[#F5F5F5] text-black hover:bg-[#F5F5F5] hover:text-black"
        >
          Text
        </Badge>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            className="w-full bg-background"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Content</label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Markdown Preview</DialogTitle>
                </DialogHeader>
                <div className="p-4 bg-background rounded-md">
                  <Markdown source={content} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none font-mono"
            placeholder="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum."
            rows={8}
          />
          <p className="text-xs text-muted-foreground">
            Supports{" "}
            <button
              onClick={() =>
                window.open(
                  "https://www.markdownguide.org/basic-syntax/",
                  "_blank"
                )
              }
              className="text-primary hover:underline cursor-pointer"
            >
              markdown
            </button>
            .
          </p>
        </div>
      </div>

      <Button onClick={handleTrainBot} size="sm">
        Train bot
      </Button>
    </div>
  );
}
