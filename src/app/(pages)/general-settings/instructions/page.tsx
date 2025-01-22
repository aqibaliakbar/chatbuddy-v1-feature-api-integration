"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useChatbotStore from "@/store/useChatbotStore";
import LoadingScreen from "@/components/loading-screen";

export default function InstructionsPage() {
  const { toast } = useToast();
  const [instructions, setInstructions] = React.useState("");
  const [persona, setPersona] = React.useState("");
  const selectedChatbotId = useChatbotStore((state) => state.selectedChatbotId);
  const chatbots = useChatbotStore((state) => state.chatbots);
  const updateChatbot = useChatbotStore((state) => state.updateChatbot);
  const isLoading = useChatbotStore((state) => state.isLoading);

  // Load instructions and persona when selected chatbot changes
  React.useEffect(() => {
    if (selectedChatbotId && chatbots.length > 0) {
      const selectedBot = chatbots.find(
        (bot) => bot.chatbot_id === selectedChatbotId
      );
      if (selectedBot) {
        setInstructions(
          selectedBot.chatbot.private_settings.model.instruction || ""
        );
        setPersona(selectedBot.chatbot.private_settings.model.persona || "");
      }
    }
  }, [selectedChatbotId, chatbots]);

const handleUpdateInstructions = async () => {
  if (!selectedChatbotId) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "No chatbot selected",
    });
    return;
  }

  try {
    // Find existing model settings
    const currentBot = chatbots.find(
      (bot) => bot.chatbot_id === selectedChatbotId
    );

    if (!currentBot) return;

    const currentModelSettings = currentBot.chatbot.private_settings.model;

    await updateChatbot(selectedChatbotId, {
      private_settings: {
        model: {
          ...currentModelSettings, // Keep existing settings
          instruction: instructions,
          persona: persona,
        },
      },
    });

    toast({
      title: "Success",
      description: "Instructions have been successfully updated.",
    });
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to update instructions",
    });
  }
};

  if (!selectedChatbotId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No Chatbot Selected</h2>
          <p className="text-muted-foreground">
            Please select a chatbot from the header to manage instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Instructions</h1>
        <Select defaultValue="ai-chatbot">
          <SelectTrigger className="w-[200px] bg-background border-input">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-800" />
              <span className="text-foreground">AI chatbot</span>
              <Badge variant="secondary" className="ml-auto font-normal">
                soon
              </Badge>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ai-chatbot">
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                AI chatbot
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg bg-card">
        <Tabs defaultValue="instructions" className="w-full">
          <TabsList className="w-full justify-between">
            <TabsTrigger value="instructions" className="w-full">
              Instructions
            </TabsTrigger>
            <TabsTrigger value="persona" className="w-full">
              Persona
            </TabsTrigger>
            <TabsTrigger value="purpose" className="w-full">
              Chatbot Purpose
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instructions" className="py-4">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingScreen />
              </div>
            ) : (
              <>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-[400px] font-mono text-sm border-input bg-background resize-none p-4"
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  The instructions allow you to customize your chatbot&apos;s
                  personality and style. Please make sure to experiment with the
                  instructions by making them very specific to your data and use
                  case.
                </p>
                <Button
                  onClick={handleUpdateInstructions}
                  disabled={isLoading}
                  className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Instructions"
                  )}
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="persona" className="py-4">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingScreen />
              </div>
            ) : (
              <>
                <Textarea
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="min-h-[400px] font-mono text-sm border-input bg-background resize-none p-4"
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  Define your chatbot&apos;s persona and behavioral
                  characteristics.
                </p>
                <Button
                  onClick={handleUpdateInstructions}
                  disabled={isLoading}
                  className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Persona"
                  )}
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="purpose" className="p-6">
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Chatbot Purpose content goes here
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
